import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

// Reuse the same socket connection pattern
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
    }
    return socket;
  };
})();

const GlobalGestureCursor = () => {
  const location = useLocation();
  const [cursorPos, setCursorPos] = useState({ x: 400, y: 300 });
  const [isVisible, setIsVisible] = useState(false);

  // Hide cursor on Heritage page
  const shouldHideCursor = location.pathname === '/heritage' || 
                          location.pathname.startsWith('/heritage-storybook') ||
                          location.pathname.startsWith('/how-to-reach');

  useEffect(() => {
    const socket = getSocket();
    
    const handleCursor = (data) => {
      // Handle clearing cursor when data.x or data.y is None/null
      if (data.x === null || data.y === null) {
        setIsVisible(false);
        return;
      }
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Improved mapping with calibration adjustments
      const calibrationPadding = 0.1;
      
      let x = (data.x - calibrationPadding) / (1 - 2 * calibrationPadding) * width;
      let y = (data.y - calibrationPadding) / (1 - 2 * calibrationPadding) * height;
      
      x = Math.max(0, Math.min(width, x));
      y = Math.max(0, Math.min(height, y));
      
      setCursorPos({ x, y });
      setIsVisible(true);
    };

    socket.on("cursor", handleCursor);

    return () => {
      socket.off("cursor", handleCursor);
    };
  }, []);

  // Don't render cursor on Heritage-related pages
  if (!isVisible || shouldHideCursor) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: cursorPos.x - 12,
        top: cursorPos.y - 12,
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'rgba(0,212,255,0.8)',
        boxShadow: '0 0 16px 4px #00d4ff',
        pointerEvents: 'none',
        zIndex: 999999, // Very high z-index to ensure it's always on top
        border: '2px solid #fff',
        transition: 'opacity 0.2s ease',
      }}
    />
  );
};

export default GlobalGestureCursor;
