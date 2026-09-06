# GeoSwipe — Project Context & Work Log

> **Purpose of this file.** Everything a new session needs to understand this
> project and the work already done: architecture, what changed, why, what was
> verified, and what is still outstanding. Read this first.
>
> Last updated: 2026-09-06

---

## 1. What GeoSwipe is

An interactive geography + Indian-heritage explorer. Three processes, run
locally via `npm start` (root) which uses `concurrently`:

| Process | Path | Stack |
|---|---|---|
| **Client** | `client/` | React 19 + Vite 7, MapLibre GL, Three.js, socket.io-client, framer-motion |
| **Server** | `server/` | Express 5, Socket.IO, Mongoose (MongoDB Atlas), 22 REST routes + 9 socket events |
| **Gesture detector** | `gesture-control/` | Python + MediaPipe, joins the same Socket.IO server |

**There is no authentication, session or user model anywhere.** Everything is
anonymous. Do not assume otherwise.

### Feature surface
- **Explore mode** (`/explore`) — Three.js globe, click countries, Earth
  customization panel (dat.GUI), gesture control, game launcher.
- **Games** — geography quiz, flag challenge, and multiplayer versions of both.
- **Heritage Mode** (`/heritage`) — MapLibre map of Indian heritage sites,
  monument sidebar, weather, news, 360° street view, 3D models, storybook, quizzes.
- **Trip Planner** (`/trip-planner`) — AI itinerary with costs + booking links.
- **Safety Navigation** (`/safety-navigation`) — safer routes, nearby safe
  places, alerts, emergency contacts, AI safety guidance.
- **Heritage Assistant** — Groq-backed chatbot.

### Data flow
Browser → REST `/api/*` → MongoDB + upstream APIs. **The browser never calls a
keyed third-party API directly** — everything goes through server proxies.

---

## 2. Environment & secrets — the one rule

**No credential may ever carry a `VITE_` prefix or live under `client/`.**
Vite compiles `VITE_*` into the browser bundle.

| File | Contents | Committed? |
|---|---|---|
| `server/.env` | All secrets + `ALLOWED_ORIGINS`, `GESTURE_WORKER_TOKEN`, `GROQ_MODEL` | Never |
| `client/.env.development` | `VITE_API_URL` + non-secret flags only | Never (holds nothing secret) |
| `gesture-control/.env` | `SOCKET_SERVER_URL`, `GESTURE_WORKER_TOKEN`, `SAVE_DEBUG_FRAME` | Never |
| `*.env.example` | Names only | Yes |

Server-side names: `MONGODB_URI`, `GROQ_API_KEY`, `GROQ_MODEL`,
`OPENWEATHER_API_KEY`, `NEWSAPI_KEY`, `MAPTILER_API_KEY`,
`UNSPLASH_ACCESS_KEY`, `UNSPLASH_SECRET_KEY`, `ALLOWED_ORIGINS`,
`GESTURE_WORKER_TOKEN`, `GESTURE_ALLOW_BROADCAST`, `PORT`, `HOST`, `NODE_ENV`.

### Proxy endpoints (browser → server → upstream)
| Browser calls | Upstream | Key used |
|---|---|---|
| `POST /api/ai/chat` (profiles: `heritage`, `safety`, `tripPlanner`) | Groq | `GROQ_API_KEY` |
| `GET /api/ai/status` | Groq models list (diagnostic) | `GROQ_API_KEY` |
| `GET /api/weather/current` \| `/forecast` | OpenWeatherMap | `OPENWEATHER_API_KEY` |
| `GET /api/maps/style/:name` | MapTiler style JSON (URLs rewritten) | `MAPTILER_API_KEY` |
| `GET /api/maps/asset/<path>` | MapTiler tiles/sprites/glyphs/TileJSON | `MAPTILER_API_KEY` |
| `GET /api/news/:siteName` | NewsAPI | `NEWSAPI_KEY` |
| `GET /api/heritage-sites/:name/image` | Unsplash → Wikipedia fallback | `UNSPLASH_ACCESS_KEY` |
| `GET /api/diagnostics` | Health of all 10 integrations | — |

Allowed map styles: `satellite`, `hybrid`, `topo`, `streets`, `streets-dark`,
`historical`.

---

## 3. ⚠️ CREDENTIAL ROTATION — STILL OUTSTANDING

These were **browser-exposed and/or committed to git history**. Removing them
from code does NOT end the exposure. **Rotate at the provider:**

- **MapTiler** — was in the client bundle *and* hardcoded in
  `maharashtra_heritage_map.html`, which is still in git history across 5
  commits (two titled *"for making repo public"*).
