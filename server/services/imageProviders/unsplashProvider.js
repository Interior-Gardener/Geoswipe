const { secrets } = require('../../config/env');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';
const REQUEST_TIMEOUT_MS = 9000;

// SECURITY: this used to fall back to reading `client/.env.development` off
// disk and scraping VITE_UNSPLASH_ACCESS_KEY out of it. That coupled a server
// secret to a client-side, browser-exposed file and kept the key alive in a
// location Vite compiles into the bundle. The key is now server-side only.
function getUnsplashAccessKey() {
  return secrets.unsplashAccessKey || '';
}

function uniqueQueries(values = []) {
  const seen = new Set();
  const queries = [];

  values.forEach((value) => {
    const normalized = (value || '').trim();
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      queries.push(normalized);
    }
  });

  return queries;
}

function buildUnsplashQueries({ name, city }) {
  return uniqueQueries([
    city ? `${name} ${city} landmark` : '',
    `${name} landmark`,
    `${name} heritage site`
  ]);
}

function scoreUnsplashPhoto(photo, context = {}) {
  if (!photo || !photo.urls) {
    return -1;
  }

  const width = Number(photo.width) || 0;
  const height = Number(photo.height) || 0;
  const pixels = width * height;
  const isLandscape = width > height;

  let score = 0;
  if (isLandscape) {
    score += 35;
  }

  if (pixels > 0) {
    score += Math.min(70, Math.round(pixels / 100000));
  }

  const textBlob = [photo.description, photo.alt_description, photo.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const name = (context.name || '').toLowerCase();
  const city = (context.city || '').toLowerCase();

  if (name && textBlob.includes(name)) {
    score += 12;
  }

  if (city && textBlob.includes(city)) {
    score += 8;
  }

  return score;
}

async function searchUnsplash(query, accessKey, orientation = 'landscape') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const params = new URLSearchParams({
    query,
    per_page: '12',
    order_by: 'relevant',
    content_filter: 'high'
  });

  if (orientation) {
    params.append('orientation', orientation);
  }

  try {
    const response = await fetch(`${UNSPLASH_SEARCH_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
        'User-Agent': 'GeoSwipe/1.0'
      }
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return Array.isArray(payload?.results) ? payload.results : [];
  } catch (_) {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchMonumentImageFromUnsplash({ name, city = '' }) {
  if (!name) {
    return null;
  }

  const accessKey = getUnsplashAccessKey();
  if (!accessKey) {
    return null;
  }

  const queries = buildUnsplashQueries({ name, city });
  const allPhotos = [];

  for (const query of queries) {
    let photos = await searchUnsplash(query, accessKey, 'landscape');

    if (photos.length === 0) {
      photos = await searchUnsplash(query, accessKey, '');
    }

    photos.forEach((photo) => allPhotos.push({ photo, query }));

    if (allPhotos.length > 0) {
      break;
    }
  }

  if (allPhotos.length === 0) {
    return null;
  }

  const context = { name, city };
  const bestMatch = [...allPhotos].sort(
    (left, right) => scoreUnsplashPhoto(right.photo, context) - scoreUnsplashPhoto(left.photo, context)
  )[0];

  if (!bestMatch?.photo?.urls) {
    return null;
  }

  const { photo } = bestMatch;
  const imageUrl = photo.urls.regular || photo.urls.full || photo.urls.small || null;

  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    source: 'unsplash',
    width: Number(photo.width) || null,
    height: Number(photo.height) || null,
    unsplashId: photo.id || null,
    credit: {
      name: photo.user?.name || null,
      username: photo.user?.username || null,
      profileUrl: photo.user?.links?.html || null
    }
  };
}

module.exports = {
  fetchMonumentImageFromUnsplash
};
