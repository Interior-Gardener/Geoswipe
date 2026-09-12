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
| **Gesture detector** | *(in the browser)* | MediaPipe Tasks-Vision in the client tab — no separate process |

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
| `server/.env` | All secrets + `ALLOWED_ORIGINS`, `GROQ_MODEL` | Never |
| `client/.env.development` | `VITE_API_URL` + non-secret flags only | Never (holds nothing secret) |
| `*.env.example` | Names only | Yes |

Server-side names: `MONGODB_URI`, `GROQ_API_KEY`, `GROQ_MODEL`,
`OPENWEATHER_API_KEY(S)`, `NEWSAPI_KEY(S)`, `MAPTILER_API_KEY(S)`,
`UNSPLASH_ACCESS_KEY(S)`, `UNSPLASH_SECRET_KEY`, `ALLOWED_ORIGINS`,
`PORT`, `HOST`, `NODE_ENV`.

The plural `*_KEYS` forms take a comma-separated pool of keys from several free
accounts; see `server/services/keyPool.js`.

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
  every user's camera feed. This was first fixed by routing frames only to a
  token-registered worker. **It is now moot: frames never leave the browser
  at all** (see §14) — the pipeline, the token and the session routing were all
  deleted along with the Python worker.
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

## 10. Session 2 - bug-fix pass (7 reported issues)

All seven items reported after session 1, with the root cause found in each
case rather than guessed at.

### 1. Gesture died when a game started
`App.jsx` gated `CameraCapture` on `isCameraVisibleRoute`, which listed only
`/` and `/explore`. Starting a game unmounted the capture element and the frame
stream stopped, so gestures died. The list now covers the landing page, the
globe and all four games it launches (`/quiz`, `/flag-game`,
`/multiplayer/quiz`, `/multiplayer/flag-game`). Heritage routes stay excluded -
that mode is map-driven and the user asked for it to be left out.

**Verified:** camera mounted on all 6 gesture routes, absent on all 3 heritage
routes, and a client-side `/explore` -> `/quiz` navigation keeps the video
track in `readyState: "live"` (the actual regression).

### 2. Colour picker for the border colour was unusable
Three separate causes:

- `.earth-gui .c input[type='text']` set `background`/`color` with
  `!important`. dat.GUI paints the current colour by writing those two
  properties *inline* on that same input, so the swatch was permanently grey.
  Scoping it to `li:not(.color)` was **not** enough - that still matches
  through the enclosing `li.folder`. The rule is now anchored to the row class
  itself: `.cr:not(.color)`.
- The palette is an absolutely-positioned popup shown on hover, and the panel's
  controls list is a scroll container, so it was clipped out of existence. It
  is now in the flow beneath the swatch: never clipped, always visible, and it
  scrolls with the panel. `box-sizing: content-box` is forced on `.selector`,
  `.saturation-field` and `.hue-field`, or the app's border-box reset drops the
  hue strip on top of the saturation square.
- `brightModeBorderColor` was the number `0x00ffff`. dat.GUI writes
  `li.style.borderLeftColor = colour.toString()`, and for a numeric colour that
  yields `"0xffff"` - invalid CSS, silently dropped. It is now the string
  `'#00ffff'`, and the two consumers use three's `Color.set()` (accepts numbers
  *and* strings) instead of `setHex()`.

A legacy `<style>` block injected from `EarthThreeJS.jsx` was also duplicating
and fighting the panel theming in `explore.css`; only the spinner keyframes
remain there.

### 3. Only 3 storybooks showed
`StoryBookDemo.jsx` held a hardcoded array of three sites. It now loads all
sites from `/api/heritage-sites` (126) and reads an optional
`public/chapters/index.json` manifest to badge the hand-authored ones.
Regenerate the manifest with `npm run chapters:manifest`.

### 4. Heritage site counts never updated
`updateSiteCounts()` wrote into `document.getElementById('site-count')`, but
those nodes only exist while the info panel is open - which it is not by
default. The counts are now derived from state with `useMemo` and rendered as
JSX. Reads 126 total / 36 UNESCO.

> Caught during verification: the memo was first placed *above* the
> `heritageSites` declaration, which threw
> `Cannot access 'heritageSites' before initialization` and broke the whole
> Heritage page. Moved below its dependency.

### 5. Story book UI
The **library** page was rebuilt (search, category filters, illustrated-first
sort, skeleton/error/empty states). The **reader** was rewritten too - it had
real bugs, not just dated styling:

- chapter prose rendered at `40px` italic, centred, in a non-scrolling box, so
  anything longer than a few sentences was silently cut off;