- **Groq** — was in the bundle and sent as a browser `Authorization` header.
- **OpenWeatherMap** — was in the bundle.
- **NewsAPI** — a key was hardcoded as a literal fallback in `server/index.js`
  (commit `6734e5c`) and is in history.
- **Unsplash access + secret key** — a client env file is the wrong home for either.
- **MongoDB Atlas** — rotate as a precaution (never committed, but stored
  beside browser-exposed keys and read by disk-scraping code).

Git history still contains the MapTiler and NewsAPI keys. Rewriting history
(`git filter-repo`/BFG + force-push) is the only removal; **rotation makes it moot.**

---

## 4. Security work completed

Full audit + remediation. Original state: keys in the browser, webcam frames
broadcast to every socket, no auth, no headers, 33 dependency vulns.

### Fixed
- **All credentials moved server-side.** Zero `VITE_` secret reads remain.
  Verified: production *and* development builds contain none of the 9 live
  secrets, and the bundle no longer references any keyed third-party host.
- **Webcam privacy (critical).** `video_frame` used
  `socket.broadcast.emit('process_frame')` — every connected client received
  every user's camera feed. Frames now go **only** to a token-registered
  gesture worker; results route **only** back to the originating browser tab
  (per-tab session id in the socket handshake).
  `GESTURE_WORKER_TOKEN` required in production.
  `GESTURE_ALLOW_BROADCAST` (default false) exists solely for single-user
  `CAMERA_MODE=local`; **frames are never broadcast under any setting.**
- **CORS** — real allowlist on HTTP *and* WebSocket; production requires
  `ALLOWED_ORIGINS`, no wildcard fallback.
- **NoSQL regex injection** — 9 unescaped `new RegExp(userInput)` sites
  replaced with escaped helpers (`server/middleware/validation.js`).
- **Security headers** — CSP, `nosniff`, `X-Frame-Options: DENY`,
  Referrer-Policy, Permissions-Policy, HSTS; `X-Powered-By` removed.
- **Error leakage** — `error.message` responses replaced with generic text.
- **Limits** — body 10mb→128kb; per-route limiters (AI 20/5min, weather
  60/5min, maps 3000/5min); per-socket token buckets; 500-room ceiling.
- **Binding** — server `0.0.0.0`→`127.0.0.1`; `vite --host` moved to opt-in
  `npm run dev:lan`.
- **Dependencies** — 22 client + 11 server vulns → **0 and 0**.
- **Debug webcam capture** — `detect.py` wrote a real webcam frame to disk
  unconditionally (untracked, so `git add .` would commit it). Now opt-in via
  `SAVE_DEBUG_FRAME`, file deleted, pattern gitignored.
- **`.gitignore`** — now catches `.env`/`.env.*` at any depth; untracked
  `server/populate-heritage-sites_only_India (1).js` (the old rule missed the
  ` (1)` suffix).

### Accepted / documented
- Flag multiplayer sends `code`, but it is already derivable from `flagUrl`
  (`flagcdn.com/w320/<code>.png`) which the client needs to render the flag.
  Game-integrity nuance, not a security hole.
- No authentication — appropriate for an anonymous app, but there is no
  identity to build authorization on if accounts are added.

---

## 5. Broken integrations fixed

| Symptom | Root cause | Fix |
|---|---|---|
| Groq 502 | Model `llama-3.3-70b-versatile` **decommissioned** (404 `model_not_found`). Key was fine. | `GROQ_MODEL` env var, default `openai/gpt-oss-120b`; token budgets raised (reasoning models spend `max_tokens` on reasoning and return empty otherwise); JSON mode restored for trip planner |
| Flag game + country quiz 503 | **restcountries v3.1 deprecated** — 301-redirects and returns `{success:false}` instead of an array | Dropped the dependency; generated `server/data/countries.js` (235 countries) from the repo's own `countrieslite.geo.json` |
| Heritage quiz "No quiz questions available" | `QuizQuestion` collection empty. `heritage_quiz_data.js` auto-ran on import against a hardcoded `mongodb://localhost:27017`, so it could never be imported | Made it side-effect-free (`require.main === module`) + `MONGODB_URI`; server auto-seeds **780 questions / 13 sites** |
| Heritage **multiplayer** modes failed | `generateHeritageQuizQuestion(difficulty = 'easy')` called with `room.difficulty` = `data.difficulty \|\| null`. **JS default params only trigger on `undefined`, not `null`** → query `{difficulty: null}` matched nothing | Treat any unrecognised difficulty as "no filter" |
| Intermittent quiz 503 (~1 in 15) | Only ~60% of trivia "geography" answers are countries; code fetched **one at a time** and gave up silently after 10 misses | Batch of 20 per request; measured 1-in-15 → **0-in-20** |
| Rate-limit 429 for real users | My own global 300/15min was too tight for Heritage Mode | Raised to 1200/15min; expensive routes keep strict per-route limits |

