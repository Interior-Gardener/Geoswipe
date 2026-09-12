# GeoSwipe — Deployment Guide

**Target setup:** Cloudflare Pages (frontend) + Render free tier (backend) + MongoDB Atlas M0 (database).
**Cost:** ₹0/month.
**Last updated:** 2026-09-12

This guide assumes the architecture changes described in [ARCHITECTURE_CHANGES.md](ARCHITECTURE_CHANGES.md) are already in the code — they are. Follow the steps in order; each one lists how to verify it before moving on.

---

## 0. What changed, and why the old deploy failed

The previous attempt put three services on Render: a static client, the Node backend, and the Python gesture worker. It failed because the Python worker (OpenCV + MediaPipe, plus a `requirements.txt` that dragged in PyTorch and Whisper that it never imported) could not fit in Render's 512 MB free instance, and because every API call went live to a third-party service whose free tier ran out within a day.

Both root causes are now fixed in the code:

| Old problem | Fix |
|---|---|
| Python worker exceeded 512 MB | **Deleted.** Hand tracking runs in the browser via MediaPipe Tasks-Vision. There is no third service to deploy. |
| Webcam frames streamed to the server (~3.2 GB/hour/user) | **Gone.** No frame leaves the device. |
| NewsAPI burned ~8 calls per monument click, 100/day limit | Per-tier caching + shared city/state/India tiers + a 3-key pool. |
| OpenWeather 1,000/day | 4-hour cache keyed by rounded coordinate + a 5-key pool. |
| MapTiler 100k/month | Style documents cached 24h + a 3-key pool. |
| Overpass throttled the whole app (one shared server IP) | 7-day cache. Measured: 8.7 s → 2 ms. |

**The important consequence:** API cost no longer scales with the number of users. It scales with the number of *distinct heritage sites viewed per day*, which is capped at 126. Ten users and ten thousand users cost the same.

---

## 1. Prerequisites