- the library page promised arrow-key paging and Esc-to-close that the reader
  never implemented;
- generated chapters 2-5 illustrated themselves with unrelated stock photos;
- joining `visitingTips` left the first tip without a bullet.

Now: scrolling prose at a readable size, drop cap, progress rail, chapter dots,
skip-typewriter, keyboard paging (Left/Right/Space/Esc), and a stacked layout
under 900px. All data contracts are unchanged - chapter files, Ken Burns, audio
captions and the narration-unlock overlay all still work.

### 6. Light mode
- `HowToReachPage` was ~540 lines of inline styles hardcoding `#fff`, so "Back"
  and "Home" were white-on-white. Rewritten on the design system.
- **The landing page was the worst offender** and had not been reported
  directly: it hardcodes a night-sky background but takes its text colour from
  `--gs-text`, which flips to dark ink in light mode. The logo, nav links, hero
  paragraph and the whole gesture section rendered dark-on-dark. It now has a
  daylight background variant (and the star field, which only reads against a
  night sky, is hidden).
- Empty travel-mode cards: records carry `byRoad: { fromMajorCities: [] }`,
  truthy but empty, which rendered a card with a heading and nothing in it.
  Modes are now gated on actual content.

### 7. Trip Planner
The page, form and result were already rebuilt in session 1. The remaining
weakness was the largest area on screen sitting empty until a plan existed, so
the empty state now previews what a generated plan contains.

### Cross-cutting: sticky topbars ran under the global nav
`.app-nav` is fixed at the top right. Any page whose container is wide enough
to reach it had its trailing button hidden underneath - trip planner, story
library and the landing header all did. Added `--gs-nav-reserve` and a
self-adjusting reserve that is only as large as the actual overlap:

```css
padding-right: clamp(
  var(--gs-space-2),
  calc(var(--gs-nav-reserve) - (100vw - var(--gs-container)) / 2),
  var(--gs-nav-reserve)
);
```

### Verification (session 2)
- `npx eslint src` - **0 errors** (8 pre-existing warnings, none in new files).
- `npm run build` - clean.
- 13 routes x light **and** dark: **0 low-contrast hits, 0 page errors.**
  (The contrast scanner had to be taught that a `background-image` gradient
  carries a colour `backgroundColor` never reports - without that it produced
  ~18 false positives on gradient buttons and the trip-planner hero scrim.)
- Storybook reader driven end-to-end: cover -> chapter -> keyboard paging both
  directions -> mobile reflow to a single column, no horizontal overflow.
- Earth panel: 1 panel (no StrictMode ghost), swatch and row edge both live
  cyan, palette unclipped, hue strip clear of the saturation square, collapsed
  folders measure 0px.

---

## 11. Known issues / not done

1. **Rotate the credentials in §3.** The single most important outstanding item.
2. **`vite preview` binds IPv6-only** — `localhost:4173` works,
   `127.0.0.1:4173` does not (from `host: 'localhost'` in `vite.config.js`).
   Browsers are fine; hardcoded-IPv4 tooling is not.
3. **Not restyled** (still heavy inline styles): `MultiplayerFlagPage/Game`,
   `MultiplayerQuizPage/Game`, `HeritageQuiz`, `HeritageMultiplayerQuiz`.
   The multiplayer views need **two live players** to verify, which is why
   they were left working rather than changed unverified. `HeritageQuiz`'s
   mode/difficulty modals are a deliberately dark glass panel in both themes;
   they pass the contrast audit, they are simply not on the design system.
   (`HeritageStoryBook`, `HowToReachPage` and `StoryBookDemo` were done in
   session 2.)
4. **Heritage modals not yet restyled**: info, directions, quiz, street-view
   (weather, news and trip-planner are done).
5. **`handleLeaveRoom` removed** from both multiplayer pages — it was dead
   code (the "Leave" button uses `handleExitToPrevious`). A return-to-lobby
   control is a genuine missing capability if you want it.
6. **NewsAPI relevance** — queries return loosely related stories (e.g. stock
   markets for "Ajanta Caves"). Data-quality/query issue, not a display bug.
7. **restcountries** is fully removed; `the-trivia-api`, `flagcdn`,
   `overpass-api.de` and Wikipedia remain external dependencies with no key.
8. **Session 1 is commit `090cd19`. Session 2 is uncommitted** in the working tree.

---

## 12. File map of new/changed code

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

