import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getGestureBus } from '../utils/gestureBus';
import { createGestureStabilizer } from '../utils/gestureClassifier';

// Gesture detection runs entirely in this browser tab.
//
// It previously did not: this component drew each camera frame to a canvas,
// base64-encoded it as JPEG and pushed it over a WebSocket to the Node server,
// which relayed it to a Python MediaPipe worker that sent the result back. That
// cost roughly 900 KB/sec per active user (~3.2 GB/hour), required a persistent
// Python process too memory-hungry for a free hosting tier, and added a full
// network round trip to every hand movement.
//
// Now MediaPipe's hand landmarker runs here, against the video element, and
// results go straight onto the in-page gesture bus. No frame ever leaves the
// device - which is both faster and a genuine privacy improvement.

// Self-hosted by scripts/setup-mediapipe.mjs (runs automatically on predev and
// prebuild) so the app does not depend on a third-party CDN at runtime.
const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/mediapipe/hand_landmarker.task';

// The landmarker is a singleton: the model is ~8MB and initialising it twice
// would both double memory and re-download it.
let landmarkerPromise = null;

async function loadHandLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      // Dynamic import keeps MediaPipe out of the initial bundle - it only
      // loads when a user actually opens a gesture-enabled screen.
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

      return HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          // GPU is dramatically faster where available; MediaPipe falls back to
          // CPU internally if the device cannot provide a WebGL context.
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        // One hand, matching the Python detector's max_num_hands=1. Tracking a
        // second hand costs inference time and the gesture vocabulary is
        // single-handed anyway.
        numHands: 1,
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.7
      });
    })().catch((error) => {
      // Let a later attempt retry rather than caching the failure forever.
      landmarkerPromise = null;
      throw error;
    });
  }

  return landmarkerPromise;
}

const CameraCapture = ({
  enabled = true,
  onError = null,
  showPreview = true,
  targetFPS = 30,
  width = 640,
  height = 480
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const landmarkerRef = useRef(null);
  const stabilizerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('initializing');
  const [modelStatus, setModelStatus] = useState('loading');
  const [fps, setFps] = useState(0);

  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  const reportError = useCallback((message, err) => {
    setError(message);
    if (onError) onError(err || new Error(message));
  }, [onError]);

  // Load the hand landmarker.
  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    setModelStatus('loading');

    loadHandLandmarker()
      .then((landmarker) => {
        if (cancelled) return;
        landmarkerRef.current = landmarker;
        stabilizerRef.current = createGestureStabilizer();
        setModelStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Hand landmarker failed to load:', err);
        setModelStatus('error');
        reportError(
          'Gesture model failed to load. Run `npm run setup:mediapipe` in client/, then reload.',
          err
        );
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, reportError]);

  // Start the camera.
  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

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

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsStreaming(true);
        setCameraStatus('active');
        setError(null);
      } catch (err) {
        if (cancelled) return;
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

        setCameraStatus('error');
        reportError(errorMsg, err);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsStreaming(false);
    };
  }, [enabled, width, height, targetFPS, reportError]);

  // Detection loop.
  useEffect(() => {
    if (!enabled || !isStreaming || modelStatus !== 'ready') return undefined;

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const stabilizer = stabilizerRef.current;
    const bus = getGestureBus();

    if (!video || !landmarker || !stabilizer) return undefined;

    let stopped = false;

    const detect = () => {
      if (stopped) return;

      try {
        // detectForVideo requires strictly increasing timestamps, and rAF fires
        // faster than the camera produces frames - re-submitting the same frame
        // makes MediaPipe throw. Only run when the video has actually advanced.
        if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;

          const result = landmarker.detectForVideo(video, performance.now());
          const landmarks = result?.landmarks?.[0] || null;
          const outcome = stabilizer.process(landmarks);

          // `skipped` means the 20 FPS inference cap dropped this frame; there
          // is no result to publish and no FPS tick to count.
          if (!outcome.skipped) {
            if (outcome.gesture) {
              bus.emit('gesture', { gesture: outcome.gesture });
            }

            // Cursor updates are published even when null, because that is how
            // consumers know to hide the on-screen cursor.
            if (outcome.cursor) {
              bus.emit('cursor', outcome.cursor);
            }

            fpsCounterRef.current.frames += 1;
            const now = Date.now();
            if (now - fpsCounterRef.current.lastTime >= 1000) {
              setFps(fpsCounterRef.current.frames);
              fpsCounterRef.current.frames = 0;
              fpsCounterRef.current.lastTime = now;
            }
          }
        }
      } catch (err) {
        console.error('Gesture detection error:', err);
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);

    return () => {
      stopped = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastVideoTimeRef.current = -1;
      stabilizer.reset();
      // Leaving a gesture surface should not strand the cursor on screen.
      bus.emit('cursor', { x: null, y: null });
    };
  }, [enabled, isStreaming, modelStatus]);

  if (!enabled) return null;

  const statusLabel =
    cameraStatus === 'active' ? `Camera · ${fps} FPS`
      : cameraStatus === 'error' ? 'Camera error'
      : cameraStatus === 'requesting' ? 'Requesting access…'
      : 'Initializing…';

  const modelLabel =
    modelStatus === 'ready' ? 'Gestures on-device'
      : modelStatus === 'error' ? 'Gesture model failed'
      : 'Loading gesture model…';

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
            <span className={`gs-camera__dot is-${modelStatus === 'ready' ? 'ok' : modelStatus === 'error' ? 'bad' : 'wait'}`} />
            {modelLabel}
          </span>
        </div>
      )}

      {/* The video element must stay mounted for detection even when the
          preview is hidden, so visibility is handled with CSS. */}
      <div className="gs-camera__preview">
        <video
          ref={videoRef}
          width={width / 2}
          height={height / 2}
          muted
          playsInline
          // Mirrored so the preview reads like a mirror. Detection mirrors the
          // landmarks separately (see gestureClassifier.mirrorLandmarks) and is
          // unaffected by this purely visual transform.
          style={{ transform: 'scaleX(-1)' }}
        />
        {error && showPreview && (
          <div className="gs-camera__error" role="alert">{error}</div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
