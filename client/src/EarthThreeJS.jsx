import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module';
import earcut from 'earcut';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createRenderer, createCamera, updateLoadingProgressBar } from './earth/core-utils';

import { loadTexture } from './earth/common-utils';
// Import shaders as raw text
import vertexShader from './assets/shaders/vertex.glsl?raw';
import fragmentShader from './assets/shaders/fragment.glsl?raw';

const Albedo = '/assets/Albedo.jpg';
const Bump = '/assets/Bump.jpg';
const Clouds = '/assets/Clouds.png';
const Ocean = '/assets/Ocean.png';
const NightLights = '/assets/night_lights_modified.png';
const GaiaSky = '/assets/Gaia_EDR3_darkened.png';
const CountriesData = '/assets/countrieslite.geo.json';

const EarthThreeJS = () => {
  const mountRef = useRef(null);
  const cameraRef = useRef();

  useEffect(() => {
    // Parameters
    const params = {
      sunIntensity: 1.8,
      speedFactor: 1.5,
      metalness: 0.2,
      roughness: 0.3,
      atmOpacity: { value: 0.8 },
      atmPowFactor: { value: 4.5 },
      atmMultiplier: { value: 12.0 },
      borderOpacity: 0.7,
      highlightIntensity: 2.0,
      cloudSpeed: 0.5,
      enableGlow: true,
      brightEarthMode: false,
      brightIntensity: 2.0,
      brightModeBorderColor: 0x00ffff,
      brightModeBorderOpacity: 1.0,
      normalModeBorderColor: 0x40e0ff,
    };

    // Scene, Renderer, Camera
    const scene = new THREE.Scene();
    const renderer = createRenderer({ antialias: true, alpha: true }, (_renderer) => {
      _renderer.outputColorSpace = THREE.SRGBColorSpace;
      _renderer.shadowMap.enabled = true;
      _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      _renderer.toneMapping = THREE.ACESFilmicToneMapping;
      _renderer.toneMappingExposure = 1.2;
    });
    // Get container size
    const container = mountRef.current;
if (!container) {
  console.error('mountRef.current is not available!');
  return;
}
const width = container.clientWidth;
const height = container.clientHeight;
renderer.setSize(width, height);
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.display = 'block';
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '0';
container.appendChild(renderer.domElement);
    // Attach renderer to React ref
    container.appendChild(renderer.domElement);
    // Camera
    const camera = createCamera(45, width / height, 1000, { x: 0, y: 0, z: 30 });
    cameraRef.current = camera;

    // Handle window resize
    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', handleResize);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, params.sunIntensity);
    dirLight.position.set(-50, 0, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x4080ff, 0.5);
    rimLight.position.set(50, 0, -30);
    scene.add(rimLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 15;
    controls.maxDistance = 100;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.1;

    // ...existing code...

    // Listen for gesture data from Python backend
    socket.on("gesture-from-server", (data) => {
      const g = data.gesture;
      // Adjust camera or earth rotation based on gesture
      if (g === "pinch") {
        camera.position.z -= 10; // Zoom in
      } else if (g === "open_palm") {
        camera.position.z += 10; // Zoom out
      } else if (g === "pointing") {
        group.rotation.y += 0.1; // Rotate right
      } else if (g === "fist") {
        group.rotation.y -= 0.1; // Rotate left
      }
    });
    // Stats
    const stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.cssText = "position:absolute;top:0px;left:0px;opacity:0.8;z-index:1001;";
    mountRef.current.appendChild(stats.dom);

    // Earth group
    const group = new THREE.Group();
    group.rotation.z = 23.5 / 360 * 2 * Math.PI;

    // Country borders and picking
    let countryLines = [];
    let countryBorderLines = {};
    let countryPickMeshes = [];
    let currentlyHighlightedCountry = null;

    // Utility: Lat/Lon to Vector3
    function latLonToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Build country meshes
    function buildCountryMeshes(geojson, group) {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(params.normalModeBorderColor),
        transparent: true,
        opacity: params.borderOpacity,
      });
      const highlightLineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0xffff00),
        linewidth: 4,
        transparent: true,
        opacity: 0.9,
      });
      const pickMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });

      geojson.features.forEach((feature) => {
        const countryName = feature.properties.name || feature.properties.ADMIN || "Unknown";
        let coords = feature.geometry.coordinates;
        if (feature.geometry.type === "Polygon") coords = [coords];
        countryBorderLines[countryName] = [];
        coords.forEach((polygon) => {
          polygon.forEach((ring) => {
            const points = ring.map(([lon, lat]) => latLonToVector3(lat, lon, 10.12));
            if (!points[0].equals(points[points.length - 1])) points.push(points[0]);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.LineLoop(geometry, lineMaterial.clone());
            line.userData.countryName = countryName;
            line.rotateY(-0.3);
            line.renderOrder = 1;
            group.add(line);
            countryLines.push(line);
            // Highlight border
            const highlightGeometry = geometry.clone();
            const highlightLine = new THREE.LineLoop(highlightGeometry, highlightLineMaterial.clone());
            highlightLine.userData.countryName = countryName;
            highlightLine.visible = false;
            highlightLine.rotateY(-0.3);
            highlightLine.renderOrder = 2;
            group.add(highlightLine);
            countryBorderLines[countryName].push(highlightLine);
          });
          // Pick mesh
          const ringVec3 = polygon[0].map(([lon, lat]) => latLonToVector3(lat, lon, 1));
          const center = new THREE.Vector3();
          ringVec3.forEach((v) => center.add(v));
          center.normalize();
          const zAxis = center.clone();
          const xAxis = new THREE.Vector3(0, 1, 0).cross(zAxis).normalize();
          const yAxis = zAxis.clone().cross(xAxis).normalize();
          const projected2D = ringVec3.map((v) => [v.dot(xAxis), v.dot(yAxis)]).flat();
          const indices = earcut(projected2D);
          let pickVertices = [];
          indices.forEach((i) => {
            const pPick = ringVec3[i].clone().normalize().multiplyScalar(10.3);
            pickVertices.push(pPick.x, pPick.y, pPick.z);
          });
          if (pickVertices.length > 0) {
            const pickGeometry = new THREE.BufferGeometry();
            pickGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pickVertices, 3));
            const pickMesh = new THREE.Mesh(pickGeometry, pickMat);
            pickMesh.userData.countryName = countryName;
            pickMesh.rotateY(-0.3);
            group.add(pickMesh);
            countryPickMeshes.push(pickMesh);
          }
        });
      });
    }

    // Async asset loading and mesh creation
    let earth, clouds, atmos;
    let animationId;
    let isMounted = true;
    let gui;
    let fullDayLights = [];


    (async () => {
      let texturesLoaded = true;
      let albedoMap, bumpMap, cloudsMap, oceanMap, nightLightsMap, envMap;
      try {
        await updateLoadingProgressBar(0.1);
        albedoMap = await loadTexture(Albedo);
        albedoMap.colorSpace = THREE.SRGBColorSpace;
        albedoMap.generateMipmaps = true;
        await updateLoadingProgressBar(0.2);
        bumpMap = await loadTexture(Bump);
        await updateLoadingProgressBar(0.3);
        cloudsMap = await loadTexture(Clouds);
        await updateLoadingProgressBar(0.4);
        oceanMap = await loadTexture(Ocean);
        await updateLoadingProgressBar(0.5);
        nightLightsMap = await loadTexture(NightLights);
        await updateLoadingProgressBar(0.6);
        envMap = await loadTexture(GaiaSky);
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        await updateLoadingProgressBar(0.7);
        scene.background = envMap;
      } catch (e) {
        console.error('Texture loading failed:', e);
        texturesLoaded = false;
      }

      let earthGeo = new THREE.SphereGeometry(10, 128, 128);
      let earthMat;
      if (texturesLoaded) {
        earthMat = new THREE.MeshStandardMaterial({
          map: albedoMap,
          bumpMap: bumpMap,
          bumpScale: 0.1,
          roughnessMap: oceanMap,
          roughness: params.roughness,
          metalness: params.metalness,
          emissiveMap: nightLightsMap,
          emissive: new THREE.Color(0xffff88),
          emissiveIntensity: 0.2,
        });
      } else {
        earthMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      }
      earth = new THREE.Mesh(earthGeo, earthMat);
      earth.receiveShadow = true;
      group.add(earth);

      // Clouds
      let cloudGeo = new THREE.SphereGeometry(10.08, 64, 64);
      let cloudsMat = texturesLoaded
        ? new THREE.MeshStandardMaterial({
            alphaMap: cloudsMap,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
          })
        : new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 });
      clouds = new THREE.Mesh(cloudGeo, cloudsMat);
      group.add(clouds);

      earth.rotateY(-0.3);
      clouds.rotateY(-0.3);

      // Atmosphere
      let atmosGeo = new THREE.SphereGeometry(12.8, 64, 64);
      let atmosMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          atmOpacity: params.atmOpacity,
          atmPowFactor: params.atmPowFactor,
          atmMultiplier: params.atmMultiplier,
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
      });
      atmos = new THREE.Mesh(atmosGeo, atmosMat);
      group.add(atmos);

      // Build country borders and pick meshes
      // Fetch geojson
      let geojson;
      try {
        const response = await fetch(CountriesData);
        geojson = await response.json();
      } catch (e) {
        geojson = null;
        console.error('Failed to load country geojson:', e);
      }
      if (geojson) buildCountryMeshes(geojson, group);

      // Add group to scene
      scene.add(group);

      // GUI
      gui = new dat.GUI();
      gui.domElement.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 1000;';
      const guiStyle = document.createElement('style');
      guiStyle.textContent = `
        .dg * {
          color: #ffffff !important;
          font-family: 'Lucida Grande', sans-serif !important;
        }
        .dg .property-name, 
        .dg .cr.function, 
        .dg .cr.boolean, 
        .dg .cr.number, 
        .dg .cr.string,
        .dg .folder-title, 
        .dg li.title,
        .dg .c .property-name,
        .dg li:not(.folder) .property-name {
          color: #ffffff !important;
          font-size: 11px !important;
          font-family: 'Lucida Grande', sans-serif !important;
          visibility: visible !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }
        .dg li { 
          background-color: #1a1a1a !important; 
          color: #ffffff !important; 
        }
        .dg .folder-title { 
          background: #000 !important; 
          color: #ffffff !important; 
        }
        .dg .c .property-name { 
          color: #ffffff !important; 
          display: inline-block !important; 
          width: 40% !important;
          float: left !important;
        }
        .dg .controller-row .property-name {
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(guiStyle);
      const lightingFolder = gui.addFolder('🌞 Lighting');
      lightingFolder.add(params, "sunIntensity", 0.0, 5.0, 0.1).onChange(v => {
        dirLight.intensity = params.brightEarthMode ? v * params.brightIntensity : v;
      }).name("Sun Intensity");
      lightingFolder.open();
      const materialFolder = gui.addFolder('🌍 Materials');
      materialFolder.add(params, "metalness", 0.0, 1.0, 0.05).onChange(v => earthMat.metalness = v).name("Ocean Metalness");
      materialFolder.add(params, "roughness", 0.0, 1.0, 0.05).onChange(v => earthMat.roughness = v).name("Surface Roughness");
      materialFolder.add(params, "borderOpacity", 0.0, 1.0, 0.05).onChange(v => {
        if (!params.brightEarthMode) {
          countryLines.forEach(line => line.material.opacity = v);
        }
      }).name("Border Opacity");
      materialFolder.add(params, "brightEarthMode").onChange(() => toggleBrightEarth()).name("🌟 Bright Earth");
      materialFolder.add(params, "brightIntensity", 1.0, 5.0, 0.1).onChange(() => {
        if (params.brightEarthMode) toggleBrightEarth();
      }).name("Brightness Level");
      materialFolder.addColor(params, "brightModeBorderColor").onChange(v => {
        if (params.brightEarthMode) {
          countryLines.forEach(line => line.material.color.setHex(v));
        }
      }).name("Bright Mode Border Color");
      materialFolder.add(params, "brightModeBorderOpacity", 0.5, 1.0, 0.05).onChange(v => {
        if (params.brightEarthMode) {
          countryLines.forEach(line => line.material.opacity = v);
          params.borderOpacity = v;
        }
      }).name("Bright Mode Border Opacity");
      const animationFolder = gui.addFolder('🔄 Animation');
      animationFolder.add(params, "speedFactor", 0.1, 20.0, 0.1).name("Rotation Speed");
      animationFolder.add(params, "cloudSpeed", 0.0, 5.0, 0.1).name("Cloud Speed");
      animationFolder.open();
      const atmosphereFolder = gui.addFolder('🌌 Atmosphere');
      atmosphereFolder.add(params.atmOpacity, "value", 0.0, 1.0, 0.05).name("Opacity");
      atmosphereFolder.add(params.atmPowFactor, "value", 0.0, 20.0, 0.1).name("Power Factor");
      atmosphereFolder.add(params.atmMultiplier, "value", 0.0, 20.0, 0.1).name("Multiplier");

      // Bright Earth toggle
      function toggleBrightEarth() {
        if (params.brightEarthMode) {
          ambientLight.intensity = 1.8;
          dirLight.intensity = params.sunIntensity * params.brightIntensity;
          if (fullDayLights.length === 0) {
            const lightPositions = [
              [50, 0, 30], [0, 50, 0], [0, -50, 0], [30, 0, -50], [-30, 0, -50]
            ];
            lightPositions.forEach(pos => {
              const additionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
              additionalLight.position.set(pos[0], pos[1], pos[2]);
              scene.add(additionalLight);
              fullDayLights.push(additionalLight);
            });
          } else {
            fullDayLights.forEach(light => light.intensity = 0.8);
          }
          earthMat.emissiveIntensity = 0.6;
          earthMat.emissive.setHex(0xaaaaaa);
          clouds.material.opacity = 0.2;
          atmos.material.uniforms.atmOpacity.value = 0.3;
          countryLines.forEach(line => {
            line.material.color.setHex(params.brightModeBorderColor);
            line.material.opacity = params.brightModeBorderOpacity;
            line.material.linewidth = 2;
            line.renderOrder = 10;
          });
          params.borderOpacity = params.brightModeBorderOpacity;
        } else {
          ambientLight.intensity = 0.3;
          dirLight.intensity = params.sunIntensity;
          if (fullDayLights.length > 0) {
            fullDayLights.forEach(light => light.intensity = 0);
          }
          earthMat.emissiveIntensity = 0.2;
          earthMat.emissive.setHex(0xffff88);
          clouds.material.opacity = 0.6;
          atmos.material.uniforms.atmOpacity.value = params.atmOpacity.value;
          countryLines.forEach(line => {
            line.material.color.setHex(params.normalModeBorderColor);
            line.material.opacity = 0.7;
            line.material.linewidth = 1;
            line.renderOrder = 1;
          });
          params.borderOpacity = 0.7;
        }
      }

      // Keyboard shortcut for bright Earth (press 'B' key)
      window.addEventListener('keydown', (event) => {
        if (event.key === 'b' || event.key === 'B') {
          params.brightEarthMode = !params.brightEarthMode;
          toggleBrightEarth();
        }
      });

      // Picking and highlight logic
      const raycaster = new THREE.Raycaster();
      raycaster.params.Line = { threshold: 0.5 };
      const mouse = new THREE.Vector2();
      window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(countryPickMeshes);
        if (intersects.length > 0) {
          const clickedName = intersects[0].object.userData.countryName;
          if (currentlyHighlightedCountry && countryBorderLines[currentlyHighlightedCountry]) {
            countryBorderLines[currentlyHighlightedCountry].forEach(line => { line.visible = false; });
          }
          if (countryBorderLines[clickedName]) {
            countryBorderLines[clickedName].forEach(line => {
              line.visible = true;
              // RGB animation then persistent white border
              const startTime = Date.now();
              const colors = [0xffff00, 0xff4444, 0x44ff44, 0x4444ff, 0xff8844];
              let colorIndex = 0;
              let animationPhase = 'rgb';
              const animateHighlight = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (animationPhase === 'rgb' && elapsed < 3) {
                  line.material.opacity = 0.9 + Math.sin(elapsed * 10) * 0.3;
                  const newColorIndex = Math.floor(elapsed * 5) % colors.length;
                  if (newColorIndex !== colorIndex) {
                    colorIndex = newColorIndex;
                    line.material.color.setHex(colors[colorIndex]);
                  }
                  line.material.linewidth = 4 + Math.sin(elapsed * 8) * 2;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'rgb' && elapsed >= 3) {
                  animationPhase = 'white';
                  line.material.color.setHex(0xffffff);
                  line.material.opacity = 1.0;
                  line.material.linewidth = 3;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'white') {
                  const whitePhaseElapsed = elapsed - 3;
                  line.material.opacity = 1.0 + Math.sin(whitePhaseElapsed * 2) * 0.1;
                  if (currentlyHighlightedCountry === clickedName) {
                    requestAnimationFrame(animateHighlight);
                  } else {
                    line.material.color.setHex(0xffff00);
                    line.material.linewidth = 4;
                    line.material.opacity = 0.9;
                  }
                }
              };
              animateHighlight();
            });
            currentlyHighlightedCountry = clickedName;
          }
        }
      });

      // Animation loop
      const animate = () => {
        if (!isMounted) return;
        stats.update();
        controls.update();
        group.rotateY(0.005 * params.speedFactor);
        clouds.rotateY(0.001 * params.cloudSpeed);
        if (atmos && !params.brightEarthMode) {
          const time = performance.now() * 0.001;
          atmos.material.uniforms.atmOpacity.value = params.atmOpacity.value + Math.sin(time * 0.5) * 0.05;
        }
        if (dirLight && !params.brightEarthMode) {
          const rotationAngle = group.rotation.y;
          dirLight.position.x = -50 * Math.cos(rotationAngle * 0.1);
          dirLight.position.z = 30 * Math.sin(rotationAngle * 0.1);
        }
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();
    })();

    // Cleanup
    return () => {
      isMounted = false;
if (animationId) cancelAnimationFrame(animationId);
if (renderer.domElement && mountRef.current) {
  try {
    mountRef.current.removeChild(renderer.domElement);
  } catch (e) {}
}
window.removeEventListener('resize', handleResize);
if (gui) gui.destroy();
if (stats && stats.dom && stats.dom.parentNode) {
  try {
    stats.dom.parentNode.removeChild(stats.dom);
  } catch (e) {}
}
    };

    
  }, []);

  return (
  <div
    ref={mountRef}
    style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0,
      background: '#222',
    }}
  />
);
};

export default EarthThreeJS;
