import React from 'react';
import { useParams } from 'react-router-dom';

const SketchfabViewer = ({ uid: propUid }) => {
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
