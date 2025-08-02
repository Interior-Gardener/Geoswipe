import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './globe.jsx'; // keep Three.js separate

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