**NewsAPI note:** `NEWSAPI_KEY` was for a long time set to the *same value* as
`OPENWEATHER_API_KEY`. You have since fixed it — diagnostics now reports
**10/10 healthy**.

---

## 6. UI/UX transformation

Original state: 18,700 lines of JSX vs 1,669 lines of CSS. No shared design
system. `index.css` and `App.css` were untouched Vite boilerplate **not even
imported**. Styling lived in inline objects, a 428-line `<style>` block inside
a component's JSX, and 234 inline styles in one file.

### Foundation
- **`client/src/styles/design-system.css`** (~1,200 lines) — the single source
  of truth. Tokens (color, fluid type, spacing, radius, elevation, motion,
  z-index) + components: buttons, forms, cards, chips, segmented controls,
  modals, docks, skeletons, tooltips, states, camera HUD, game toolbar,
  overlay-open state. Imported first in `main.jsx`.
- Light/dark via `:root[data-gs-theme='light']` **and**
  `body[data-heritage-theme='light']`.

### Global systems added
| File | Purpose |
|---|---|
| `components/AppNav.jsx` + `.css` | Global nav on **every** route: ☰ destination menu, theme toggle, "?" guide. Replaced per-page back/home buttons and the heritage-only theme toggle |
| `components/WelcomeGuide.jsx` + `.css` | First-run explainer (localStorage `geoswipe:guide:seen:v1`), reopenable from "?". Explains all 6 capabilities + 4-step getting started |
| `utils/apiConfig.js` | `API_BASE_URL` + per-tab `getGestureSessionId()` |
| `utils/apiError.js` | Collapsible console diagnostics: URL, status, server message, fix hint |
| `utils/richText.jsx` | **Safe** Markdown→React renderer (no `dangerouslySetInnerHTML`; hrefs limited to http/https/mailto) |

### Per-surface work
- **Landing** — gradient hero, glass mode cards with CTAs, star field, sticky nav.
- **Explore** — `styles/explore.css`: centred CTA dock, class-driven globe
  overlays, themed instructions modal, **Earth customization panel** (below).
- **Game selection modal** — grouped single/multiplayer, accent cards, Escape + scroll-lock.
- **Chatbot** — `HeritageChatbot`: Markdown rendering (AI output was showing
  literal `**asterisks**`), grouped suggestion chips, per-message copy,
  auto-grow composer, typing indicator, jump-to-latest, persistent error bar.
- **Trip Planner** — page + modal + form + result. Steppers, segmented budget,
  transport tiles, interest chips; hero stats, cost cards with proportion bars,
  collapsible day-by-day timeline.
- **Heritage Mode** — `styles/heritage-map.css`: seven scattered always-on
  panels consolidated into one dock (search collapses; info/legend are
  mutually exclusive popovers); action cards became a centred dock.
- **Heritage sidebar + modals** — `styles/heritage-panels.css`: glass sidebar,
  rebuilt **weather** (hero temp, stat cards, 5-day forecast) and **news**
  (tabs, thumbnails, metadata) modals, shared `.h-modal` shell.
- **Safety Navigation** — `styles/safety-navigation.css`: extracted the
  428-line embedded `<style>`; theme-aware map style (`streets-dark` in dark).

---

## 7. Bugs found and fixed (beyond the brief)

- **`useParams` called conditionally** in `SketchfabViewer` — rules-of-hooks violation.
- **Two `no-undef` runtime bombs** — `loadHDRI`/`loadModel` and
  `createComposer` referenced `RGBELoader`/`GLTFLoader`/`EffectComposer` that
  were never imported. All dead; removed.
- **Map init crash** — map constructed with a null container while the loading
  shell rendered, then `.on()` called on null. Both guarded.
- **Deprecated `onKeyPress`** in the chatbot → `onKeyDown`.
- **Broken CSS declaration** — missing `;` after `background:` in the globe
  instructions modal swallowed the next declaration.
- **Clickable `<div>`s** (landing feature cards, `SidebarBlock`) → real `<button>`s.
- **Duplicate `export default`** in `HeritagePage.jsx`.
- **ESLint config gap** — no `eslint-plugin-react`, so JSX usage wasn't tracked
  and `motion` was falsely "unused". Added plugin + tuned rules.
