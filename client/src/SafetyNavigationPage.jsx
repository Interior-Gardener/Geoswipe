import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/safety-navigation.css';
import { fetchWeatherData } from './utils/openWeatherService';
import {
  fetchLocationSafetyAlerts,
  fetchNearbySafePlaces,
  fetchRouteAlternatives
} from './utils/safetyService';
import {
  getEmergencyContacts,
  getEmergencyLocations,
  getEmergencyTelHref,
  saveCustomEmergencyContact
} from './utils/safetyContacts';
import {
  distanceToDestinationMeters,
  estimateRouteDeviationMeters,
  findRouteByPreference,
  rankAndLabelRoutes
} from './utils/safetyScoring';
import { requestSafetyGuidance } from './utils/safetyGuidanceService';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import { useTheme } from './context/ThemeContext';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';

import { API_BASE_URL } from './utils/apiConfig';
const DEFAULT_CENTER = [77.209, 28.6139];
const DEFAULT_RADIUS = 3000;
const EMERGENCY_RADIUS = 5500;

function createMarker(color, size = 16) {
  const element = document.createElement('div');
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.borderRadius = '50%';
  element.style.background = color;
  element.style.border = '2px solid #ffffff';
  element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.35)';
  return element;
}

function formatDistanceMeters(meters) {
  if (!Number.isFinite(meters)) {
    return 'N/A';
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(2)} km`;
}

function normalizeDestination(site) {
  if (!site) {
    return null;
  }

  const coordinates =
    Array.isArray(site.coordinates) && site.coordinates.length === 2
      ? site.coordinates
      : Array.isArray(site.location?.coordinates) && site.location.coordinates.length === 2
        ? site.location.coordinates
        : null;

  if (!coordinates) {
    return null;
  }

  return {
    id: site.id || site._id || site.name,
    name: site.name || 'Destination',
    coordinates,
    city: site.city || site.location?.city || '',
    state: site.state || site.location?.state || '',
    country: site.country || site.location?.country || 'India'
  };
}

function boundsFromCoordinates(coords = []) {
  if (!Array.isArray(coords) || coords.length === 0) {
    return null;
  }

  const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
  coords.forEach((coord) => bounds.extend(coord));
  return bounds;
}

function weatherSummaryString(weather) {
  if (!weather?.current) {
    return 'Weather unavailable';
  }

  return `${weather.current.condition}, ${weather.current.temp}C, visibility ${weather.current.visibility}km`;
}

function alertsSummaryString(alerts = []) {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return 'No active safety alerts';
  }

  return alerts
    .slice(0, 4)
    .map((alert) => `${alert.severity || 'medium'}: ${alert.title}`)
    .join(' | ');
}

const SafetyNavigationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();
  const { isLight } = useTheme();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const safePlaceMarkersRef = useRef([]);
  const navWatchIdRef = useRef(null);
  const lastRerouteAtRef = useRef(0);
  const selectedRouteRef = useRef(null);
  const destinationRef = useRef(null);

  const [heritageSites, setHeritageSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [destination, setDestination] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [safePlaces, setSafePlaces] = useState([]);
  const [alertsData, setAlertsData] = useState({
    safetyHeadline: 'No alerts loaded.',
    alerts: [],
    fetchedAt: null
  });
  const [weather, setWeather] = useState(null);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routePreference, setRoutePreference] = useState('safest');
  const [isGeneratingRoutes, setIsGeneratingRoutes] = useState(false);

  const [emergencyMode, setEmergencyMode] = useState(false);
  const [evacuationMode, setEvacuationMode] = useState(false);

  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState('Navigation idle. Locate yourself to begin.');
  const [rerouteCount, setRerouteCount] = useState(0);

  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactsVersion, setContactsVersion] = useState(0);
  const [customContact, setCustomContact] = useState({ label: '', number: '' });

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiTip, setAiTip] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [error, setError] = useState('');

  const routeSelection = extractMonumentFromRouteState(location.state);
  const fallbackSelection = normalizeMonumentSelection(destination) || routeSelection || selectedMonument;

  const navigateBackToHeritage = () => {
    const state = buildHeritageRouteState(fallbackSelection);
    if (state) {
      navigate('/heritage', { state });
      return;
    }
    navigate('/heritage');
  };

  // SECURITY: the style URL used to embed VITE_MAPTILER_API_KEY. It now points
  // at the server proxy, which holds the key. If the server has no key
  // configured it returns 503 and MapLibre falls back to the demo style.
  //
  // The base map follows the app theme so a light map is not sitting under a
  // dark UI (and vice versa).
  const mapStyle = useMemo(
    () => `${API_BASE_URL}/api/maps/style/${isLight ? 'streets' : 'streets-dark'}`,
    [isLight]
  );

  const emergencyLocations = useMemo(() => getEmergencyLocations(), []);

  const cityOptions = useMemo(() => {
    const selected = emergencyLocations.find((entry) => entry.country === country);
    return selected?.cities || [];
  }, [country, emergencyLocations]);

  const filteredSites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return heritageSites
      .filter((site) => site.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery, heritageSites]);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) || null,
    [routes, selectedRouteId]
  );

  useEffect(() => {
    selectedRouteRef.current = selectedRoute;
  }, [selectedRoute]);

  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  const stopLiveNavigation = () => {
    if (navWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navWatchIdRef.current);
      navWatchIdRef.current = null;
    }
    setIsNavigating(false);
  };

  const loadSafetyContext = async (baseLocation, targetDestination = destination, nextEmergencyMode = emergencyMode) => {
    if (!baseLocation) {
      return;
    }

    const radius = nextEmergencyMode ? EMERGENCY_RADIUS : DEFAULT_RADIUS;
    const weatherLat = targetDestination?.coordinates?.[1] ?? baseLocation.lat;
    const weatherLon = targetDestination?.coordinates?.[0] ?? baseLocation.lon;

    const alertCity = targetDestination?.city || city;
    const alertState = targetDestination?.state || '';
    const alertCountry = targetDestination?.country || country;

    setAlertsLoading(true);

    try {
      const [places, weatherPayload, alertsPayload] = await Promise.all([
        fetchNearbySafePlaces({
          lat: baseLocation.lat,
          lon: baseLocation.lon,
          radius,
          limit: 25
        }),
        fetchWeatherData(weatherLat, weatherLon).catch(() => null),
        fetchLocationSafetyAlerts({
          city: alertCity,
          state: alertState,
          country: alertCountry
        }).catch(() => ({
          safetyHeadline: 'Could not load safety alerts.',
          alerts: [],
          fetchedAt: new Date().toISOString()
        }))
      ]);

      setSafePlaces(places);

      if (weatherPayload) {
        setWeather(weatherPayload);
      }

      setAlertsData(alertsPayload);
    } catch (contextError) {
      setError(contextError.message || 'Failed to load safety context.');
    } finally {
      setAlertsLoading(false);
    }
  };

  const fitRouteOnMap = (route) => {
    if (!mapRef.current || !route?.geometry?.coordinates) {
      return;
    }

    const bounds = boundsFromCoordinates(route.geometry.coordinates);
    if (bounds) {
      mapRef.current.fitBounds(bounds, {
        padding: 90,
        duration: 1000
      });
    }
  };

  const generateRoutesForDestination = async (targetDestination, origin = userLocation) => {
    if (!origin || !targetDestination?.coordinates) {
      setError('Location and destination are required before generating routes.');
      return [];
    }

    setIsGeneratingRoutes(true);
    setError('');

    try {
      const routePayload = await fetchRouteAlternatives({
        from: { lat: origin.lat, lon: origin.lon },
        to: { lat: targetDestination.coordinates[1], lon: targetDestination.coordinates[0] },
        profile: 'driving'
      });

      const ranked = rankAndLabelRoutes(routePayload.routes, {
        safePlaces,
        weather,
        alerts: alertsData.alerts
      });

      setRoutes(ranked);

      const preferred = findRouteByPreference(ranked, routePreference) || ranked[0] || null;
      if (preferred) {
        setSelectedRouteId(preferred.id);
        fitRouteOnMap(preferred);
        setNavigationStatus(`Loaded ${ranked.length} route options.`);
      } else {
        setSelectedRouteId(null);
        setNavigationStatus('No available routes for this trip.');
      }

      return ranked;
    } catch (routeError) {
      setError(routeError.message || 'Failed to generate routes.');
      return [];
    } finally {
      setIsGeneratingRoutes(false);
    }
  };

  const locateUserAndSetState = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return null;
    }

    setIsLocating(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 5000
        });
      });

      const nextLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        updatedAt: Date.now()
      };

      setUserLocation(nextLocation);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [nextLocation.lon, nextLocation.lat],
          zoom: 13,
          duration: 1200
        });
      }

      setNavigationStatus('Live location acquired.');
      await loadSafetyContext(nextLocation, destination);
      return nextLocation;
    } catch {
      setError('Could not fetch your current location. Please check browser permissions.');
      return null;
    } finally {
      setIsLocating(false);
    }
  };

  const selectDestination = (site) => {
    const normalized = normalizeDestination(site);
    if (!normalized) {
      setError('Selected destination does not include valid coordinates.');
      return;
    }

    setDestination(normalized);
    setSearchQuery(normalized.name);
    setShowSuggestions(false);

    if (normalized.country) {
      setCountry(normalized.country);
    }

    if (normalized.city) {
      setCity(normalized.city);
    }

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: normalized.coordinates,
        zoom: 12,
        duration: 900
      });
    }
  };

  const handleGenerateRoutesClick = async () => {
    if (!destination) {
      setError('Pick a destination before generating routes.');
      return;
    }

    let origin = userLocation;
    if (!origin) {
      origin = await locateUserAndSetState();
    }

    if (!origin) {
      return;
    }

    await generateRoutesForDestination(destination, origin);
  };

  const handleEmergencyToggle = async () => {
    const next = !emergencyMode;
    setEmergencyMode(next);

    if (userLocation) {
      await loadSafetyContext(userLocation, destination, next);
    }

    setNavigationStatus(next ? 'Emergency mode enabled.' : 'Emergency mode disabled.');
  };

  const handleEvacuationMode = async () => {
    let origin = userLocation;
    if (!origin) {
      origin = await locateUserAndSetState();
    }

    if (!origin) {
      return;
    }

    setEmergencyMode(true);
    setEvacuationMode(true);

    let places = safePlaces;
    if (!Array.isArray(places) || places.length === 0) {
      try {
        places = await fetchNearbySafePlaces({
          lat: origin.lat,
          lon: origin.lon,
          radius: EMERGENCY_RADIUS,
          limit: 30
        });
        setSafePlaces(places);
      } catch {
        // If safe places fail here, route generation will still proceed if destination exists.
      }
    }

    const nearest = (places || [])
      .filter((place) => Array.isArray(place.coordinates))
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0))[0];

    if (nearest) {
      const evacuationDestination = {
        id: nearest.id || nearest.name,
        name: nearest.name || 'Nearest safe place',
        coordinates: nearest.coordinates,
        city: nearest.city || city,
        state: nearest.state || '',
        country: nearest.country || country
      };

      setDestination(evacuationDestination);
      setSearchQuery(evacuationDestination.name);
      setRoutePreference('safest');
      await generateRoutesForDestination(evacuationDestination, origin);
      setNavigationStatus(`Evacuation route generated to ${evacuationDestination.name}.`);
    } else if (destination) {
      setRoutePreference('safest');
      await generateRoutesForDestination(destination, origin);
      setNavigationStatus('Evacuation mode enabled. Using safest available route.');
    } else {
      setError('No safe place found nearby and no destination selected.');
    }
  };

  const startLiveNavigation = () => {
    if (!selectedRoute || !destination) {
      setError('Select a destination route before starting live navigation.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    if (navWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(navWatchIdRef.current);
      navWatchIdRef.current = null;
    }

    setIsNavigating(true);
    setNavigationStatus('Live navigation started.');

    navWatchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const activeRoute = selectedRouteRef.current;
        const activeDestination = destinationRef.current;
        if (!activeRoute || !activeDestination?.coordinates) {
          setNavigationStatus('No active route found. Stopping navigation.');
          stopLiveNavigation();
          return;
        }

        const nextLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now()
        };

        setUserLocation(nextLocation);

        const remaining = distanceToDestinationMeters(activeDestination.coordinates, [nextLocation.lon, nextLocation.lat]);
        const offRoute = estimateRouteDeviationMeters(
          activeRoute.geometry?.coordinates || [],
          [nextLocation.lon, nextLocation.lat]
        );

        setNavigationStatus(
          `Remaining ${formatDistanceMeters(remaining)} | Off-route ${formatDistanceMeters(offRoute)}`
        );

        if (remaining < 60) {
          setNavigationStatus('Destination reached. Navigation complete.');
          stopLiveNavigation();
          return;
        }

        const now = Date.now();
        if (offRoute > 180 && now - lastRerouteAtRef.current > 15000) {
          lastRerouteAtRef.current = now;
          setRerouteCount((value) => value + 1);
          setNavigationStatus('Off-route detected. Re-routing now...');
          await generateRoutesForDestination(activeDestination, nextLocation);
        }
      },
      () => {
        setError('Lost GPS updates. Navigation stopped.');
        stopLiveNavigation();
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 3000
      }
    );
  };

  const handleAddCustomContact = () => {
    try {
      saveCustomEmergencyContact({
        country,
        city,
        label: customContact.label,
        number: customContact.number
      });

      setCustomContact({ label: '', number: '' });
      setContactsVersion((v) => v + 1);
    } catch (contactError) {
      setError(contactError.message || 'Could not save emergency contact.');
    }
  };

  const requestSafetyTip = async () => {
    setAiLoading(true);
    setAiTip('');

    const response = await requestSafetyGuidance({
      question:
        aiQuestion.trim() ||
        'Give me travel safety guidance for my active destination and route.',
      userLocation,
      destination,
      preferredRoute: routePreference,
      weatherSummary: weatherSummaryString(weather),
      alertsSummary: alertsSummaryString(alertsData.alerts),
      emergencyMode,
      evacuationMode
    });

    setAiLoading(false);

    if (response.success) {
      setAiTip(response.message);
    } else {
      setError(response.error || 'Could not fetch AI safety guidance.');
    }
  };

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: DEFAULT_CENTER,
        zoom: 5.8,
        pitch: 40,
        antialias: true
      });

      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    return () => {
      stopLiveNavigation();

      safePlaceMarkersRef.current.forEach((marker) => marker.remove());
      safePlaceMarkersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStyle]);

  useEffect(() => {
    let active = true;

    const loadSites = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/heritage-sites`);
        if (!response.ok) {
          throw new Error(`Failed to load heritage sites (${response.status})`);
        }

        const payload = await response.json();
        if (!active) {
          return;
        }

        const normalized = (Array.isArray(payload) ? payload : [])
          .map((site) => normalizeDestination(site))
          .filter(Boolean);

        setHeritageSites(normalized);
      } catch {
        if (active) {
          setError('Could not load heritage site list for destination search.');
        }
      }
    };

    loadSites();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const preselected = normalizeDestination(location.state?.site || location.state?.selectedMonument);
    if (preselected) {
      setDestination(preselected);
      setSearchQuery(preselected.name);
      setCountry(preselected.country || 'India');
      setCity(preselected.city || '');
    }
  }, [location.state]);

  useEffect(() => {
    setContacts(getEmergencyContacts(country, city));
  }, [country, city, contactsVersion]);

  useEffect(() => {
    if (!routes.length) {
      return;
    }

    const preferred = findRouteByPreference(routes, routePreference);
    if (preferred) {
      setSelectedRouteId(preferred.id);
    }
  }, [routePreference, routes]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) {
      return;
    }

    const lngLat = [userLocation.lon, userLocation.lat];

    if (!userMarkerRef.current) {
      userMarkerRef.current = new maplibregl.Marker({
        element: createMarker('#2d9cdb', 18)
      })
        .setLngLat(lngLat)
        .setPopup(new maplibregl.Popup({ offset: 14 }).setText('You are here'))
        .addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLngLat(lngLat);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !destination?.coordinates) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
      return;
    }

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new maplibregl.Marker({
        element: createMarker('#eb5757', 18)
      })
        .setLngLat(destination.coordinates)
        .setPopup(new maplibregl.Popup({ offset: 14 }).setText(destination.name))
        .addTo(mapRef.current);
    } else {
      destinationMarkerRef.current
        .setLngLat(destination.coordinates)
        .setPopup(new maplibregl.Popup({ offset: 14 }).setText(destination.name));
    }
  }, [destination]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    safePlaceMarkersRef.current.forEach((marker) => marker.remove());
    safePlaceMarkersRef.current = [];

    safePlaces
      .slice(0, emergencyMode ? 20 : 10)
      .filter((place) => Array.isArray(place.coordinates))
      .forEach((place) => {
        const marker = new maplibregl.Marker({
          element: createMarker('#27ae60', 14)
        })
          .setLngLat(place.coordinates)
          .setPopup(
            new maplibregl.Popup({ offset: 10 }).setHTML(
              `<strong>${place.name || 'Safe place'}</strong><br/>${place.type || 'support'}<br/>${formatDistanceMeters(place.distanceMeters)}`
            )
          )
          .addTo(mapRef.current);

        safePlaceMarkersRef.current.push(marker);
      });
  }, [safePlaces, emergencyMode]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const drawRoutes = () => {
      const sourceId = 'safety-routes-source';
      const routesLayerId = 'safety-routes-layer';
      const selectedLayerId = 'safety-selected-route-layer';

      const featureCollection = {
        type: 'FeatureCollection',
        features: routes
          .filter((route) => route.geometry?.coordinates?.length)
          .map((route) => ({
            type: 'Feature',
            geometry: route.geometry,
            properties: {
              id: route.id,
              safetyScore: route.safetyScore || 0
            }
          }))
      };

      if (!mapRef.current.getSource(sourceId)) {
        mapRef.current.addSource(sourceId, {
          type: 'geojson',
          data: featureCollection
        });
      } else {
        mapRef.current.getSource(sourceId).setData(featureCollection);
      }

      if (!mapRef.current.getLayer(routesLayerId)) {
        mapRef.current.addLayer({
          id: routesLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-width': 4,
            'line-opacity': 0.7,
            'line-color': [
              'case',
              ['>=', ['get', 'safetyScore'], 75],
              '#6fcf97',
              ['>=', ['get', 'safetyScore'], 55],
              '#f2c94c',
              '#eb5757'
            ]
          }
        });
      }

      if (!mapRef.current.getLayer(selectedLayerId)) {
        mapRef.current.addLayer({
          id: selectedLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-width': 7,
            'line-color': '#2d9cdb',
            'line-opacity': 0.95
          },
          filter: ['==', ['get', 'id'], selectedRouteId || '']
        });
      } else {
        mapRef.current.setFilter(selectedLayerId, ['==', ['get', 'id'], selectedRouteId || '']);
      }
    };

    if (mapRef.current.isStyleLoaded()) {
      drawRoutes();
    } else {
      mapRef.current.once('load', drawRoutes);
    }
  }, [routes, selectedRouteId]);

  useEffect(() => {
    if (!destination || !userLocation) {
      return;
    }

    loadSafetyContext(userLocation, destination);
  }, [destination, country, city, emergencyMode]);

  return (
    <div className="safety-page-root">
      <div ref={mapContainerRef} className="safety-map-canvas" />

      <div className="safety-top-bar">
        <div className="safety-top-title">
          Smart Tourist Safety and Emergency Navigation
        </div>
        <div className="safety-top-actions">
          <button className="safety-btn" onClick={navigateBackToHeritage}>
            Back to Heritage Map
          </button>
          <button className="safety-btn primary" onClick={locateUserAndSetState} disabled={isLocating}>
            {isLocating ? 'Locating...' : 'Locate Me'}
          </button>
        </div>
      </div>

      <div className="safety-left-panel">
        <div className="safety-section">
          <div className="safety-section-title">Destination</div>
          <input
            value={searchQuery}
            placeholder="Search heritage destination"
            className="safety-input"
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />

          {showSuggestions && filteredSites.length > 0 && (
            <div className="safety-suggestions">
              {filteredSites.map((site) => (
                <button
                  key={site.id || site.name}
                  className="safety-suggestion-item"
                  onClick={() => selectDestination(site)}
                >
                  <div className="safety-suggestion-name">{site.name}</div>
                  <div className="safety-suggestion-meta">
                    {site.city || 'Unknown city'}, {site.country || 'Unknown country'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {destination && (
            <div className="safety-chip-row">
              <span className="safety-chip active">{destination.name}</span>
            </div>
          )}
        </div>

        <div className="safety-section">
          <div className="safety-section-title">Route Strategy</div>
          <div className="safety-inline-controls">
            <select
              className="safety-select"
              value={routePreference}
              onChange={(event) => setRoutePreference(event.target.value)}
            >
              <option value="safest">Safest</option>
              <option value="fastest">Fastest</option>
              <option value="shortest">Shortest</option>
            </select>

            <button
              className="safety-btn primary"
              onClick={handleGenerateRoutesClick}
              disabled={isGeneratingRoutes}
            >
              {isGeneratingRoutes ? 'Planning...' : 'Generate Routes'}
            </button>
          </div>

          <div className="safety-toggle-row">
            <button
              className={`safety-btn ${emergencyMode ? 'danger' : ''}`}
              onClick={handleEmergencyToggle}
            >
              {emergencyMode ? 'Emergency Mode ON' : 'Enable Emergency Mode'}
            </button>
            <button className="safety-btn warning" onClick={handleEvacuationMode}>
              Start Evacuation Mode
            </button>
          </div>

          <div className="safety-route-list">
            {routes.length === 0 && (
              <div className="safety-muted-block">
                Routes will appear here after destination and location are set.
              </div>
            )}

            {routes.map((route) => (
              <div
                key={route.id}
                className={`safety-route-card ${selectedRouteId === route.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedRouteId(route.id);
                  fitRouteOnMap(route);
                }}
              >
                <div className="safety-route-head">
                  <div className="safety-route-title">{route.summary || route.id}</div>
                  <div className="safety-route-score">Safety {route.safetyScore}/100</div>
                </div>
                <div className="safety-route-meta">
                  <span>{route.distanceKm} km</span>
                  <span>{route.durationMin} min</span>
                  <span>Composite {route.compositeScore}</span>
                </div>
                <div className="safety-chip-row">
                  {(route.badges || []).map((badge) => (
                    <span key={`${route.id}-${badge}`} className="safety-chip">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="safety-section">
          <div className="safety-section-title">Live Navigation</div>
          <div className="safety-inline-controls">
            <button className="safety-btn primary" onClick={startLiveNavigation} disabled={isNavigating}>
              Start Navigation
            </button>
            <button
              className="safety-btn"
              onClick={() => {
                stopLiveNavigation();
                setNavigationStatus('Navigation stopped.');
              }}
              disabled={!isNavigating}
            >
              Stop Navigation
            </button>
          </div>
          <div className="safety-status">{navigationStatus}</div>
          <div className="safety-status">Auto re-routes triggered: {rerouteCount}</div>
        </div>
      </div>

      <div className="safety-right-panel">
        <div className="safety-section">
          <div className="safety-section-title">Nearby Safe Places</div>
          {safePlaces.length === 0 && (
            <div className="safety-muted-block">
              Safe places will load once your location is available.
            </div>
          )}
          {safePlaces.slice(0, 6).map((place) => (
            <button
              key={place.id || `${place.name}-${place.distanceMeters}`}
              className="safety-place-item"
              onClick={() => {
                if (mapRef.current && Array.isArray(place.coordinates)) {
                  mapRef.current.flyTo({ center: place.coordinates, zoom: 14, duration: 900 });
                }
              }}
            >
              <div className="safety-place-name">{place.name || 'Unnamed place'}</div>
              <div className="safety-place-meta">
                {place.type || 'support'} | {formatDistanceMeters(place.distanceMeters)}
              </div>
            </button>
          ))}
        </div>

        <div className="safety-section">
          <div className="safety-section-title">Weather and Alerts</div>
          {alertsLoading ? (
            <div className="safety-muted-block">Refreshing weather and alerts...</div>
          ) : (
            <>
              <div className="safety-alert-headline">{alertsData.safetyHeadline}</div>
              <div className="safety-weather-summary">{weatherSummaryString(weather)}</div>
              {alertsData.alerts.length === 0 ? (
                <div className="safety-muted-block">No high-priority local alerts right now.</div>
              ) : (
                alertsData.alerts.slice(0, 4).map((alert, index) => (
                  <div key={`${alert.url || alert.title}-${index}`} className="safety-alert-item">
                    <div className="safety-alert-title">{alert.title}</div>
                    <div className="safety-alert-meta">
                      {alert.severity || 'medium'} | {alert.source || 'local feed'}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <div className="safety-section">
          <div className="safety-section-title">Emergency Contacts</div>
          <div className="safety-inline-controls">
            <select className="safety-select" value={country} onChange={(e) => setCountry(e.target.value)}>
              {emergencyLocations.map((entry) => (
                <option key={entry.country} value={entry.country}>
                  {entry.country}
                </option>
              ))}
            </select>
            <select className="safety-select" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {cityOptions.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="safety-contact-list">
            {contacts.map((contact, index) => (
              <a
                key={`${contact.label}-${contact.number}-${index}`}
                className="safety-contact-item"
                href={getEmergencyTelHref(contact.number)}
              >
                <span>{contact.label}</span>
                <strong>{contact.number}</strong>
              </a>
            ))}
          </div>

          <div className="safety-inline-controls">
            <input
              className="safety-input"
              placeholder="Custom contact label"
              value={customContact.label}
              onChange={(e) => setCustomContact((prev) => ({ ...prev, label: e.target.value }))}
            />
            <input
              className="safety-input"
              placeholder="Custom contact number"
              value={customContact.number}
              onChange={(e) => setCustomContact((prev) => ({ ...prev, number: e.target.value }))}
            />
            <button className="safety-btn" onClick={handleAddCustomContact}>
              Add
            </button>
          </div>
        </div>

        <div className="safety-section">
          <div className="safety-section-title">AI Safety Guidance</div>
          <textarea
            value={aiQuestion}
            onChange={(event) => setAiQuestion(event.target.value)}
            className="safety-textarea"
            placeholder="Ask for guidance like: Is this route safe at night?"
          />
          <button className="safety-btn primary" onClick={requestSafetyTip} disabled={aiLoading}>
            {aiLoading ? 'Thinking...' : 'Get Safety Advice'}
          </button>
          {aiTip && <div className="safety-ai-output">{aiTip}</div>}
        </div>
      </div>

      {error && (
        <div className="safety-error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

    </div>
  );
};

export default SafetyNavigationPage;
