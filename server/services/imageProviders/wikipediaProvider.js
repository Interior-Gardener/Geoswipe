const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const REQUEST_TIMEOUT_MS = 8000;

function uniqueList(values = []) {
  const seen = new Set();
  const output = [];

  values.forEach((value) => {
    const normalized = (value || '').trim();
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(normalized);
    }
  });

  return output;
}

function buildWikipediaTitleCandidates({ name, city, state, country }) {
  return uniqueList([
    city ? `${name}, ${city}` : '',
    state ? `${name}, ${state}` : '',
    country ? `${name}, ${country}` : '',
    name
  ]);
}

function extractImageFromSummary(summary) {
  if (!summary || typeof summary !== 'object') {
    return null;
  }

  const image = summary.originalimage || summary.thumbnail;
  if (!image || !image.source) {
    return null;
  }

  return {
    imageUrl: image.source,
    width: Number.isFinite(image.width) ? image.width : null,
    height: Number.isFinite(image.height) ? image.height : null,
    title: summary.title || null,
    pageUrl: summary.content_urls?.desktop?.page || null
  };
}

function scoreWikipediaCandidate(candidate, context = {}) {
  if (!candidate || !candidate.imageUrl) {
    return -1;
  }

  const width = candidate.width || 0;
  const height = candidate.height || 0;
  const pixels = width * height;
  const isLandscape = width > height;

  let score = 0;
  if (isLandscape) {
    score += 35;
  }

  if (pixels > 0) {
    score += Math.min(60, Math.round(pixels / 90000));
  }

  const title = (candidate.title || '').toLowerCase();
  const name = (context.name || '').toLowerCase();
  const city = (context.city || '').toLowerCase();

  if (name && title.includes(name)) {
    score += 12;
  }

  if (city && title.includes(city)) {
    score += 8;
  }

  return score;
}

async function fetchSummary(title) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${WIKIPEDIA_API_BASE}/${encodeURIComponent(title)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GeoSwipe/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchMonumentImageFromWikipedia({ name, city = '', state = '', country = 'India' }) {
  if (!name) {
    return null;
  }

  const candidates = buildWikipediaTitleCandidates({ name, city, state, country });
  const images = [];

  for (const title of candidates) {
    const summary = await fetchSummary(title);
    const image = extractImageFromSummary(summary);

    if (image?.imageUrl) {
      images.push({ ...image, title });
    }
  }

  if (images.length === 0) {
    return null;
  }

  const context = { name, city };
  const best = [...images].sort(
    (left, right) => scoreWikipediaCandidate(right, context) - scoreWikipediaCandidate(left, context)
  )[0];

  if (!best) {
    return null;
  }

  return {
    imageUrl: best.imageUrl,
    source: 'wikipedia',
    width: best.width,
    height: best.height,
    pageUrl: best.pageUrl
  };
}

module.exports = {
  fetchMonumentImageFromWikipedia
};
