import React, { useCallback, memo, useEffect, useRef } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { getGestureBus } from './utils/gestureBus';

const TEAM = [
  {
    name: 'Kushal Soni',
    email: 'sonikushal237@gmail.com',
    github: 'https://github.com/kushal-s0',
    linkedin: 'https://www.linkedin.com/in/kushaldsoni/'
  },
  {
    name: 'Kartik Verma',
    email: 'kartikverma2204@gmail.com',
    github: 'https://github.com/Interior-Gardener',
    linkedin: 'https://www.linkedin.com/in/kartikverma2204/'
  },
  {
    name: 'Bhavana Suthar',
    email: 'bhavnasuthar150@gmail.com',
    github: 'https://github.com/bhavna382',
    linkedin: 'https://www.linkedin.com/in/bhavna-s-073986345/'
  },
  {
    name: 'Shreeya Sati',
    email: 'shreeyasati@gmail.com',
    // Preserved from the previous markup, where the displayed address and the
    // mailto target differed. Confirm which is correct.
    mailto: 'shreeya.sati@somaiya.edu',
    github: 'https://github.com/shreeya-238',
    linkedin: 'https://www.linkedin.com/in/shreeya-sati-659781345/'
  }
];

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

// Gesture and cursor events come from in-browser MediaPipe detection (see
// components/CameraCapture.jsx). This component previously opened its own
// Socket.IO connection solely to receive them from a server-side Python worker.

const socket = getGestureBus();

// Memoized feature component
// A clickable card must be a real button: the previous <div onClick> could not
// be reached by keyboard and was invisible to assistive technology.
const Feature = memo(({ icon, title, description, onClick, clickable = false }) => {
  const content = (
    <>
      <div className="feature-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {clickable && <span className="feature-cta">Open <span aria-hidden="true">→</span></span>}
    </>
  );

  if (!clickable) {
    return <div className="feature">{content}</div>;
  }

  return (
    <button type="button" className="feature clickable" onClick={onClick}>
      {content}
    </button>
  );
});

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
            description="Explore Earth in 3D with games, quizzes & multiplayer challenges"
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
          <ul className="team-grid">
            {TEAM.map((member) => (
              <li key={member.name} className="team-card">
                <h3 className="team-card__name">{member.name}</h3>
                <a className="team-card__email" href={`mailto:${member.mailto || member.email}`}>
                  {member.email}
                </a>
                <div className="team-card__links">
                  <a
                    className="team-link"
                    href={`mailto:${member.mailto || member.email}`}
                    aria-label={`Email ${member.name}`}
                  >
                    <MailIcon />
                    <span>Email</span>
                  </a>
                  <a
                    className="team-link"
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on GitHub`}
                  >
                    <GitHubIcon />
                    <span>GitHub</span>
                  </a>
                  <a
                    className="team-link"
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedInIcon />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
