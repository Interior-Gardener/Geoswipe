// Shared client configuration.
//
// SECURITY NOTE: VITE_API_URL is the ONLY environment variable the browser is
// allowed to see. Anything prefixed with VITE_ is compiled into the JavaScript
// bundle and is readable by every visitor, so third-party API keys must never
// be referenced from client code - they live on the server and are reached
// through the /api/ai, /api/weather and /api/maps proxy endpoints.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GESTURE_SESSION_STORAGE_KEY = 'geoswipe.gestureSession';

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `s${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/**
 * A per-browser-tab identifier shared by every socket this tab opens.
 *
 * The gesture pipeline uses it to route webcam frames to the detector and to
 * deliver detection results back to THIS tab only. Previously frames and
 * results were broadcast to every connected client.
 */
export function getGestureSessionId() {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  try {
    const existing = window.sessionStorage.getItem(GESTURE_SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const created = createSessionId();
    window.sessionStorage.setItem(GESTURE_SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    // Private mode / storage disabled - fall back to a per-load id.
    return createSessionId();
  }
}

/**
 * Socket.IO options every gesture-aware socket should use, so the server can
 * group this tab's sockets together.
 */
export function gestureSocketOptions(extra = {}) {
  return {
    ...extra,
    auth: { gestureSession: getGestureSessionId() }
  };
}