# session 2
client/src/styles/how-to-reach.css       HowToReachPage (rewritten off inline styles)
client/src/styles/storybook-library.css  Story Library index
client/src/styles/storybook-reader.css   Story Book reader (own warm palette,
                                         deliberately theme-independent)
client/public/chapters/index.json        manifest of hand-authored chapters
client/scripts/chapters-manifest.mjs     regenerates it (npm run chapters:manifest)
```

**Deleted (dead code):** `client/src/index.css`, `client/src/App.css`,
`client/src/HeritagePage.jsx.backup`, `server/index_backup.js`,
`gesture-control/detect_backup.py`.

**Docs:** `SECURITY_ENV_GUIDE.md` rewritten; this file.

---

## 13. Conventions to follow

- **Never** add a `VITE_`-prefixed secret. Add it to `server/.env` and proxy it.
- Style with design-system tokens (`--gs-*`). Avoid new inline style objects.
- Clickable things are `<button>`, not `<div onClick>`.
- Unused bindings are `_`-prefixed (lint is configured for this).
- Verify with a real browser + `/api/diagnostics` before claiming something works.
- Run `npm run build` and `npx eslint src` in `client/` after changes.

---

## 14. Session 3 — free-tier deployment architecture

Full detail in [ARCHITECTURE_CHANGES.md](ARCHITECTURE_CHANGES.md); deploy steps
in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md). Summary of what changed and why:

### The problem
A previous Render deploy failed twice over. The Python gesture worker did not
fit in a 512MB free instance, and every third-party API call went live to the
provider — NewsAPI's 100/day free tier could be exhausted by about a dozen
visitors, because one monument click cost up to eight calls.

### Gesture detection moved into the browser
`gesture-control/` is **deleted**. Hand tracking runs client-side via
`@mediapipe/tasks-vision`:

- `client/src/utils/gestureClassifier.js` — the pose geometry ported from
  `detect.py`, plus the stabiliser (5 stable frames, 1s click cooldown, 20fps
  inference cap). Verified against the original Python on 20,000 generated
  poses: **0 mismatches** across all ten gesture classes.
- `client/src/utils/gestureBus.js` — in-page pub/sub with the same `on`/`off`/
  `emit` surface the components already used, so `GlobalGestureCursor`,
  `GestureButton`, `LandingPage` and `EarthThreeJS` changed only where they
  obtain the event source. Handler logic is untouched.
- `client/scripts/setup-mediapipe.mjs` — self-hosts the WASM runtime and the
  ~8MB model under `public/mediapipe/` (runs on `predev`/`prebuild`), so there
  is no runtime CDN dependency.

Removed from the server: `register-gesture-worker`, `video_frame`,
`process_frame`, worker/session rooms, `forwardDetection`, frame rate limiters
(163 lines), plus `GESTURE_WORKER_TOKEN` and `GESTURE_ALLOW_BROADCAST`. Socket
`maxHttpBufferSize` dropped 1MB → 64KB. `client/src/globe.jsx` was deleted —
dead prototype, imported nowhere, listening for an event no server emitted.

### Caching makes API cost independent of user count
`server/services/cache.js` (new) — two-tier cache (memory + `ApiCache`
collection), generalised from `monumentImageService.js`. Caches results **per
heritage site / per news tier**, not per request, so all users share one
upstream call. Serves stale data when a fetch fails, de-duplicates concurrent
misses, and caches confirmed-empty results.

Applied to: NewsAPI (12h, per fallback tier — city/state/India tiers are shared
across every site in that place), OpenWeather (4h, by rounded coordinate),
MapTiler style documents (24h), Overpass safe places (7 days, **8.7s → 2ms**),
safety alerts (3h).

### Key pooling
`server/services/keyPool.js` (new) — round-robin across several free accounts'
keys, with soft daily caps below each provider's real limit and automatic
rotation on 429/401/403. Configured with comma-separated `*_KEYS` variables;
the old singular names still work and are merged in.

### Deployment config
`render.yaml` (backend), `client/public/_redirects` + `_headers` (Cloudflare
Pages). `package-lock.json` was un-ignored in `.gitignore` — both hosts build
with `npm ci`, which requires a committed lockfile.

### Still outstanding
- **§3 credential rotation is still not done** and now matters more, since the
  app is going public.
- `maplibre-gl` has a critical advisory (GHSA-jrc7-96c5-q579); the fix is a
  major version bump that needs its own testing pass.
- Gesture control was **not** verified against a real camera — the test browser
  blocks camera access. The classifier, stabiliser and bus are covered by
  differential and behavioural tests; the on-camera check is steps 9-11 of the
  deployment guide's post-deploy list.
