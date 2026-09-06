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
| `gesture-control/.env` | Socket URL + `GESTURE_WORKER_TOKEN` | Never |
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

Webcam frames from the browser are delivered **only** to a registered gesture
worker, and detection results are delivered **only** back to the originating
browser tab (identified by a per-tab session id sent in the socket handshake).

The Python detector registers itself with `GESTURE_WORKER_TOKEN`, which must
match between `server/.env` and `gesture-control/.env`. In production the token
is mandatory: without it, registration is refused, because an unauthenticated
worker registration would let any client receive users' camera frames.

`GESTURE_ALLOW_BROADCAST` (default `false`) exists only for single-user
`CAMERA_MODE=local` setups, where the detector uses its own webcam and there is
no originating tab. It permits broadcasting hand-position data only — webcam
frames are never broadcast under any setting.

## CORS

`ALLOWED_ORIGINS` is a comma-separated allowlist, enforced on both HTTP and
WebSocket transports. **In production an empty list rejects every browser
origin** — set it explicitly at deploy time. There is no wildcard fallback.

## Production checklist

- [ ] `ALLOWED_ORIGINS` set to the real front-end origin(s)
- [ ] `GESTURE_WORKER_TOKEN` set, and matching in the detector's environment
- [ ] `NODE_ENV=production`
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
cp .env.example server/.env          # then fill in real values
cp client/.env.example client/.env.development
cp gesture-control/.env.example gesture-control/.env
```

Generate a worker token and put the same value in `server/.env` and
`gesture-control/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit any `.env` file. `.gitignore` covers `.env` and `.env.*` at any
depth, with `.env.example` explicitly re-included.
