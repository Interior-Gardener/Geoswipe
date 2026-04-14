function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function haversineDistanceMeters(coordA, coordB) {
  if (!Array.isArray(coordA) || !Array.isArray(coordB)) {
    return Number.POSITIVE_INFINITY;
  }

  const [lon1, lat1] = coordA;
  const [lon2, lat2] = coordB;

  const toRadians = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function sampleRouteCoordinates(routeCoordinates = []) {
  if (!Array.isArray(routeCoordinates) || routeCoordinates.length === 0) {
    return [];
  }

  const sampleCount = Math.min(12, routeCoordinates.length);
  if (sampleCount <= 1) {
    return [routeCoordinates[0]];
  }

  const samples = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const idx = Math.floor((i / (sampleCount - 1)) * (routeCoordinates.length - 1));
    samples.push(routeCoordinates[idx]);
  }

  return samples;
}

function safePlaceCoverageScore(routeCoordinates, safePlaces = []) {
  if (!Array.isArray(safePlaces) || safePlaces.length === 0) {
    return 0.45;
  }

  const sampled = sampleRouteCoordinates(routeCoordinates);
  if (sampled.length === 0) {
    return 0.35;
  }

  let totalNearestMeters = 0;

  sampled.forEach((coord) => {
    let nearest = Number.POSITIVE_INFINITY;
    safePlaces.forEach((place) => {
      if (!Array.isArray(place.coordinates)) {
        return;
      }
      const dist = haversineDistanceMeters(coord, place.coordinates);
      nearest = Math.min(nearest, dist);
    });
    totalNearestMeters += nearest;
  });

  const avgNearestMeters = totalNearestMeters / sampled.length;

  // 0m => perfect (1), 5000m+ => poor (~0)
  return clamp(1 - avgNearestMeters / 5000, 0, 1);
}

function weatherRisk(weather) {
  if (!weather?.current) {
    return 0.35;
  }

  const { condition = '', visibility = 10, wind = {}, temp = 25 } = weather.current;
  const cond = String(condition).toLowerCase();

  let risk = 0.15;

  if (cond.includes('thunder') || cond.includes('storm')) {
    risk += 0.45;
  } else if (cond.includes('rain') || cond.includes('snow')) {
    risk += 0.3;
  } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    risk += 0.2;
  }

  if (typeof visibility === 'number' && visibility < 3) {
    risk += 0.2;
  }

  if (typeof wind.speed === 'number' && wind.speed > 10) {
    risk += 0.15;
  }

  if (typeof temp === 'number' && (temp > 41 || temp < 3)) {
    risk += 0.15;
  }

  return clamp(risk, 0, 1);
}

function alertRisk(alerts = []) {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return 0.15;
  }

  const severityToRisk = {
    low: 0.2,
    medium: 0.45,
    high: 0.75,
    critical: 1
  };

  let maxRisk = 0.2;
  alerts.forEach((alert) => {
    const severity = String(alert.severity || 'medium').toLowerCase();
    maxRisk = Math.max(maxRisk, severityToRisk[severity] ?? 0.45);
  });

  return clamp(maxRisk, 0, 1);
}

export function computeSafetyScore(route, context = {}) {
  const safeCoverage = safePlaceCoverageScore(route?.geometry?.coordinates || [], context.safePlaces || []);
  const wRisk = weatherRisk(context.weather);
  const aRisk = alertRisk(context.alerts);

  const safetyScore =
    safeCoverage * 55 +
    (1 - wRisk) * 25 +
    (1 - aRisk) * 20;

  return {
    safetyScore: Math.round(clamp(safetyScore, 0, 100)),
    breakdown: {
      safeCoverage,
      weatherRisk: wRisk,
      alertRisk: aRisk
    }
  };
}

export function rankAndLabelRoutes(routes = [], context = {}) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return [];
  }

  const minDuration = Math.min(...routes.map((route) => route.durationMin || Number.POSITIVE_INFINITY));
  const minDistance = Math.min(...routes.map((route) => route.distanceKm || Number.POSITIVE_INFINITY));

  const enriched = routes.map((route, index) => {
    const routeId = route.id || `route-${index + 1}`;
    const { safetyScore, breakdown } = computeSafetyScore(route, context);

    const durationScore = minDuration / Math.max(route.durationMin || minDuration, 1);
    const distanceScore = minDistance / Math.max(route.distanceKm || minDistance, 0.1);

    // Keep navigation practical while prioritizing safety.
    const compositeScore = Math.round(
      clamp(safetyScore * 0.7 + durationScore * 20 + distanceScore * 10, 0, 100)
    );

    return {
      ...route,
      id: routeId,
      safetyScore,
      compositeScore,
      breakdown
    };
  });

  const fastest = enriched.reduce((best, route) =>
    !best || route.durationMin < best.durationMin ? route : best,
  null);

  const shortest = enriched.reduce((best, route) =>
    !best || route.distanceKm < best.distanceKm ? route : best,
  null);

  const safest = enriched.reduce((best, route) =>
    !best || route.safetyScore > best.safetyScore ? route : best,
  null);

  return enriched.map((route) => {
    const badges = [];
    if (fastest && route.id === fastest.id) {
      badges.push('Fastest');
    }
    if (shortest && route.id === shortest.id) {
      badges.push('Shortest');
    }
    if (safest && route.id === safest.id) {
      badges.push('Safest');
    }

    return {
      ...route,
      badges
    };
  });
}

export function findRouteByPreference(routes = [], preference = 'safest') {
  if (!Array.isArray(routes) || routes.length === 0) {
    return null;
  }

  const normalized = String(preference || 'safest').toLowerCase();

  if (normalized === 'fastest') {
    return routes.reduce((best, route) =>
      !best || route.durationMin < best.durationMin ? route : best,
    null);
  }

  if (normalized === 'shortest') {
    return routes.reduce((best, route) =>
      !best || route.distanceKm < best.distanceKm ? route : best,
    null);
  }

  return routes.reduce((best, route) =>
    !best || route.safetyScore > best.safetyScore ? route : best,
  null);
}

export function estimateRouteDeviationMeters(routeCoordinates = [], currentCoord = []) {
  if (!Array.isArray(routeCoordinates) || routeCoordinates.length === 0 || !Array.isArray(currentCoord)) {
    return Number.POSITIVE_INFINITY;
  }

  let minDistance = Number.POSITIVE_INFINITY;

  routeCoordinates.forEach((coord) => {
    minDistance = Math.min(minDistance, haversineDistanceMeters(coord, currentCoord));
  });

  return minDistance;
}

export function distanceToDestinationMeters(destinationCoord = [], currentCoord = []) {
  return haversineDistanceMeters(destinationCoord, currentCoord);
}