- A GitHub account with this repository pushed to it.
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free M0 tier).
- A [Render](https://render.com) account.
- A [Cloudflare](https://dash.cloudflare.com) account.
- The API keys (already in your local `server/.env`; you will paste them into Render).

Nothing here requires a credit card.

---

## 2. Before you deploy: rotate the old credentials

**Do this first.** `PROJECT_CONTEXT.md` §3 documents that these keys were exposed in the browser bundle and/or committed to git history, and they are still valid:

- MapTiler (was in the client bundle *and* hardcoded in a since-deleted HTML file, across 5 commits)
- Groq (was sent as a browser `Authorization` header)
- OpenWeatherMap (was in the bundle)
- NewsAPI (was hardcoded in `server/index.js`, commit `6734e5c`)
- Unsplash access + secret (lived in a client `.env` file)
- MongoDB URI (never committed, but stored alongside the above — rotate as a precaution)

Anyone with access to the repo history has these. Deploying on them means going live on known-compromised credentials, and someone else can burn your free-tier quota.

**What to do:** regenerate each one in its provider dashboard, then use the *new* values in Step 4/5. The keys you supplied for this work are already pooled in `server/.env`; add the rotated ones to the same comma-separated lists.

> Rotation alone is enough. You do **not** need to rewrite git history — once the old keys are dead, their presence in history is harmless.

---

## 3. MongoDB Atlas

1. Create a free **M0** cluster (any region; pick one near your users).
2. **Database Access** → add a database user with a strong password. Save the password.
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`).
   - Render's free tier does not give you a static outbound IP, so an allowlist is not possible. The database user's password is the actual access control.
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/geoswipedb?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>`, and make sure `/geoswipedb` is in there before the `?`.

**Verify:** keep this string for Step 4. If your existing local `server/.env` already has a working `MONGODB_URI`, you can reuse it (but see Step 2 about rotation).

---

## 4. Deploy the backend to Render

### 4.1 Create the service

1. Render Dashboard → **New** → **Web Service** → connect your GitHub repo.
2. Configure:

   | Setting | Value |
   |---|---|
   | Name | `geoswipe-api` |
   | Language | `Node` |
   | Branch | `Mapathon` (or whichever you deploy) |
   | **Root Directory** | `server` |
   | Build Command | `npm ci` |
   | Start Command | `node index.js` |
   | Instance Type | **Free** |
   | Health Check Path | `/health` |

   The repo also contains `render.yaml`, so you can instead use **New → Blueprint** and Render will read all of this automatically.

### 4.2 Environment variables

Add these under **Environment**. Comma-separated lists — **no spaces after the commas**.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `MONGODB_URI` | your Atlas connection string from Step 3 |
| `ALLOWED_ORIGINS` | *leave blank for now* — you fill this in Step 5.3 |
| `MAPTILER_API_KEYS` | your MapTiler keys, comma-separated |
| `OPENWEATHER_API_KEYS` | your OpenWeather keys, comma-separated |
| `NEWSAPI_KEYS` | your NewsAPI keys, comma-separated |
| `UNSPLASH_ACCESS_KEYS` | your Unsplash access keys, comma-separated |
| `UNSPLASH_SECRET_KEY` | your Unsplash secret key |
| `GROQ_API_KEY` | your Groq key |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |

> **`HOST=0.0.0.0` is not optional.** The app defaults to `127.0.0.1`, which on Render means the health check can never reach it and the deploy will fail with "no open ports detected".

You can copy the exact values out of your local `server/.env` — the pools are already assembled there.

### 4.3 Deploy and verify

Once the first deploy finishes, note your URL (e.g. `https://geoswipe-api.onrender.com`) and check:

```bash
curl https://geoswipe-api.onrender.com/health
```

Then the important one — it reports the live health of every integration:

```bash
curl https://geoswipe-api.onrender.com/api/diagnostics
```

You want **10/10 healthy**. If something fails, the response names the service, the upstream status code, and a specific fix hint. Also check the Render logs for this line, which confirms your pools loaded:

```
🔑 Key pools: groqx1, openWeatherx5, newsApix3, maptilerx3, unsplashAccessx3
```

If a pool shows `x1` when you supplied several keys, your comma-separated list has a typo (usually a stray space).

---

## 5. Deploy the frontend to Cloudflare Pages

### 5.1 Create the project

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the repo and configure:

   | Setting | Value |
   |---|---|
   | Framework preset | `Vite` |
   | **Root directory** | `client` |
   | Build command | `npm ci && npm run build` |
   | Build output directory | `dist` |

### 5.2 Environment variables

Under **Settings → Environment variables → Production**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://geoswipe-api.onrender.com` (your Render URL, **no trailing slash**) |
| `NODE_VERSION` | `20` |

> Only `VITE_*` variables reach the browser, and `VITE_API_URL` is the only one this app needs. **Never put an API key here** — Vite compiles these straight into the JavaScript bundle where any visitor can read them.

### 5.3 Connect the two sides

After the Pages build finishes you get a URL like `https://geoswipe.pages.dev`.

Go back to **Render → Environment** and set:

```
ALLOWED_ORIGINS=https://geoswipe.pages.dev
```

Render redeploys automatically. Until you do this, every browser request is rejected by CORS and the app will look broken while the API is perfectly healthy.

### Do you have to update this after every deploy? No.

Cloudflare Pages gives you **three kinds of URL**:

| URL | Changes per deploy? | Use it for |
|---|---|---|
| `https://geoswipe.pages.dev` | **No** — stable alias, always points at the current production deployment | This is your real site. Share this one. |
| `https://main.geoswipe.pages.dev` | No — one per branch | Branch testing |
| `https://b9b14a49.geoswipe.pages.dev` | **Yes** — unique, immutable, per deployment | Checking one specific build |

So if you use the stable `https://geoswipe.pages.dev`, you set `ALLOWED_ORIGINS` **once** and never touch it again. Deploy as often as you like.

The per-deployment hash URLs are the awkward case, which is why the server accepts a **single-label wildcard**:

```
ALLOWED_ORIGINS=https://geoswipe.pages.dev,https://*.geoswipe.pages.dev
```

That covers the stable alias, every branch alias, and every per-deployment hash URL — with no further edits, ever.

The wildcard is matched on a parsed URL, and only one label may vary. `https://b9b14a49.geoswipe.pages.dev` matches; `https://geoswipe.pages.dev.evil.com`, `https://evil.com/#.geoswipe.pages.dev`, `https://a.b.geoswipe.pages.dev` and plain `http://` do not.

> Custom domain later? Just add it: `ALLOWED_ORIGINS=https://geoswipe.pages.dev,https://*.geoswipe.pages.dev,https://geoswipe.yourdomain.com`

### 5.4 Verify the gesture assets shipped

The ~8 MB hand-tracking model is downloaded at build time by `client/scripts/setup-mediapipe.mjs` (it runs automatically via the `prebuild` script). Confirm it made it into the deploy:

```bash
curl -I https://geoswipe.pages.dev/mediapipe/hand_landmarker.task
```

Expect **200** and roughly **7.8 MB**. If you get a 404, the download failed during the build — check the Cloudflare build log for `[mediapipe]` lines and re-run the deploy. The build deliberately does *not* fail on a model download error, so that a bad minute at Google's asset host cannot block a deploy; the cost is that gesture control is silently unavailable until you notice, which is why this check matters.

---

## 6. Post-deploy verification

Work through this list in a real browser on the deployed site:

| # | Check | Expected |
|---|---|---|
| 1 | Landing page loads | No console errors |
| 2 | `/explore` — 3D globe renders, countries clickable | Globe spins, clicks register |
| 3 | `/heritage` — map tiles load | MapTiler tiles visible (proves `/api/maps/*` works) |
| 4 | Click a monument → sidebar → **Weather** | Temperature and 5-day forecast |
| 5 | Same sidebar → **News** | Articles listed |
| 6 | Click a *second* monument in the same city → News | Loads noticeably faster (shared cache tier) |
| 7 | `/trip-planner` — generate a plan | AI itinerary returns (proves Groq) |
| 8 | `/safety-navigation` — allow location, find safe places | Hospitals/police listed (proves Overpass) |
| 9 | Allow camera on `/` or `/explore` | Preview appears, status reads **"Gestures on-device"** |
| 10 | Open palm to camera | Cyan cursor appears and follows your hand |
| 11 | OK sign (thumb + index circle, other fingers out) over a button | Button activates |
| 12 | Games: `/quiz`, `/flag-game` | Questions load |
| 13 | Multiplayer: open two tabs, join the same room | Both players see each other (proves WebSockets) |

**Camera requires HTTPS.** Both Cloudflare Pages and Render give you HTTPS by default, so this works in production — but it will *not* work if you test over plain `http://` on a LAN IP.

---

## 7. Living with the free tier

### Render cold starts

The free instance sleeps after **15 minutes** of inactivity. The next request wakes it, taking **30–60 seconds**. During that window the site loads (it is on Cloudflare's CDN) but API-driven panels spin.

Options, in order of how much I would recommend them:

1. **Accept it.** For a showcase or a demo, a slow first load of the day is usually fine.
2. **Keep it warm with an external pinger.** [UptimeRobot](https://uptimerobot.com) free tier can hit `https://geoswipe-api.onrender.com/health` every 5 minutes. `/health` is deliberately exempt from rate limiting. Note Render's free tier has a monthly instance-hour budget — continuous pinging consumes it faster, so check your usage.
3. **Move the backend to Fly.io** with one always-on machine if cold starts become a real problem.

### Watching your API usage

`GET /api/diagnostics` on the deployed backend reports every integration's live health. In the Render logs, watch for:

- `[keyPool:newsapi] key #N/3 exhausted for YYYY-MM-DD` — one account is spent, traffic moved to the next. Normal.
- `[news] every NewsAPI key is exhausted for today - serving cached news only.` — all keys spent. The app keeps serving cached news rather than erroring, but add more keys.
- `📰 [miss] fetching news tier "..."` — an actual upstream call. These should be rare after the first day.

### Adding more keys later

Create another free account at the provider, then append the key to the relevant list in Render's environment:

```
NEWSAPI_KEYS=key1,key2,key3,key4
```

No code change, no redeploy needed beyond Render's automatic restart. Current headroom with what you have:

| Service | Keys | Effective daily budget | Realistic use |
|---|---:|---:|---|
| NewsAPI | 3 | 270 req/day (90/key soft cap) | ~126 worst case, usually far less |
| OpenWeather | 5 | 4,500 req/day (900/key soft cap) | ~756 worst case |
| MapTiler | 3 | ~9,000 req/day | Scales with map panning |
| Unsplash | 3 | 150 req/hour | Near zero after warm-up |

MapTiler is the one that scales with real usage (tiles are fetched per map pan, not per site), so it is the first pool to grow if you get heavy traffic.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Render deploy fails: "no open ports detected" | `HOST` not set | Set `HOST=0.0.0.0` |
| Site loads but every panel errors; API is healthy | CORS | `ALLOWED_ORIGINS` must contain your Pages origin, with `https://` and no trailing slash. Add `https://*.<project>.pages.dev` to cover per-deployment URLs |
| `Unexpected token '<', "<!doctype "... is not valid JSON` | A fetch used a **relative** path (`/api/...`), so Cloudflare's SPA fallback answered it with `index.html` instead of the API answering | Every client API call must go through `API_BASE_URL` from `src/utils/apiConfig.js`. Never a relative `/api/...` path, and never a hardcoded host |
| Heritage sites don't load, other pages fine | A hardcoded `http://localhost:3000` left in a fetch | Same fix — use `API_BASE_URL`. Check with `grep -rn "localhost:300" client/src` |
| `npm ci` fails on Render/Cloudflare | `package.json` and `package-lock.json` out of sync | Run `npm install` locally, commit the updated lockfile |
| Map is blank, everything else works | MapTiler keys | Check `/api/diagnostics`; a 403 means quota or a disabled key |
| News panel empty | All NewsAPI keys spent, cold cache | Check logs for `all_keys_exhausted`; add a key |
| Gesture status stuck on "Loading gesture model…" | Model missing from deploy | `curl -I <pages-url>/mediapipe/hand_landmarker.task` — if 404, redeploy |
| Gesture status "Gesture model failed" | Model 404 or WASM blocked | Same as above; also check the browser console |
| Camera never prompts | Not HTTPS | Use the real Pages URL, not an IP |
| First API call of the day takes ~45 s | Render cold start | Expected — see §7 |
| Multiplayer does not connect | WebSockets | Render supports them on free tier; confirm `VITE_API_URL` has no trailing slash |

---

## 9. Local development after these changes

```bash
# once
cd client && npm install && cd ../server && npm install

# every time - two processes now, not three
npm start          # from the repo root: client + server
```

The Python gesture worker is gone, so there is no virtualenv to activate and no third terminal. `npm run dev` in `client/` automatically runs the MediaPipe setup script first.

To re-fetch the gesture model by hand:

```bash
cd client && npm run setup:mediapipe
```

---

## 10. Known issues not addressed here

- **`maplibre-gl` has a critical advisory** (GHSA-jrc7-96c5-q579, XSS sanitizer bypass). The fix is `maplibre-gl@6.9.0`, a major version bump from the 5.7.1 this project uses. That upgrade needs its own testing pass across Heritage Mode and Safety Navigation — it was out of scope here, but it should be scheduled.
- **Old credentials are still live** until you complete Step 2.
- **The research paper, forensic docs and `PROJECT_ABSTRACT.md`** still describe the three-process architecture. They are historical records of the project as it was, and were left alone deliberately. `README.md`, `PROJECT_CONTEXT.md` and `SECURITY_ENV_GUIDE.md` have been updated to match the current code.
