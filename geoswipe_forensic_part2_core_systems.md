# GeoSwipe Forensic Analysis - Part 2: Frontend & Core Systems

> [!NOTE]
> This is Part 2 of the exhaustive forensic analysis, focusing on the React frontend architecture, the Three.js 3D Earth implementation, the Python MediaPipe Gesture bridge, and the Map/Heritage Mode systems. Every detail and numeric constant here is extracted directly from the codebase.

---

## 5. Complete Frontend Component Tree

The frontend is a Vite-powered React Single Page Application (SPA). By inspecting `src/App.jsx` and `src/main.jsx`, the exact verified component hierarchy is:

```text
main.jsx (Entry Point)
 └── ThemeProvider (ThemeContext)
      └── HeritageSelectionProvider (HeritageSelectionContext)
           └── App.jsx (Router / Shell)
                ├── GlobalGestureCursor [VERIFIED] (Always active except on Heritage pages)
                ├── GameSelectionModal [VERIFIED]
                └── Routes
                     ├── / (LandingPage)
                     │    ├── EarthThreeJS (3D Globe Background)
                     │    └── GestureButton (Multiple instances for navigation)
                     ├── /explore (ExplorePage)
                     │    ├── EarthThreeJS (Interactive)
                     │    └── HeritageStoryBook
                     ├── /heritage (HeritagePage)
                     │    ├── MapLibre GL Map (Interactive 2D Map)
                     │    ├── HeritageCard (List of sites)
                     │    ├── HeritageChatbot (Groq integration)
                     │    ├── TripPlannerModal (AI itinerary generation)
                     │    └── SafetyNavigationPage
                     ├── /quiz (QuizPage)
                     │    └── HeritageQuiz
                     ├── /flag-guess (FlagGuessPage)
                     │    └── FlagGuessGame
                     ├── /multiplayer (MultiplayerQuizPage)
                     │    └── HeritageMultiplayerQuiz
                     ├── /multiplayer-flag (MultiplayerFlagPage)
                     │    └── MultiplayerFlagGame
                     └── /how-to-reach (HowToReachPage)
                          └── SafetyNavigationPage (Routing & Contacts)
```

---

## 6. UI/UX Functionality & User Journeys

### Journey: The Landing Experience
1. User visits `/`.
2. `LandingPage.jsx` mounts, instantly loading `EarthThreeJS.jsx` as a full-screen, slowly rotating background (`speedFactor: 0.1` or `0.3`).
3. Overlays render: "Explore World", "Multiplayer", "Take Quiz".
4. The Python background process (if running) connects via Socket.io. `GlobalGestureCursor.jsx` renders a glowing blue dot (`rgba(0,212,255,0.8)`) mapping the user's hand to the screen using a `0.1` calibration padding to reach screen edges easily.
5. User pinches their thumb and index finger ("OK" sign) over a button.
6. The `GestureButton.jsx` component detects the intersection, visually scales to `0.95`, applies a `#00ff00` box-shadow, and dispatches the `onClick` handler via React router to change pages.

---

## 7. GeoSwipe Globe System (Three.js Analysis)

The 3D globe is arguably the most complex component in the repository (`client/src/EarthThreeJS.jsx` - 2,098 lines). 

### 7.1 Architecture & Initialization
*   **Engine:** `Three.js` (WebGL).
*   **Camera:** PerspectiveCamera (`fov: 45`, default `z: 30`).
*   **Renderer:** Configured for `high-performance` power preference, disables antialiasing/shadows for speed, and uses `ACESFilmicToneMapping` with exposure `1.2`.
*   **Textures:** Uses high-res assets (`Albedo.jpg`, `Bump.jpg`, `Clouds.png`, `Ocean.png`, `night_lights_modified.png`).

### 7.2 Shaders & Atmosphere
Custom GLSL shaders (`vertex.glsl` and `fragment.glsl`) are injected via `THREE.ShaderMaterial` to create the atmospheric scattering effect.
*   **Atmosphere Multiplier:** `12.0`
*   **Atmosphere Power Factor:** `4.5`
*   **Atmosphere Opacity:** `0.8` (default). Modulated by a sine wave in the render loop `Math.sin(time * 0.7) * 0.08` to create a "breathing" effect.

