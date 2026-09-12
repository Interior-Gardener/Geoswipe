# GeoSwipe — Free-Tier Deployment Plan

**Prepared:** 2026-09-12
**Goal:** Deploy GeoSwipe with 100% of current functionality intact, entirely on free-tier infrastructure, in a way that stays inside every third-party API's free quota **regardless of how many users the app gets** — not by removing features, but by making API cost a function of the app's fixed content (a set of ~126 heritage sites) instead of a function of traffic.
**Audience:** This document is the plan. All code/infra changes it describes will be implemented separately (by Opus-model coding sessions), file by file.

---

## 0. Executive Summary

**The core insight:** Weather and news are looked up *by heritage site*, and GeoSwipe has a fixed, bounded catalog of ~126 sites. Today, every user who opens a site's sidebar triggers a live upstream API call — so cost scales with **users × visits**. If instead the server caches each site's weather/news once and serves every user from that shared cache, cost scales with **number of sites × how often you refresh them** — a small, fixed number that free tiers comfortably absorb no matter how many people use the app. This single change (a shared, site-keyed cache) is what makes "free tier works for all users" achievable without touching a single user-facing feature.

On top of that: a **multi-key rotation pool** (using the 4+ free accounts you can create per service) adds burst headroom and resilience, and a **gesture-detection architecture change** removes the actual cause of the Render crash (a memory-heavy Python process), rather than just moving it to a bigger box.

**Recommended path:** Plan 1 or Plan 2 below (client-side gesture detection + shared caching + key rotation). Both keep every feature working exactly as today; users will not notice a difference except faster, more reliable gesture control and no more "news/weather failed to load" once the free tier is exceeded.

**Do this first, regardless of which plan you pick:** Section 1 (credential rotation) — it's a live security exposure, unrelated to cost, and takes priority over everything else here.

---

## 1. Pre-Deployment Blocker: Rotate Exposed Credentials

`PROJECT_CONTEXT.md` (§3 in this repo) already documents that five of your six secrets were, at some point, exposed in the browser bundle and/or committed to git history:

| Credential | How it was exposed |
|---|---|
| MapTiler API key | In the client bundle **and** hardcoded in a now-deleted `maharashtra_heritage_map.html`, present across 5 commits |
| Groq API key | In the bundle, sent as a browser `Authorization` header |
| OpenWeatherMap API key | In the bundle |
| NewsAPI key | Hardcoded as a literal fallback in `server/index.js` (commit `6734e5c`) |
| Unsplash access + secret key | Lived in a client `.env` file |
| MongoDB URI | Never committed, but stored alongside the above on the same disk — rotate as a precaution |

The current code no longer reads any of these from the client — they're all server-side now — but **the old values are still valid credentials sitting in git history**, and anyone with repo access (including a public repo's history, or a past collaborator) already has them. Deploying with the *old* keys still active means you're deploying on compromised secrets from day one, independent of any cost/quota problem.

**Action — do this before anything else, and before setting any host's environment variables:**
1. Log into each provider (MapTiler, Groq, OpenWeatherMap, NewsAPI, Unsplash, MongoDB Atlas) and rotate/regenerate the key.
2. Update `server/.env` locally with the new values.
3. Run the server and hit `GET /api/diagnostics` (already built — reports live health of all 10 integrations with provider error text) to confirm every service is healthy on the new keys before deploying anywhere.
4. Only then put the new keys into your hosting provider's secret/environment manager (Render/Fly.io/Oracle — never commit them).

This does **not** require rewriting git history (`git filter-repo`/BFG). Rotation alone makes the old exposure moot; history rewriting is a separate, optional cleanup you can do later if you want the old keys gone from the repo entirely.

---

## 2. Shared Caching Layer (build this regardless of which plan you choose)

### 2.1 Where it lives

The codebase already has the right pattern, just not applied everywhere yet: `server/services/monumentImageService.js` caches Unsplash/Wikipedia images in a **two-tier** scheme — an in-memory `Map` (fast, 6h TTL) backed by a MongoDB collection (`MonumentImage`, persistent across restarts). That's exactly the mechanism weather and news need.

