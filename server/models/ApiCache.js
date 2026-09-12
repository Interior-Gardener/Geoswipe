const mongoose = require('mongoose');

// Persistent second tier for `services/cache.js`.
//
// One collection serves every namespace (weather, news, ...) because the cache
// stores opaque payloads: a per-namespace model would be the same three fields
// duplicated. `namespace` keeps the keyspaces separate.
const ApiCacheSchema = new mongoose.Schema(
  {
    namespace: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: true
    },
    // Whatever the upstream fetch produced. Mixed because each namespace has a
    // different shape and the cache never inspects it.
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    cachedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    versionKey: false
  }
);

ApiCacheSchema.index({ namespace: 1, key: 1 }, { unique: true });

// Entries are read back after expiry on purpose (stale-while-quota-exhausted),
// so this TTL only reaps records nothing has touched for a week - it is a
// storage guard for the 512MB Atlas free tier, not the freshness mechanism.
ApiCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('ApiCache', ApiCacheSchema, 'api_cache');
