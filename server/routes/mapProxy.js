// server/routes/mapProxy.js
// Server-side proxy for MapTiler.
//
// SECURITY: the MapTiler key was previously embedded in style URLs built in the
// browser (and was additionally hardcoded in a now-deleted HTML file that is
// still present in git history). The key now stays on the server.
//
// How this preserves functionality: MapLibre does not just fetch style.json -
// it then follows the tile/sprite/glyph URLs *inside* that document, and for
// vector sources it follows a TileJSON document too. So every JSON document
// that passes through this proxy is rewritten: any api.maptiler.com URL becomes
// an /api/maps/asset URL, and this endpoint re-attaches the key server-side.
//
// SSRF containment: /api/maps/asset never accepts a caller-supplied URL. It
// accepts an opaque path, validates it against a strict pattern, and always
// resolves it against the fixed api.maptiler.com origin with redirects disabled.

const express = require('express');
const rateLimit = require('express-rate-limit');

const { secrets } = require('../config/env');
const { safeError, relaxCspForMedia } = require('../middleware/security');

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const MAPTILER_ORIGIN = 'https://api.maptiler.com';
const UPSTREAM_TIMEOUT_MS = 15000;

// Only these named styles may be requested. The caller supplies the key of this
// map, never any part of the upstream path.
const ALLOWED_STYLES = {
  satellite: 'maps/satellite/style.json',
  hybrid: 'maps/hybrid/style.json',
  topo: 'maps/topo-v2/style.json',
  streets: 'maps/streets-v2/style.json',
  'streets-dark': 'maps/streets-v2-dark/style.json',
  historical: 'maps/backdrop/style.json'
};

// Upstream asset paths: dot/dash/at-safe segments only. Rejects scheme
// prefixes, host swaps, backslashes and `..` traversal. Curly braces are
// permitted because MapLibre templates carry {z}/{x}/{y}/{fontstack}/{range}
// placeholders, which the browser substitutes before the request is sent.
// Spaces and commas are permitted because MapLibre font stacks are real font
// names ("Open Sans Regular", or comma-joined fallback lists). Every segment
// must still START with an alphanumeric or a brace, which is what blocks `..`
// traversal; ':', '\' and '/' inside a segment remain impossible, so a scheme
// or host cannot be smuggled in.
const SAFE_ASSET_PATH = /^[A-Za-z0-9{][A-Za-z0-9._@{}, -]*(?:\/[A-Za-z0-9{][A-Za-z0-9._@{}, -]*)*$/;

const mapLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  // Tiles are fetched in bursts while panning/zooming, so this ceiling is high
  // by design - it exists to stop quota-draining scrapers, not normal browsing.
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many map requests. Please slow down.' }
});

function isMapTilerUrl(value) {
  return typeof value === 'string' && value.startsWith(`${MAPTILER_ORIGIN}/`);
}

// Percent-encodes one path segment while leaving characters that are legal in
// a URI path and meaningful to MapTiler/MapLibre untouched:
//   @  sprite@2x.png  - MapTiler 404s on %40
//   {} MapLibre templating placeholders, substituted by the browser
//   ,  comma-joined font stacks
function encodePathSegment(segment) {
  return encodeURIComponent(segment)
    .replace(/%40/g, '@')
    .replace(/%7B/g, '{')
    .replace(/%7D/g, '}')
    .replace(/%2C/g, ',');
}

// Turns an absolute MapTiler URL into a proxied /api/maps/asset/<path> URL.
//
// The upstream path goes in the URL PATH, not a query parameter. MapLibre
// builds sprite requests by appending ".json" / "@2x.png" to the *path*
// portion of the sprite URL (not to the end of the string), so a query-based
// form produced "/api/maps/asset.json?path=..." and 404'd.
function toProxiedUrl(originalUrl, publicBase) {
  let parsed;
  try {
    parsed = new URL(originalUrl);
  } catch {
    return originalUrl;
  }

  // Decode first: pathname percent-encodes MapLibre's {placeholders}, and
  // double-encoding them stops the browser substituting real values.
  const upstreamPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');

  // Re-encode each segment but keep `{`/`}` literal for MapLibre templating.
  const encodedPath = upstreamPath.split('/').map(encodePathSegment).join('/');

  const query = [];
  parsed.searchParams.forEach((value, name) => {
    // Never carry the upstream key through to the browser.
    if (name.toLowerCase() === 'key') return;
    query.push(`${encodeURIComponent(name)}=${encodePathSegment(value)}`);
  });

  return `${publicBase}/api/maps/asset/${encodedPath}${query.length ? `?${query.join('&')}` : ''}`;
}

