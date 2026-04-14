const MonumentImage = require('../models/MonumentImage');
const { fetchMonumentImageFromWikipedia } = require('./imageProviders/wikipediaProvider');
const { fetchMonumentImageFromUnsplash } = require('./imageProviders/unsplashProvider');

const MEMORY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const memoryImageCache = new Map();

function normalizeText(value) {
  return String(value || '').trim();
}

function getMonumentId(site) {
  if (site?._id) {
    return String(site._id);
  }

  const name = normalizeText(site?.name).toLowerCase();
  const city = normalizeText(site?.location?.city).toLowerCase();
  const state = normalizeText(site?.location?.state).toLowerCase();
  return [name, city, state].filter(Boolean).join('|') || name;
}

function readMemoryCache(monumentId) {
  const entry = memoryImageCache.get(monumentId);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    memoryImageCache.delete(monumentId);
    return null;
  }

  return entry.value;
}

function writeMemoryCache(monumentId, value) {
  memoryImageCache.set(monumentId, {
    value,
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS
  });
}

function toPlainImage(document) {
  if (!document) {
    return null;
  }

  const source = document.toObject ? document.toObject() : document;
  return {
    monumentId: source.monumentId,
    name: source.name,
    imageUrl: source.imageUrl,
    source: source.source,
    width: source.width || null,
    height: source.height || null,
    cachedAt: source.cachedAt
  };
}

function buildFallbackImage(site) {
  const fallbackUrl =
    site?.media?.panorama_url ||
    (Array.isArray(site?.media?.images) ? site.media.images[0] : null) ||
    null;

  if (!fallbackUrl) {
    return null;
  }

  return {
    monumentId: getMonumentId(site),
    name: site.name,
    imageUrl: fallbackUrl,
    source: 'fallback',
    width: null,
    height: null,
    cachedAt: new Date().toISOString()
  };
}

async function resolveMonumentImage(site) {
  if (!site?.name) {
    return null;
  }

  const monumentId = getMonumentId(site);
  if (!monumentId) {
    return null;
  }

  const memoryResult = readMemoryCache(monumentId);
  if (memoryResult) {
    return memoryResult;
  }

  const dbRecord = await MonumentImage.findOne({ monumentId });
  if (dbRecord) {
    const normalized = toPlainImage(dbRecord);
    writeMemoryCache(monumentId, normalized);
    return normalized;
  }

  const fetchInput = {
    name: site.name,
    city: site.location?.city || '',
    state: site.location?.state || '',
    country: site.location?.country || 'India'
  };

  let fetchedImage = await fetchMonumentImageFromWikipedia(fetchInput);
  if (!fetchedImage) {
    fetchedImage = await fetchMonumentImageFromUnsplash(fetchInput);
  }

  if (!fetchedImage?.imageUrl) {
    return null;
  }

  const updatedRecord = await MonumentImage.findOneAndUpdate(
    { monumentId },
    {
      $set: {
        monumentId,
        name: site.name,
        imageUrl: fetchedImage.imageUrl,
        source: fetchedImage.source,
        width: fetchedImage.width || null,
        height: fetchedImage.height || null,
        cachedAt: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  const normalized = toPlainImage(updatedRecord);
  writeMemoryCache(monumentId, normalized);
  return normalized;
}

async function resolveMonumentImageWithFallback(site) {
  try {
    const resolved = await resolveMonumentImage(site);
    if (resolved) {
      return resolved;
    }
  } catch (error) {
    console.warn('Monument image resolution failed:', error.message || error);
  }

  return buildFallbackImage(site);
}

module.exports = {
  resolveMonumentImage,
  resolveMonumentImageWithFallback,
  buildFallbackImage
};
