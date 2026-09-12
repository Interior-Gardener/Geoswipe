# GeoSwipe — Architecture Changes for Free-Tier Deployment

**Date:** 2026-09-12
**Goal:** every existing feature keeps working, on free infrastructure, for any number of users.
**Companion doc:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — the step-by-step deploy.

---

## The core idea

Before this work, third-party API cost scaled with **users × page views**. Every time anyone opened a monument's sidebar, the server made live calls to OpenWeather and NewsAPI. NewsAPI's free tier is 100 requests/day and a single monument click could spend eight of them, so the app broke for everyone after roughly a dozen visitors.

But weather and news are only ever looked up for one of **126 fixed heritage sites**. Nothing about the result depends on *who* is asking. So the fix is to cache the result per site and share it across every user: cost now scales with **sites × refreshes per day**, a fixed number that free tiers absorb comfortably.

Key pooling (several free accounts per provider) sits on top of that as headroom — it is not the mechanism that makes this work, and should not be treated as one.

---

## 1. Shared cache — `server/services/cache.js` (new)

A two-tier cache: an in-process `Map` in front of a MongoDB collection. Generalised from the pattern already proven in `server/services/monumentImageService.js`.

```js
getOrFetch(namespace, key, ttlMs, fetchFn, { allowStale = true })
```

Design decisions worth knowing:

- **`undefined` from `fetchFn` means "failed, don't cache"**, while `null` and `[]` *are* cached. A confirmed "no articles exist for this place" is worth remembering — otherwise a site with no coverage re-asks upstream on every single view.
- **Stale-on-failure.** If the fetch fails and an expired entry exists, the expired entry is served. When a quota runs out, users see yesterday's news rather than an error panel.
- **In-flight de-duplication.** Ten users opening the same monument on a cold cache produce *one* upstream call, not ten.
- **Mongo TTL index is 7 days, not the cache TTL.** Entries are deliberately readable after expiry (that is what makes stale-on-failure work); the index only reaps records nothing has touched in a week, to protect the 512 MB Atlas free tier.

Backed by `server/models/ApiCache.js` (new) — one collection for all namespaces, since the cache stores opaque payloads and per-namespace models would be the same three fields repeated.

## 2. Key pool — `server/services/keyPool.js` (new)

Round-robin across several accounts' keys, with per-key daily counters that roll at UTC midnight.

