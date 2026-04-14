const fs = require('fs');
const path = require('path');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';
const REQUEST_TIMEOUT_MS = 9000;
let cachedClientEnvAccessKey = null;

function parseEnvValue(rawLine = '') {
  const equalsIndex = rawLine.indexOf('=');
  if (equalsIndex === -1) {
    return '';
  }

  return rawLine.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');
}

function readClientUnsplashKey() {
  if (cachedClientEnvAccessKey !== null) {
    return cachedClientEnvAccessKey;
  }

  cachedClientEnvAccessKey = '';

  if (process.env.NODE_ENV === 'production') {
    return cachedClientEnvAccessKey;
  }

  const envCandidates = [
    path.resolve(__dirname, '../../../client/.env.development'),
    path.resolve(__dirname, '../../../client/.env')
  ];

  for (const envPath of envCandidates) {
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const accessLine = content
      .split(/\r?\n/)
      .find((line) => line.trim().toUpperCase().startsWith('VITE_UNSPLASH_ACCESS_KEY'));

    if (accessLine) {
      cachedClientEnvAccessKey = parseEnvValue(accessLine);
      break;
    }
  }

  return cachedClientEnvAccessKey;
}

function getUnsplashAccessKey() {
  const explicitKey = (
    process.env.UNSPLASH_ACCESS_KEY ||
    process.env.VITE_UNSPLASH_ACCESS_KEY ||
    ''
  ).trim();

  if (explicitKey) {
    return explicitKey;
  }

  return readClientUnsplashKey();
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
