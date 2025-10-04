import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SketchfabViewer = ({ uid: propUid }) => {
  const navigate = useNavigate();
  
  // Allow both prop and URL param usage
  let uid = propUid;
  if (!uid) {
    // If not passed as prop, get from URL
    const params = useParams();
    uid = params.uid;
  }
  if (!uid) return <div>No Sketchfab UID provided.</div>;
  
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
          onClick={() => navigate('/heritage')}
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
