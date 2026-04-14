function normalizeCoordinates(rawCoordinates) {
  if (!Array.isArray(rawCoordinates) || rawCoordinates.length !== 2) {
    return null;
  }

  const [lon, lat] = rawCoordinates;
  const normalizedLon = Number(lon);
  const normalizedLat = Number(lat);

  if (!Number.isFinite(normalizedLon) || !Number.isFinite(normalizedLat)) {
    return null;
  }

  return [normalizedLon, normalizedLat];
}

function pickCoordinates(source) {
  return (
    normalizeCoordinates(source?.coordinates) ||
    normalizeCoordinates(source?.location?.coordinates) ||
    normalizeCoordinates(source?.site?.coordinates) ||
    normalizeCoordinates(source?.site?.location?.coordinates) ||
    null
  );
}

export function normalizeMonumentSelection(source) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const name =
    source.name ||
    source.monumentName ||
    source.site?.name ||
    source.selectedMonument?.name ||
    '';

  if (!name) {
    return null;
  }

  const coordinates = pickCoordinates(source);
  const city = source.city || source.location?.city || source.site?.city || source.site?.location?.city || '';
  const stateName = source.state || source.location?.state || source.site?.state || source.site?.location?.state || '';
  const country =
    source.country || source.location?.country || source.site?.country || source.site?.location?.country || 'India';

  return {
    name,
    category: source.category || source.site?.category || '',
    year: source.year || source.site?.year || '',
    coordinates,
    location: {
      city,
      state: stateName,
      country,
      coordinates
    }
  };
}

export function extractMonumentFromRouteState(routeState) {
  if (!routeState || typeof routeState !== 'object') {
    return null;
  }

  const candidate =
    routeState.selectedMonument ||
    routeState.monument ||
    routeState.site ||
    routeState;

  return normalizeMonumentSelection(candidate);
}

export function buildHeritageRouteState(selectedMonument, extraState = {}) {
  const normalized = normalizeMonumentSelection(selectedMonument);

  if (!normalized) {
    return Object.keys(extraState || {}).length > 0 ? { ...extraState } : undefined;
  }

  return {
    ...extraState,
    selectedMonument: normalized
  };
}
