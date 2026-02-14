import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Reuse socket singleton pattern (same as other components)
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

const CameraCapture = ({
  enabled = true,
  onError = null,
  showPreview = true,
  targetFPS = 30,
  quality = 0.7,
  width = 640,
  height = 480
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameIntervalRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('initializing');
  const [fps, setFps] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });
  const framesSentRef = useRef(0);

  // Monitor socket connection
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      console.log('✅ Socket connected for gesture streaming');
      setSocketConnected(true);
    };

    const onDisconnect = () => {
      console.warn('⚠️ Socket disconnected');
      setSocketConnected(false);
    };

    const onConnectError = (err) => {
      console.error('❌ Socket connection error:', err);
      setSocketConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Check initial connection status
    if (socket.connected) {
      setSocketConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  // Start camera
  useEffect(() => {
    if (!enabled) return;

    const startCamera = async () => {
      try {
        setCameraStatus('requesting');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: 'user',
            frameRate: { ideal: targetFPS, max: 30 }
          },
          audio: false
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsStreaming(true);
        setCameraStatus('active');
        setError(null);
      } catch (err) {
        console.error('Camera access error:', err);
        const errorMsg = err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : err.name === 'NotReadableError'
          ? 'Camera is in use by another application.'
          : err.name === 'SecurityError'
          ? 'HTTPS required for camera access in production.'
          : `Camera error: ${err.message}`;

        setError(errorMsg);
        setCameraStatus('error');
        if (onError) onError(err);
      }
    };

    startCamera();

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          track = null;  // Help GC
        });
        streamRef.current = null;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [enabled, width, height, targetFPS, onError]);

  // Send frames to server
  useEffect(() => {
    if (!isStreaming || !enabled) return;

    const socket = getSocket();
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const frameInterval = 1000 / targetFPS; // ms between frames

    const sendFrame = () => {
      try {
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          return;
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, width, height);

        // Convert to base64 JPEG
        const base64Frame = canvas.toDataURL('image/jpeg', quality);

        // Log first frame sent for debugging
        if (framesSentRef.current === 0) {
          console.log('📸 First frame captured and sending to backend');
          console.log(`   - Resolution: ${width}x${height}`);
          console.log(`   - Quality: ${quality}`);
          console.log(`   - Target FPS: ${targetFPS}`);
          console.log(`   - Frame size: ${(base64Frame.length / 1024).toFixed(1)} KB`);
        }

        // Send to server
        socket.emit('video_frame', {
          frame: base64Frame,
          timestamp: Date.now()
        });

        framesSentRef.current++;

        // Log periodically (every 100 frames)
        if (framesSentRef.current % 100 === 0) {
          console.log(`📊 Frames sent: ${framesSentRef.current}`);
        }

        // Update FPS counter
        fpsCounterRef.current.frames++;
        const now = Date.now();
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(fpsCounterRef.current.frames);
          fpsCounterRef.current.frames = 0;
          fpsCounterRef.current.lastTime = now;
        }
      } catch (err) {
        console.error('Frame capture error:', err);
      }
    };

    // Start frame capture loop
    frameIntervalRef.current = setInterval(sendFrame, frameInterval);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [isStreaming, enabled, targetFPS, quality, width, height]);

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 110,
      right: 1,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.8)',
      borderRadius: '12px',
      padding: '10px',
      border: '2px solid #00d4ff'
    }}>
      {/* Status indicator */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '8px',
        color: '#fff',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        {/* Camera status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: cameraStatus === 'active' ? '#00ff00' :
                        cameraStatus === 'error' ? '#ff0000' : '#ffaa00'
          }} />
          <span>
            {cameraStatus === 'active' ? `Camera: ${fps} FPS` :
             cameraStatus === 'error' ? 'Camera Error' :
             cameraStatus === 'requesting' ? 'Requesting...' :
             'Initializing...'}
          </span>
        </div>
        {/* Socket status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: socketConnected ? '#00ff00' : '#ff0000'
          }} />
          <span>
            {socketConnected ? 'Server Connected' : 'Server Disconnected'}
          </span>
        </div>
        {/* Frames sent counter */}
        {isStreaming && socketConnected && (
          <div style={{ fontSize: '10px', color: '#00d4ff', marginLeft: '18px' }}>
            Sent: {framesSentRef.current} frames
          </div>
        )}
      </div>

      {/* Video preview */}
      <div style={{
        position: 'relative',
        display: showPreview ? 'block' : 'none'
      }}>
        <video
          ref={videoRef}
          width={width / 2}  // Show preview at half resolution
          height={height / 2}
          style={{
            display: 'block',
            borderRadius: '8px',
            transform: 'scaleX(-1)',  // Mirror effect
            border: '1px solid #00d4ff'
          }}
          muted
          playsInline
        />
        {error && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            color: '#ff4444',
            padding: '10px',
            fontSize: '11px',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CameraCapture;
