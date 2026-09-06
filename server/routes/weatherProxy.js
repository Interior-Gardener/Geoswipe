// server/routes/weatherProxy.js
// Server-side proxy for OpenWeatherMap.
//
// SECURITY: the OpenWeather key was previously inlined into the browser bundle
// via VITE_OPENWEATHERMAP_API_KEY and sent on every weather request. It now
// stays on the server; the client calls these endpoints instead.
//
// Upstream JSON is returned unchanged so existing client-side parsing keeps
// working - only the URL the client calls has changed.

const express = require('express');
const rateLimit = require('express-rate-limit');

const { secrets } = require('../config/env');
const { safeError } = require('../middleware/security');
const { isFiniteNumberInRange } = require('../middleware/validation');

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const UPSTREAM_TIMEOUT_MS = 10000;

const weatherLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many weather requests. Please try again shortly.' }
});


async function proxyOpenWeather(resource, req, res) {
  if (!secrets.openWeatherApiKey) {
    return safeError(res, 503, 'Weather service is not configured on this server.');
  }

  const { lat, lon } = req.query;

  if (!isFiniteNumberInRange(lat, -90, 90) || !isFiniteNumberInRange(lon, -180, 180)) {
    return safeError(res, 400, 'Valid lat and lon query parameters are required.');
  }

  const params = new URLSearchParams({
    lat: String(Number(lat)),
    lon: String(Number(lon)),
    appid: secrets.openWeatherApiKey,
    units: 'metric'
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${OPENWEATHER_BASE}/${resource}?${params.toString()}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GeoSwipe/1.0' }
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return safeError(res, 429, 'Weather service is busy. Please try again later.');
      }
      // A 401 here means OUR key is bad - that is an operator problem, and the
      // detail must not leak to the client.
      console.error(`OpenWeather upstream responded ${upstream.status} for /${resource}`);
      return safeError(res, 502, 'Failed to fetch weather data.');
    }

    const data = await upstream.json();
    // Cache briefly at the edge/browser; weather does not change per-second.
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return safeError(res, 504, 'Weather service timed out.');
    }
    return safeError(res, 502, 'Failed to fetch weather data.', err);
  } finally {
    clearTimeout(timeoutId);
  }
}

const router = express.Router();

// Explicit routes (rather than a parameterised path) keep the reachable
// upstream set literal and avoid Express 5 path-pattern pitfalls.
router.get('/current', weatherLimiter, (req, res) => proxyOpenWeather('weather', req, res));
router.get('/forecast', weatherLimiter, (req, res) => proxyOpenWeather('forecast', req, res));

module.exports = router;