### 7.3 Click Detection & Raycasting
When a user clicks (or gesture-clicks) the globe:
1. `THREE.Raycaster` translates the 2D coordinate to a 3D ray.
2. It tests against `countryPickMeshes` (invisible polygon meshes generated from `countrieslite.geo.json` using the `earcut` triangulation library).
3. **Validation Algorithm:** A custom function validates if the mesh hit makes geographic sense:
   ```javascript
   const lat = Math.asin(point3D.y / 10.3) * 180 / Math.PI;
   const lon = Math.atan2(point3D.x, point3D.z) * 180 / Math.PI;
   ```
   It applies a `20-degree` tolerance to verify the click isn't hitting the back of the globe (dot product > 0).
4. On success, an animation fires cycling the country border through RGB colors `[0xffff00, 0xff4444, 0x44ff44, ...]` before settling on white.

---

## 8. Hand Gesture & Computer Vision System

The gesture system relies on `gesture-control/detect.py`. It does not run in the browser; it is a Python background process that broadcasts to Node.js, which broadcasts to React.

### 8.1 Engine & Configuration
*   **Engine:** MediaPipe Hands (`max_num_hands=1` for performance).
*   **Detection Confidence:** `0.7` (Fallback from `.env`).
*   **Tracking Confidence:** `0.7`.
*   **Frame Interval Limiter:** `0.05` seconds (Caps at 20 FPS to prevent Socket.io flooding).
*   **Stabilization:** A gesture must be detected for `5` consecutive frames (`STABLE_THRESHOLD = 5`) before it is emitted to the UI to prevent flickering.
*   **Click Cooldown:** `1.0` seconds to prevent accidental double-clicks.

### 8.2 Mathematical Gesture Classifications
Gestures are classified via Euclidean distance between 3D hand landmarks (`0`=Wrist, `4`=Thumb Tip, `8`=Index Tip, etc.).

| Gesture | Node Event | Mathematical Logic [VERIFIED] |
|---------|------------|--------------------------------|
| **OK Sign (Click)** | `click` | `thumb_index_dist < 0.05` AND middle/ring/pinky fingers extended. Highest priority. |
| **Pinch** | `pinch` | `thumb_index_dist < 0.04` AND all other fingers closed. |
| **L-Sign (Zoom)** | `zoom` | `thumb_index_dist > 0.13` AND only thumb/index open. |
| **Open Palm** | `cursor_move`| All fingers open, `thumb_tip` to `wrist` dist > 0.08. Cursor coordinates taken from middle finger tip (landmark `12`) for stability. |
| **Thumbs Up** | `thumbs_up` | Thumb extended > 0.12 from wrist, `thumb_tip.y < wrist.y - 0.08`. |
| **Thumbs Down**| `thumbs_down`| Thumb extended > 0.12 from wrist, `thumb_tip.y > wrist.y + 0.08`. |

### 8.3 3D Rotation Mapping
In `EarthThreeJS.jsx`, gestures map directly to Three.js camera rotation matrices:
*   `rotate_right`: `makeRotationY(0.01875)`
*   `rotate_left`: `makeRotationY(-0.01875)`
*   `thumbs_up`: `makeRotationX(0.0125)`
*   `thumbs_down`: `makeRotationX(-0.0125)`

---

## 9. Map System & Heritage Mode

The `HeritagePage.jsx` serves as a comprehensive dashboard mapping system.

### 9.1 Map Implementation
*   **Library:** `react-map-gl` (MapLibre implementation).
*   **Provider:** MapTiler API.
*   **Default Viewport:** Varies dynamically based on the selected country via `HeritageSelectionContext`.
*   **Styles:** Includes dynamic theme switching (Standard, Satellite, Topographic).

### 9.2 Heritage Data Pipeline
1. Data originates from MongoDB (`models/HeritageSite.js`).
2. API endpoint `/api/heritage-sites/:country` fetches sites.
3. React stores this in `useHeritageSites` hook.
4. Sites are rendered as Map Markers and as UI Cards (`HeritageCard.jsx`).
5. Clicking a site updates the global context, triggering the `HeritageChatbot`, fetching `OpenWeather` data, and preparing the `TripPlannerModal`.

> [!TIP]
> **Data Transformation Insight:** Heritage images aren't just static links. The backend uses a complex fallback system (`monumentImageService.js`). If a database image is missing, it dynamically queries the Unsplash API or Wikipedia API for an image, caches the result, and returns it to the map marker popup.

---
*End of Part 2. Part 3 will cover the Backend API Architecture, Database Schemas, Multiplayer Socket Logic, and Auxiliary AI/Weather Systems.*