// Recursively rewrites every MapTiler URL inside a JSON document (style.json
// and TileJSON both need this).
function rewriteMapTilerUrls(node, publicBase) {
  if (Array.isArray(node)) {
    return node.map((item) => rewriteMapTilerUrls(item, publicBase));
  }

  if (node && typeof node === 'object') {
    const output = {};
    for (const [key, value] of Object.entries(node)) {
      output[key] = rewriteMapTilerUrls(value, publicBase);
    }
    return output;
  }

  if (isMapTilerUrl(node)) {
    return toProxiedUrl(node, publicBase);
  }

  return node;
}

// The origin the browser should call back on. Honours forwarded headers when
// the deployment sits behind a reverse proxy.
function publicBaseUrl(req) {
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
  const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  return host ? `${proto}://${host}` : '';
}

async function fetchUpstream(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      // `manual` stops a redirecting upstream from pulling this request to
      // another host.
      redirect: 'manual',
      headers: { 'User-Agent': 'GeoSwipe/1.0' }
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

const router = express.Router();

// GET /api/maps/style/:styleName -> key-free, rewritten MapLibre style document
router.get('/style/:styleName', mapLimiter, async (req, res) => {
  if (!secrets.maptilerApiKey) {
    return safeError(res, 503, 'Map service is not configured on this server.');
  }

  const upstreamPath = ALLOWED_STYLES[req.params.styleName];
  if (!upstreamPath) {
    return safeError(res, 404, 'Unknown map style.');
  }

  try {
    const upstream = await fetchUpstream(
      `${MAPTILER_ORIGIN}/${upstreamPath}?key=${encodeURIComponent(secrets.maptilerApiKey)}`
    );

    if (!upstream.ok) {
      console.error(`MapTiler style upstream responded ${upstream.status}`);
      return safeError(res, 502, 'Failed to load map style.');
    }

    const style = await upstream.json();

    relaxCspForMedia(res);
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.json(rewriteMapTilerUrls(style, publicBaseUrl(req)));
  } catch (err) {
    if (err.name === 'AbortError') {
      return safeError(res, 504, 'Map style request timed out.');
    }
    return safeError(res, 502, 'Failed to load map style.', err);
  }
});

// GET /api/maps/asset/<upstream path> -> proxied tile/sprite/glyph/TileJSON
router.get('/asset/*splat', mapLimiter, async (req, res) => {
  if (!secrets.maptilerApiKey) {
    return safeError(res, 503, 'Map service is not configured on this server.');
  }

  // Express 5 gives a named wildcard as an array of decoded segments.
  const splat = req.params.splat;
  const rawPath = Array.isArray(splat) ? splat.join('/') : String(splat || '');

  if (!rawPath || rawPath.length > 512 || !SAFE_ASSET_PATH.test(rawPath)) {
    return safeError(res, 400, 'Invalid map asset path.');
  }

  const params = new URLSearchParams();
  Object.entries(req.query).forEach(([name, value]) => {
    if (name.toLowerCase() === 'key') return;
    if (typeof value === 'string') params.append(name, value);
  });
  params.set('key', secrets.maptilerApiKey);

  // Fixed origin + validated path: the caller cannot steer this elsewhere.
  const target = `${MAPTILER_ORIGIN}/${rawPath.split('/').map(encodePathSegment).join('/')}?${params.toString()}`;

  try {
    const upstream = await fetchUpstream(target);

    if (!upstream.ok) {
      if (upstream.status !== 404) {
        console.error(`[maps] asset ${upstream.status} for "${rawPath}"`);
      }
      return res.status(upstream.status === 404 ? 404 : 502).end();
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    relaxCspForMedia(res);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // TileJSON and other JSON documents embed further keyed MapTiler URLs, so
    // they must be rewritten too - otherwise the key reaches the browser here.
    if (contentType.includes('json')) {
      const document = await upstream.json();
      res.setHeader('Content-Type', 'application/json');
      return res.json(rewriteMapTilerUrls(document, publicBaseUrl(req)));
    }

    res.setHeader('Content-Type', contentType);
    return res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).end();
    }
    console.error('[maps] asset proxy failed:', err.message || err);
    return res.status(502).end();
  }
});

module.exports = router;
