# GeoSwipe Forensic Analysis - Part 3: Backend & Integrations

> [!NOTE]
> This is Part 3 of the exhaustive forensic analysis, focusing on the Node.js/Express backend architecture, the MongoDB schema designs, the real-time multiplayer WebSocket synchronization, and external AI/API integrations (Groq, NewsAPI, Overpass, etc.).

---

## 10. Backend Express Architecture

The backend (`server/index.js` - 1,868 lines) serves as a robust hybrid API that handles standard HTTP REST requests alongside real-time WebSocket connections.

### Core Configuration [VERIFIED]
*   **Express Runtime:** Configured with `express.json()` and `express.urlencoded()` limits set to `10mb` (necessary for handling high-resolution base64 video frames if the Python script is bypassed).
*   **Performance Middleware:** Employs `compression()` for gzip payloads.
*   **Rate Limiting:** `express-rate-limit` enforces 100 requests per 15 minutes per IP on the `/api/` route space.
*   **Database Connectivity:** Connects to MongoDB Atlas via Mongoose with highly optimized connection pooling (`maxPoolSize: 10`, `socketTimeoutMS: 45000`).

---

## 11. MongoDB Schemas & Database Structure

The persistence layer uses Mongoose to model cultural data and quiz questions.

### The `HeritageSite` Schema (`models/HeritageSite.js`)
This is the core data structure powering the exploration map.
*   **Geospatial Capabilities:** Uses a `[longitude, latitude]` coordinate array and explicitly creates a `'2dsphere'` index on `location.coordinates` for fast spatial queries.
*   **Taxonomy:** The `category` field enforces strict Enums: `['UNESCO World Heritage', 'Historic Fort', 'Rock-cut Cave', 'Temple', 'Monument', 'Palace', 'Museum', 'Historic Building']`.
*   **Nested Data:**
    *   `info`: Contains `summary`, `full`, `history`, `architecture`, `significance`.
    *   `howToReach`: Highly structured transit data (`byAir`, `byRail`, `byRoad`).
    *   `media`: `images`, `video_url`, and `panorama_url`.
    *   `view360`: Stores `heading` and `pitch` for Google Street View integrations.

### Bootstrapping & Caching [INFERRED]
The server employs a `populateCountries()` function on startup. If the `Country` collection is empty, it reaches out to `https://restcountries.com/v3.1/all?fields=name` to seed the database, then maintains an in-memory `countryCache` with a `24-hour` expiry to prevent database thrashing.

---

## 12. Multiplayer Socket Logic (Real-Time Game State)

The multiplayer system in `index.js` manages custom game rooms (`flag`, `quiz`, `heritage-quiz`, `heritage-monument`) for exactly 2 players.

### Connection Architecture
1. **Socket Buffer:** Configured with `maxHttpBufferSize: 5e6` (5MB).
2. **Room Management:** Stored in-memory via a `Map()` called `rooms`.
3. **State Structure:** Each room contains:
    ```javascript
    {
       roomId: string,
       gameMode: string,
       players: [ { socketId, playerName, score, status, connected } ],
       gameState: 'waiting' | 'starting' | 'playing' | 'round-end' | 'finished',
       currentRound: number,
       maxRounds: number,
       questions: Array,
       answers: Map // Tracks answers per socket.id
    }
    ```

### Game Loop Execution
*   `join-room`: Validates room capacity (max 2) and game mode compatibility. Emits `room-joined` or `game-started` if full.
*   `submit-answer`: Prevents double-answering using the `room.answers.has(socket.id)` check. Once both players answer, it calculates scores, broadcasts the `round-result`, waits 5 seconds, and triggers `next-round`.
*   **Disconnection Handling:** Detects disconnects, updates the player's status to `false`, and notifies the opponent via `player-disconnected`.

---

## 13. AI Integrations (Groq Llama 3)

The application utilizes **Groq's API** to power ultra-fast conversational AI, bypassing OpenAI for lower latency.

### Heritage Chatbot (`client/src/utils/groqService.js`)
*   **Model:** `llama-3.3-70b-versatile`
*   **Endpoint:** `https://api.groq.com/openai/v1/chat/completions` (OpenAI-compatible endpoint).
*   **Context Injection Engine:**
    *   Before sending a prompt, the frontend calls the backend `/api/heritage-sites`, grabs the first 50 sites, and dynamically appends them to the `BASE_SYSTEM_PROMPT`.
    *   *Prompt Extract:* "You are a knowledgeable and enthusiastic AI assistant specializing in Indian heritage sites... Keep responses concise but comprehensive (2-4 paragraphs)... Use emojis occasionally 🏛️."
*   **Token Management:** Limits conversation history to the last 15 messages via `.slice(-15)`. Restricts output to `max_tokens: 800`.

---

## 14. Auxiliary API Systems & Fallbacks

GeoSwipe employs aggressive fallback mechanisms to ensure the UI rarely fails when external APIs break.

### 14.1 Map & Routing (MapTiler & Overpass)
*   **MapTiler:** Used for the core map tiles in `react-map-gl`.
*   **Overpass API (OSM):** Used for the "Safety Navigation" feature. The backend runs complex queries (`amenity~"hospital|police|fire_station..."`) to find emergency services within a `3000m` radius using the `haversineMeters` formula.
*   *Fallback:* If Overpass fails, the system generates "synthetic" safe places by applying deterministic micro-offsets (`dLat: 0.012`) to the user's location to prevent UI crash.

### 14.2 News API Integration
*   **Endpoint:** `https://newsapi.org/v2/everything`
*   Queries live news regarding a heritage site or its parent city. Limits results to `5` articles.
*   Includes rate limit detection returning a clean `429` status to the frontend.

### 14.3 Image Prewarming (`index.js`)
On server start, if `PREWARM_MONUMENT_IMAGES === 'true'`, the server queries the database for `6` "hot sites" and immediately triggers `resolveMonumentImageWithFallback()` to proactively fetch and cache high-resolution Unsplash/Wikipedia images into memory before a user ever requests them.

---
*End of Part 3. Part 4 will cover the Application Forensics, Security Audits, and Vulnerabilities.*
