import React, { useCallback, memo } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

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

  // Memoize navigation callbacks
  const handleStartExploration = useCallback(() => {
    navigate("/explore");
  }, [navigate]);

  const handleHeritageMode = useCallback(() => {
    navigate("/heritage");
  }, [navigate]);

  return (
    <div className="landing-page">

      {/* Sleek Themed Header */}
      <header className="header">
        <div className="logo">🌐 GeoSwipe</div>
        <nav className="nav-links">
          <a href="#features">Features</a>
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
      </div>
    </div>
  );
};

export default LandingPage;