import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Reuse the same socket connection pattern from EarthThreeJS
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

const GestureButton = ({ 
  onClick, 
  children, 
  style = {}, 
  disabled = false,
  className = "",
  gestureEnabled = true,
  ...props 
}) => {
  const buttonRef = useRef(null);
  const [isGestureHovered, setIsGestureHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!gestureEnabled) return;

    const socket = getSocket();
    
    // Handle cursor position updates
    const handleCursor = (data) => {
      if (data.x === null || data.y === null) {
        setIsGestureHovered(false);
        return;
      }
      
      // Convert normalized coordinates to screen coordinates
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const calibrationPadding = 0.1;
      let x = (data.x - calibrationPadding) / (1 - 2 * calibrationPadding) * screenWidth;
      let y = (data.y - calibrationPadding) / (1 - 2 * calibrationPadding) * screenHeight;
      
      x = Math.max(0, Math.min(screenWidth, x));
      y = Math.max(0, Math.min(screenHeight, y));
      
      setCursorPos({ x, y });
      
      // Check if cursor is over this button
      if (buttonRef.current && !disabled) {
        const rect = buttonRef.current.getBoundingClientRect();
        const isOver = (
          x >= rect.left && 
          x <= rect.right && 
          y >= rect.top && 
          y <= rect.bottom
        );
        setIsGestureHovered(isOver);
      }
    };

    // Handle gesture clicks
    const handleGesture = (data) => {
      if (data.gesture === "click" && isGestureHovered && !disabled && onClick) {
        console.log("🎯 Gesture click detected on button:", children);
        
        // Add visual feedback for gesture click
        if (buttonRef.current) {
          const button = buttonRef.current;
          const originalTransform = button.style.transform;
          button.style.transform = 'scale(0.95)';
          button.style.boxShadow = '0 0 20px #00ff00';
          
          setTimeout(() => {
            button.style.transform = originalTransform;
            button.style.boxShadow = style.boxShadow || '';
          }, 150);
        }
        
        onClick();
      }
    };

    socket.on("cursor", handleCursor);
    socket.on("gesture", handleGesture);

    return () => {
      socket.off("cursor", handleCursor);
      socket.off("gesture", handleGesture);
    };
  }, [gestureEnabled, isGestureHovered, disabled, onClick, children, style.boxShadow]);

  const combinedStyle = {
    ...style,
    border: isGestureHovered ? '3px solid #00ff00' : (style.border || 'none'),
    boxShadow: isGestureHovered 
      ? '0 0 15px rgba(0, 255, 0, 0.6), ' + (style.boxShadow || '')
      : (style.boxShadow || ''),
    transition: 'all 0.2s ease, border 0.1s ease, box-shadow 0.1s ease',
    // Don't override position - use the one from style prop
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      style={combinedStyle}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
      {isGestureHovered && gestureEnabled && (
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '12px',
            height: '12px',
            background: '#00ff00',
            borderRadius: '50%',
            boxShadow: '0 0 8px #00ff00',
            animation: 'pulse 1s infinite'
          }}
        />
      )}
    </button>
  );
};

export default GestureButton;
