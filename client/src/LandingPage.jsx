import React from 'react'
import './LandingPage.css'

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="hero-section">
          <h1 className="title">GeoSwipe</h1>
          <h2 className="subtitle">Explore Earth Like Never Before</h2>
          <p className="description">
            Embark on an interactive journey around our planet. Discover countries, 
            explore geographical features, and experience Earth in stunning 3D visualization 
            powered by cutting-edge web technologies.
          </p>
          <button className="start-button" onClick={onStart}>
            <span className="button-text">Start Exploration</span>
            <div className="button-glow"></div>
          </button>
        </div>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🌍</div>
            <h3>Interactive Globe</h3>
            <p>Rotate, zoom, and explore Earth with smooth 3D interactions</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🗺️</div>
            <h3>Country Details</h3>
            <p>Click on any country to discover detailed information</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌟</div>
            <h3>Real-time Rendering</h3>
            <p>Experience high-quality graphics with WebGL technology</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage