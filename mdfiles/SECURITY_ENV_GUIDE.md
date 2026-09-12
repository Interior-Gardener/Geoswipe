# Security & Environment Variables Guide

## The one rule

**No third-party credential may ever be given a `VITE_` prefix, or placed in any
file under `client/`.**

Vite compiles every `VITE_*` variable directly into the JavaScript bundle it
serves to browsers. Anything with that prefix is public: readable in DevTools,
in the downloaded bundle, and in the browser's network tab.

All credentials live in `server/.env` and are used only by the server. The
browser reaches keyed services through server proxy endpoints.

## Where things live

| Location | Contents | Committed? |
|---|---|---|
| `server/.env` | Every credential: DB URI, Groq, MapTiler, OpenWeather, NewsAPI, Unsplash, gesture worker token | Never |
| `client/.env.development` | Public config only: `VITE_API_URL` and feature flags | Never (though it holds nothing secret) |
| `*.env.example` | Variable NAMES only, no values | Yes |

## Proxy endpoints

The browser never talks to a keyed third-party API directly.

| Browser calls | Server forwards to | Key used |
|---|---|---|
| `POST /api/ai/chat` | Groq chat completions | `GROQ_API_KEY` |
| `GET /api/weather/current`, `/api/weather/forecast` | OpenWeatherMap | `OPENWEATHER_API_KEY` |
| `GET /api/maps/style/:name` | MapTiler style JSON (URLs rewritten) | `MAPTILER_API_KEY` |
| `GET /api/maps/asset?path=...` | MapTiler tiles/sprites/glyphs/TileJSON | `MAPTILER_API_KEY` |
| `GET /api/news/:siteName` | NewsAPI | `NEWSAPI_KEY` |
| `GET /api/heritage-sites/:name/image` | Unsplash | `UNSPLASH_ACCESS_KEY` |

### How the map proxy keeps working

MapLibre does not only fetch `style.json` — it then follows the tile, sprite and
glyph URLs *inside* that document, and for vector sources follows a TileJSON
document as well. The proxy therefore rewrites every `api.maptiler.com` URL in
any JSON passing through it to point back at `/api/maps/asset`, which re-attaches
the key server-side.

`/api/maps/asset` never accepts a caller-supplied URL — only an opaque path,
validated against a strict pattern and always resolved against the fixed
`api.maptiler.com` origin with redirects disabled. This is what prevents it
becoming an SSRF pivot.

## Gesture pipeline

**Webcam frames never leave the browser.** Hand tracking runs in the user's own
tab (MediaPipe Tasks-Vision), and detection results are delivered to the page's
own components through an in-memory event bus — they never touch the network.

This removed a whole class of risk rather than mitigating it. The previous
design streamed base64 webcam frames over a WebSocket to the server, which
relayed them to a Python worker; that required a shared `GESTURE_WORKER_TOKEN`,
per-tab session routing, and frame rate limiting purely to stop one user's
camera feed reaching another client. None of that machinery exists any more,
because there is nothing to route.

`GESTURE_WORKER_TOKEN` and `GESTURE_ALLOW_BROADCAST` no longer exist. Delete
them from any deployed environment.

## CORS

`ALLOWED_ORIGINS` is a comma-separated allowlist, enforced on both HTTP and
WebSocket transports. **In production an empty list rejects every browser
origin** — set it explicitly at deploy time. There is no wildcard fallback.

## Production checklist

- [ ] `ALLOWED_ORIGINS` set to the real front-end origin(s)
- [ ] `NODE_ENV=production`
- [ ] `HOST=0.0.0.0` (required on Render/any container host)
- [ ] `HOST` left at `127.0.0.1` unless the process must accept external traffic
      directly (behind a reverse proxy, use `0.0.0.0` inside the container only)
- [ ] All API keys are freshly rotated (see below) and set only in `server/.env`
      or the platform's secret store
- [ ] `npm audit` clean in both `client/` and `server/`
- [ ] TLS terminated in front of the server (enables the HSTS header)

## Credential rotation

Every key that was previously present in a `VITE_`-prefixed variable, or
hardcoded in source, must be treated as compromised — these were compiled into
the browser bundle and/or committed to git history:

- MapTiler (was in the client bundle **and** hardcoded in a file still in git history)
- Groq (was in the client bundle and sent as a browser `Authorization` header)
- OpenWeatherMap (was in the client bundle)
- NewsAPI (a key was hardcoded as a literal fallback in `server/index.js` and is in git history)
- Unsplash access key **and** secret key (a client env file is the wrong home for either)
- MongoDB Atlas credentials (rotate as a precaution — stored alongside browser-exposed keys)

Rotating the key at the provider is the only thing that ends the exposure.
Removing it from the code does not, because the old value is still in git
history and in any bundle previously served.

## Local setup

```bash
cp server/.env.example server/.env   # then fill in real values
cp client/.env.example client/.env.development
```

Keys may be supplied singly (`NEWSAPI_KEY`) or as a comma-separated pool from
several free accounts (`NEWSAPI_KEYS`). Pooled keys are used round-robin and a
key that hits its quota is skipped until the next UTC day.

Never commit any `.env` file. `.gitignore` covers `.env` and `.env.*` at any
depth, with `.env.example` explicitly re-included.
