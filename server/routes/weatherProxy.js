// server/routes/weatherProxy.js
// Server-side proxy for OpenWeatherMap.
//
// SECURITY: the OpenWeather key was previously inlined into the browser bundle
// via VITE_OPENWEATHERMAP_API_KEY and sent on every weather request. It now
// stays on the server; the client calls these endpoints instead.
//
// FREE-TIER STRATEGY: OpenWeather's free tier allows 1,000 calls/day per
// account. Previously every sidebar open was a live upstream call, so cost grew
// with traffic and the tier was exhausted at roughly 500 daily users.
//
// Two layers fix that, in this order:
//   1. CACHE (services/cache.js) - responses are cached by rounded coordinate,
//      so every user looking at the same heritage site shares one upstream
//      call. Cost now scales with (distinct locations x refreshes per day),
//      which is bounded by the ~126-site catalogue regardless of user count.
//   2. KEY POOL (services/keyPool.js) - several free accounts' keys are used
//      round-robin, and a 429 rotates to the next key rather than failing.
//      This is headroom for cold caches and bursts, not the primary mechanism.
//
// Upstream JSON is returned unchanged so existing client-side parsing keeps
// working - only the URL the client calls has changed.

const express = require('express');
const rateLimit = require('express-rate-limit');

const { keyPools } = require('../config/env');
const { safeError } = require('../middleware/security');
const { isFiniteNumberInRange } = require('../middleware/validation');
const { createKeyPool } = require('../services/keyPool');
const { getOrFetch } = require('../services/cache');

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const UPSTREAM_TIMEOUT_MS = 10000;

// 4 hours. Chosen against the free-tier arithmetic: 1,000 calls/day divided by
// ~126 heritage sites allows ~7 full refreshes per day, so a 4h TTL (6 sweeps)
// leaves headroom while still being far fresher than a sidebar widget needs.
const WEATHER_TTL_MS = 4 * 60 * 60 * 1000;

// Soft cap below OpenWeather's 1,000/day so a key is retired by us before the
// provider has to reject it.
const OPENWEATHER_DAILY_SOFT_CAP = 900;

const weatherKeys = createKeyPool('openweather', keyPools.openWeather, {
  dailyLimitPerKey: OPENWEATHER_DAILY_SOFT_CAP
});

const weatherLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many weather requests. Please try again shortly.' }
});

// Two decimal places is ~1.1km - finer than weather varies, and coarse enough
// that every visitor to the same monument lands on ONE cache entry. This is the
// whole reason API cost stops scaling with user count.
function coordinateKey(lat, lon) {
  return `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
}

/**
 * One upstream attempt with a specific key.
 * Resolves to the keyPool contract: { value } or { quotaExhausted: true }.
 */
async function fetchWithKey(resource, lat, lon, apiKey) {
  const params = new URLSearchParams({
    lat: String(Number(lat)),
    lon: String(Number(lon)),
    appid: apiKey,
    units: 'metric'
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${OPENWEATHER_BASE}/${resource}?${params.toString()}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GeoSwipe/1.0' }
    });

    if (upstream.status === 429) {
      // This key's daily quota is gone. Let the pool try the next account.
      return { quotaExhausted: true };
    }

    if (upstream.status === 401) {
      // A rejected key is an operator problem, not a quota problem, but the
      // pool should still move past it rather than serving errors forever.
      console.error('[weather] OpenWeather rejected a key (401) - check it is valid and activated.');
      return { quotaExhausted: true };
    }

    if (!upstream.ok) {
      console.error(`[weather] OpenWeather responded ${upstream.status} for /${resource}`);
      return { value: undefined };
    }

    return { value: await upstream.json() };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[weather] OpenWeather timed out for /${resource}`);
    } else {
      console.error(`[weather] OpenWeather request failed: ${err.message || err}`);
    }
    return { value: undefined };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function proxyOpenWeather(resource, req, res) {
  if (!weatherKeys.hasKeys()) {
    return safeError(res, 503, 'Weather service is not configured on this server.');
  }

  const { lat, lon } = req.query;

  if (!isFiniteNumberInRange(lat, -90, 90) || !isFiniteNumberInRange(lon, -180, 180)) {
    return safeError(res, 400, 'Valid lat and lon query parameters are required.');
  }

  const cacheKey = `${resource}:${coordinateKey(lat, lon)}`;

  const data = await getOrFetch(
    'weather',
    cacheKey,
    WEATHER_TTL_MS,
    async () => {
      const result = await weatherKeys.run((apiKey) => fetchWithKey(resource, lat, lon, apiKey));

      if (!result.ok) {
        if (result.reason === 'all_keys_exhausted') {
          console.warn('[weather] every OpenWeather key is exhausted for today.');
        }
        // `undefined` tells the cache the fetch failed, so it serves the last
        // known value instead of caching a failure.
        return undefined;
      }

      return result.value;
    }
  );

  if (data === undefined) {
    return safeError(res, 503, 'Weather data is temporarily unavailable.');
  }

  // Cache at the browser/edge too, so a repeat view inside the window never
  // even reaches this server.
  res.setHeader('Cache-Control', 'public, max-age=1800');
  return res.json(data);
}

const router = express.Router();

// Explicit routes (rather than a parameterised path) keep the reachable
// upstream set literal and avoid Express 5 path-pattern pitfalls.
router.get('/current', weatherLimiter, (req, res) => proxyOpenWeather('weather', req, res));
router.get('/forecast', weatherLimiter, (req, res) => proxyOpenWeather('forecast', req, res));

module.exports = router;
module.exports.weatherKeys = weatherKeys;
