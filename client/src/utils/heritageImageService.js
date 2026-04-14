const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const imageSessionCache = new Map();

function normalizeKey(siteName) {
  return String(siteName || '').trim().toLowerCase();
}

export function primeMonumentImageCache(siteName, image) {
  const key = normalizeKey(siteName);
  if (!key || !image?.imageUrl) {
    return;
  }

  imageSessionCache.set(key, image);
}

export async function fetchMonumentImage(siteName) {
  const key = normalizeKey(siteName);
  if (!key) {
    return null;
  }

  if (imageSessionCache.has(key)) {
    return imageSessionCache.get(key);
  }

  const response = await fetch(`${API_BASE_URL}/api/heritage-sites/${encodeURIComponent(siteName)}/image`);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload?.image?.imageUrl) {
    return null;
  }

  imageSessionCache.set(key, payload.image);
  return payload.image;
}

export function clearMonumentImageCache() {
  imageSessionCache.clear();
}