- **Debug UI shipping to users** — three.js FPS meter, custom FPS readout, and
  the camera telemetry HUD. All now behind `VITE_DEBUG_MODE` / preview-open.

### Bugs I introduced and then fixed (all caught by verification)
- **Map sprite 404** — MapLibre appends `.json`/`@2x.png` to the URL **path**,
  not the string end. Rebuilt the asset proxy as path-based.
- **`%40` breaks MapTiler** — `sprite@2x.png` must keep a literal `@`.
  `encodePathSegment` preserves `@ { } ,`.
- **`{fontstack}` double-encoded** — would have broken all map labels.
- **Font names with spaces rejected** — glyphs 404'd.
- **`left: 50%` sizing trap** — an absolutely-positioned box shrink-to-fits
  against the *remaining* 50% of the viewport, capping the action dock at
  ~720px and clipping its last item. Fixed with `width: max-content`.
- **Temporal dead zone crash** — a sidebar effect referenced `sidebarExpanded`
  before its declaration.
- **Nav overlapping the sidebar** — nav now shifts left via `body.h-sidebar-open`.
- **Nav covering modals** — `position: fixed` **always creates a stacking
  context in Blink**, so nested modals can never out-stack a fixed sibling by
  z-index. Fixed with `body.gs-overlay-open` hiding the nav.
- **Removed a real feature** — I mis-classified the dat.GUI Earth customization
  panel as a dev tool and hid it. **Restored** (see below).
- **`loadTexture` deleted by accident** during dead-code removal; restored.
- **`assetLoader.js`** — an over-broad rename broke a used variable; reverted.

---

## 8. Earth customization panel (restored)

`EarthThreeJS.jsx` builds a dat.GUI panel with **Lighting Controls** (sun
intensity), **Material Properties** (ocean metalness, surface roughness, border
opacity, Bright Earth Mode, brightness, bright border colour/opacity),
**Animation Settings** (rotation speed, cloud speed) and **Atmosphere Effects**
(opacity, power factor, multiplier).

This is a **user feature, not debug UI.** It is visible by default. It is
styled in `styles/explore.css` under `.earth-gui` / `.earth-gui-host`:
dat.GUI's full-width fixed host is neutralised (it caused a 32px mobile
overflow), the panel sits at `top: 62px; right: 12px` (clear of the global
nav), and sliders/inputs/folders use design tokens.

### Why StrictMode was removed (important)

`main.jsx` is deliberately **not** wrapped in `<React.StrictMode>`.

StrictMode double-invokes effects in development only. `EarthThreeJS` builds a
whole Three.js scene imperatively - WebGL context, renderer, textures, DOM
overlays and the dat.GUI panel - and that setup is **not idempotent**. Double
invoking it produced two stacked full-size canvases and two control panels, and
left the visible globe wired to a torn-down scene. Symptom: the Earth
customization panel did nothing under `npm run dev` while working perfectly in
production builds - which is also why `vite preview` testing missed it.

Two defensive guards were added as well and should stay:
- `EarthThreeJS.jsx` removes any stale `<canvas>` from the mount container
  before attaching a new renderer.
- It removes any stale `.earth-gui` node before constructing a new panel.

**Restore StrictMode only alongside a rewrite that makes the Three.js effect
safe to run twice.**

**Still behind `VITE_DEBUG_MODE`** (genuinely developer-only): the three.js
Stats FPS meter and the custom `FPS / Target` readout.

Two follow-up bugs were fixed after restoring it:

1. **Duplicate panel in dev.** React StrictMode double-invokes effects, and the
   teardown left the first panel on screen - so two panels rendered and only
   the right-hand one was wired to the live Three.js scene. `EarthThreeJS.jsx`
   now purges any existing `.earth-gui` node before constructing a new one, and
   teardown no longer calls `__closeButton.click()` first (that was what left a
   collapsed ghost behind). Only reproducible with `npm run dev`, not `preview`.
2. **Collapsed bar unreadable.** dat.GUI absolutely-positions its open/close bar
   (`.close-bottom`), so it contributed no height; the panel collapsed to 2px
   and clipped the "Open Controls" label to a sliver. Fixed by putting the bar
   back in normal flow (`position: relative`) and moving the scroll container
   from the panel onto its inner `<ul>`, so the panel is never an overflow box.

---

## 9. Verification performed

Browser automation with **puppeteer-core driving installed Chrome** (scripts in
the session scratchpad, not committed).

- **13/13 routes** clean on desktop and mobile — **zero console errors**, zero
  horizontal overflow.
