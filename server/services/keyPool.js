// server/services/keyPool.js
//
// Round-robin pool of interchangeable free-tier API keys.
//
// This sits BEHIND services/cache.js, not instead of it: caching is what makes
// free-tier quota sufficient, and the pool only supplies headroom for cold
// caches, burst days, and a key the provider decides to throttle.
//
// Usage tracking is in-memory on purpose. The cache already keeps real upstream
// volume to the low hundreds per day, so a counter reset on redeploy costs at
// most one key's remaining quota - not worth a database write per API call.

function utcDayStamp(at = Date.now()) {
  return new Date(at).toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

/**
 * @param {string} serviceName     for log lines ("openweather")
 * @param {string[]} keys          the pool; duplicates and blanks are dropped
 * @param {object} [options]
 * @param {number} [options.dailyLimitPerKey]  soft cap; a key is skipped once
 *   it is reached, before the provider has to say no. Omit to rely purely on
 *   observed 429s.
 */
function createKeyPool(serviceName, keys, options = {}) {
  const { dailyLimitPerKey = null } = options;

  const pool = [...new Set((keys || []).map((k) => String(k || '').trim()).filter(Boolean))];

  // { used, exhaustedUntilDay } per key index.
  let state = pool.map(() => ({ used: 0, exhaustedDay: null }));
  let currentDay = utcDayStamp();
  let cursor = 0;

  // Quotas are daily; roll the counters when the UTC date changes. Done lazily
  // on access rather than with a timer, so there is no interval to leak and a
  // restart cannot land between ticks.
  function rollDayIfNeeded() {
    const today = utcDayStamp();
    if (today !== currentDay) {
      currentDay = today;
      state = pool.map(() => ({ used: 0, exhaustedDay: null }));
      if (pool.length) {
        console.log(`[keyPool:${serviceName}] daily counters reset for ${today}`);
      }
    }
  }

  function isAvailable(index) {
    const entry = state[index];
    if (entry.exhaustedDay === currentDay) {
      return false;
    }
    if (dailyLimitPerKey !== null && entry.used >= dailyLimitPerKey) {
      return false;
    }
    return true;
  }

  function markExhausted(index) {
    state[index].exhaustedDay = currentDay;
    console.warn(
      `[keyPool:${serviceName}] key #${index + 1}/${pool.length} exhausted for ${currentDay}` +
      ` - ${state.filter((_, i) => isAvailable(i)).length} key(s) still available`
    );
  }

  /**
   * Run `attempt` against each available key until one succeeds.
   *
   * `attempt(key)` must resolve to either:
   *   { value }                    - success, returned to the caller
   *   { quotaExhausted: true }     - this key is spent; try the next one
   *
   * @returns {Promise<{ok: boolean, value?: any, reason?: string}>}
   */
  async function run(attempt) {
    rollDayIfNeeded();

    if (pool.length === 0) {
      return { ok: false, reason: 'not_configured' };
    }

    let triedAny = false;

    for (let hop = 0; hop < pool.length; hop += 1) {
      const index = (cursor + hop) % pool.length;

      if (!isAvailable(index)) {
        continue;
      }

      triedAny = true;
      state[index].used += 1;

      const outcome = await attempt(pool[index]);

      if (outcome && outcome.quotaExhausted) {
        markExhausted(index);
        continue;
      }

      // Advance the cursor so load spreads evenly instead of hammering key #1.
      cursor = (index + 1) % pool.length;
      return { ok: true, value: outcome ? outcome.value : undefined };
    }

    return { ok: false, reason: triedAny ? 'all_keys_exhausted' : 'no_keys_available' };
  }

  function status() {
    rollDayIfNeeded();
    return {
      service: serviceName,
      keys: pool.length,
      available: state.filter((_, i) => isAvailable(i)).length,
      usedToday: state.reduce((sum, entry) => sum + entry.used, 0),
      day: currentDay
    };
  }

  return { run, status, size: () => pool.length, hasKeys: () => pool.length > 0 };
}

module.exports = { createKeyPool };
