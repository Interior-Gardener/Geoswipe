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
          <p className="about-text">
            Discover UNESCO World Heritage Sites, historic monuments, ancient temples, and 
            architectural marvels from around the globe. Our interactive maps feature multiple 
            viewing modes including satellite, street, terrain, and dark themes to enhance your 
            exploration experience.
          </p>
          <p className="about-text">
            Built with cutting-edge technologies like React 19, Three.js for 3D visualization, 
            and MediaPipe for real-time gesture recognition, GeoSwipe offers an immersive 
            educational platform. Challenge yourself with geography quizzes, read detailed 
            heritage storybooks, and plan your visits with integrated "How to Reach" guides.
          </p>
          <p className="about-text">
            Whether you're a student, educator, traveler, or cultural enthusiast, GeoSwipe 
            transforms the way you learn about world heritage and geography. Join us on this 
            journey to make global exploration accessible, interactive, and fun for everyone!
          </p>
        </div>

        {/* Contact Section */}
        <div className="contact-section" id="contact">
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-text">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem', 
            marginTop: '2rem',
            maxWidth: '1000px',
            margin: '2rem auto'
          }}>
            {/* Kushal */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.3rem' }}>Kushal Soni</h3>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                📧 <a href="mailto:sonikushal237@gmail.com" style={{ color: '#00d4ff', textDecoration: 'none' }}>sonikushal237@gmail.com</a>
              </p>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <a href="https://github.com/kushal-s0" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="30" height="30" viewBox="0 0 16 16" fill="#00d4ff" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
              </p>
            </div>

            {/* Kartik */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.3rem' }}>Kartik Verma</h3>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                📧 <a href="mailto:kartikverma2204number1@gmail.com" style={{ color: '#00d4ff', textDecoration: 'none' }}>kartikverma2204number1@gmail.com</a>
              </p>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <a href="https://github.com/Interior-Gardener" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="30" height="30" viewBox="0 0 16 16" fill="#00d4ff" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
              </p>
            </div>

            {/* Bhavana */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.3rem' }}>Bhavana Suthar</h3>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                📧 <a href="mailto:bhavnasuthar150@gmail.com" style={{ color: '#00d4ff', textDecoration: 'none' }}>bhavnasuthar150@gmail.com</a>
              </p>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <a href="https://github.com/bhavna382" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="30" height="30" viewBox="0 0 16 16" fill="#00d4ff" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
              </p>
            </div>

            {/* Shreeya */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.3rem' }}>Shreeya Sati</h3>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                📧 <a href="mailto:shreeya.sati@somaiya.edu" style={{ color: '#00d4ff', textDecoration: 'none' }}>shreeya.sati@somaiya.edu</a>
              </p>
              <p style={{ color: '#b0bec5', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <a href="https://github.com/shreeya-238" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <svg width="30" height="30" viewBox="0 0 16 16" fill="#00d4ff" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;