- **6 routes × 2 themes** (dark + light) — no issues.
- **API sweep** — all endpoints 200. `/api/diagnostics` → **10/10 integrations healthy**.
- **9/9 gesture-privacy tests pass** — eavesdropper gets no frames; worker
  registration rejected without the token; forged gestures rejected;
  legitimate worker still receives frames and results reach the right tab.
- **Security regression** — SSRF/traversal blocked, regex injection blocked,
  CORS correct, 4 security headers present, **no secrets in the bundle**.
- **Lint: 0 errors** (was 46). 9 remaining warnings are pre-existing
  `react-hooks/exhaustive-deps` advisories — deliberately left alone, since
  "fixing" them changes effect timing and risks behaviour.
- **Build green** throughout.

### How to re-run locally
```bash
# terminal 1
cd server && node index.js
# terminal 2
cd client && npm run build && npx vite preview --port 4173
# then open http://localhost:4173  (NOTE: localhost, not 127.0.0.1 — see below)
curl http://127.0.0.1:3000/api/diagnostics   # health of all integrations
```

---

## 10. Known issues / not done

1. **Rotate the credentials in §3.** The single most important outstanding item.
2. **`vite preview` binds IPv6-only** — `localhost:4173` works,
   `127.0.0.1:4173` does not (from `host: 'localhost'` in `vite.config.js`).
   Browsers are fine; hardcoded-IPv4 tooling is not.
3. **Not restyled** (still heavy inline styles): `MultiplayerFlagPage/Game`,
   `MultiplayerQuizPage/Game`, `HeritageQuiz`, `HeritageMultiplayerQuiz`,
   `HeritageStoryBook`, `HowToReachPage`, `StoryBookDemo`. The multiplayer
   views need **two live players** to verify, which is why they were left
   working rather than changed unverified.
4. **Heritage modals not yet restyled**: info, directions, quiz, street-view
   (weather, news and trip-planner are done).
5. **`handleLeaveRoom` removed** from both multiplayer pages — it was dead
   code (the "Leave" button uses `handleExitToPrevious`). A return-to-lobby
   control is a genuine missing capability if you want it.
6. **NewsAPI relevance** — queries return loosely related stories (e.g. stock
   markets for "Ajanta Caves"). Data-quality/query issue, not a display bug.
7. **restcountries** is fully removed; `the-trivia-api`, `flagcdn`,
   `overpass-api.de` and Wikipedia remain external dependencies with no key.
8. **Nothing has been committed.** All work is uncommitted in the working tree.

---

## 11. File map of new/changed code

**New — server**
```
server/config/env.js              central secret loading (no VITE_ fallbacks)
server/middleware/security.js     headers, safeError, errorHandler
server/middleware/validation.js   regex escaping, text sanitising
server/routes/aiProxy.js          Groq proxy + /status
server/routes/weatherProxy.js     OpenWeather proxy
server/routes/mapProxy.js         MapTiler style + asset proxy (SSRF-contained)
server/routes/diagnostics.js      health of all 10 integrations
server/data/countries.js          static 235-country dataset
```

**New — client**
```
client/src/styles/design-system.css      tokens + component library
client/src/styles/explore.css            explore shell, globe overlays, earth-gui
client/src/styles/heritage-map.css       map dock + floating panels
client/src/styles/heritage-panels.css    sidebar + modal shell, weather, news
client/src/styles/safety-navigation.css  extracted from embedded <style>
client/src/components/AppNav.{jsx,css}
client/src/components/WelcomeGuide.{jsx,css}
client/src/components/GameSelectionModal.css
client/src/components/tripPlanner/{TripPlannerPage,TripPlannerResult,TripPlannerModal}.css
client/src/utils/{apiConfig.js,apiError.js,richText.jsx}
```

**Deleted (dead code):** `client/src/index.css`, `client/src/App.css`,
`client/src/HeritagePage.jsx.backup`, `server/index_backup.js`,
`gesture-control/detect_backup.py`.

**Docs:** `SECURITY_ENV_GUIDE.md` rewritten; this file.

---

## 12. Conventions to follow

- **Never** add a `VITE_`-prefixed secret. Add it to `server/.env` and proxy it.
- Style with design-system tokens (`--gs-*`). Avoid new inline style objects.
- Clickable things are `<button>`, not `<div onClick>`.
- Unused bindings are `_`-prefixed (lint is configured for this).
- Verify with a real browser + `/api/diagnostics` before claiming something works.
- Run `npm run build` and `npx eslint src` in `client/` after changes.
