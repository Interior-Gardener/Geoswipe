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

// Free-tier quotas are per ACCOUNT, so several accounts' keys pooled together
// multiply the daily allowance. Plural `*_KEYS` holds a comma-separated list;
// the singular name is still honoured so an existing .env keeps working.
//
// Order matters only for round-robin start position, not correctness.
function readSecretList(pluralName, singularName) {
  const raw = (process.env[pluralName] || '').trim();
  const fromList = raw
    ? raw.split(',').map((entry) => entry.trim()).filter(Boolean)
    : [];

  const single = readSecret(singularName);
  if (single) {
    fromList.push(single);
  }

  // De-duplicate: the same key listed twice would be treated as two separate
  // quotas and the pool would "fail over" from a key onto itself.
  return [...new Set(fromList)];
}

const keyPools = {
  groq: readSecretList('GROQ_API_KEYS', 'GROQ_API_KEY'),
  openWeather: readSecretList('OPENWEATHER_API_KEYS', 'OPENWEATHER_API_KEY'),
  newsApi: readSecretList('NEWSAPI_KEYS', 'NEWSAPI_KEY'),
  maptiler: readSecretList('MAPTILER_API_KEYS', 'MAPTILER_API_KEY'),
  unsplashAccess: readSecretList('UNSPLASH_ACCESS_KEYS', 'UNSPLASH_ACCESS_KEY')
};

// Singular accessors remain the "first key in the pool" so code that only needs
// *a* working key (diagnostics probes, the MapTiler URL signer) is unchanged.
const secrets = {
  groqApiKey: keyPools.groq[0] || null,
  openWeatherApiKey: keyPools.openWeather[0] || null,
  newsApiKey: keyPools.newsApi[0] || null,
  maptilerApiKey: keyPools.maptiler[0] || null,
  unsplashAccessKey: keyPools.unsplashAccess[0] || null,
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

  // Pool depth is the thing that decides whether a free tier holds up, so make
  // it visible at boot rather than something to infer from a 429 later.
  const poolSummary = Object.entries(keyPools)
    .filter(([, list]) => list.length > 0)
    .map(([name, list]) => `${name}x${list.length}`)
    .join(', ');
  if (poolSummary) {
    console.log(`🔑 Key pools: ${poolSummary}`);
  }
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
  keyPools,
  allowedOrigins,
  reportConfiguration
};