- A `429` (or a provider's quota-exceeded body) marks that key spent for the day and **immediately retries on the next key**.
- A `401`/`403` is treated the same way — a dead key gets stepped over rather than serving errors forever.
- A **soft cap** below the provider's real limit (90 of NewsAPI's 100, 900 of OpenWeather's 1,000) retires a key before the provider has to reject it; a hard 429 can get an account flagged, a soft cap cannot.
- Counters are in-memory only. The cache already keeps real upstream volume to the low hundreds per day, so a counter reset on redeploy costs at most one key's remaining quota — not worth a database write per API call.

Configured via comma-separated `*_KEYS` variables, with the old singular names still honoured and merged in (`server/config/env.js`).

## 3. Per-integration changes

| Integration | Free limit | What was happening | What happens now |
|---|---|---|---|
| **NewsAPI** | 100/day | Up to ~8 live calls per monument click: a 4-level fallback chain, plus a second near-duplicate chain for the "location" panel. No server cache. | Cached **per fallback tier** for 12h. City/state/India tiers are shared by every site in that place, so the marginal cost of the Nth monument in a state is one call. The location panel reuses the monument chain's tiers and is usually free. Empty results cached. |
| **OpenWeather** | 1,000/day | Live call per sidebar open. | Cached 4h, keyed by coordinate rounded to 2 decimals (~1.1 km) so every visitor to a site shares one entry. |
| **MapTiler** | 100k/month | Style document re-fetched on every map init; tiles uncached server-side. | Style cached 24h server-side (raw document cached, rewritten per request). Tiles stay uncached by design — they are binary and high-volume; the existing 24h browser cache handles them. Both now run through the key pool. |
| **Overpass (safe places)** | IP-throttled | Live query per Safety Navigation load. **All users share one server IP**, so a handful of users could get the whole app throttled. | Cached 7 days by coordinate. Measured **8.7 s → 2 ms**. |
| **Safety alerts** | (NewsAPI) | A *third* uncached NewsAPI chain, up to 3 calls per page load. | Same tier cache, 3h TTL (hazard data should be fresher than heritage news). |
| **Unsplash** | 50/hour | Already cached permanently in Mongo. | Unchanged; added to the key pool. |

### Measured result

Three monuments in Maharashtra, then a repeat of the first:

```
Kanheri Caves                 706ms   monument=5 (L2)  location=5
Mahalakshmi Temple, Kolhapur  656ms   monument=1 (L1)  location=5
Chhatrapati Shivaji Terminus  355ms   monument=5 (L1)  location=5
Kanheri Caves (repeat)         18ms   monument=5
```

**5 NewsAPI calls total.** The third site's location panel reused the `city:mumbai` tier the first site populated; the repeat cost zero. Under the old code this sequence would have cost roughly 32 calls — a third of the entire daily budget for four page views.

Cache effectiveness, cold vs warm:

| Endpoint | Cold | Warm | Speedup |
|---|---:|---:|---:|
| `weather/current` | 235 ms | 6 ms | 39× |
| `weather/forecast` | 78 ms | 4 ms | 20× |
| `maps/style` | 672 ms | 5 ms | 134× |
| `safety/nearby-safe-places` | 8,726 ms | 2 ms | 4,363× |
| `safety/alerts` | 347 ms | 4 ms | 87× |

---

## 4. Gesture control moved into the browser

This is what actually killed the Render deploy: `gesture-control/detect.py` was a persistent Python process running OpenCV + MediaPipe, consuming a stream of base64 JPEG frames the browser pushed over a WebSocket at ~30 fps. That is ~900 KB/s per active user (~3.2 GB/hour), and the process did not fit in 512 MB — not helped by a `requirements.txt` that installed PyTorch, torchaudio and Whisper, none of which `detect.py` imported.

### What replaced it

| New file | Purpose |
|---|---|
| `client/src/utils/gestureClassifier.js` | The hand-pose geometry, ported from `detect.py`, plus the stabilisation state machine (5 stable frames, 1 s click cooldown, 20 fps inference cap). |
| `client/src/utils/gestureBus.js` | A tiny in-page pub/sub with the same `on`/`off`/`emit` surface the components already used against Socket.IO. Each consumer gets its **own subscription scope** — see the note below. |
| `client/scripts/setup-mediapipe.mjs` | Copies the WASM runtime out of `node_modules` and downloads the hand-landmark model into `public/mediapipe/`, so the app self-hosts them instead of depending on Google's CDN at runtime. Runs via `predev`/`prebuild`. |

`client/src/components/CameraCapture.jsx` was rewritten: instead of encoding frames and emitting `video_frame`, it runs MediaPipe's `HandLandmarker` against the video element and publishes results to the bus. MediaPipe is dynamically imported, so it stays out of the initial bundle and only loads when a gesture-enabled screen opens.

`GlobalGestureCursor.jsx`, `GestureButton.jsx`, `LandingPage.jsx` and `EarthThreeJS.jsx` each changed only where they *obtain* the event source — their handler logic is untouched, and the payload shapes (`{x, y}`, `{gesture}`) are identical.

### Why the bus hands out scoped handles

`getGestureBus()` returns a **new handle per consumer**, each with its own handler registry. `emit` reaches every handle; `off(event)` without a handler clears only the calling handle's subscriptions.

This is not incidental — it reproduces a property the old design had by accident. Every component used to create its *own* Socket.IO connection, so `EarthThreeJS`'s bare `socket.off("cursor")` (which it calls on setup to avoid duplicate listeners, and again on teardown) only detached its own listeners.

The first version of this bus used one shared registry, and that same call silently detached `GlobalGestureCursor` and every `GestureButton` as well. The symptom was precise and misleading: **the blue cursor stopped updating the moment Explore mounted, while gestures and clicks kept working** — because Earth and the buttons re-subscribed their own handlers immediately afterwards, and only the globally-mounted cursor stayed unsubscribed. Scoped handles fix it without touching any consumer, and make the bare-`off` form safe for anyone who writes it in future.

Covered by a regression test: a consumer's bare `off(event)` must leave other consumers' subscriptions intact, across Explore mount *and* unmount.

### Verification that the port is faithful

The Python `classify_gesture` and the JS port were run against **20,000 generated hand poses** covering all ten gesture classes:

```
python distribution: {unknown: 15384, cursor_move: 1216, zoom: 1071, rotate_left: 643,
                      rotate_right: 632, thumbs_up: 470, thumbs_down: 460,
                      index_point: 76, click: 39, pinch: 9}
js     distribution: (identical)
mismatches: 0
```

Plus 15 behavioural checks on the stabiliser and bus: the 5-frame threshold, click cooldown spacing (measured 1.02 s / 2.04 s / 3.06 s), the 50 ms inference cap, cursor clearing when the hand leaves frame, and bus subscribe/unsubscribe semantics including the bare `off(event)` form `EarthThreeJS` relies on.

A further 15 checks cover subscription scoping specifically, including the Explore-mount/unmount sequence that broke the cursor, handlers that unsubscribe themselves mid-dispatch, and re-subscribing after a scope has emptied.

The cursor path was also verified live in a browser on `/explore` with the globe mounted: emitting synthetic cursor events moves the rendered cursor element, both after SPA navigation and after a hard refresh.

### Removed

- `gesture-control/` entirely (including the 1.47 GB virtualenv).
- Server: `register-gesture-worker`, `video_frame`, `process_frame`, the worker room and per-tab session rooms, `forwardDetection`, and the frame/result rate limiters — 163 lines.
- `GESTURE_WORKER_TOKEN` and `GESTURE_ALLOW_BROADCAST`.
- Socket.IO `maxHttpBufferSize` dropped 1 MB → 64 KB (the 1 MB ceiling existed only to bound webcam frames).
- `client/src/globe.jsx` — an abandoned prototype, imported nowhere, listening for a `gesture-from-server` event no server ever emitted, using gesture names (`open_palm`, `fist`) that were not in the vocabulary.
- `getGestureSessionId` / `gestureSocketOptions` from `apiConfig.js` — they existed only to route frames to the worker and results back to the right tab.

### Trade-offs

- **First gesture use downloads ~10 MB** (WASM runtime + 7.8 MB model). It is lazy — nothing is fetched until a gesture screen opens — and cached for 30 days by the `_headers` rule. Repeat visits are instant.
- **Inference now costs the user's CPU/GPU** rather than a server's. On a free tier with no server capacity to spare, that is the right trade.
- **Better:** latency drops from a full network round trip to local inference, and webcam frames never leave the device — a real privacy improvement over streaming them to a server.

---

## 5. Deployment configuration (new files)

| File | Purpose |
|---|---|
| `render.yaml` | Render blueprint for the backend. Secrets are `sync: false` so Render prompts for them instead of them living in git. |
| `client/public/_redirects` | SPA fallback so `/heritage` etc. survive a hard refresh on Cloudflare Pages. |
| `client/public/_headers` | Immutable caching for hashed `/assets`, 30-day caching for `/mediapipe`, and `Permissions-Policy: camera=(self), geolocation=(self)` — the app needs both. |

`.gitignore`: `client/public/mediapipe/` is now ignored (generated artefacts), and the `package-lock.json` rule was **removed** — both hosts build with `npm ci`, which requires a committed lockfile.

---

## 6. What was NOT changed

- No feature was removed, simplified, or degraded. Every route, game, panel and gesture behaves as before.
- No API response shape changed, so no client parsing needed updating.
- Multiplayer Socket.IO handling is untouched.
- MapTiler *tile* responses are still not cached server-side — deliberately, since they are binary and high-volume and the browser cache already covers them.

---

## 7. Verification performed

- `npx eslint src` — **0 errors** (8 pre-existing warnings, unchanged).
- `npm run build` — green. MediaPipe correctly splits into its own lazy 43 KB gzip chunk.
- Server boots, MongoDB connects, `/api/diagnostics` reports **10/10 integrations healthy** with the pooled keys.
- Every cached endpoint called twice — payloads identical (apart from the `fetchedAt` response timestamp), warm calls 20×–4,363× faster.
- Deployed-build smoke test in a browser: page renders, no console errors, and the MediaPipe WASM + model load from the app's own origin (no third-party CDN request).
- **Not verified:** gesture detection against a real hand on a real camera. The sandboxed browser used for testing blocks camera access, so the classifier, stabiliser and bus were verified by differential and behavioural tests instead. Steps 9–11 of the deployment guide's checklist cover this and should be run on the deployed site.
