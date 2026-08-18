# GeoSwipe Forensic Analysis - Part 4: Forensics & Audits

> [!CAUTION]
> This section covers critical security vulnerabilities, dead code artifacts, and performance bottlenecks discovered during the exhaustive codebase analysis. **Immediate attention is required for the API Key exposure vulnerabilities.**

---

## 15. Security Vulnerabilities

### 🚨 CRITICAL: Client-Side Secret Exposure (Vite Bundle)
The most severe vulnerability in the repository is the direct exposure of paid API keys in the frontend React bundle.

**The Problem:**
In Vite, any environment variable prefixed with `VITE_` is statically replaced with its literal string value during the build process (`npm run build`). Anyone inspecting the frontend JavaScript files can extract these keys.

**Verified Occurrences:**
1. **Groq AI Key:** Extracted in `client/src/utils/groqService.js` and `tripPlannerAIService.js` via `import.meta.env.VITE_GROQ_CHATBOT_API_KEY`.
2. **OpenWeatherMap Key:** Extracted in `client/src/utils/openWeatherService.js` via `import.meta.env.VITE_OPENWEATHERMAP_API_KEY`.
3. **MapTiler Key:** Extracted in `client/src/SafetyNavigationPage.jsx` and `HeritagePage.jsx` via `import.meta.env.VITE_MAPTILER_API_KEY`.

**Remediation Required:**
Move all external API calls to the `server/index.js` Express backend. The frontend should call an internal route (e.g., `/api/weather` or `/api/chat`), and the backend should securely append the API key and forward the request.

### ⚠️ HIGH: Overly Permissive CORS Policy
In `server/index.js` (lines 7 & 25):
```javascript
const io = require('socket.io')(http, { cors: { origin: "*" } });
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://your-domain.com'] : '*',
}));
```
While handled correctly in production via the ternary operator, if `NODE_ENV` is not strictly set in the production environment, the server allows cross-origin requests and WebSocket connections from any malicious site (`*`).

### ⚠️ MEDIUM: Socket.io Payload Limits
The Socket.io server allows `maxHttpBufferSize: 5e6` (5MB). Since there is no apparent rate limit on the WebSocket layer, a malicious actor could rapidly spam 5MB packets, causing memory exhaustion (DDoS) on the Node server.

---

## 16. Dead Code & Backup Artifacts

The repository contains several orphaned files and backups that bloat the codebase and pose a slight risk if executed accidentally in production.

**Verified Dead Code/Backups:**
1. `server/index_backup.js`: A complete duplicate of the main server file containing older (or conflicting) logic.
2. `server/populate-heritage-sites_only_India (1).js` & `mongo_data_for_heritage_sites.js`: Massive database seeder scripts left in the production folder.
3. `client/src/HeritagePage.jsx.backup`: A backup of the frontend map view.
4. `gesture-control/detect_backup.py`: An older version of the MediaPipe tracker.

*Recommendation:* These should be deleted or moved to a dedicated `scripts/` or `archive/` folder excluded from builds.

---

## 17. Hardcoded Values & "Magic Numbers"

The system relies on several undocumented hardcoded values for its internal math and physics logic.

1. **Earth Camera Radius (`client/src/EarthThreeJS.jsx`)**
   *   The Earth has a radius of `10.0`.
   *   The invisible country picking meshes are placed at `10.3`.
   *   The raycaster uses a strict geographical validation logic to ensure clicks land precisely on the outer hull.

2. **Emergency Fallback Distances (`server/index.js`)**
   *   `SAFETY_DEFAULT_RADIUS = 3000`: The Overpass API strictly limits emergency searches (hospitals, police) to a 3km radius.
   *   `speedKmph: 38`: If routing APIs fail, the fallback `buildFallbackRoutes` hardcodes the expected driving speed to 38 km/h for the "Primary Corridor".

3. **Gesture Calibration (`GlobalGestureCursor.jsx`)**
   *   `calibrationPadding = 0.1`: This expands the bounding box of the user's camera to ensure they can easily reach the edges of their monitor without physically moving their hand out of the camera's FOV.

---

## 18. Performance & Optimization Analysis

### 🟢 The Good: Adaptive 3D FPS
`EarthThreeJS.jsx` features an excellent adaptive FPS monitor. It targets 120 FPS, but if performance drops below 50 FPS, it dynamically steps down the rendering interval to prevent browser crashes. Furthermore, heavy operations (like dynamic lighting) are only calculated every 3 frames, while light operations (cloud rotation) happen every 6 frames.

### 🔴 The Bottlenecks: Memory Leaks & Large Payloads
1. **MediaPipe Timestamp Exceptions:** In `detect.py`, if the webcam feed drops frames, MediaPipe throws a `timestamp mismatch` error. The developer handled this by completely destroying and re-instantiating the ML graph on the fly, which causes a massive CPU spike during the reset.
2. **WebGL Context Loss:** The 3D globe requires significant memory. If the user rapidly switches between the Landing Page (Globe) and the Explore Page (Globe), the WebGL contexts may stack up if `renderer.dispose()` in the React cleanup block isn't fully flushing the GPU buffers (a known issue with Three.js in SPA routers).
3. **Earcut Triangulation:** Processing the `countrieslite.geo.json` into Three.js geometry requires heavy math on initial load. This blocks the main thread, resulting in a visible 1-3 second stutter before the globe appears.

---
*End of Part 4. Part 5 will conclude the report with final outcomes and deployment recommendations.*
