// server/config/env.js
// Single source of truth for server-side configuration and secrets.
//
// SECURITY: only server-scoped variable names are read here. `VITE_*` names are
// deliberately NOT accepted as fallbacks - anything Vite can see is compiled into
// the browser bundle, so treating those names as server secrets would re-create
// the exposure this module exists to prevent.

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

function readSecret(name) {
  const value = (process.env[name] || '').trim();
  return value || null;
}

const secrets = {
  groqApiKey: readSecret('GROQ_API_KEY'),
  openWeatherApiKey: readSecret('OPENWEATHER_API_KEY'),
  newsApiKey: readSecret('NEWSAPI_KEY'),
  maptilerApiKey: readSecret('MAPTILER_API_KEY'),
  unsplashAccessKey: readSecret('UNSPLASH_ACCESS_KEY'),
  mongodbUri: readSecret('MONGODB_URI')
};

// Origins permitted to call the API. In production an explicit allowlist is
// required; there is no wildcard fallback.
function parseAllowedOrigins() {
  const raw = (process.env.ALLOWED_ORIGINS || '').trim();
  if (raw) {
    return raw.split(',').map((entry) => entry.trim()).filter(Boolean);
  }

  if (isProduction) {
    return [];
  }

  // Development fallback only - production above requires an explicit
  // ALLOWED_ORIGINS allowlist and has no wildcard.
  //
  // 5173 (dev) and 4173 (preview) are the configured ports, but Vite moves to
  // the next free port when one is busy, and a `--port` override is a normal
  // thing to do. Covering the immediate fallbacks turns "everything fails with
  // an unexplained CORS error" into "it just works", without ever opening this
  // up to non-loopback origins.
  const devPorts = [5173, 5174, 5175, 4173, 4174];
  return devPorts.flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`
  ]);
}

const allowedOrigins = parseAllowedOrigins();

// Report configuration state at boot WITHOUT ever printing a secret value.
function reportConfiguration() {
  const configured = [];
  const missing = [];

  Object.entries(secrets).forEach(([name, value]) => {
    (value ? configured : missing).push(name);
  });

  console.log(`🔐 Secrets configured: ${configured.length ? configured.join(', ') : 'none'}`);
  if (missing.length) {
    console.warn(`⚠️  Secrets not configured (dependent features degrade gracefully): ${missing.join(', ')}`);
  }

  if (isProduction && allowedOrigins.length === 0) {
    console.error('❌ NODE_ENV=production but ALLOWED_ORIGINS is empty - all browser origins will be rejected.');
  }
}

module.exports = {
  isProduction,
  secrets,
  allowedOrigins,
  reportConfiguration
};
