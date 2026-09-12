// Shared client configuration.
//
// The per-tab gesture session id that used to live here is gone: it existed to
// route webcam frames to a server-side Python detector and steer the results
// back to the right tab. Gesture detection runs in this tab now, so there is
// nothing to route.
//
// SECURITY NOTE: VITE_API_URL is the ONLY environment variable the browser is
// allowed to see. Anything prefixed with VITE_ is compiled into the JavaScript
// bundle and is readable by every visitor, so third-party API keys must never
// be referenced from client code - they live on the server and are reached
// through the /api/ai, /api/weather and /api/maps proxy endpoints.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
