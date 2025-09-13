import React from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartExploration = () => {
    navigate("/explore");
  };

  const handleHeritageMode = () => {
    navigate("/heritage");
  };

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
          <div className="feature clickable" onClick={handleStartExploration} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🌍</div>
            <h3>Interactive Globe</h3>
            <p>Rotate, zoom, and explore Earth with smooth 3D interactions</p>
          </div>

          {/* Heritage Mode - Clickable */}
          <div className="feature clickable" onClick={handleHeritageMode} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🏛️</div>
            <h3>Heritage Mode</h3>
            <p>Explore cultural heritage sites from around the globe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;