import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState
} from './utils/heritageNavigationState';

const SketchfabViewer = ({ uid: propUid }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();
  const currentSelection = extractMonumentFromRouteState(location.state) || selectedMonument;

  const navigateBackToHeritage = () => {
    const state = buildHeritageRouteState(currentSelection);
    if (state) {
      navigate('/heritage', { state });
      return;
    }
    navigate('/heritage');
  };
  
  // Hooks must run unconditionally on every render - useParams was previously
  // called inside an `if`, which breaks the rules of hooks and can desync
  // React's hook order when the component is used with a `uid` prop.
  const params = useParams();
  const uid = propUid || params.uid;

  if (!uid) {
    return (
      <div className="gs-page-loader">
        <div className="gs-state" style={{ background: 'transparent', border: 0 }}>
          <div className="gs-state__icon" aria-hidden="true">🗿</div>
          <h2 className="gs-state__title">No 3D model specified</h2>
          <p className="gs-state__text">This viewer needs a Sketchfab model id to load.</p>
          <button type="button" className="gs-btn gs-btn--primary" onClick={navigateBackToHeritage}>
            Back to Heritage
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      {/* Navigation Buttons */}
      <div style={{ 
        position: 'absolute', 
        top: '50px', 
        left: '20px', 
        zIndex: 10000, 
        display: 'flex', 
        gap: '10px' 
      }}>
        {/* Back Button */}
        <button 
          onClick={navigateBackToHeritage}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
          }}
        >
          ← Back
        </button>

        {/* Home Button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
          }}
        >
          🏠 Home
        </button>
      </div>

      <iframe
        title="Sketchfab 3D Model"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        src={`https://sketchfab.com/models/${uid}/embed?autostart=1&ui_theme=dark`}
        allow="autoplay; fullscreen; vr"
      ></iframe>
    </div>
  );
};

export default SketchfabViewer;
