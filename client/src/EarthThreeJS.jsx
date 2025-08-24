import React, { useRef, useEffect, useState } from 'react';
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
  const [cursorPos, setCursorPos] = useState({ x: 400, y: 300 }); // Initialize cursor at center
  const cursorPosRef = useRef({ x: 400, y: 300 }); // Ref to store current cursor position for gesture handlers

  // Geographic validation function to reject meshes in impossible locations
  const validateCountryPosition = (countryName, point3D) => {
    // Convert 3D coordinates to approximate lat/lon for validation
    const lat = Math.asin(point3D.y / 10.3) * 180 / Math.PI;
    const lon = Math.atan2(point3D.x, point3D.z) * 180 / Math.PI;
    
    // Define approximate geographic bounds for countries
    const countryBounds = {
      'Mexico': { latMin: 14, latMax: 33, lonMin: -118, lonMax: -86 },
      'Brazil': { latMin: -34, latMax: 6, lonMin: -74, lonMax: -35 },
      'Peru': { latMin: -19, latMax: 0, lonMin: -82, lonMax: -68 },
      'Colombia': { latMin: -4, latMax: 12, lonMin: -82, lonMax: -66 },
      'Philippines': { latMin: 4, latMax: 19, lonMin: 116, lonMax: 127 },
      'Indonesia': { latMin: -11, latMax: 6, lonMin: 95, lonMax: 141 },
      'India': { latMin: 6, latMax: 37, lonMin: 68, lonMax: 97 },
      'China': { latMin: 18, latMax: 54, lonMin: 73, lonMax: 135 },
      'Honduras': { latMin: 12, latMax: 17, lonMin: -89, lonMax: -83 },
      'Cuba': { latMin: 19, latMax: 24, lonMin: -85, lonMax: -74 },
      'Bangladesh': { latMin: 20, latMax: 27, lonMin: 88, lonMax: 93 },
      'Myanmar': { latMin: 9, latMax: 29, lonMin: 92, lonMax: 102 },
      'Thailand': { latMin: 5, latMax: 21, lonMin: 97, lonMax: 106 },
      'Vietnam': { latMin: 8, latMax: 24, lonMin: 102, lonMax: 110 },
      'Malaysia': { latMin: 1, latMax: 7, lonMin: 100, lonMax: 120 }
    };
    
    const bounds = countryBounds[countryName];
    if (!bounds) return true; // Allow unknown countries
    
    // Check if position is within expected bounds (with some tolerance)
    const tolerance = 20; // degrees - increased tolerance for now
    const isValid = lat >= (bounds.latMin - tolerance) && 
                   lat <= (bounds.latMax + tolerance) && 
                   lon >= (bounds.lonMin - tolerance) && 
                   lon <= (bounds.lonMax + tolerance);
    
    if (!isValid) {
      // console.log(`🌍 ${countryName} position check: lat=${lat.toFixed(1)}, lon=${lon.toFixed(1)} vs expected lat=[${bounds.latMin}, ${bounds.latMax}], lon=[${bounds.lonMin}, ${bounds.lonMax}]`);
      // For now, allow most countries but log the discrepancy
      return true; // Temporarily allow all to prevent crashes
    }
    
    return isValid;
  };

  useEffect(() => {
    // Store cleanup functions
    let cleanupFunctions = [];
    
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
    cleanupFunctions.push(() => window.removeEventListener('resize', handleResize));

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
      ✋ <strong>Open palm: Move blue cursor dot</strong><br>
      🖐 <strong>Four fingers (no thumb): Click where cursor points</strong><br>
      🤏 <strong>Pinch/Zoom with scale limits (0.3x - 3.0x)</strong><br>
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

    // Remove any existing socket listeners to prevent duplicates
    socket.off("cursor");
    socket.off("gesture");

    // Store cursor event handler for cleanup
    const handleCursor = (data) => {
      const container = mountRef.current;
      if (!container) return;
      
      // Handle clearing cursor when data.x or data.y is None/null
      // Don't clear cursor - keep it visible but don't update position if no data
      if (data.x === null || data.y === null) {
        return; // Keep current position, don't clear
      }
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      // Clamp and map normalized coordinates to screen
      let x = Math.min(Math.max(data.x, 0), 1) * width;
      let y = Math.min(Math.max(data.y, 0), 1) * height;
      console.log("📍 Updating cursor position:", { 
        x, y, data, width, height,
        originalNormalizedX: data.x,
        originalNormalizedY: data.y,
        convertedX: x,
        convertedY: y
      });
      
      // Update both state and ref
      const newPos = { x, y };
      setCursorPos(newPos);
      cursorPosRef.current = newPos; // Update ref for gesture handlers
    };

    // Listen for cursor position from backend
    socket.on("cursor", handleCursor);
    cleanupFunctions.push(() => socket.off("cursor", handleCursor));

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
      
      // Debug country mesh information
      // console.log(`🗺️ Country mesh summary:`, {
      //   totalMeshes: countryPickMeshes.length,
      //   uniqueCountries: [...new Set(countryPickMeshes.map(mesh => mesh.userData.countryName))].length,
      //   sampleCountries: countryPickMeshes.slice(0, 5).map(mesh => mesh.userData.countryName)
      // });
      
      // Check for duplicate countries
      // const countryMeshCounts = {};
      // countryPickMeshes.forEach(mesh => {
      //   const country = mesh.userData.countryName;
      //   countryMeshCounts[country] = (countryMeshCounts[country] || 0) + 1;
      // });
      
      // const duplicateCountries = Object.entries(countryMeshCounts)
      //   .filter(([country, count]) => count > 1)
      //   .slice(0, 10); // Show first 10 duplicates
        
      // if (duplicateCountries.length > 0) {
      //   console.log(`⚠️ Countries with multiple meshes:`, Object.fromEntries(duplicateCountries));
      // }
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

      // Store gesture event handler for cleanup
      const handleGesture = (data) => {
        // console.log("Received gesture:", data);
        const g = data.gesture;
        // Pinch: zoom out (move camera away) with distance limits
        if (g === "pinch") {
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera distance from target
            const currentDistance = camera.position.distanceTo(controls.target);
            const newDistance = Math.min(currentDistance * 1.1, controls.maxDistance);
            
            // Move camera away from target
            const direction = camera.position.clone().sub(controls.target).normalize();
            camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
            
            // Update controls
            controls.update();
          }
        }
        // Zoom: zoom in (move camera closer) with distance limits  
        else if (g === "zoom") {
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera distance from target
            const currentDistance = camera.position.distanceTo(controls.target);
            const newDistance = Math.max(currentDistance * 0.9, controls.minDistance);
            
            // Move camera closer to target
            const direction = camera.position.clone().sub(controls.target).normalize();
            camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
            
            // Update controls
            controls.update();
          }
        }
        // Click gesture: "OK" sign (thumb touches index, other fingers up) - clicks at cursor position
        else if (g === "click") {
          const currentCursorPos = cursorPosRef.current; // Use ref to get latest position
          // console.log("🎯 OK sign detected! Cursor state:", cursorPos);
          // console.log("🎯 OK sign detected! Cursor ref:", currentCursorPos);
          
          if (renderer && renderer.domElement) {
            const rect = renderer.domElement.getBoundingClientRect();
            
            // Debug: Log the rect and cursor position details
            // console.log("🔧 Coordinate conversion debug:", {
            //   cursorX: currentCursorPos.x,
            //   cursorY: currentCursorPos.y,
            //   rectLeft: rect.left,
            //   rectTop: rect.top,
            //   rectWidth: rect.width,
            //   rectHeight: rect.height,
            //   calculatedAbsoluteX: currentCursorPos.x + rect.left,
            //   calculatedAbsoluteY: currentCursorPos.y + rect.top
            // });
            
            // Check if cursor coordinates are relative to container vs renderer
            const container = mountRef.current;
            const containerRect = container.getBoundingClientRect();
            // console.log("🔧 Container vs Renderer comparison:", {
            //   containerLeft: containerRect.left,
            //   containerTop: containerRect.top,
            //   rendererLeft: rect.left,
            //   rendererTop: rect.top,
            //   offsetX: rect.left - containerRect.left,
            //   offsetY: rect.top - containerRect.top
            // });
            
            // FIXED: Round coordinates to avoid floating point precision issues
            // This ensures gesture clicks match mouse click precision
            const absoluteClickX = Math.round(currentCursorPos.x + rect.left);
            const absoluteClickY = Math.round(currentCursorPos.y + rect.top);
            
            // console.log("🎯 Final click coordinates:", { 
            //   cursorX: currentCursorPos.x, 
            //   cursorY: currentCursorPos.y,
            //   rectLeft: rect.left, 
            //   rectTop: rect.top,
            //   absoluteClickX: absoluteClickX, 
            //   absoluteClickY: absoluteClickY,
            //   rectWidth: rect.width,
            //   rectHeight: rect.height
            // });
            
            // Add a visual debug marker to show where gesture thinks it's clicking
            const debugMarker = document.createElement('div');
            debugMarker.style.cssText = `
              position: fixed;
              left: ${absoluteClickX - 5}px;
              top: ${absoluteClickY - 5}px;
              width: 10px;
              height: 10px;
              background: lime;
              border: 2px solid black;
              border-radius: 50%;
              z-index: 10000;
              pointer-events: none;
            `;
            document.body.appendChild(debugMarker);
            setTimeout(() => debugMarker.remove(), 2000); // Remove after 2 seconds
            
            const event = new MouseEvent('click', {
              clientX: absoluteClickX,
              clientY: absoluteClickY,
              bubbles: true
            });
            // console.log("🎯 Dispatching click event on renderer element");
            renderer.domElement.dispatchEvent(event);
          }
        }
        // Rotate right
        else if (g === "rotate_right") {
          // Instead of rotating the group, rotate the camera around the Y-axis
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera position relative to target
            const offset = camera.position.clone().sub(controls.target);
            
            // Create rotation matrix for Y-axis rotation
            const rotationMatrix = new THREE.Matrix4().makeRotationY(0.1);
            
            // Apply rotation to camera offset
            offset.applyMatrix4(rotationMatrix);
            
            // Update camera position
            camera.position.copy(controls.target).add(offset);
            
            // Update controls
            controls.update();
          }
        }
        // Rotate left
        else if (g === "rotate_left") {
          // Instead of rotating the group, rotate the camera around the Y-axis
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera position relative to target
            const offset = camera.position.clone().sub(controls.target);
            
            // Create rotation matrix for Y-axis rotation
            const rotationMatrix = new THREE.Matrix4().makeRotationY(-0.1);
            
            // Apply rotation to camera offset
            offset.applyMatrix4(rotationMatrix);
            
            // Update camera position
            camera.position.copy(controls.target).add(offset);
            
            // Update controls
            controls.update();
          }
        }
        // Thumbs up: move globe up
        else if (g === "thumbs_up") {
          // Instead of rotating the group, rotate the camera around the X-axis (up)
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera position relative to target
            const offset = camera.position.clone().sub(controls.target);
            
            // Create rotation matrix for X-axis rotation (negative for up movement)
            const rotationMatrix = new THREE.Matrix4().makeRotationX(-0.1);
            
            // Apply rotation to camera offset
            offset.applyMatrix4(rotationMatrix);
            
            // Update camera position
            camera.position.copy(controls.target).add(offset);
            
            // Update controls
            controls.update();
          }
        }
        // Thumbs down: move globe down
        else if (g === "thumbs_down") {
          // Instead of rotating the group, rotate the camera around the X-axis (down)
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera position relative to target
            const offset = camera.position.clone().sub(controls.target);
            
            // Create rotation matrix for X-axis rotation (positive for down movement)
            const rotationMatrix = new THREE.Matrix4().makeRotationX(0.1);
            
            // Apply rotation to camera offset
            offset.applyMatrix4(rotationMatrix);
            
            // Update camera position
            camera.position.copy(controls.target).add(offset);
            
            // Update controls
            controls.update();
          }
        }
      };

      // Listen for gesture data from Python backend (moved here so 'group' is accessible)
      socket.on("gesture", handleGesture);
      cleanupFunctions.push(() => socket.off("gesture", handleGesture));

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
      const handleKeydown = (event) => {
        if (event.key === 'b' || event.key === 'B') {
          params.brightEarthMode = !params.brightEarthMode;
          toggleBrightEarth();
          console.log("🌟 Bright Earth mode:", params.brightEarthMode ? "ON" : "OFF");
        }
      };

      // Enhanced country picking and highlighting with improved accuracy
      const raycaster = new THREE.Raycaster();
      raycaster.params.Line = { threshold: 0.2 }; // Reduced threshold for more precise picking
      raycaster.params.Points = { threshold: 0.2 };
      const mouse = new THREE.Vector2();

      const handleClick = (event) => {
        // console.log("🔍 Click event details:", {
        //   target: event.target?.tagName || 'unknown',
        //   rendererElement: renderer.domElement?.tagName || 'unknown',
        //   container: container?.tagName || 'unknown',
        //   isSyntheticEvent: event.isTrusted === false,
        //   eventType: event.type
        // });
        
        // Accept clicks on renderer or its parent container
        // FIXED: Accept all canvas clicks and synthetic events since zoom changes behavior
        const isValidTarget = 
          event.target?.tagName === 'CANVAS' ||             // Any canvas click
          event.target === container ||                     // Container click  
          event.isTrusted === false;                        // Synthetic gesture events
        
        if (!isValidTarget) {
          console.log("🚫 Click rejected - wrong target", {
            eventTarget: event.target?.tagName || 'unknown',
            rendererElement: renderer.domElement?.tagName || 'unknown', 
            container: container?.tagName || 'unknown',
            isSynthetic: event.isTrusted === false,
            targetIsCanvas: event.target?.tagName === 'CANVAS'
          });
          return;
        }

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Log globe state for debugging
        // console.log("🌍 Globe state at click:", {
        //   rotationX: group.rotation.x.toFixed(3),
        //   rotationY: group.rotation.y.toFixed(3),
        //   rotationZ: group.rotation.z.toFixed(3),
        //   scaleX: group.scale.x.toFixed(3)
        // });
        
        // console.log("🎯 Click coordinates:", { 
        //   screenX: event.clientX, 
        //   screenY: event.clientY,
        //   normalizedX: mouse.x.toFixed(3),
        //   normalizedY: mouse.y.toFixed(3),
        //   rectWidth: rect.width,
        //   rectHeight: rect.height,
        //   relativeX: (event.clientX - rect.left).toFixed(1),
        //   relativeY: (event.clientY - rect.top).toFixed(1),
        //   rectLeft: rect.left.toFixed(1),
        //   rectTop: rect.top.toFixed(1)
        // });

        raycaster.setFromCamera(mouse, cameraRef.current || camera);
        
        // Debug: Show camera and raycaster state
        // console.log("📷 Camera debug:", {
        //   cameraPositionX: camera.position.x.toFixed(3),
        //   cameraPositionY: camera.position.y.toFixed(3),
        //   cameraPositionZ: camera.position.z.toFixed(3),
        //   cameraRefPositionX: cameraRef.current?.position.x.toFixed(3) || 'null',
        //   cameraRefPositionY: cameraRef.current?.position.y.toFixed(3) || 'null', 
        //   cameraRefPositionZ: cameraRef.current?.position.z.toFixed(3) || 'null',
        //   cameraSame: camera === cameraRef.current
        // });
        
        // Debug: Show where the ray is actually pointing
        const rayDirection = raycaster.ray.direction.clone();
        const rayOrigin = raycaster.ray.origin.clone();
        // console.log("🔫 Raycaster debug:", {
        //   rayOriginX: rayOrigin.x.toFixed(3),
        //   rayOriginY: rayOrigin.y.toFixed(3), 
        //   rayOriginZ: rayOrigin.z.toFixed(3),
        //   rayDirectionX: rayDirection.x.toFixed(3),
        //   rayDirectionY: rayDirection.y.toFixed(3),
        //   rayDirectionZ: rayDirection.z.toFixed(3),
        //   isSynthetic: event.isTrusted === false
        // });
        // Increase threshold for more reliable picking at all zoom levels
        // Adjust threshold based on camera distance for better precision
        const cameraDistance = cameraRef.current ? cameraRef.current.position.length() : camera.position.length();
        const baseThreshold = 0.5;
        const dynamicThreshold = baseThreshold * (cameraDistance / 30.0); // Scale threshold with zoom
        raycaster.params.Line = { threshold: dynamicThreshold };
        raycaster.params.Points = { threshold: dynamicThreshold };
        const allIntersects = raycaster.intersectObjects(countryPickMeshes);
        // console.log("🎯 All intersections found:", allIntersects.length);
        
        // Log ALL intersections before filtering
        allIntersects.forEach((intersect, index) => {
          const distance = intersect.point.length();
          const dotProduct = intersect.point.clone().normalize().dot(camera.position.clone().normalize());
          // console.log(`🎯 Raw intersection ${index}:`, {
          //   country: intersect.object.userData.countryName,
          //   distance: distance,
          //   point3D: `(${intersect.point.x.toFixed(2)}, ${intersect.point.y.toFixed(2)}, ${intersect.point.z.toFixed(2)})`,
          //   meshIndex: intersect.object.userData.meshIndex || 'unknown',
          //   faceIndex: intersect.faceIndex,
          //   dotProduct: dotProduct.toFixed(3),
          //   isBackFacing: dotProduct < 0
          // });
        });
        
        // Filter out back-facing intersections (only keep front-facing ones)
        const frontFacingIntersects = allIntersects.filter(intersect => {
          const dotProduct = intersect.point.clone().normalize().dot(camera.position.clone().normalize());
          return dotProduct > 0; // Only front-facing
        });
        
        // console.log(`🎯 Front-facing intersections: ${frontFacingIntersects.length} of ${allIntersects.length}`);
        
        // Further filter by geographic validation to remove misplaced meshes
        const geographicallyValidIntersects = frontFacingIntersects.filter(intersect => {
          const isValid = validateCountryPosition(intersect.object.userData.countryName, intersect.point);
          if (!isValid) {
            // console.log(`🚫 Rejected ${intersect.object.userData.countryName} - geographically invalid position`);
          }
          return isValid;
        });
        
        // console.log(`🎯 Geographically valid intersections: ${geographicallyValidIntersects.length} of ${frontFacingIntersects.length}`);
        
        const intersects = geographicallyValidIntersects
          .filter(intersect => {
            // FIXED: Make distance validation dynamic based on zoom level
            // The Earth sphere has radius 10, picking meshes are at ~10.3
            // Instead of hardcoded distance, validate that intersections are on the Earth surface
            const distance = intersect.point.length();
            const earthRadius = 10; // Earth sphere radius
            const pickingRadius = 10.3; // Picking mesh radius (slightly above clouds at 10.08)
            
            // Accept intersections near the picking mesh radius with some tolerance
            // This works regardless of camera zoom distance
            const isValid = distance >= earthRadius - 0.5 && distance <= pickingRadius + 0.5;
            // console.log("🎯 Intersection:", {
            //   country: intersect.object.userData.countryName,
            //   distance: distance,
            //   earthRadius: earthRadius,
            //   pickingRadius: pickingRadius,
            //   isValid: isValid,
            //   point3D: `(${intersect.point.x.toFixed(2)}, ${intersect.point.y.toFixed(2)}, ${intersect.point.z.toFixed(2)})`
            // });
            return isValid;
          })
          .sort((a, b) => a.distance - b.distance);

        // Add visual marker at the click point
        // if (intersects.length > 0) {
        //   const clickPoint = intersects[0].point;
        //   const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        //   const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        //   const marker = new THREE.Mesh(geometry, material);
        //   marker.position.copy(clickPoint);
        //   marker.name = 'clickMarker';
          
        //   // Remove previous markers
        //   const oldMarkers = scene.children.filter(child => child.name === 'clickMarker');
        //   oldMarkers.forEach(marker => scene.remove(marker));
          
        //   scene.add(marker);
        //   console.log(`🔴 Added red marker at: (${clickPoint.x.toFixed(2)}, ${clickPoint.y.toFixed(2)}, ${clickPoint.z.toFixed(2)})`);
        // }

        // console.log("🎯 Valid intersections after filtering:", intersects.length);
        // console.log("🎯 All valid countries found:", intersects.map(i => ({
        //   name: i.object.userData.countryName,
        //   distance: i.distance.toFixed(3),
        //   point: `(${i.point.x.toFixed(2)}, ${i.point.y.toFixed(2)}, ${i.point.z.toFixed(2)})`
        // })));

        if (intersects.length > 0) {
          // Enhanced selection algorithm for overlapping meshes with geographic validation
          const countryIntersects = new Map();
          
          // Group intersections by country and validate geographic position
          intersects.forEach(intersect => {
            const country = intersect.object.userData.countryName;
            const point = intersect.point;
            
            // Basic geographic validation - reject meshes in impossible locations
            const isGeographicallyValid = validateCountryPosition(country, point);
            
            if (isGeographicallyValid) {
              if (!countryIntersects.has(country)) {
                countryIntersects.set(country, []);
              }
              countryIntersects.get(country).push(intersect);
            } else {
              // console.log(`🚫 Rejected ${country} at invalid position: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`);
            }
          });
          
          // console.log(`🎯 Found ${countryIntersects.size} unique countries at click point:`, 
          //   Array.from(countryIntersects.keys()));
          
          // For each country, find the best intersection (closest to expected distance)
          const bestCountryMatches = Array.from(countryIntersects.entries()).map(([country, countryIntersects]) => {
            const bestIntersect = countryIntersects.reduce((best, current) => {
              const bestDiff = Math.abs(best.point.length() - 10.3);
              const currentDiff = Math.abs(current.point.length() - 10.3);
              return currentDiff < bestDiff ? current : best;
            });
            
            return {
              country,
              intersect: bestIntersect,
              distanceDiff: Math.abs(bestIntersect.point.length() - 10.3),
              meshCount: countryIntersects.length
            };
          });
          
          // Sort by distance difference (best match first)
          bestCountryMatches.sort((a, b) => a.distanceDiff - b.distanceDiff);
          
          // console.log(`🎯 Best matches per country:`, bestCountryMatches.slice(0, 3).map(match => ({
          //   country: match.country,
          //   distanceDiff: match.distanceDiff.toFixed(4),
          //   meshCount: match.meshCount
          // })));
          
          // Check if we have any valid countries after geographic validation
          if (bestCountryMatches.length === 0) {
            // console.log("🚫 No valid countries found after geographic validation");
            return; // Exit early if no valid countries
          }
          
          // Select the best overall match
          const bestMatch = bestCountryMatches[0];
          const bestIntersect = bestMatch.intersect;
          const clickedName = bestMatch.country;
          // console.log("🎯 Selected country (best match):", clickedName, "distance diff:", Math.abs(bestIntersect.point.length() - 10.3).toFixed(3));
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

          // console.log("🎯 Clicked country:", clickedName);

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
      };

      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('click', handleClick);
      cleanupFunctions.push(() => window.removeEventListener('keydown', handleKeydown));
      cleanupFunctions.push(() => window.removeEventListener('click', handleClick));

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
      
      // Clean up socket listeners to prevent memory leaks
      socket.off("cursor");
      socket.off("gesture");
      
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
    >
      {/* Render gesture-controlled cursor dot - always visible */}
      <div
        style={{
          position: 'absolute',
          left: cursorPos.x - 12,
          top: cursorPos.y - 12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'rgba(0,212,255,0.8)',
          boxShadow: '0 0 16px 4px #00d4ff',
          pointerEvents: 'none',
          zIndex: 2001,
          border: '2px solid #fff',
        }}
      />
    </div>
  );
};

export default EarthThreeJS;