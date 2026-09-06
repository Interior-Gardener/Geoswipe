import { API_BASE_URL } from './apiConfig';
import { reportApiFailure, reportNetworkFailure } from './apiError';

async function requestJson(url, options = {}, label = 'Safety service') {
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch (networkError) {
    throw reportNetworkFailure(networkError, label, url);
  }

  if (!response.ok) {
    throw await reportApiFailure(response, label, url);
  }

  return response.json().catch(() => null);
}

export async function fetchNearbySafePlaces({ lat, lon, radius = 3000, limit = 20 }) {
  if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
    throw new Error('Valid coordinates are required to fetch safe places.');
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius: String(radius),
    limit: String(limit)
  });

  const payload = await requestJson(`${API_BASE_URL}/api/safety/nearby-safe-places?${params}`);
  return Array.isArray(payload?.places) ? payload.places : [];
}

export async function fetchLocationSafetyAlerts({ city = '', state = '', country = '' } = {}) {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (state) params.set('state', state);
  if (country) params.set('country', country);

  const payload = await requestJson(`${API_BASE_URL}/api/safety/alerts?${params}`);

  return {
    safetyHeadline: payload?.safetyHeadline || 'No major alerts reported.',
    alerts: Array.isArray(payload?.alerts) ? payload.alerts : [],
    fetchedAt: payload?.fetchedAt || new Date().toISOString()
  };
}

export async function fetchRouteAlternatives({ from, to, profile = 'driving' }) {
  if (!from || !to) {
    throw new Error('Origin and destination are required for route generation.');
  }

  const params = new URLSearchParams({
    fromLat: String(from.lat),
    fromLon: String(from.lon),
    toLat: String(to.lat),
    toLon: String(to.lon),
    profile
  });

  const payload = await requestJson(`${API_BASE_URL}/api/safety/routes?${params}`);
  return {
    routes: Array.isArray(payload?.routes) ? payload.routes : []
  };
}
