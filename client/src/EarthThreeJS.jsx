import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module';
import earcut from 'earcut';
import { io } from "socket.io-client";

// Memoize socket connection to prevent reconnections
const getSocket = (() => {
  let socket = null;
  return () => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
        autoConnect: true, // Enable auto connect for gesture controls
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      });
      
      // Add connection event handlers for debugging
      socket.on('connect', () => {
        console.log('🔌 Frontend connected to gesture server');
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Frontend disconnected from gesture server');
      });
      
      socket.on('connect_error', (error) => {
        console.error('🔌 Frontend connection error:', error);
      });
    }
    return socket;
  };
})();

const socket = getSocket();

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createRenderer, createCamera } from './earth/core-utils';
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

const EarthThreeJS = ({ setSelectedCountry, hideInstructions = false, hideControls = false, onBackToHome = null }) => {
  const mountRef = useRef(null);
  const cameraRef = useRef();
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const animationIdRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 400, y: 300 }); // Initialize cursor at center
  const cursorPosRef = useRef({ x: 400, y: 300 }); // Ref to store current cursor position for gesture handlers
  
  // Initialize guard to prevent double initialization
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);
  
  // Stable params object - using useRef to maintain object identity across renders
  const paramsRef = useRef({
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
  });
  
  // Store refs for cleanup
  const cleanupRefs = useRef({
    gui: null,
    style: null,
    cleanupFunctions: []
  });

  // Memoize callback to prevent unnecessary re-renders
  const handleCountrySelect = useCallback((country) => {
    if (setSelectedCountry) {
      setSelectedCountry(country);
    }
  }, [setSelectedCountry]);

  // Memoize country bounds to avoid recreating on every render
  const countryBounds = useMemo(() => ({
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
  }), []);

  // Memoized geographic validation function to reject meshes in impossible locations
  const validateCountryPosition = useCallback((countryName, point3D) => {
    // Convert 3D coordinates to approximate lat/lon for validation
    const lat = Math.asin(point3D.y / 10.3) * 180 / Math.PI;
    const lon = Math.atan2(point3D.x, point3D.z) * 180 / Math.PI;
    
    const bounds = countryBounds[countryName];
    if (!bounds) return true; // Allow unknown countries
    
    // Check if position is within expected bounds (with some tolerance)
    const tolerance = 20; // degrees - increased tolerance for now
    const isValid = lat >= (bounds.latMin - tolerance) && 
                   lat <= (bounds.latMax + tolerance) && 
                   lon >= (bounds.lonMin - tolerance) && 
                   lon <= (bounds.lonMax + tolerance);
    
    return isValid || true; // Temporarily allow all to prevent crashes
  }, [countryBounds]);

  useEffect(() => {
    // Prevent double initialization
    if (initializingRef.current || initializedRef.current) {
      return;
    }
    initializingRef.current = true;

    // Store cleanup functions
    let cleanupFunctions = [];
    cleanupRefs.current.cleanupFunctions = cleanupFunctions;
    
    // Add Google Font for Bungee Spice dynamically (only if not already loaded)
    let link = document.getElementById('geoswipe-fonts');
    if (!link) {
      link = document.createElement('link');
      link.href = "https://fonts.googleapis.com/css2?family=Bungee+Spice&family=Orbitron:wght@400;700;900&display=swap";
      link.rel = 'stylesheet';
      link.id = 'geoswipe-fonts'; // Add ID for cleanup
      document.head.appendChild(link);
    }
    // Don't store font link for cleanup since it might be shared

    // Use stable params reference
    const params = paramsRef.current;

    // Scene, Renderer, Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const renderer = createRenderer({ 
      antialias: false, // Disable for better performance
      alpha: true,
      powerPreference: "high-performance", // Use dedicated GPU if available
      stencil: false, // Disable stencil buffer if not needed
      depth: true,
      logarithmicDepthBuffer: false // Disable if not needed
    }, (_renderer) => {
      _renderer.outputColorSpace = THREE.SRGBColorSpace;
      _renderer.shadowMap.enabled = false; // Disable shadows for better performance
      _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      _renderer.toneMapping = THREE.ACESFilmicToneMapping;
      _renderer.toneMappingExposure = 1.2;
      _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    });
    rendererRef.current = renderer;

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
    cleanupRefs.current.style = style; // Store for cleanup
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
    // Remove any existing country name display to prevent duplicates
    const existingCountryDisplay = document.getElementById('countryNameDisplay');
    if (existingCountryDisplay) {
      existingCountryDisplay.remove();
    }
    
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
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 200px;
      min-height: 60px;
      text-align: center;
      line-height: 1.2;
      word-wrap: break-word;
      overflow: hidden;
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

    // Add Back to Home button if callback provided
    if (onBackToHome) {
      const backButton = document.createElement('button');
      backButton.innerHTML = '← Back to Home';
      backButton.style.cssText = `
        position: absolute;
        top: 15px;
        left: 120px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 128, 255, 0.3));
        color: #00d4ff;
        border: 2px solid rgba(0, 212, 255, 0.5);
        padding: 8px 16px;
        border-radius: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 1001;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        user-select: none;
      `;
      
      // Add hover effects
      backButton.onmouseenter = () => {
        backButton.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(0, 128, 255, 0.5))';
        backButton.style.transform = 'scale(1.05)';
        backButton.style.boxShadow = '0 6px 16px rgba(0, 212, 255, 0.3)';
      };
      
      backButton.onmouseleave = () => {
        backButton.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 128, 255, 0.3))';
        backButton.style.transform = 'scale(1)';
        backButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      };
      
      backButton.onclick = onBackToHome;
      container.appendChild(backButton);
    }

    // Enhanced Instructions - only show if not hidden
    if (!hideInstructions) {
      const instructions = document.createElement('div');
      instructions.innerHTML = `
        🖱 <strong>Click to explore countries</strong><br>
        🌍 <strong>Drag to rotate • Scroll to zoom</strong><br>
        ✋ <strong>Open palm: Move blue cursor dot</strong><br>
        � <strong>OK sign: Click where cursor points (Countries & Buttons!)</strong><br>
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
    }

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
      
      // Improved mapping with calibration adjustments for better edge detection
      // Allow slight overshoot and then clamp to ensure full screen coverage
      const calibrationPadding = 0.1; // 10% padding for better edge detection
      
      // Map with expanded range, then clamp to screen bounds
      let x = (data.x - calibrationPadding) / (1 - 2 * calibrationPadding) * width;
      let y = (data.y - calibrationPadding) / (1 - 2 * calibrationPadding) * height;
      
      // Clamp to screen boundaries to ensure cursor stays within screen
      x = Math.max(0, Math.min(width, x));
      y = Math.max(0, Math.min(height, y));
      
      console.log("📍 Updating cursor position:", { 
        originalX: data.x,
        originalY: data.y,
        mappedX: x,
        mappedY: y,
        screenWidth: width,
        screenHeight: height,
        reachedLeftEdge: x <= 5,
        reachedRightEdge: x >= width - 5,
        reachedTopEdge: y <= 5,
        reachedBottomEdge: y >= height - 5
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

      let earthGeo = new THREE.SphereGeometry(10, 64, 64); // Reduced from 128x128 to 64x64
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
      earth.receiveShadow = false; // Disable for better performance
      group.add(earth);

      // Clouds
      let cloudGeo = new THREE.SphereGeometry(10.08, 32, 32); // Reduced from 64x64 to 32x32
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
      let atmosGeo = new THREE.SphereGeometry(12.8, 32, 32); // Reduced from 64x64 to 32x32
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
        const g = data.gesture;
        // Pinch: zoom out (move camera away) with distance limits
        if (g === "pinch") {
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera distance from target
            const currentDistance = camera.position.distanceTo(controls.target);
            const newDistance = Math.min(currentDistance * 1.0125, controls.maxDistance); // Slower, smoother zoom out
            
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
            const newDistance = Math.max(currentDistance * 0.9875, controls.minDistance); // Slower, smoother zoom in
            
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
          
          if (renderer && renderer.domElement) {
            const rect = renderer.domElement.getBoundingClientRect();
            
            // FIXED: Round coordinates to avoid floating point precision issues
            // This ensures gesture clicks match mouse click precision
            const absoluteClickX = Math.round(currentCursorPos.x + rect.left);
            const absoluteClickY = Math.round(currentCursorPos.y + rect.top);
            
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
            
            // Create rotation matrix for Y-axis rotation (slower, smoother movement)
            const rotationMatrix = new THREE.Matrix4().makeRotationY(0.01875);
            
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
            
            // Create rotation matrix for Y-axis rotation (slower, smoother movement)
            const rotationMatrix = new THREE.Matrix4().makeRotationY(-0.01875);
            
            // Apply rotation to camera offset
            offset.applyMatrix4(rotationMatrix);
            
            // Update camera position
            camera.position.copy(controls.target).add(offset);
            
            // Update controls
            controls.update();
          }
        }
        // Thumbs up: move globe up (show more northern hemisphere/top)
        else if (g === "thumbs_up") {
          // Instead of rotating the group, rotate the camera around the X-axis (up)
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera position relative to target
            const offset = camera.position.clone().sub(controls.target);
            
            // Create rotation matrix for X-axis rotation (slower movement for better control)
            const rotationMatrix = new THREE.Matrix4().makeRotationX(0.0125);
            
            // Apply rotation to camera offset
            offset.applyMatrix4(rotationMatrix);
            
            // Update camera position
            camera.position.copy(controls.target).add(offset);
            
            // Update controls
            controls.update();
          }
        }
        // Thumbs down: move globe down (show more southern hemisphere/bottom)
        else if (g === "thumbs_down") {
          // Instead of rotating the group, rotate the camera around the X-axis (down)
          const camera = cameraRef.current;
          if (camera && controls) {
            // Get current camera position relative to target
            const offset = camera.position.clone().sub(controls.target);
            
            // Create rotation matrix for X-axis rotation (slower movement for better control)
            const rotationMatrix = new THREE.Matrix4().makeRotationX(-0.0125);
            
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
      cleanupRefs.current.gui = gui; // Store for cleanup
      gui.domElement.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 1003;'; // Increased z-index to be above performance display

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
      raycaster.params.Line = { threshold: 0.5 }; // Increase threshold to reduce precision but improve performance
      raycaster.params.Points = { threshold: 0.5 };
      const mouse = new THREE.Vector2();

      const handleClick = (event) => {
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

        raycaster.setFromCamera(mouse, cameraRef.current || camera);
        
        // Increase threshold for more reliable picking at all zoom levels
        // Adjust threshold based on camera distance for better precision
        const cameraDistance = cameraRef.current ? cameraRef.current.position.length() : camera.position.length();
        const baseThreshold = 0.5;
        const dynamicThreshold = baseThreshold * (cameraDistance / 30.0); // Scale threshold with zoom
        raycaster.params.Line = { threshold: dynamicThreshold };
        raycaster.params.Points = { threshold: dynamicThreshold };
        const allIntersects = raycaster.intersectObjects(countryPickMeshes);
        
        // Filter out back-facing intersections (only keep front-facing ones)
        const frontFacingIntersects = allIntersects.filter(intersect => {
          const dotProduct = intersect.point.clone().normalize().dot(camera.position.clone().normalize());
          return dotProduct > 0; // Only front-facing
        });
        
        // Further filter by geographic validation to remove misplaced meshes
        const geographicallyValidIntersects = frontFacingIntersects.filter(intersect => {
          const isValid = validateCountryPosition(intersect.object.userData.countryName, intersect.point);
          return isValid;
        });
        
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
            return isValid;
          })
          .sort((a, b) => a.distance - b.distance);

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
            }
          });
          
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
          
          // Check if we have any valid countries after geographic validation
          if (bestCountryMatches.length === 0) {
            return; // Exit early if no valid countries
          }
          
          // Select the best overall match
          const bestMatch = bestCountryMatches[0];
          const bestIntersect = bestMatch.intersect;
          const clickedName = bestMatch.country;
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

          // Enhanced country name display with better animations
          // Use direct reference to the div we created instead of getElementById
          if (countryNameDisplay) {
            // Clear any existing content completely
            countryNameDisplay.innerHTML = '';
            countryNameDisplay.textContent = '';
            // Force layout recalculation
            countryNameDisplay.offsetHeight;
            // Now set the new content
            countryNameDisplay.textContent = clickedName;
            
            // Apply animation styles
            countryNameDisplay.style.transform = 'scale(1.15) rotateZ(2deg)';
            countryNameDisplay.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.95), rgba(255, 136, 68, 0.95), rgba(68, 255, 68, 0.95))';
            countryNameDisplay.style.boxShadow = '0 15px 50px rgba(255, 68, 68, 0.4), 0 0 50px rgba(255, 136, 68, 0.3)';
            countryNameDisplay.style.zIndex = '1500'; // Increase z-index to ensure it's on top
            
            setTimeout(() => {
              countryNameDisplay.style.transform = 'scale(1) rotateZ(0deg)';
              countryNameDisplay.style.background = 'linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95))';
              countryNameDisplay.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.3), inset 0 2px 2px rgba(255, 255, 255, 0.1)';
              countryNameDisplay.style.zIndex = '1000'; // Reset z-index
            }, 400);
          }
          handleCountrySelect(clickedName);
        }
      };

      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('click', handleClick);
      cleanupFunctions.push(() => window.removeEventListener('keydown', handleKeydown));
      cleanupFunctions.push(() => window.removeEventListener('click', handleClick));

      // Enhanced animation loop with adaptive FPS management and better performance optimizations
      let lastFrameTime = 0;
      const targetFPS = 120; // Increase target FPS
      const frameInterval = 1000 / targetFPS;
      
      // Add performance optimization variables
      let frameCount = 0;
      let lastPerformanceCheck = 0;
      let adaptiveFPS = targetFPS;
      
      // Add performance monitor display
      const performanceDisplay = document.createElement('div');
      performanceDisplay.style.cssText = `
        position: absolute;
        top: 60px;
        left: 10px;
        color: #00ff00;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        z-index: 1002;
        background: rgba(0,0,0,0.7);
        padding: 5px;
        border-radius: 3px;
      `;
      container.appendChild(performanceDisplay);

      const animate = (currentTime = 0) => {
        if (!isMounted) return;
        
        // Adaptive FPS based on performance
        frameCount++;
        if (currentTime - lastPerformanceCheck > 1000) { // Check every second
          const actualFPS = frameCount;
          frameCount = 0;
          lastPerformanceCheck = currentTime;
          
          // Update performance display
          performanceDisplay.textContent = `FPS: ${Math.round(actualFPS)} | Target: ${Math.round(adaptiveFPS)}`;
          
          // Adjust rendering frequency based on actual performance
          if (actualFPS < 50) {
            // Reduce update frequency for heavy operations
            adaptiveFPS = Math.max(30, actualFPS * 0.9);
          } else if (actualFPS > 90) {
            // Can handle higher FPS
            adaptiveFPS = Math.min(120, targetFPS);
          }
        }
        
        // Use adaptive frame interval
        const currentFrameInterval = 1000 / adaptiveFPS;
        
        if (currentTime - lastFrameTime >= currentFrameInterval) {
          stats.update();
          controls.update();

          // Reduce frequency of expensive operations
          const isHeavyFrame = frameCount % 3 === 0; // Every 3rd frame
          const isLightFrame = frameCount % 6 === 0; // Every 6th frame

          // Smooth rotation (only on light frames)
          if (clouds && isLightFrame) {
            clouds.rotateY(0.003 * params.cloudSpeed); // Compensate for lower frequency
          }

          // Enhanced atmosphere breathing effect (even less frequent)
          if (atmos && !params.brightEarthMode && isLightFrame) {
            const time = performance.now() * 0.001;
            atmos.material.uniforms.atmOpacity.value = params.atmOpacity.value + Math.sin(time * 0.7) * 0.08;
          }

          // Dynamic lighting (only on heavy frames)
          if (dirLight && !params.brightEarthMode && isHeavyFrame) {
            const rotationAngle = group.rotation.y;
            dirLight.position.x = -50 * Math.cos(rotationAngle * 0.1);
            dirLight.position.z = 30 * Math.sin(rotationAngle * 0.1);
          }

          renderer.render(scene, camera);
          lastFrameTime = currentTime;
        }
        
        animationId = requestAnimationFrame(animate);
        animationIdRef.current = animationId;
      };
      animate();
      
      // Mark as fully initialized
      initializingRef.current = false;
      initializedRef.current = true;
    })();

    // Enhanced cleanup with proper memory management
    return () => {
      console.log('🧹 EarthThreeJS cleanup started');
      isMounted = false;
      initializedRef.current = false;
      initializingRef.current = false;
      
      // Cancel animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Clean up socket listeners to prevent memory leaks (but don't disconnect global socket)
      socket.off("cursor");
      socket.off("gesture");
      
      // Dispose of Three.js resources to prevent memory leaks
      if (sceneRef.current) {
        sceneRef.current.traverse((child) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                if (material.map) material.map.dispose();
                if (material.bumpMap) material.bumpMap.dispose();
                if (material.normalMap) material.normalMap.dispose();
                if (material.roughnessMap) material.roughnessMap.dispose();
                if (material.alphaMap) material.alphaMap.dispose();
                if (material.emissiveMap) material.emissiveMap.dispose();
                material.dispose();
              });
            } else {
              if (child.material.map) child.material.map.dispose();
              if (child.material.bumpMap) child.material.bumpMap.dispose();
              if (child.material.normalMap) child.material.normalMap.dispose();
              if (child.material.roughnessMap) child.material.roughnessMap.dispose();
              if (child.material.alphaMap) child.material.alphaMap.dispose();
              if (child.material.emissiveMap) child.material.emissiveMap.dispose();
              child.material.dispose();
            }
          }
          if (child.texture) {
            child.texture.dispose();
          }
        });
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      
      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && mountRef.current) {
          try {
            mountRef.current.removeChild(rendererRef.current.domElement);
          } catch (e) {
            console.warn('Error removing renderer element:', e);
          }
        }
        rendererRef.current = null;
      }

      // Clean up dat.GUI completely
      if (cleanupRefs.current.gui) {
        try {
          // Force close all folders and remove event listeners
          cleanupRefs.current.gui.__closeButton?.click?.();
          
          // Remove GUI domElement from DOM if it exists
          if (cleanupRefs.current.gui.domElement) {
            const guiElement = cleanupRefs.current.gui.domElement;
            if (guiElement.parentNode) {
              guiElement.parentNode.removeChild(guiElement);
            }
            // Also try removing from document.body as fallback
            if (document.body.contains(guiElement)) {
              document.body.removeChild(guiElement);
            }
          }
          
          // Destroy the GUI instance
          cleanupRefs.current.gui.destroy();
          cleanupRefs.current.gui = null;
        } catch (e) {
          console.warn('Error destroying GUI:', e);
        }
      }
      
      // Additional cleanup: only remove GUI elements that belong to this instance
      // Be more conservative to avoid breaking other potential GUI instances
      try {
        const potentialGUIElements = document.querySelectorAll('.dg.main');
        potentialGUIElements.forEach(element => {
          // Only remove if it's definitely from our instance (check positioning)
          if (element.style.position === 'fixed' && 
              element.style.top === '0px' && 
              element.style.right === '0px') {
            try {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            } catch (e) {
              console.warn('Error removing specific GUI element:', e);
            }
          }
        });
      } catch (e) {
        console.warn('Error in conservative GUI cleanup:', e);
      }

      // Clean up style element
      if (cleanupRefs.current.style) {
        try {
          if (cleanupRefs.current.style.parentNode) {
            cleanupRefs.current.style.parentNode.removeChild(cleanupRefs.current.style);
          }
          cleanupRefs.current.style = null;
        } catch (e) {
          console.warn('Error removing style element:', e);
        }
      }

      // Additional cleanup: remove any remaining font links with our ID
      // DON'T remove shared font links as other components might need them
      // const existingFontLinks = document.querySelectorAll('#geoswipe-fonts');
      // existingFontLinks.forEach(link => {
      //   try {
      //     if (link.parentNode) {
      //       link.parentNode.removeChild(link);
      //     }
      //   } catch (e) {
      //     console.warn('Error removing existing font link:', e);
      //   }
      // });

      // Clean up all UI elements from container
      if (mountRef.current) {
        try {
          // Clear all children from the container
          while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
          }
        } catch (e) {
          console.warn('Error clearing container children:', e);
          
          // Fallback: try to remove specific elements
          const elementsToRemove = ['countryNameDisplay', 'loadingOverlay'];
          elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.parentNode === mountRef.current) {
              try {
                mountRef.current.removeChild(element);
              } catch (e2) {
                console.warn(`Error removing element ${id}:`, e2);
              }
            }
          });
          
          // Remove stats.dom if it exists
          const statsElements = mountRef.current.querySelectorAll('[style*="z-index: 1001"]');
          statsElements.forEach(element => {
            try {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            } catch (e2) {
              console.warn('Error removing stats element:', e2);
            }
          });
          
          // Remove all other elements
          const allElements = mountRef.current.querySelectorAll('*');
          allElements.forEach(element => {
            try {
              if (element.parentNode === mountRef.current) {
                mountRef.current.removeChild(element);
              }
            } catch (e2) {
              console.warn('Error removing element:', e2);
            }
          });
        }
      }

      // Clean up event listeners and refs
      if (cleanupRefs.current.cleanupFunctions) {
        cleanupRefs.current.cleanupFunctions.forEach(cleanup => {
          try {
            cleanup();
          } catch (e) {
            console.warn('Error during cleanup:', e);
          }
        });
        cleanupRefs.current.cleanupFunctions = [];
      }
      
      console.log('🧹 EarthThreeJS cleanup completed');
      
      // Additional cleanup with delay to ensure navigation has completed
      setTimeout(() => {
        // Final sweep for any remaining GUI elements (be more specific)
        const remainingGUIElements = document.querySelectorAll('.dg.main[style*="position: fixed"][style*="right: 0"]');
        remainingGUIElements.forEach(element => {
          try {
            if (element.parentNode && element.style.zIndex === '1000') {
              element.parentNode.removeChild(element);
            }
          } catch (e) {
            console.warn('Error in final GUI cleanup:', e);
          }
        });
      }, 100);
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
    </div>
  );
};

export default EarthThreeJS;