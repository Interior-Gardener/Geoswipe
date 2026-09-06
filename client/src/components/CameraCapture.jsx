import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, getGestureSessionId } from '../utils/apiConfig';

// Reuse socket singleton pattern (same as other components)
const getSocket = (() => {
  let socket = null;
  return () => {
    if (!socket) {
      socket = io(API_BASE_URL, {
        // Tags every socket from this tab so gesture frames/results stay private to it.
        auth: { gestureSession: getGestureSessionId() },
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

  const statusLabel =
    cameraStatus === 'active' ? `Camera · ${fps} FPS`
      : cameraStatus === 'error' ? 'Camera error'
      : cameraStatus === 'requesting' ? 'Requesting access…'
      : 'Initializing…';

  return (
    <div className={`gs-camera${showPreview ? ' is-visible' : ''}`}>
      {/* Telemetry is debugging detail: only surface it while the preview is
          open. It previously sat on screen permanently, on every page. */}
      {showPreview && (
        <div className="gs-camera__status">
          <span className="gs-camera__row">
            <span className={`gs-camera__dot is-${cameraStatus === 'active' ? 'ok' : cameraStatus === 'error' ? 'bad' : 'wait'}`} />
            {statusLabel}
          </span>
          <span className="gs-camera__row">
            <span className={`gs-camera__dot is-${socketConnected ? 'ok' : 'bad'}`} />
            {socketConnected ? 'Server connected' : 'Server disconnected'}
          </span>
        </div>
      )}

      {/* The video element must stay mounted for frame capture even when the
          preview is hidden, so visibility is handled with CSS. */}
      <div className="gs-camera__preview">
        <video
          ref={videoRef}
          width={width / 2}
          height={height / 2}
          muted
          playsInline
        />
        {error && showPreview && (
          <div className="gs-camera__error" role="alert">{error}</div>
        )}
      </div>

      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
