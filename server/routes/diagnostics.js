// server/routes/diagnostics.js
//
// One place to answer "which integrations are actually working right now, and
// if not, exactly why". Every check reports the upstream status code and the
// provider's own error message, so a failure is self-explaining instead of
// surfacing as an opaque 502/503 in the browser.
//
// SECURITY: never returns a key. It reports only whether one is CONFIGURED and
// whether the provider ACCEPTED it, and every upstream detail passes through a
// redaction pass first.

const express = require('express');
const mongoose = require('mongoose');

const { secrets } = require('../config/env');

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const CHECK_TIMEOUT_MS = 12000;

function redact(text) {
  return String(text || '')
    .replace(/\b(gsk_|sk-)[A-Za-z0-9_-]{8,}/g, '$1<REDACTED>')
    .replace(/([?&](?:key|apikey|appid|api_key)=)[^&\s"']+/gi, '$1<REDACTED>')
    .slice(0, 300);
}

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Runs one check and normalises the outcome, never throwing.
async function runCheck(name, { required = true, configured = true, hint, fn }) {
  const started = Date.now();

  if (!configured) {
    return { name, status: 'not_configured', ok: false, required, hint };
  }

  try {
    const result = await fn();
    return {
      name,
      status: result.ok ? 'ok' : 'failing',
      ok: result.ok,
      required,
      httpStatus: result.httpStatus ?? null,
      ms: Date.now() - started,
      ...(result.detail ? { detail: redact(result.detail) } : {}),
      ...(result.ok ? {} : { hint: result.hint || hint }),
      ...(result.info ? { info: result.info } : {})
    };
  } catch (err) {
    return {
      name,
      status: 'error',
      ok: false,
      required,
      ms: Date.now() - started,
      detail: redact(err.name === 'AbortError' ? `timed out after ${CHECK_TIMEOUT_MS}ms` : err.message),
      hint
    };
  }
}

async function readError(response) {
  const body = await response.text().catch(() => '');
  try {
    const parsed = JSON.parse(body);
    return (
      parsed?.error?.message ||
      parsed?.message ||
      parsed?.errors?.[0]?.message ||
      body.slice(0, 300)
    );
  } catch {
    return body.slice(0, 300);
  }
}

const router = express.Router();

router.get('/', async (req, res) => {
  const checks = await Promise.all([
    runCheck('mongodb', {
      fn: async () => {
        const state = mongoose.connection.readyState;
        const names = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        if (state !== 1) {
          return { ok: false, detail: `connection state: ${names[state] || state}`, hint: 'Check MONGODB_URI in server/.env and network access to the cluster.' };
        }
        await mongoose.connection.db.admin().ping();
        return { ok: true, info: { host: mongoose.connection.host } };
      },
      hint: 'Check MONGODB_URI in server/.env.'
    }),

    runCheck('groq', {
      configured: Boolean(secrets.groqApiKey),
      hint: 'Set GROQ_API_KEY in server/.env.',
      fn: async () => {
        const model = (process.env.GROQ_MODEL || 'openai/gpt-oss-120b').trim();
        const r = await timedFetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${secrets.groqApiKey}` }
        });
        if (!r.ok) {
          return { ok: false, httpStatus: r.status, detail: await readError(r), hint: 'GROQ_API_KEY was rejected. Check the key at https://console.groq.com/keys' };
        }
        const data = await r.json();
        const available = (data?.data || []).map((m) => m.id);
        if (!available.includes(model)) {
          return {
            ok: false,
            httpStatus: 200,
            detail: `configured model "${model}" is not available on this account`,
            hint: `Set GROQ_MODEL in server/.env to one of: ${available.slice(0, 8).join(', ')}`
          };
        }
        return { ok: true, httpStatus: 200, info: { model, modelsAvailable: available.length } };
      }
    }),

    runCheck('openweather', {
      configured: Boolean(secrets.openWeatherApiKey),
      hint: 'Set OPENWEATHER_API_KEY in server/.env.',
      fn: async () => {
        const r = await timedFetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=27.17&lon=78.04&appid=${encodeURIComponent(secrets.openWeatherApiKey)}`
        );
        return r.ok
          ? { ok: true, httpStatus: r.status }
          : { ok: false, httpStatus: r.status, detail: await readError(r), hint: 'OPENWEATHER_API_KEY was rejected. A new key can take ~1 hour to activate.' };
      }
    }),

    runCheck('newsapi', {
      configured: Boolean(secrets.newsApiKey),
      hint: 'Set NEWSAPI_KEY in server/.env.',
      fn: async () => {
        const r = await timedFetch(
          `https://newsapi.org/v2/everything?q=heritage&pageSize=1&apiKey=${encodeURIComponent(secrets.newsApiKey)}`
        );
        if (r.ok) return { ok: true, httpStatus: r.status };
        const detail = await readError(r);
        const sameAsWeather = secrets.newsApiKey === secrets.openWeatherApiKey;
        return {
          ok: false,
          httpStatus: r.status,
          detail,
          hint: sameAsWeather
            ? 'NEWSAPI_KEY is currently set to the SAME value as OPENWEATHER_API_KEY. Get a real NewsAPI key at https://newsapi.org/account'
            : 'NEWSAPI_KEY was rejected. Check it at https://newsapi.org/account'
        };
      }
    }),

    runCheck('maptiler', {
      configured: Boolean(secrets.maptilerApiKey),
      hint: 'Set MAPTILER_API_KEY in server/.env.',
      fn: async () => {
        const r = await timedFetch(
          `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(secrets.maptilerApiKey)}`
        );
        return r.ok
          ? { ok: true, httpStatus: r.status }
          : { ok: false, httpStatus: r.status, detail: await readError(r), hint: 'MAPTILER_API_KEY was rejected. Check key and its allowed-origins restrictions at https://cloud.maptiler.com/account/keys/' };
      }
    }),

    runCheck('unsplash', {
      required: false,
      configured: Boolean(secrets.unsplashAccessKey),
      hint: 'Set UNSPLASH_ACCESS_KEY in server/.env (optional - monument images fall back to Wikipedia).',
      fn: async () => {
        const r = await timedFetch('https://api.unsplash.com/search/photos?query=taj&per_page=1', {
          headers: { Authorization: `Client-ID ${secrets.unsplashAccessKey}` }
        });
        return r.ok
          ? { ok: true, httpStatus: r.status }
          : { ok: false, httpStatus: r.status, detail: await readError(r), hint: 'UNSPLASH_ACCESS_KEY was rejected.' };
      }
    }),

    runCheck('trivia-api', {
      hint: 'Public API used for quiz questions; no key required.',
      fn: async () => {
        const r = await timedFetch('https://the-trivia-api.com/v2/questions?limit=1');
        return r.ok
          ? { ok: true, httpStatus: r.status }
          : { ok: false, httpStatus: r.status, detail: await readError(r) };
      }
    }),

    runCheck('flag-cdn', {
      hint: 'Public CDN serving flag images; no key required.',
      fn: async () => {
        const r = await timedFetch('https://flagcdn.com/w320/in.png');
        return r.ok ? { ok: true, httpStatus: r.status } : { ok: false, httpStatus: r.status };
      }
    }),

    runCheck('overpass', {
      required: false,
      hint: 'Public OpenStreetMap API for safe-place lookup; falls back to synthetic places when down.',
      fn: async () => {
        const r = await timedFetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: '[out:json][timeout:10];node["amenity"="hospital"](around:1000,27.17,78.04);out 1;',
          headers: { 'Content-Type': 'text/plain' }
        });
        return r.ok ? { ok: true, httpStatus: r.status } : { ok: false, httpStatus: r.status, detail: await readError(r) };
      }
    }),

    runCheck('wikipedia', {
      required: false,
      hint: 'Public API used as a monument-image fallback; no key required.',
      fn: async () => {
        const r = await timedFetch('https://en.wikipedia.org/api/rest_v1/page/summary/Taj_Mahal');
        return r.ok ? { ok: true, httpStatus: r.status } : { ok: false, httpStatus: r.status };
      }
    })
  ]);

  const failing = checks.filter((c) => !c.ok);
  const requiredFailing = failing.filter((c) => c.required);

  // Mirror failures to the server console so they are visible without polling
  // this endpoint from a browser.
  if (failing.length) {
    console.error(`[diagnostics] ${failing.length} integration(s) not healthy:`);
    failing.forEach((c) => {
      console.error(
        `  - ${c.name}: ${c.status}` +
        `${c.httpStatus ? ` (HTTP ${c.httpStatus})` : ''}` +
        `${c.detail ? ` :: ${c.detail}` : ''}` +
        `${c.hint ? `\n      FIX: ${c.hint}` : ''}`
      );
    });
  } else {
    console.log('[diagnostics] all integrations healthy');
  }

  res.status(requiredFailing.length ? 503 : 200).json({
    healthy: requiredFailing.length === 0,
    summary: {
      total: checks.length,
      ok: checks.filter((c) => c.ok).length,
      failing: failing.length,
      requiredFailing: requiredFailing.length
    },
    checks
  });
});

module.exports = router;
