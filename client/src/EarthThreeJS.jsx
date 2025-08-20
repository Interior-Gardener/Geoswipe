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

const EarthThreeJS = ({ setSelectedCountry }) => {
  const mountRef = useRef(null);
  const cameraRef = useRef();

  useEffect(() => {
    // Add Google Font for Bungee Spice dynamically
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Bungee+Spice&family=Orbitron:wght@400;700;900&display=swap";
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Parameters with CORRECTED rotation speeds
    const params = {
      sunIntensity: 1.8,
      speedFactor: 0.3,
      metalness: 0.2,
      roughness: 0.3,
      atmOpacity: { value: 0.8 },
      atmPowFactor: { value: 4.5 },
      atmMultiplier: { value: 12.0 },
      borderOpacity: 0.7,
      highlightIntensity: 2.0,
      cloudSpeed: 0.1,
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

    // Create Enhanced Loading Overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 20, 40, 0.8));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 2000;
      color: white;
      font-family: 'Orbitron', sans-serif;
      font-size: 24px;
      font-weight: 700;
      user-select: none;
      backdrop-filter: blur(10px);
    `;

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'earth-spinner';
    
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Loading Earth Visualization...';
    loadingText.style.cssText = `
      margin-top: 20px;
      color: #00d4ff;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      letter-spacing: 2px;
      text-align: center;
    `;

    const loadingProgress = document.createElement('div');
    loadingProgress.id = 'loadingProgress';
    loadingProgress.style.cssText = `
      width: 300px;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin-top: 20px;
      overflow: hidden;
    `;

    const progressBar = document.createElement('div');
    progressBar.id = 'progressBar';
    progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #00d4ff, #0080ff);
      border-radius: 2px;
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    `;

    loadingProgress.appendChild(progressBar);
    loadingOverlay.appendChild(loadingSpinner);
    loadingOverlay.appendChild(loadingText);
    loadingOverlay.appendChild(loadingProgress);
    container.appendChild(loadingOverlay);

    // Add Enhanced CSS Styles for Loading and GUI (FIXED GUI TITLES)
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      .earth-spinner {
        border: 6px solid rgba(255, 255, 255, 0.1);
        border-top: 6px solid #00d4ff;
        border-right: 6px solid #0080ff;
        border-radius: 50%;
        width: 80px;
        height: 80px;
        animation: earthSpin 2s linear infinite;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
      }

      @keyframes earthSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Enhanced dat.GUI Styling */
      .dg.main {
        color: white !important;
        font-family: 'Orbitron', sans-serif !important;
        background: rgba(0, 20, 40, 0.9) !important;
        border-radius: 8px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
      }

      .dg .title {
        color: #00d4ff !important;
        font-weight: bold !important;
        font-size: 14px !important;
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
        background: rgba(0, 40, 80, 0.8) !important;
        border-radius: 4px !important;
        padding: 4px 8px !important;
        margin-bottom: 4px !important;
      }

      .dg .folder-title {
        color: #00d4ff !important;
        font-weight: bold !important;
        text-shadow: 0 0 5px rgba(0, 212, 255, 0.3) !important;
      }

      .dg li:not(.folder) > .property-name {
        color: white !important;
        text-shadow: 0 0 2px rgba(255, 255, 255, 0.3) !important;
      }

      .dg .c select {
        color: white !important;
        background: rgba(0, 40, 80, 0.8) !important;
        border: 1px solid rgba(0, 212, 255, 0.3) !important;
        border-radius: 4px !important;
      }

      .dg .c input[type=text] {
        color: white !important;
        background: rgba(0, 40, 80, 0.8) !important;
        border: 1px solid rgba(0, 212, 255, 0.3) !important;
        border-radius: 4px !important;
      }

      .dg .c .slider {
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 4px !important;
      }

      .dg .c .slider-fg {
        background: linear-gradient(90deg, #00d4ff, #0080ff) !important;
        border-radius: 4px !important;
      }

      .dg li.folder {
        border-left: 4px solid rgba(0, 212, 255, 0.5) !important;
        background: rgba(0, 20, 40, 0.3) !important;
        border-radius: 4px !important;
        margin: 2px 0 !important;
      }

      .dg .c input[type=checkbox] {
        margin-right: 8px !important;
      }
    `;
    document.head.appendChild(style);

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

    // Enhanced UI Elements
    const countryNameDisplay = document.createElement('div');
    countryNameDisplay.id = 'countryNameDisplay';
    countryNameDisplay.textContent = 'Click a country!';
    countryNameDisplay.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95));
      color: #00d4ff;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 48px;
      z-index: 1000;
      font-family: 'Bungee Spice', cursive;
      text-shadow: 0 0 15px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4), 2px 2px 6px rgba(0, 0, 0, 0.8);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.3), inset 0 2px 2px rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(0, 212, 255, 0.4);
      backdrop-filter: blur(15px);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      user-select: none;
      transform: translateZ(0);
    `;
    container.appendChild(countryNameDisplay);

    // FIXED: Title positioned at very top, smaller, non-obstructive
    const title = document.createElement('div');
    title.textContent = 'GESTURE CONTROLLED EARTH';
    title.style.cssText = `
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      color: #00d4ff;
      font-family: 'Orbitron', sans-serif;
      font-size: 22px;
      font-weight: 700;
      text-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
      background: rgba(0, 0, 0, 0.35);
      letter-spacing: 2px;
      z-index: 10;
      text-align: center;
      padding: 6px 18px;
      border-radius: 8px;
      backdrop-filter: blur(5px);
      pointer-events: none;
      user-select: none;
    `;
    container.appendChild(title);

    // Enhanced Instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      🖱 <strong>Click to explore countries</strong><br>
      🌍 <strong>Drag to rotate • Scroll to zoom</strong><br>
      👋 <strong>Hand gesture controls ready</strong><br>
      🌟 <strong>Press 'B' for bright mode</strong><br>
      ⌨ <strong>Use GUI panel for fine-tuning</strong>
    `;
    instructions.style.cssText = `
      position: absolute;
      bottom: 140px;
      left: 20px;
      color: rgba(255, 255, 255, 0.9);
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      font-weight: 400;
      z-index: 100;
      background: linear-gradient(135deg, rgba(0, 20, 40, 0.9), rgba(0, 40, 80, 0.9));
      padding: 16px 20px;
      border-radius: 12px;
      border: 2px solid rgba(0, 212, 255, 0.3);
      backdrop-filter: blur(15px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 255, 0.1);
      line-height: 1.6;
    `;
    container.appendChild(instructions);

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

    // Enhanced Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 15;
    controls.maxDistance = 100;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.5;

    // Listen for gesture data from Python backend
        // Listen for gesture data from Python backend
    socket.on("gesture", (data) => {
      console.log("Received gesture:", data);
      const g = data.gesture;
      // Pinch: scale globe down (shrink)
      if (g === "pinch") {
        group.scale.multiplyScalar(0.95); // Shrink globe
      }
      // Zoom: scale globe up (enlarge)
      else if (g === "zoom") {
        group.scale.multiplyScalar(1.05); // Enlarge globe
      }
      // Open palm: tap/select country (simulate click at center of renderer)
      else if (g === "open_palm") {
        if (renderer && renderer.domElement) {
          const rect = renderer.domElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const event = new MouseEvent('click', {
            clientX: centerX,
            clientY: centerY,
            bubbles: true
          });
          renderer.domElement.dispatchEvent(event);
        }
      }
      // Rotate right
      else if (g === "rotate_right") {
        group.rotation.y += 0.1;
        // Clamp/wrap rotation to avoid overflow
        if (group.rotation.y > Math.PI) group.rotation.y -= 2 * Math.PI;
      }
      // Rotate left
      else if (g === "rotate_left") {
        group.rotation.y -= 0.1;
        if (group.rotation.y < -Math.PI) group.rotation.y += 2 * Math.PI;
      }
      // Thumbs up: move globe up
      else if (g === "thumbs_up") {
        // Rotate globe towards the Arctic (north pole)
        group.rotation.x -= 0.1;
        if (group.rotation.x < -Math.PI) group.rotation.x -= 2 * Math.PI;
      }
      // Thumbs down: move globe down
      else if (g === "thumbs_down") {
        // Rotate globe towards the Antarctic (south pole)
        group.rotation.x += 0.1;
        if (group.rotation.x > Math.PI) group.rotation.x += 2 * Math.PI;
      }
    });

    // Enhanced Stats
    const stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.cssText = `
      position: absolute;
      top: 0px;
      left: 0px;
      opacity: 0.8;
      z-index: 1001;
      border-radius: 0 0 8px 0;
      overflow: hidden;
    `;
    container.appendChild(stats.dom);

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

    // FIXED: Build country meshes - corrected points.push error
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
            // FIXED: Changed from points.push(points) to points.push(points[0])
            if (!points[0].equals(points[points.length - 1])) points.push(points);
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
          // Pick mesh with improved accuracy
          const ringVec3 = polygon[0].map(([lon, lat]) => latLonToVector3(lat, lon, 1));
          const center = new THREE.Vector3();
          ringVec3.forEach((v) => center.add(v));
          center.divideScalar(ringVec3.length); // Properly calculate center
          center.normalize();
          const zAxis = center.clone();
          const xAxis = new THREE.Vector3(0, 1, 0).cross(zAxis).normalize();
          const yAxis = zAxis.clone().cross(xAxis).normalize();
          
          // Project points to 2D plane with proper scaling
          const projected2D = [];
          const scale = 10.0; // Scale factor for better triangulation
          ringVec3.forEach((v) => {
            projected2D.push(v.dot(xAxis) * scale, v.dot(yAxis) * scale);
          });
          
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

    // Update progress bar helper
    function updateProgress(progress) {
      const progressBarElement = document.getElementById('progressBar');
      if (progressBarElement) {
        progressBarElement.style.width = `${progress * 100}%`;
      }
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
        updateProgress(0.1);
        albedoMap = await loadTexture(Albedo);
        albedoMap.colorSpace = THREE.SRGBColorSpace;
        albedoMap.generateMipmaps = true;
        
        updateProgress(0.25);
        bumpMap = await loadTexture(Bump);
        
        updateProgress(0.4);
        cloudsMap = await loadTexture(Clouds);
        
        updateProgress(0.55);
        oceanMap = await loadTexture(Ocean);
        
        updateProgress(0.7);
        nightLightsMap = await loadTexture(NightLights);
        
        updateProgress(0.85);
        envMap = await loadTexture(GaiaSky);
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = envMap;
        
        updateProgress(1.0);
        
        // Remove loading overlay with fade effect
        setTimeout(() => {
          if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
              if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
              }
            }, 500);
          }
        }, 200);
        
      } catch (e) {
        console.error('Texture loading failed:', e);
        texturesLoaded = false;
        if (loadingOverlay && loadingOverlay.parentNode) {
          loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
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

      // Enhanced GUI with better styling
      gui = new dat.GUI();
      gui.domElement.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 1000;';

      const lightingFolder = gui.addFolder('🌞 Lighting Controls');
      lightingFolder.add(params, "sunIntensity", 0.0, 5.0, 0.1).onChange(v => {
        dirLight.intensity = params.brightEarthMode ? v * params.brightIntensity : v;
      }).name("Sun Intensity");
      lightingFolder.open();

      const materialFolder = gui.addFolder('🌍 Material Properties');
      materialFolder.add(params, "metalness", 0.0, 1.0, 0.05).onChange(v => earthMat.metalness = v).name("Ocean Metalness");
      materialFolder.add(params, "roughness", 0.0, 1.0, 0.05).onChange(v => earthMat.roughness = v).name("Surface Roughness");
      materialFolder.add(params, "borderOpacity", 0.0, 1.0, 0.05).onChange(v => {
        if (!params.brightEarthMode) {
          countryLines.forEach(line => line.material.opacity = v);
        }
      }).name("Border Opacity");

      materialFolder.add(params, "brightEarthMode").onChange(() => toggleBrightEarth()).name("🌟 Bright Earth Mode");
      materialFolder.add(params, "brightIntensity", 1.0, 5.0, 0.1).onChange(() => {
        if (params.brightEarthMode) toggleBrightEarth();
      }).name("Brightness Level");

      materialFolder.addColor(params, "brightModeBorderColor").onChange(v => {
        if (params.brightEarthMode) {
          countryLines.forEach(line => line.material.color.setHex(v));
        }
      }).name("Bright Border Color");

      materialFolder.add(params, "brightModeBorderOpacity", 0.5, 1.0, 0.05).onChange(v => {
        if (params.brightEarthMode) {
          countryLines.forEach(line => line.material.opacity = v);
          params.borderOpacity = v;
        }
      }).name("Bright Border Opacity");

      const animationFolder = gui.addFolder('🔄 Animation Settings');
      animationFolder.add(params, "speedFactor", 0.1, 2.0, 0.1).name("Rotation Speed");
      animationFolder.add(params, "cloudSpeed", 0.0, 1.0, 0.1).name("Cloud Speed");
      animationFolder.open();

      const atmosphereFolder = gui.addFolder('🌌 Atmosphere Effects');
      atmosphereFolder.add(params.atmOpacity, "value", 0.0, 1.0, 0.05).name("Atmosphere Opacity");
      atmosphereFolder.add(params.atmPowFactor, "value", 0.0, 20.0, 0.1).name("Power Factor");
      atmosphereFolder.add(params.atmMultiplier, "value", 0.0, 20.0, 0.1).name("Multiplier");

      // FIXED: Bright Earth toggle function - corrected light position typo
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
          // Do NOT override highlight borders here
          params.borderOpacity = params.brightModeBorderOpacity;
          // Re-apply highlight animation if a country is selected
          if (currentlyHighlightedCountry && countryBorderLines[currentlyHighlightedCountry]) {
            countryBorderLines[currentlyHighlightedCountry].forEach(line => {
              line.visible = true;
              // Enhanced RGB animation then persistent white border
              const startTime = Date.now();
              const colors = [0xffff00, 0xff4444, 0x44ff44, 0x4444ff, 0xff8844, 0xff44ff];
              let colorIndex = 0;
              let animationPhase = 'rgb';
              const animateHighlight = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (animationPhase === 'rgb' && elapsed < 3) {
                  line.material.opacity = 0.9 + Math.sin(elapsed * 12) * 0.3;
                  const newColorIndex = Math.floor(elapsed * 6) % colors.length;
                  if (newColorIndex !== colorIndex) {
                    colorIndex = newColorIndex;
                    line.material.color.setHex(colors[colorIndex]);
                  }
                  line.material.linewidth = 4 + Math.sin(elapsed * 10) * 2;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'rgb' && elapsed >= 3) {
                  animationPhase = 'white';
                  line.material.color.setHex(0xffffff);
                  line.material.opacity = 1.0;
                  line.material.linewidth = 3;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'white') {
                  const whitePhaseElapsed = elapsed - 3;
                  line.material.opacity = 1.0 + Math.sin(whitePhaseElapsed * 3) * 0.15;
                  if (currentlyHighlightedCountry === line.userData.countryName) {
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
          }
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
          // Do NOT override highlight borders here
          params.borderOpacity = 0.7;
          // Re-apply highlight animation if a country is selected
          if (currentlyHighlightedCountry && countryBorderLines[currentlyHighlightedCountry]) {
            countryBorderLines[currentlyHighlightedCountry].forEach(line => {
              line.visible = true;
              // Enhanced RGB animation then persistent white border
              const startTime = Date.now();
              const colors = [0xffff00, 0xff4444, 0x44ff44, 0x4444ff, 0xff8844, 0xff44ff];
              let colorIndex = 0;
              let animationPhase = 'rgb';
              const animateHighlight = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (animationPhase === 'rgb' && elapsed < 3) {
                  line.material.opacity = 0.9 + Math.sin(elapsed * 12) * 0.3;
                  const newColorIndex = Math.floor(elapsed * 6) % colors.length;
                  if (newColorIndex !== colorIndex) {
                    colorIndex = newColorIndex;
                    line.material.color.setHex(colors[colorIndex]);
                  }
                  line.material.linewidth = 4 + Math.sin(elapsed * 10) * 2;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'rgb' && elapsed >= 3) {
                  animationPhase = 'white';
                  line.material.color.setHex(0xffffff);
                  line.material.opacity = 1.0;
                  line.material.linewidth = 3;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'white') {
                  const whitePhaseElapsed = elapsed - 3;
                  line.material.opacity = 1.0 + Math.sin(whitePhaseElapsed * 3) * 0.15;
                  if (currentlyHighlightedCountry === line.userData.countryName) {
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
          }
        }
      }

      // Enhanced keyboard controls
      window.addEventListener('keydown', (event) => {
        if (event.key === 'b' || event.key === 'B') {
          params.brightEarthMode = !params.brightEarthMode;
          toggleBrightEarth();
          console.log("🌟 Bright Earth mode:", params.brightEarthMode ? "ON" : "OFF");
        }
      });

      // Enhanced country picking and highlighting with improved accuracy
      const raycaster = new THREE.Raycaster();
      raycaster.params.Line = { threshold: 0.2 }; // Reduced threshold for more precise picking
      raycaster.params.Points = { threshold: 0.2 };
      const mouse = new THREE.Vector2();

      window.addEventListener('click', (event) => {
        // Accept clicks on renderer or its parent container
        if (event.target !== renderer.domElement && event.target !== container) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        // Increase threshold for more reliable picking
        raycaster.params.Line = { threshold: 0.5 };
        raycaster.params.Points = { threshold: 0.5 };
        const intersects = raycaster.intersectObjects(countryPickMeshes)
          .filter(intersect => {
            // Accept intersections near the picking mesh radius (10.3)
            const distance = intersect.point.length();
            return Math.abs(distance - 10.3) < 1.0;
          })
          .sort((a, b) => a.distance - b.distance);

        if (intersects.length > 0) {
          const clickedName = intersects[0].object.userData.countryName;
          if (!clickedName) return;

          // Hide previous highlights
          if (currentlyHighlightedCountry && countryBorderLines[currentlyHighlightedCountry]) {
            countryBorderLines[currentlyHighlightedCountry].forEach(line => {
              line.visible = false;
            });
          }

          if (countryBorderLines[clickedName]) {
            countryBorderLines[clickedName].forEach(line => {
              line.visible = true;
              line.material.color.setHex(0xffff00);
              line.material.opacity = 1.0;
              line.material.linewidth = 4;
              line.renderOrder = 20;
              const startTime = Date.now();
              const colors = [0xffff00, 0xff4444, 0x44ff44, 0x4444ff, 0xff8844, 0xff44ff];
              let colorIndex = 0;
              let animationPhase = 'rgb';

              const animateHighlight = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (animationPhase === 'rgb' && elapsed < 3) {
                  line.material.opacity = 0.9 + Math.sin(elapsed * 12) * 0.3;
                  const newColorIndex = Math.floor(elapsed * 6) % colors.length;
                  if (newColorIndex !== colorIndex) {
                    colorIndex = newColorIndex;
                    line.material.color.setHex(colors[colorIndex]);
                  }
                  line.material.linewidth = 4 + Math.sin(elapsed * 10) * 2;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'rgb' && elapsed >= 3) {
                  animationPhase = 'white';
                  line.material.color.setHex(0xffffff);
                  line.material.opacity = 1.0;
                  line.material.linewidth = 3;
                  requestAnimationFrame(animateHighlight);
                } else if (animationPhase === 'white') {
                  const whitePhaseElapsed = elapsed - 3;
                  line.material.opacity = 1.0 + Math.sin(whitePhaseElapsed * 3) * 0.15;
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

          console.log("🎯 Clicked country:", clickedName);

          // Enhanced country name display with better animations
          const countryNameDiv = document.getElementById('countryNameDisplay');
          if (countryNameDiv) {
            countryNameDiv.style.transform = 'scale(1.15) rotateZ(2deg)';
            countryNameDiv.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.95), rgba(255, 136, 68, 0.95), rgba(68, 255, 68, 0.95))';
            countryNameDiv.style.boxShadow = '0 15px 50px rgba(255, 68, 68, 0.4), 0 0 50px rgba(255, 136, 68, 0.3)';
            countryNameDiv.textContent = clickedName;
            setTimeout(() => {
              countryNameDiv.style.transform = 'scale(1) rotateZ(0deg)';
              countryNameDiv.style.background = 'linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95))';
              countryNameDiv.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.3), inset 0 2px 2px rgba(255, 255, 255, 0.1)';
            }, 400);
          }
          setSelectedCountry(clickedName);
        }
      });

      // Enhanced animation loop
      const animate = () => {
        if (!isMounted) return;
        stats.update();
        controls.update();

        // Smooth rotation
  // group.rotateY(0.001 * params.speedFactor); // Disabled automatic earth rotation
        clouds.rotateY(0.0005 * params.cloudSpeed);

        // Enhanced atmosphere breathing effect
        if (atmos && !params.brightEarthMode) {
          const time = performance.now() * 0.001;
          atmos.material.uniforms.atmOpacity.value = params.atmOpacity.value + Math.sin(time * 0.7) * 0.08;
        }

        // Dynamic lighting
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

    // Enhanced cleanup
    return () => {
      isMounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer.domElement && mountRef.current) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {}
      }

      // Clean up all UI elements
      const elementsToRemove = ['countryNameDisplay', 'loadingOverlay'];
      elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.parentNode) {
          try {
            element.parentNode.removeChild(element);
          } catch (e) {}
        }
      });

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
        background: 'linear-gradient(135deg, #000000, #001122)',
      }}
    />
  );
};

export default EarthThreeJS;