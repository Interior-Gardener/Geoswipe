 import React, { useCallback, memo, useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Memoize socket connection to prevent reconnections
const getSocket = (() => {
  let socket = null;
  return () => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      });
      
      // Add connection event handlers for debugging
      socket.on('connect', () => {
        console.log('🔗 Socket connected to backend for gesture control');
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected from backend');
      });
      
      socket.on('connect_error', (error) => {
        console.log('❌ Socket connection error:', error);
      });
    }
    return socket;
  };
})();

const socket = getSocket();

// Memoized feature component
const Feature = memo(({ icon, title, description, onClick, clickable = false }) => (
  <div 
    className={`feature ${clickable ? 'clickable' : ''}`} 
    onClick={onClick} 
    style={{ cursor: clickable ? 'pointer' : 'default' }}
  >
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
));

Feature.displayName = 'Feature';

const LandingPage = () => {
  const navigate = useNavigate();
  const cursorPosRef = useRef({ x: 400, y: 300 }); // Ref to store current cursor position for gesture handlers
  const containerRef = useRef(null);

  // Memoize navigation callbacks
  const handleStartExploration = useCallback(() => {
    navigate("/explore");
  }, [navigate]);

  const handleHeritageMode = useCallback(() => {
    navigate("/heritage");
  }, [navigate]);

  // Setup gesture control listeners
  useEffect(() => {
    // Store cleanup functions
    const cleanupFunctions = [];

    // Handle cursor movement - only track position for click detection
    const handleCursor = (data) => {
      const container = containerRef.current;
      if (!container) return;
      
      // Handle clearing cursor when data.x or data.y is None/null
      if (data.x === null || data.y === null) {
        return; // Keep cursor position but don't update
      }
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Improved mapping with calibration adjustments for better edge detection
      const calibrationPadding = 0.1; // 10% padding for better edge detection
      
      // Map with expanded range, then clamp to screen bounds
      let x = (data.x - calibrationPadding) / (1 - 2 * calibrationPadding) * width;
      let y = (data.y - calibrationPadding) / (1 - 2 * calibrationPadding) * height;
      
      // Clamp to screen boundaries
      x = Math.max(0, Math.min(width, x));
      y = Math.max(0, Math.min(height, y));
      
      console.log("📍 Landing page cursor position:", { 
        originalX: data.x,
        originalY: data.y,
        mappedX: x,
        mappedY: y,
        screenWidth: width,
        screenHeight: height
      });
      
      // Update only the ref for click detection (GlobalGestureCursor handles display)
      cursorPosRef.current = { x, y };
    };

    // Handle gesture clicks
    const handleGesture = (data) => {
      if (data.gesture === "click") {
        const currentCursorPos = cursorPosRef.current;
        console.log("🎯 Landing page gesture click detected at:", currentCursorPos);
        
        // Get the element at cursor position
        const elementAtCursor = document.elementFromPoint(currentCursorPos.x, currentCursorPos.y);
        
        if (elementAtCursor) {
          console.log("🔘 Element at cursor:", elementAtCursor);
          
          // Find the closest clickable element (button, feature, or nav link)
          let clickableElement = elementAtCursor;
          
          // Traverse up to find clickable parent
          while (clickableElement && clickableElement !== document.body) {
            if (
              clickableElement.tagName === 'BUTTON' ||
              clickableElement.classList.contains('feature') ||
              clickableElement.classList.contains('clickable') ||
              clickableElement.tagName === 'A' ||
              clickableElement.onclick
            ) {
              console.log("✅ Found clickable element:", clickableElement);
              
              // Add visual feedback
              const originalTransform = clickableElement.style.transform;
              const originalFilter = clickableElement.style.filter;
              clickableElement.style.transform = 'scale(0.95)';
              clickableElement.style.filter = 'brightness(1.2)';
              
              setTimeout(() => {
                clickableElement.style.transform = originalTransform;
                clickableElement.style.filter = originalFilter;
              }, 150);
              
              // Trigger click
              clickableElement.click();
              break;
            }
            clickableElement = clickableElement.parentElement;
          }
        }
        
        // Add visual debug marker
        const debugMarker = document.createElement('div');
        debugMarker.style.cssText = `
          position: fixed;
          left: ${currentCursorPos.x - 5}px;
          top: ${currentCursorPos.y - 5}px;
          width: 10px;
          height: 10px;
          background: lime;
          border: 2px solid black;
          border-radius: 50%;
          z-index: 10000;
          pointer-events: none;
        `;
        document.body.appendChild(debugMarker);
        setTimeout(() => debugMarker.remove(), 2000);
      }
    };

    // Listen for cursor and gesture events
    socket.on("cursor", handleCursor);
    socket.on("gesture", handleGesture);
    
    cleanupFunctions.push(() => {
      socket.off("cursor", handleCursor);
      socket.off("gesture", handleGesture);
    });

    // Cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  return (
    <div className="landing-page" ref={containerRef}>

      {/* Sleek Themed Header */}
      <header className="header">
        <div className="logo">🌐 GeoSwipe</div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#gestures">Gesture Controls</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div className="landing-content">
        <div className="hero-section">
          <h1 className="title">GeoSwipe</h1>
          <h2 className="subtitle">Explore Earth Like Never Before</h2>
          <p className="description">
            Embark on an interactive journey around our planet. Discover countries, 
            explore geographical features, and experience Earth in stunning 3D visualization 
            powered by cutting-edge web technologies.
          </p>
        </div>
        
        <div className="features" id="features">
          {/* Interactive Globe - Clickable */}
          <Feature
            icon="🌍"
            title="Interactive Globe"
            description="Rotate, zoom, and explore Earth with smooth 3D interactions"
            onClick={handleStartExploration}
            clickable={true}
          />

          {/* Heritage Mode - Clickable */}
          <Feature
            icon="🏛️"
            title="Heritage Mode"
            description="Explore cultural heritage sites from around the globe"
            onClick={handleHeritageMode}
            clickable={true}
          />
        </div>

        {/* Hand Gesture Controls Section */}
        <div className="gesture-controls-section" id="gestures">
          <h2 className="section-title">✋ Hand Gesture Controls</h2>
          <p className="section-subtitle">Control the Earth globe with simple hand gestures</p>
          
          <div className="gesture-grid">
            {/* Thumbs Up */}
            <div className="gesture-card">
              <div className="gesture-icon">👍</div>
              <h3 className="gesture-name">Thumbs Up</h3>
              <p className="gesture-description">Rotate Earth upward</p>
            </div>

            {/* Thumbs Down */}
            <div className="gesture-card">
              <div className="gesture-icon">👎</div>
              <h3 className="gesture-name">Thumbs Down</h3>
              <p className="gesture-description">Rotate Earth downward</p>
            </div>

            {/* Two Fingers Right Tilt */}
            <div className="gesture-card">
              <div className="gesture-icon">🤞➡️</div>
              <h3 className="gesture-name">Two Fingers Right</h3>
              <p className="gesture-description">Rotate Earth to the right</p>
            </div>

            {/* Two Fingers Left Tilt */}
            <div className="gesture-card">
              <div className="gesture-icon">🤞⬅️</div>
              <h3 className="gesture-name">Two Fingers Left</h3>
              <p className="gesture-description">Rotate Earth to the left</p>
            </div>

            {/* Pinch */}
            <div className="gesture-card">
              <div className="gesture-icon">🤏</div>
              <h3 className="gesture-name">Pinch</h3>
              <p className="gesture-description">Zoom out from Earth</p>
            </div>

            {/* L Sign - Zoom In */}
            <div className="gesture-card">
              <div className="gesture-icon">👆</div>
              <h3 className="gesture-name">L Sign</h3>
              <p className="gesture-description">Index finger up + thumb open = Zoom in</p>
            </div>

            {/* Palm - Move Cursor */}
            <div className="gesture-card">
              <div className="gesture-icon">🖐️</div>
              <h3 className="gesture-name">Palm</h3>
              <p className="gesture-description">Move cursor around the screen</p>
            </div>

            {/* OK Sign - Click */}
            <div className="gesture-card">
              <div className="gesture-icon">👌</div>
              <h3 className="gesture-name">OK Sign</h3>
              <p className="gesture-description">Click on elements</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="about-section" id="about">
          <h2 className="section-title">About GeoSwipe</h2>
          <p className="about-text">
            GeoSwipe is an innovative web application that combines 3D Earth visualization 
            with gesture-based controls. Experience a new way to explore our planet using 
            simple hand gestures captured through your webcam.
          </p>
        </div>

        {/* Contact Section */}
        <div className="contact-section" id="contact">
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-text">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;