**New files:**
- `server/services/cache.js` — a generic `getOrFetch(namespace, key, ttlMs, fetchFn)` helper, extracted from the pattern in `monumentImageService.js` so weather, news, and images all share one implementation instead of three near-duplicate copies.
- `server/models/WeatherCache.js` — mirrors `MonumentImage.js`'s shape: `{ siteId, payload, cachedAt }`.
- `server/models/NewsCache.js` — `{ siteId, fallbackTier, payload, cachedAt }` (see §2.3 for why it's keyed by tier).

**Key principle:** cache by **heritage-site id**, not by raw query parameters (lat/lon, free-text site name). Every user viewing "Taj Mahal" then hits the exact same cache entry, no matter how many users there are.

### 2.2 Weather — the arithmetic

- OpenWeather free tier: **1,000 requests/day**.
- Heritage sites: **126**.
- A full refresh of every site costs 126 requests. `1000 ÷ 126 ≈ 7.9` — the budget allows roughly 7-8 full refresh sweeps per day with *zero* margin.
- **Recommended TTL: 4 hours** → 6 sweeps/day = **756 requests/day**, leaving ~24% headroom for cold-start misses, diagnostics, and anything else sharing the quota.
- **Prewarm on a schedule.** The server already prewarms images for 6 "hot" sites 1.5s after boot (`PREWARM_MONUMENT_IMAGES` in `server/index.js`) — reuse that exact pattern, but extend it to sweep all 126 sites for weather on a 4-hour interval. Weather doesn't need per-user real-time freshness for a sidebar widget; this is not a UX compromise.

### 2.3 News — the tight one

- NewsAPI free tier: **100 requests/day**.
- Today's actual cost per site click, traced in `server/index.js`'s `/api/news/:siteName` handler: a fallback chain (monument → city → state → country) for the "monument" news block, **plus a second, separate near-duplicate chain** (city → state → India) for a "location" news block — up to **~7-8 NewsAPI calls for one click**, with zero server-side caching today (only a client-side, per-browser-session cache exists, which doesn't help the next user at all).
- Even a single full sweep of all 126 sites (126 > 100) exceeds the entire daily budget before multiplying by up to 8 calls/site. This is the tightest constraint in the whole app.

**Fix — two changes, both required:**
1. **Cache each fallback tier independently**: `news:{siteId}:monument`, `news:{siteId}:city:{cityName}`, `news:{siteId}:state:{stateName}`, `news:{siteId}:india`. Since many sites share a state or country, the state/country tiers populate **once** and are then reused by every other site in that state/country — this alone collapses a large share of duplicate calls.
2. **Cache empty results too.** "No articles found for X" should be cached for the same TTL, not re-attempted on every visit.
3. **Lazy population, not prewarm.** A prewarm sweep of 126 sites would itself exceed the daily budget before a single real user asks. Populate each tier only on first real request; with a **12–24 hour TTL**, total daily cost becomes bounded by *distinct sites actually visited that day*, not the full catalog — in practice, far under 100/day for realistic traffic.
4. Consider trimming the second "location" chain to skip firing when the corresponding tier is already fresh in cache (it frequently duplicates work the monument chain already did for the same city/state).

### 2.4 Everything else

- **Unsplash / Wikipedia images**: already correctly cached (in-memory + Mongo, effectively once-ever per monument). No change needed.
- **Flags (flagcdn.com)**: already cached, keyless. No change needed.
- **MapTiler**: not in scope for this cache — tile requests are per-viewport (panning/zooming), not per-site, and the 100,000/month free tier is generous relative to current traffic (see §7 hosting matrix notes). Flagged in the Appendix as a future item if you ever reach ~3,000+ daily active users.
- **Groq**: rate-limited per-minute rather than a hard daily cap; already has a 10-minute cache for the system-prompt context and a strict per-route limiter. No change needed now.

---

## 3. Multi-Key Rotation Pool (layers on top of caching — not instead of it)

Since caching already bounds steady-state usage to a few hundred calls/day, key rotation exists purely for **headroom and resilience**: burst days, a cold cache right after a redeploy, or one account getting flagged.

**New file:** `server/services/keyPool.js`.

- **Config:** add plural, comma-separated env vars — `OPENWEATHER_API_KEYS`, `NEWSAPI_KEYS`, `MAPTILER_API_KEYS`, `UNSPLASH_ACCESS_KEYS`, `GROQ_API_KEYS` — falling back to the existing singular var if only one key is set (so this is backward-compatible, not a breaking change).
- **Selection:** round-robin across the pool, with an in-memory per-key daily counter that resets at UTC midnight.
- **Failure handling:** on a 429 or provider-specific "quota exceeded" response, mark that key exhausted for the rest of the day and immediately retry the same request with the next key. Only fall back to today's graceful-degradation behavior (e.g., "news unavailable") if *every* key in the pool is exhausted.
- **Why in-memory counters are enough:** the cache already keeps real call volume low (low hundreds/day), so this is a rarely-exercised path; a counter reset on a redeploy costs at most one key's worth of quota, which is not worth adding a Mongo write on every single upstream call to prevent.

**Sizing guidance for your 4+ accounts per service:** put your spare keys where the budget is actually tight — **2–4 keys each for NewsAPI and OpenWeather**. With caching in place they already have real headroom (756/1000 for weather, well under 100/day for news), so extra keys there are pure insurance. MapTiler/Unsplash/Groq rotation is "nice to have," not load-bearing — their free tiers aren't under pressure at current or near-term traffic.

---

## 4. Gesture Detection: Two Architecture Options

The Render crash traced to `gesture-control/detect.py`: a persistent Python process running OpenCV + MediaPipe, decoding a continuous stream of base64 JPEG frames the browser sends over WebSocket at ~30fps (~900KB/sec/user, ~3.2GB/hour/user — this app's own `GEOSWIPE_COST_ANALYSIS.md` already calls this "financially unscalable" at any real user count). Two ways to fix it, presented as separate tracks — pick one.

**One extra finding worth acting on regardless of which track you choose:** `gesture-control/requirements.txt` lists `openai-whisper`, `torch`, `torchaudio`, and `ffmpeg-python` — none of which `detect.py` actually imports (verified by reading the file). These are large packages (torch alone is typically 500MB–2GB installed) dragged in for an unrelated one-off captioning script elsewhere in the repo. Even before touching MediaPipe/OpenCV's own footprint, trimming these four lines from the requirements file removes a very real chunk of dead weight from whatever memory/disk budget a host provides.

### 4.1 Track A — Move detection into the browser (recommended)

**What changes:**
- Add `@mediapipe/tasks-vision` to `client/package.json` (MediaPipe's official browser/WASM package — not currently a dependency anywhere in the client).
- Rewrite `client/src/components/CameraCapture.jsx`: instead of encoding each frame to base64 and `socket.emit('video_frame', ...)`, run MediaPipe's `HandLandmarker` (video mode) directly against the camera stream in the browser.
- Port `classify_gesture()` and the gesture-stabilization logic from `detect.py` (roughly lines 110–307) into a new `client/src/utils/gestureClassifier.js`. This is a near-mechanical translation: the Python function is pure landmark-geometry math (finger-open checks, thumb-distance thresholds, the click/thumbs-up/thumbs-down/pinch/zoom/index-point/cursor-move/rotate decision tree) against the same 21-point normalized hand landmarks that `@mediapipe/tasks-vision` produces. Keep the same tuning constants (`STABLE_THRESHOLD = 5` frames, `CLICK_COOLDOWN = 1.0s`) so gesture *feel* doesn't change for users.
- Add `client/src/utils/gestureBus.js` — a small local pub-sub module. `GlobalGestureCursor.jsx` and `GestureButton.jsx` currently listen on a Socket.IO connection (`socket.on('cursor', ...)`, `socket.on('gesture', ...)`); they change only their one import and connection call — their actual handler logic and payload shapes (`{x,y}`, `{gesture}`) stay identical.
- **Delete once this ships:** the entire `gesture-control/` directory (Python worker, `requirements.txt`, the ~1.47GB `geovenv`), `GESTURE_WORKER_TOKEN`/`GESTURE_ALLOW_BROADCAST` env vars, and in `server/index.js`: the `register-gesture-worker` handler, `process_frame`/`video_frame` socket events, the worker-gating logic in frame forwarding, and the frame-size-driven `maxHttpBufferSize` socket tuning (no longer needed once no frames traverse the socket).

**Why this is the better fix, not just a workaround:** it removes the memory-heavy process *and* the bandwidth cost entirely — there's no server-side gesture compute left to run out of RAM, and no 3.2GB/hour/user stream to pay for on any host. It also very likely improves latency (capture → in-browser inference → UI update, vs. capture → encode → socket → server → Python decode → inference → socket → UI update).

**Real trade-offs to plan for:**
- The WASM runtime + `.task` model file for `HandLandmarker` is tens of MB, fetched on first use. Mitigate by lazy-loading it only when a gesture-enabled screen actually opens (not on initial app load), and by self-hosting those asset files on your own static host with long-cache, content-hashed filenames (Vite's build already does this for hashed assets) rather than pulling from a third-party CDN at runtime — this also avoids CSP complications given the strict CSP headers already in `server/middleware/security.js`.
- Older/low-end devices will spend more CPU/battery on in-browser inference than a dedicated server would use — an acceptable trade for a free-tier-hosted app where server capacity is the actual constraint.

### 4.2 Track B — Keep it server-side, move it to a bigger free host

If you'd rather keep detection server-side (e.g., for a consistent experience independent of the user's device), fix the RAM problem by relocating the worker rather than rewriting it.

**What changes:**
- Trim `gesture-control/requirements.txt` as noted above (drop the 4 unused packages).
- Deploy `detect.py` to an **Oracle Cloud "Always Free" ARM VM**. This is a genuinely permanent free tier (not a trial), offering up to 24GB RAM / 4 OCPU — vastly more than MediaPipe+OpenCV need even before trimming, which eliminates the 512MB-ceiling crash outright. It's also a real always-on VM, which fits a persistent Socket.IO client daemon far better than a PaaS slot that spins down when idle.
- **Wiring:** set `SOCKET_SERVER_URL` in the VM's `gesture-control/.env` to your deployed Node backend's URL; `GESTURE_WORKER_TOKEN` must match `server/.env`'s value. No `ALLOWED_ORIGINS`/CORS change is needed — the Python client connects without a browser `Origin` header, which `server/index.js`'s `isOriginAllowed()` already permits unconditionally (see the existing comment: "requests with no Origin header ... are permitted"). The VM only needs **outbound** access — no inbound port to open, no public listener to secure.
- **Setup cost:** meaningfully more hands-on than a PaaS — manual OS/Python setup, a process supervisor (`systemd` or similar) to keep `detect.py` running and auto-restart it, basic firewall/patching upkeep. If that's more ops than you want, Fly.io is a lighter-weight fallback, at the cost of a much smaller free RAM allowance and potential usage-based charges if traffic spikes.

**What this track does *not* fix:** the ~3.2GB/hour/user bandwidth cost is unchanged, and frames now cross the network *twice* instead of once (browser → Node → Oracle VM → Node → browser). Treat Track B as a valid stopgap for a specific server-side-detection requirement, not a long-term scalable architecture — this app's own cost analysis already reaches that conclusion independently.

---

## 5. Hosting Matrix

| Platform | WebSockets? | Free RAM/CPU | Idle behavior | Free-tier durability | Setup effort |
|---|---|---|---|---|---|
| **Render (free)** | Yes | 512MB, shared CPU | Spins down after 15 min idle; ~30–60s cold-start stall on next request | Permanent, no trial expiry | Lowest — git-push deploy |
| **Fly.io** | Yes | Small free allowance (~256MB typical machine) | Configurable always-on or auto-stop/start | Usage-based allowance, not a flat permanent tier — can incur cost if exceeded | Moderate — `fly.toml` + CLI |
| **Railway** | Yes | Generous while trial credit lasts | No forced spin-down during trial | **Not durable** — trial credit runs out | Low |
| **Cloudflare Pages / Workers** | Pages: static only. Workers: possible via Durable Objects, but porting Express+Socket.IO there is a large rewrite | N/A for a Socket.IO backend | Pages: no idle spin-down (CDN) | Durable, generous | High for backend; trivial for static frontend |
| **Oracle Cloud Always-Free VM** | Yes (full VM) | Up to 24GB RAM / 4 OCPU | Always-on | Genuinely permanent | Highest — full VM ops |
| **Vercel** | **No** — serverless functions drop persistent WebSocket connections (confirmed in this repo's own `GEOSWIPE_COST_ANALYSIS.md`) | N/A for backend | N/A | Durable for static hosting | Lowest, frontend only |

**Recommendations:**
- **Frontend (static):** **Cloudflare Pages** — unlimited bandwidth, no spin-down, and this app's asset-heavy pages (images/audio/chapters) benefit from that over Vercel's bandwidth-capped free tier.
- **Backend (Node/Socket.IO):** With the gesture worker's RAM load removed (either track), Express+Socket.IO+Mongoose alone is lightweight and comfortably fits Render's 512MB. **Primary recommendation: Fly.io, one small always-on machine**, to avoid the 15-minute cold-start UX hit entirely. **Render free tier is the ₹0 fallback** if an occasional cold-start stall on the first visit of the day is acceptable (e.g., for a showcase/low-traffic phase).
- **Gesture worker (Track B only):** **Oracle Cloud Always-Free VM**, per §4.2.

---

## 6. Three Named Plans

All three share the same prerequisite work: **§2 (caching) and §3 (key rotation)** — build these first, independent of which plan you land on.

### Plan 1 — Client-Side Gesture, Render-Only *(lowest cost, lowest ops complexity)*
- Frontend: Render static site (or Cloudflare Pages later, at no extra cost).
- Backend: Render free web service.
- Gesture: **Track A**.
- Database: MongoDB Atlas M0 (unchanged).
- Cost: **₹0/month.** Trade-off: ~30–60s cold-start stall after 15 minutes of inactivity.
- Steps: (1) build the cache module, wire into weather+news → (2) add key rotation for OpenWeather/NewsAPI → (3) port `classify_gesture` to JS, build the `HandLandmarker` pipeline → (4) swap `GlobalGestureCursor`/`GestureButton` to the local gesture bus → (5) delete `gesture-control/` and its server-side plumbing → (6) rotate all credentials (§1) and set fresh keys in Render's dashboard → (7) deploy both services → (8) smoke-test cold-start reconnection.

### Plan 2 — Client-Side Gesture, Best-Free-Host Mix *(best reliability, ~₹0–500/month)*
- Frontend: Cloudflare Pages.
- Backend: Fly.io, one always-on machine (or Render free as an interim step while validating).
- Gesture: **Track A**.
- Database: MongoDB Atlas M0 (unchanged).
- Cost: no cold starts if the Fly.io machine stays always-on.
- Steps: same as Plan 1 steps 1–6, then (7) `fly launch` + configure always-on in `fly.toml`, set secrets via `fly secrets set` → (8) deploy frontend to Cloudflare Pages, point `ALLOWED_ORIGINS`/`VITE_API_URL` at the Fly.io backend → (9) validate the cross-origin WebSocket handshake.

### Plan 3 — Server-Side Gesture Kept, Oracle Free VM *(stopgap, for a specific server-side requirement)*
- Frontend: Cloudflare Pages (or Render static).
- Backend: Render free or Fly.io always-on, per Plan 1/2 reasoning.
- Gesture: **Track B** — `detect.py` on an Oracle Always-Free ARM VM.
- Database: MongoDB Atlas M0 (unchanged).
- Trade-off: RAM crash is fixed; the bandwidth cost and extra network hop are not — this is bandwidth-bound at scale, not RAM-bound.
- Steps: (1)-(2) cache + key rotation (same as above) → (3) trim `requirements.txt` → (4) provision the Oracle VM, install trimmed deps, configure `systemd` to keep `detect.py` alive and auto-restart → (5) set `SOCKET_SERVER_URL`/`GESTURE_WORKER_TOKEN` on the VM to match the deployed backend → (6) deploy backend+frontend as in Plan 1/2 → (7) confirm worker registration via `/api/diagnostics` and server logs → (8) rotate credentials (§1) before going live.

---

## 7. Appendix

### Env var changes by plan

**Added (all plans):** `OPENWEATHER_API_KEYS`, `NEWSAPI_KEYS` (comma-separated; `MAPTILER_API_KEYS`/`UNSPLASH_ACCESS_KEYS`/`GROQ_API_KEYS` optional) — all fall back to the existing singular vars if you only ever set one key.

**Removed if Track A is chosen:** `GESTURE_WORKER_TOKEN`, `GESTURE_ALLOW_BROADCAST` (from both `server/.env` and the now-deleted `gesture-control/.env`).

**Unchanged either way:** `MONGODB_URI`, `GROQ_MODEL`, `ALLOWED_ORIGINS`, `PORT`/`HOST`/`NODE_ENV`. Note `HOST` in `server/.env.example` defaults to `127.0.0.1` — this **must** be overridden (typically to `0.0.0.0`) on any container/PaaS host, or the server won't accept external connections at all.

### Deferred — not needed now, worth knowing about

`server/routes/mapProxy.js` only sets browser-facing `Cache-Control` headers for MapTiler responses (600s for styles, 86400s for tiles/assets) — there's no shared server-side cache, so a deployed backend's own egress bandwidth scales with total tile requests across all users, not just unique tiles. This isn't a problem today (MapTiler's 100k/month free tier comfortably covers current and near-term traffic per this repo's own cost analysis), but if GeoSwipe ever approaches ~3,000+ daily active users, the same `cache.js` module built in §2 could be extended to cover this too.
