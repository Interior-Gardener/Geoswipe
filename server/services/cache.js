// server/services/cache.js
//
// Shared two-tier cache: an in-process Map in front of a MongoDB collection.
//
// WHY THIS EXISTS: weather and news were fetched live on every sidebar open, so
// third-party API cost scaled with (users x visits). Both are only ever looked
// up for one of ~126 fixed heritage sites, so caching the RESULT per site makes
// cost scale with (sites x refresh rate) instead - a fixed number that fits in
// a free tier no matter how many people use the app.
//
// The pattern is generalised from services/monumentImageService.js, which
// already proved it for monument imagery.

const mongoose = require('mongoose');
const ApiCache = require('../models/ApiCache');

// Memory tier. Survives only the process, and that is fine: Mongo is the
// durable tier and a cold start simply re-reads from it.
const memoryCache = new Map();

// Collapses concurrent misses for the same key into ONE upstream call. Without
// this, ten users opening the same monument at once on a cold cache would each
// fire their own request - ten times the quota for one cache entry.
const inFlight = new Map();

function cacheId(namespace, key) {
  return `${namespace}::${key}`;
}

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function readMemory(id) {
  const entry = memoryCache.get(id);
  if (!entry) {
    return null;
  }
  return entry;
}

function writeMemory(id, payload, expiresAt) {
  memoryCache.set(id, { payload, expiresAt, cachedAt: Date.now() });
}

/**
 * Read a cached value without ever calling upstream.
 *
 * @returns {Promise<{payload: any, fresh: boolean}|null>} null when nothing is
 *   cached at all. `fresh` is false for an expired entry, which callers may
 *   still choose to serve when upstream is unavailable.
 */
async function peek(namespace, key) {
  const id = cacheId(namespace, key);
  const now = Date.now();

  const memoryEntry = readMemory(id);
  if (memoryEntry) {
    return { payload: memoryEntry.payload, fresh: now < memoryEntry.expiresAt };
  }

  if (!mongoReady()) {
    return null;
  }

  try {
    const record = await ApiCache.findOne({ namespace, key }).lean();
    if (!record) {
      return null;
    }

    const expiresAt = new Date(record.expiresAt).getTime();
    writeMemory(id, record.payload, expiresAt);
    return { payload: record.payload, fresh: now < expiresAt };
  } catch (error) {
    console.warn(`[cache] read failed for ${namespace}/${key}:`, error.message || error);
    return null;
  }
}

/**
 * Write a value into both tiers.
 */
async function put(namespace, key, payload, ttlMs) {
  const id = cacheId(namespace, key);
  const expiresAt = Date.now() + ttlMs;

  writeMemory(id, payload, expiresAt);

  if (!mongoReady()) {
    return;
  }

  try {
    await ApiCache.findOneAndUpdate(
      { namespace, key },
      {
        $set: {
          namespace,
          key,
          payload,
          cachedAt: new Date(),
          expiresAt: new Date(expiresAt)
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // A failed persist is survivable - the memory tier still holds the value.
    console.warn(`[cache] write failed for ${namespace}/${key}:`, error.message || error);
  }
}

/**
 * The main entry point: serve from cache, or fetch once and cache the result.
 *
 * @param {string} namespace   logical cache ("weather", "news")
 * @param {string} key         identity of the thing cached (a site id, a tier)
 * @param {number} ttlMs       how long a fetched value stays fresh
 * @param {Function} fetchFn   async () => value. Return `undefined` to signal
 *                             "this failed, do not cache it". Returning null or
 *                             [] IS cached - a confirmed empty result is worth
 *                             remembering, otherwise every visit re-asks
 *                             upstream for something known to be absent.
 * @param {object} [options]
 * @param {boolean} [options.allowStale=true]  serve an expired entry when the
 *                             fetch fails (quota exhausted, upstream down).
 *                             Stale news beats an error panel.
 */
async function getOrFetch(namespace, key, ttlMs, fetchFn, options = {}) {
  const { allowStale = true } = options;
  const id = cacheId(namespace, key);

  const cached = await peek(namespace, key);
  if (cached && cached.fresh) {
    return cached.payload;
  }

  // Someone else is already fetching this exact key - wait for their result.
  if (inFlight.has(id)) {
    return inFlight.get(id);
  }

  const work = (async () => {
    try {
      const value = await fetchFn();

      if (value === undefined) {
        // Fetch failed. Expired-but-present data is better than nothing.
        return allowStale && cached ? cached.payload : undefined;
      }

      await put(namespace, key, value, ttlMs);
      return value;
    } catch (error) {
      console.warn(`[cache] fetch failed for ${namespace}/${key}:`, error.message || error);
      return allowStale && cached ? cached.payload : undefined;
    } finally {
      inFlight.delete(id);
    }
  })();

  inFlight.set(id, work);
  return work;
}

// Diagnostics only.
function stats() {
  const now = Date.now();
  let fresh = 0;
  memoryCache.forEach((entry) => {
    if (now < entry.expiresAt) fresh += 1;
  });
  return { memoryEntries: memoryCache.size, memoryFresh: fresh, inFlight: inFlight.size };
}

module.exports = { getOrFetch, peek, put, stats };
