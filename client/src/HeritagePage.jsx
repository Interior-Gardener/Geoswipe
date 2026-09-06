import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './assets/map-icon-outlines.css';
import './styles/heritage-theme.css';
import './styles/heritage-map.css';
import './styles/heritage-panels.css';
import HeritageQuiz from './HeritageQuiz';
import HeritageChatbot from './components/HeritageChatbot';
import TripPlannerModal from './components/tripPlanner/TripPlannerModal';
import { fetchWeatherData, getWeatherIconUrl, formatWeatherDate } from './utils/openWeatherService';
import { fetchHeritageNews } from './utils/newsService';
import { primeMonumentImageCache } from './utils/heritageImageService';
import { useTheme } from './context/ThemeContext';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import { usePanelFullscreen } from './hooks/usePanelFullscreen';
import {
  buildHeritageRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';
import { API_BASE_URL } from './utils/apiConfig';

// Map tiles are proxied by the server so the MapTiler key never reaches the
// browser. See server/routes/mapProxy.js.
const MAP_STYLE_BASE = `${API_BASE_URL}/api/maps/style`;
const MAP_ASSET_BASE = `${API_BASE_URL}/api/maps/asset`;

const HeritagePage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapReadyRef = useRef(false);
  const restoreAppliedRef = useRef(false);
  const sidebarPanelRef = useRef(null);
  const weatherModalCardRef = useRef(null);
  const newsModalCardRef = useRef(null);
  
  // Add scrollbar styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .sidebar-scroll::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 3px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Check if a storybook JSON exists for a site
  const checkStoryBookAvailable = async (siteName) => {
    const formattedName = siteName.toLowerCase().replace(/\s+/g, '-');
    const tryPaths = [
      `/chapters/${siteName}.json`,
      `/chapters/${formattedName}.json`
    ];
    
    for (const path of tryPaths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          return true;
        }
      } catch (_e) {
        // continue checking next path
      }
    }
    return false;
  };
  
  // Sidebar state
  const [sidebarData, setSidebarData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  
  // Street View Modal state
  const [streetViewModalOpen, setStreetViewModalOpen] = useState(false);
  const [streetViewData, setStreetViewData] = useState(null);
  
  // Heritage Info Modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [tripPlannerModalOpen, setTripPlannerModalOpen] = useState(false);
  
  // Weather Modal state
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  
  // News Modal state
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [newsData, setNewsData] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [newsTab, setNewsTab] = useState('monument'); // 'monument' or 'location'
  
  // Search functionality state
  // --- Map chrome ---------------------------------------------------
  // The map controls used to be seven separate always-on panels pinned to
  // every corner. They are now driven from one dock: the search panel
  // collapses, and info/legend are mutually exclusive popovers.
  const [searchOpen, setSearchOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth > 820
  );
  const [openPanel, setOpenPanel] = useState(null); // 'info' | 'legend' | null

  const togglePanel = useCallback((panel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  }, []);

  const [searchMode, setSearchMode] = useState('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // API data state
  const [heritageSites, setHeritageSites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Site counters shown in the info panel. Derived from state so they are
  // correct whenever the panel is opened, rather than written into DOM nodes
  // that only exist while the panel happens to be open.
  const siteCounts = useMemo(() => {
    const features = heritageSites?.features;
    if (!Array.isArray(features)) return { total: 0, unesco: 0 };
    return {
      total: features.length,
      unesco: features.filter(
        (f) => f?.properties?.category === 'UNESCO World Heritage'
      ).length
    };
  }, [heritageSites]);
  
  // Map style management
  const [currentMapStyle, setCurrentMapStyle] = useState('hybrid');
  const [mapStyleLoading, setMapStyleLoading] = useState(false);
  const [chatbotPulse, setChatbotPulse] = useState(false);
  const { theme } = useTheme();
  const { isExpanded: sidebarExpanded, togglePanelFullscreen: toggleSidebarFullscreen } =
    usePanelFullscreen(sidebarPanelRef);

  // Any open dialog should own the screen. HeritagePage renders inside a
  // position:fixed root, which always creates a stacking context in Blink, so
  // its modals can never out-stack the global nav by z-index alone. Flag the
  // state on <body> instead and let CSS take the nav out of the way.
  const anyOverlayOpen =
    streetViewModalOpen ||
    infoModalOpen ||
    directionsModalOpen ||
    quizModalOpen ||
    tripPlannerModalOpen ||
    weatherModalOpen ||
    newsModalOpen;

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.body.classList.toggle('gs-overlay-open', Boolean(anyOverlayOpen));
    return () => document.body.classList.remove('gs-overlay-open');
  }, [anyOverlayOpen]);

  // Signal sidebar state to the document so the global nav and map dock can
  // move clear of the right-hand panel instead of being covered by it.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const { classList } = document.body;
    classList.toggle('h-sidebar-open', Boolean(sidebarOpen && sidebarData));
    classList.toggle('h-sidebar-expanded', Boolean(sidebarExpanded));
    return () => {
      classList.remove('h-sidebar-open', 'h-sidebar-expanded');
    };
  }, [sidebarOpen, sidebarData, sidebarExpanded]);
  const { isExpanded: weatherExpanded, togglePanelFullscreen: toggleWeatherFullscreen } =
    usePanelFullscreen(weatherModalCardRef);
  const { isExpanded: newsExpanded, togglePanelFullscreen: toggleNewsFullscreen } =
    usePanelFullscreen(newsModalCardRef);
  
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedMonument,
    setSelectedMonument,
    hydrateSelectionFromRoute
  } = useHeritageSelection();

  const toSafetySiteState = useCallback((source) => {
    const normalized = normalizeMonumentSelection(source);
    if (!normalized) {
      return undefined;
    }

    return {
      site: {
        name: normalized.name,
        coordinates: normalized.coordinates,
        city: normalized.location?.city || '',
        state: normalized.location?.state || '',
        country: normalized.location?.country || 'India'
      }
    };
  }, []);

  const navigateWithSelection = useCallback(
    (path, extraState = {}) => {
      const state = buildHeritageRouteState(sidebarData || selectedMonument, extraState);
      if (state) {
        navigate(path, { state });
      } else {
        navigate(path);
      }
    },
    [navigate, selectedMonument, sidebarData]
  );

  useEffect(() => {
    const routeSelection = hydrateSelectionFromRoute(location.state);
    if (routeSelection) {
      restoreAppliedRef.current = false;
    }
  }, [location.state, hydrateSelectionFromRoute]);

  // Map style switching function
  const switchMapStyle = async (styleName, zoomLevel = 14, siteCoordinates = null) => {
    if (!map.current || mapStyleLoading) return;
    
    console.log(`🔄 Switching to ${styleName} map style...`);
    setMapStyleLoading(true);
    
    let timeoutId = null;
    let styleLoadCompleted = false;
    
    try {
      // SECURITY: style URLs used to embed VITE_MAPTILER_API_KEY, exposing the
      // key to every visitor. They now point at the server, which attaches the
      // key and rewrites the tile/sprite/glyph URLs inside the style document.
      const styleUrls = {
        satellite: `${MAP_STYLE_BASE}/satellite`,
        hybrid: `${MAP_STYLE_BASE}/hybrid`,
        topo: `${MAP_STYLE_BASE}/topo`,
        streets: `${MAP_STYLE_BASE}/streets`,
        historical: `${MAP_STYLE_BASE}/historical`
      };
      
      if (!styleUrls[styleName]) {
        console.error('Unknown map style:', styleName);
        setMapStyleLoading(false);
        return;
      }
      
      // Store current heritage sites data
      const currentHeritageSites = heritageSites;
      
      // Handle style load completion
      const onStyleLoad = () => {
        if (styleLoadCompleted) return; // Prevent multiple executions
        styleLoadCompleted = true;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        try {
          // Re-add terrain if not satellite or historical
          if (styleName !== 'satellite' && styleName !== 'historical') {
            try {
              if (!map.current.getSource('maptiler-terrain')) {
                map.current.addSource('maptiler-terrain', {
                  type: 'raster-dem',
                  url: `${MAP_ASSET_BASE}/tiles/terrain-rgb-v2/tiles.json`,
                  tileSize: 256
                });
                map.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 });
              }
            } catch (terrainError) {
              console.warn('Could not add terrain:', terrainError);
              // Continue without terrain
            }
          }
          
            // Re-add heritage sites
          if (currentHeritageSites) {
            try {
              // Remove existing sources and layers if they exist
              if (map.current.getLayer('heritage-sites-layer')) {
                map.current.removeLayer('heritage-sites-layer');
              }
              if (map.current.getLayer('heritage-sites-circles')) {
                map.current.removeLayer('heritage-sites-circles');
              }
              if (map.current.getLayer('heritage-sites-icons')) {
                map.current.removeLayer('heritage-sites-icons');
              }
              if (map.current.getSource('heritage-sites-source')) {
                map.current.removeSource('heritage-sites-source');
              }
              
              // Add heritage sites source
              map.current.addSource('heritage-sites-source', {
                type: 'geojson',
                data: currentHeritageSites
              });
              
              // Add circle markers first (as fallback)
              map.current.addLayer({
                'id': 'heritage-sites-circles',
                'type': 'circle',
                'source': 'heritage-sites-source',
                'paint': {
                  'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    6, 6,
                    10, 10,
                    14, 18
                  ],
                  'circle-color': [
                    'case',
                    ['==', ['get', 'category'], 'UNESCO World Heritage'], '#ff6b6b',
                    ['==', ['get', 'category'], 'Historic Fort'], '#4ecdc4',
                    ['==', ['get', 'category'], 'Rock-cut Cave'], '#45b7d1',
                    ['==', ['get', 'category'], 'Temple'], '#f9ca24',
                    ['==', ['get', 'category'], 'Monument'], '#6c5ce7',
                    ['==', ['get', 'category'], 'Palace'], '#a29bfe',
                    ['==', ['get', 'category'], 'Museum'], '#a29bfe',
                    ['==', ['get', 'category'], 'Historic Building'], '#fd79a8',
                    '#74b9ff'
                  ],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                  'circle-opacity': 0.8
                }
              });

              // Re-load and add heritage site icons
              const loadIconForStyleSwitch = (category, fileName, iconId) => {
                return new Promise((resolve) => {
                  // Skip if icon already exists
                  if (map.current.hasImage(iconId)) {
                    resolve(true);
                    return;
                  }

                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  
                  img.onload = () => {
                    try {
                      // Create canvas with extra space for white outline
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const baseSize = 28;
                      const padding = 4;
                      const totalSize = baseSize + (padding * 2);
                      
                      canvas.width = totalSize;
                      canvas.height = totalSize;
                      ctx.clearRect(0, 0, totalSize, totalSize);
                      
                      // Create white outline
                      const outlineWidth = 2;
                      ctx.globalCompositeOperation = 'source-over';
                      
                      for (let x = -outlineWidth; x <= outlineWidth; x++) {
                        for (let y = -outlineWidth; y <= outlineWidth; y++) {
                          if (x !== 0 || y !== 0) {
                            ctx.save();
                            ctx.globalAlpha = 0.8;
                            ctx.filter = 'brightness(0) invert(1)';
                            ctx.drawImage(img, padding + x, padding + y, baseSize, baseSize);
                            ctx.restore();
                          }
                        }
                      }
                      
                      // Draw the main icon on top
                      ctx.save();
                      ctx.globalCompositeOperation = 'source-over';
                      ctx.filter = 'contrast(1.1) brightness(1.05)';
                      ctx.drawImage(img, padding, padding, baseSize, baseSize);
                      ctx.restore();
                      
                      const imageData = ctx.getImageData(0, 0, totalSize, totalSize);
                      const mapImage = {
                        width: totalSize,
                        height: totalSize,
                        data: imageData.data
                      };
                      
                      map.current.addImage(iconId, mapImage);
                      console.log(`✅ Re-added icon for style switch: ${category}`);
                      resolve(true);
                    } catch (error) {
                      console.warn(`⚠️ Error re-adding icon ${category}:`, error);
                      resolve(false);
                    }
                  };
                  
                  img.onerror = () => resolve(false);
                  img.src = `/assets/${fileName}`;
                });
              };

              // Load all icons for the new style
              Promise.all([
                loadIconForStyleSwitch('UNESCO World Heritage', 'UNESCO World Heritage.png', 'unesco-icon'),
                loadIconForStyleSwitch('Historic Fort', 'Historic Forts.png', 'fort-icon'),
                loadIconForStyleSwitch('Rock-cut Cave', 'Rock-cut Caves.png', 'cave-icon'),
                loadIconForStyleSwitch('Temple', 'Temples.png', 'temple-icon'),
                loadIconForStyleSwitch('Monument', 'Monuments.png', 'monument-icon'),
                loadIconForStyleSwitch('Palace', 'Palaces & Museums.png', 'palace-icon'),
                loadIconForStyleSwitch('Historic Building', 'Historic Buildings.png', 'building-icon')
              ]).then((results) => {
                const loaded = results.filter(Boolean).length;
                console.log(`🔄 Re-loaded ${loaded}/7 icons for ${styleName} style`);
                
                // Add icons layer if any icons were loaded
                if (loaded > 0) {
                  map.current.addLayer({
                    'id': 'heritage-sites-icons',
                    'type': 'symbol',
                    'source': 'heritage-sites-source',
                    'layout': {
                      'icon-image': [
                        'case',
                        ['==', ['get', 'category'], 'UNESCO World Heritage'], 'unesco-icon',
                        ['==', ['get', 'category'], 'Historic Fort'], 'fort-icon',
                        ['==', ['get', 'category'], 'Rock-cut Cave'], 'cave-icon',
                        ['==', ['get', 'category'], 'Temple'], 'temple-icon',
                        ['==', ['get', 'category'], 'Monument'], 'monument-icon',
                        ['==', ['get', 'category'], 'Palace'], 'palace-icon',
                        ['==', ['get', 'category'], 'Museum'], 'palace-icon',
                        ['==', ['get', 'category'], 'Historic Building'], 'building-icon',
                        'monument-icon'
                      ],
                      'icon-size': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 0.6,
                        10, 0.8,
                        14, 1.0,
                        16, 1.2
                      ],
                      'icon-allow-overlap': true
                    }
                  });
                  
                  // Hide circles since we have icons
                  map.current.setLayoutProperty('heritage-sites-circles', 'visibility', 'none');
                  console.log(`🎯 Icons displayed in ${styleName} map style`);
                } else {
                  console.log(`⚠️ No icons loaded, showing circles in ${styleName} style`);
                }
              }).catch((error) => {
                console.error('Error loading icons for style switch:', error);
              });
              
              // Add text labels
              map.current.addLayer({
                'id': 'heritage-sites-layer',
                'type': 'symbol',
                'source': 'heritage-sites-source',
                'layout': {
                  'text-field': ['get', 'name'],
                  'text-anchor': 'top',
                  'text-offset': [0, 1.5],
                  'text-size': [
                    'interpolate', ['linear'], ['zoom'],
                    6, 10,
                    10, 12,
                    14, 16
                  ],
                  'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                  'text-max-width': 10,
                  'text-line-height': 1.2
                },
                'paint': {
                  'text-color': '#ffffff',
                  'text-halo-color': '#000000',
                  'text-halo-width': 2
                }
              });
              
              // Re-attach event listeners
              const handleSiteClick = async (e) => {
                const properties = e.features[0].properties;
                const coordinates = e.features[0].geometry.coordinates?.slice?.() || e.features[0].geometry.coordinates;
                await openSiteInSidebar(
                  {
                    name: properties.name,
                    category: properties.category,
                    year: properties.year,
                    coordinates
                  },
                  { flyTo: false }
                );
              };
              
              const handleMouseEnter = () => {
                map.current.getCanvas().style.cursor = 'pointer';
              };
              
              const handleMouseLeave = () => {
                map.current.getCanvas().style.cursor = '';
              };
              
              map.current.on('click', 'heritage-sites-icons', handleSiteClick);
              map.current.on('click', 'heritage-sites-circles', handleSiteClick);
              map.current.on('mouseenter', 'heritage-sites-icons', handleMouseEnter);
              map.current.on('mouseenter', 'heritage-sites-circles', handleMouseEnter);
              map.current.on('mouseleave', 'heritage-sites-icons', handleMouseLeave);
              map.current.on('mouseleave', 'heritage-sites-circles', handleMouseLeave);
            } catch (sitesError) {
              console.error('Error re-adding heritage sites:', sitesError);
              // Continue without heritage sites
            }
          }
          
          // Fly to site if coordinates provided
          if (siteCoordinates) {
            setTimeout(() => {
              if (map.current) {
                map.current.flyTo({
                  center: siteCoordinates,
                  zoom: zoomLevel,
                  pitch: styleName === 'satellite' || styleName === 'topo' ? 0 : 45,
                  bearing: 0,
                  duration: 2000,
                  essential: true
                });
              }
            }, 500);
          }
          
          setCurrentMapStyle(styleName);
          setMapStyleLoading(false);
          console.log(`✅ Map style switched to: ${styleName}`);
        } catch (error) {
          console.error('Error in style load handler:', error);
          setMapStyleLoading(false);
        }
      };
      
      // Set up style load listener
      map.current.once('style.load', onStyleLoad);
      
      // Switch map style
      map.current.setStyle(styleUrls[styleName]);
      
      // Fallback timeout with proper cleanup
      timeoutId = setTimeout(() => {
        if (!styleLoadCompleted) {
          console.warn(`⏰ Style load timeout for ${styleName}, forcing completion`);
          onStyleLoad();
        }
      }, 8000);
      
    } catch (error) {
      console.error('Error switching map style:', error);
      setMapStyleLoading(false);
      
      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Only fallback to hybrid if we're not already trying hybrid and this isn't a repeated failure
      if (styleName !== 'hybrid' && !error.isRecursive) {
        console.log('⚡ Falling back to hybrid map style');
        setTimeout(() => {
          const fallbackError = new Error('Fallback to hybrid after error');
          fallbackError.isRecursive = true;
          switchMapStyle('hybrid').catch(() => {
            console.error('Fallback to hybrid also failed');
            setMapStyleLoading(false);
          });
        }, 1000);
      }
    }
  };

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setInfoModalOpen(false);
        setDirectionsModalOpen(false);
        setStreetViewModalOpen(false);
        setWeatherModalOpen(false);
        setNewsModalOpen(false);
        setTripPlannerModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch heritage sites data from MongoDB on component mount
  useEffect(() => {
    const fetchHeritageSites = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/heritage-sites/geojson');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setHeritageSites(data);
        console.log('✅ Heritage sites loaded from database:', data.features.length, 'sites');
      } catch (err) {
        setError(err.message);
        console.error('❌ Error fetching heritage sites:', err);
        
        // Fallback to empty data structure
        setHeritageSites({
          type: 'FeatureCollection',
          features: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeritageSites();
  }, []);

  // Search functionality
  const filterPlaces = (query) => {
    if (!query.trim() || !heritageSites?.features) return [];
    
    const filtered = heritageSites.features
      .filter(site => 
        site.properties.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(site => ({
        name: site.properties.name,
        category: site.properties.category,
        coordinates: site.geometry.coordinates
    }));
    
    return filtered;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHighlightedIndex(-1);
    
    if (query.trim()) {
      const filtered = filterPlaces(query);
      setFilteredPlaces(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredPlaces([]);
      setShowDropdown(false);
    }
  };

  // Handle place selection from dropdown
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setSearchQuery(place.name);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  // Scroll to highlighted item in dropdown
  const scrollToHighlightedItem = (index) => {
    const dropdownElement = document.querySelector('.dropdown-container');
    const highlightedElement = document.querySelector(`[data-dropdown-index="${index}"]`);
    
    if (dropdownElement && highlightedElement) {
      const dropdownRect = dropdownElement.getBoundingClientRect();
      const highlightedRect = highlightedElement.getBoundingClientRect();
      
      // Calculate if the item is outside the visible area
      const isAbove = highlightedRect.top < dropdownRect.top;
      const isBelow = highlightedRect.bottom > dropdownRect.bottom;
      
      if (isAbove || isBelow) {
        highlightedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  };

  // Handle keyboard navigation and enter key
  const handleKeyDown = (e) => {
    if (!showDropdown) {
      // If dropdown is closed and Enter is pressed, trigger fly-to
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFlyTo(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => {
          const newIndex = prev < filteredPlaces.length - 1 ? prev + 1 : 0;
          // Scroll the highlighted item into view
          setTimeout(() => scrollToHighlightedItem(newIndex), 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredPlaces.length - 1;
          // Scroll the highlighted item into view
          setTimeout(() => scrollToHighlightedItem(newIndex), 0);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredPlaces.length) {
          const selectedPlace = filteredPlaces[highlightedIndex];
          handlePlaceSelect(selectedPlace);
          // After selection, trigger fly-to with a slight delay to ensure state updates
          setTimeout(() => handleFlyTo(e), 50);
        } else if (filteredPlaces.length > 0) {
          // If no item is highlighted, select the first one
          const firstPlace = filteredPlaces[0];
          handlePlaceSelect(firstPlace);
          setTimeout(() => handleFlyTo(e), 50);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const flyToBox = document.querySelector('.fly-to-box');
      if (flyToBox && !flyToBox.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  // Clear search when switching modes
  useEffect(() => {
    setSearchQuery('');
    setSelectedPlace(null);
    setShowDropdown(false);
    setFilteredPlaces([]);
    setHighlightedIndex(-1);
  }, [searchMode]);

  // Enhanced Fly-to functionality with coordinate and place search support
  const handleFlyTo = (e) => {
    e.preventDefault();
    console.log('Fly-to button clicked, mode:', searchMode);
    
    let lat, lon;
    
    if (searchMode === 'coordinates') {
      const latInput = document.getElementById('lat-input');
      const lonInput = document.getElementById('lon-input');
      
      if (!latInput || !lonInput) {
        alert('Coordinate input fields not found');
        return;
      }
      
      const latValue = latInput.value.trim();
      const lonValue = lonInput.value.trim();
      
      if (!latValue || !lonValue) {
        alert('Please enter both latitude and longitude coordinates');
        return;
      }
      
      lat = parseFloat(latValue);
      lon = parseFloat(lonValue);
      
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        alert('Please enter valid coordinates (Lat: -90 to 90, Lon: -180 to 180)');
        return;
      }
    } else if (searchMode === 'places') {
      if (selectedPlace) {
        [lon, lat] = selectedPlace.coordinates;
        console.log('Using selected place:', selectedPlace.name, 'at', lat, lon);
      } else if (searchQuery.trim()) {
        const matchedPlaces = filterPlaces(searchQuery);
        if (matchedPlaces.length > 0) {
          // Check if there's a highlighted item in dropdown
          let placeToUse;
          if (highlightedIndex >= 0 && highlightedIndex < filteredPlaces.length) {
            placeToUse = filteredPlaces[highlightedIndex];
            console.log('Using highlighted place:', placeToUse.name, 'at index', highlightedIndex);
          } else {
            placeToUse = matchedPlaces[0];
            console.log('Using first match:', placeToUse.name);
          }
          
          [lon, lat] = placeToUse.coordinates;
          setSelectedPlace(placeToUse);
          setSearchQuery(placeToUse.name);
        } else {
          alert('No heritage site found matching your search. Please select from the dropdown or try a different search term.');
          return;
        }
      } else {
        alert('Please search for and select a heritage site');
        return;
      }
    }
    
    console.log('Flying to coordinates:', lat, lon);
    
    const executeflyTo = () => {
      try {
        map.current.flyTo({ 
          center: [lon, lat], 
          zoom: 14, 
          pitch: 60,
          bearing: -15,
          essential: true,
          duration: 3000
        });
        console.log('FlyTo command executed successfully');
        
        if (searchMode === 'places') {
          setShowDropdown(false);
        }
      } catch (error) {
        console.error('Error during flyTo:', error);
        alert('Error flying to location. Please try again.');
      }
    };
    
    if (map.current && map.current.isStyleLoaded()) {
      executeflyTo();
    } else if (map.current) {
      console.log('Map not fully loaded, waiting...');
      map.current.once('idle', executeflyTo);
    } else {
      console.error('Map not initialized');
      alert('Map is not ready. Please wait and try again.');
    }
  };

  // Fetch detailed heritage site data from MongoDB
  const fetchDetails = async (siteName) => {
    try {
      console.log('🔍 Fetching details for:', siteName);
      const response = await fetch(`http://localhost:3000/api/heritage-sites/${encodeURIComponent(siteName)}/details`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ Site not found in database:', siteName);
          return {
            info: {
              summary: siteName + ' - No detailed info available.',
              full: siteName + ' - No detailed info in database.'
            }
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Site details loaded from database:', data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching site details:', err);
      // Fallback for sites not in database
      return {
        info: {
          summary: siteName + ' - No detailed info available.',
          full: siteName + ' - No detailed info in database.'
        }
      };
    }
  };

  const openSiteInSidebar = useCallback(
    async (siteSeed, options = {}) => {
      if (!siteSeed?.name) {
        return;
      }

      restoreAppliedRef.current = true;

      const shouldFly = options.flyTo !== false;
      setSidebarOpen(true);
      setSidebarLoading(true);

      const seedCoordinates = siteSeed.coordinates || siteSeed.location?.coordinates || null;
      setSidebarData({
        name: siteSeed.name,
        category: siteSeed.category || 'Heritage Site',
        year: siteSeed.year || 'Unknown',
        coordinates: seedCoordinates,
        location: {
          city: siteSeed.location?.city || '',
          state: siteSeed.location?.state || '',
          country: siteSeed.location?.country || 'India',
          coordinates: seedCoordinates
        }
      });

      try {
        const details = await fetchDetails(siteSeed.name);
        const resolvedCoordinates =
          siteSeed.coordinates ||
          siteSeed.location?.coordinates ||
          details.location?.coordinates ||
          null;

        const merged = {
          name: siteSeed.name,
          category: siteSeed.category || details.category || 'Heritage Site',
          year: siteSeed.year || details.year || 'Unknown',
          coordinates: resolvedCoordinates,
          ...details
        };

        const mergedLocation = {
          city: details.location?.city || siteSeed.location?.city || '',
          state: details.location?.state || siteSeed.location?.state || '',
          country: details.location?.country || siteSeed.location?.country || 'India',
          coordinates: details.location?.coordinates || resolvedCoordinates
        };

        merged.location = mergedLocation;
        setSidebarData(merged);
        setSelectedMonument(merged);

        if (merged?.monumentImage?.imageUrl) {
          primeMonumentImageCache(merged.name, merged.monumentImage);
        }

        if (shouldFly && merged.coordinates && map.current) {
          map.current.flyTo({
            center: merged.coordinates,
            zoom: Math.max(13, map.current.getZoom()),
            pitch: map.current.getPitch() || 45,
            bearing: map.current.getBearing() || 0,
            duration: 900,
            essential: true
          });
        }
      } finally {
        setSidebarLoading(false);
      }
    },
    [setSelectedMonument]
  );

  const restoreSelectedMonument = useCallback(async () => {
    if (restoreAppliedRef.current) {
      return;
    }

    if (!selectedMonument?.name || !mapReadyRef.current || loading || !heritageSites?.features) {
      return;
    }

    restoreAppliedRef.current = true;
    await openSiteInSidebar(selectedMonument, { flyTo: true });
  }, [heritageSites, loading, openSiteInSidebar, selectedMonument]);

  useEffect(() => {
    restoreSelectedMonument();
  }, [restoreSelectedMonument]);

  // Weather handler function
  const handleWeatherClick = async () => {
    if (!sidebarData?.coordinates) {
      console.error('No coordinates available for weather');
      return;
    }
    
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      const [longitude, latitude] = sidebarData.coordinates;
      console.log(`🌤️ Fetching weather for ${sidebarData.name} at [${latitude}, ${longitude}]`);
      
      const data = await fetchWeatherData(latitude, longitude);
      setWeatherData(data);
      setWeatherModalOpen(true);
      
      console.log('✅ Weather data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching weather:', error);
      setWeatherError(error.message || 'Failed to fetch weather data');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Retry weather fetch
  const retryWeather = () => {
    setWeatherError(null);
    handleWeatherClick();
  };

  // Handle News button click
  const handleNewsClick = async () => {
    if (!sidebarData || !sidebarData.name) {
      alert('No heritage site selected');
      return;
    }

    // If already loaded in this session, just open modal
    if (newsData && newsData.monument && newsData.monument.name === sidebarData.name) {
      setNewsModalOpen(true);
      return;
    }

    setNewsLoading(true);
    setNewsError(null);
    setNewsModalOpen(true);
    setNewsTab('monument'); // Reset to monument tab

    try {
      console.log(`📰 Fetching news for ${sidebarData.name}`);
      const data = await fetchHeritageNews(sidebarData.name);
      setNewsData(data);
      console.log('✅ News loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      setNewsError(error.message || 'Failed to fetch news');
    } finally {
      setNewsLoading(false);
    }
  };

  // Retry news fetch
  const retryNews = () => {
    setNewsError(null);
    setNewsData(null);
    handleNewsClick();
  };

  useEffect(() => {
    if (map.current) {
      console.log('Map already initialized, skipping...');
      return;
    }

    // The container only exists once the map view is rendered - while the
    // loading or error shell is showing, this ref is null. Attempting to
    // construct the map then threw "Invalid type: 'container'..." and left
    // map.current null, which the code below then dereferenced.
    if (!mapContainer.current) {
      return;
    }

    console.log('Initializing map...');
    




    // Update site counts

    // Initialize the map with timeout
    setTimeout(() => {
      try {
        console.log('Map container:', mapContainer.current);
        console.log('Creating MapLibre instance...');
        
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `${MAP_STYLE_BASE}/hybrid`,
          center: [75.5, 19.0],
          zoom: 6.5,
          pitch: 60,
          bearing: -15,
          antialias: true,
          scrollZoom: true,
          boxZoom: true,
          dragRotate: true,
          dragPan: true,
          keyboard: true,
          doubleClickZoom: true,
          touchZoomRotate: true
        });
        
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        console.log('Map initialized successfully');
        
        let retryCount = 0;
        const maxRetries = 3;
        
        map.current.on('error', (e) => {
          console.error('Map error:', e.error);
          if (retryCount < maxRetries) {
            console.log(`Retrying map initialization (${retryCount + 1}/${maxRetries})`);
            retryCount++;
            setTimeout(() => {
              if (map.current) {
                map.current.getSource('raster-tiles')?.reload?.();
              }
            }, 1000 * retryCount);
          }
        });
        
        map.current.on('sourcedataabort', () => {
          // Silently handle source data abort
        });
        
        map.current.on('styledata', () => {
          console.log('Map style loaded successfully');
        });
        
        map.current.on('sourcedata', (e) => {
          if (e.sourceId && e.isSourceLoaded) {
            console.log(`Source ${e.sourceId} loaded successfully`);
          }
        });
        
        map.current.on('styleimagemissing', (e) => {
          console.error('Map style image missing:', e);
        });
      
      } catch (error) {
        console.error('Error initializing map:', error);
      }

      // Construction can fail (bad style response, missing container). Without
      // this guard the next line threw "Cannot read properties of null".
      if (!map.current) {
        setError('The map could not be initialized. Please reload the page.');
        return;
      }

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        mapReadyRef.current = true;
        
        setTimeout(() => {
          console.log('Adding heritage sites to map...');
          
          try {
            // Add terrain and 3D effects
            if (!map.current.getSource('maptiler-terrain')) {
              map.current.addSource('maptiler-terrain', { 
                type: 'raster-dem', 
                url: `${MAP_ASSET_BASE}/tiles/terrain-rgb-v2/tiles.json`, 
                tileSize: 256 
              });
              map.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 });
              console.log('Terrain added successfully');
            }
          } catch (error) {
            console.error('Error adding terrain:', error);
          }
  
          try {
            console.log('Map sources available:', Object.keys(map.current.getStyle()?.sources || {}));

            // Load heritage site category icons - simplified approach
            const iconCategories = [
              { category: 'UNESCO World Heritage', file: 'UNESCO World Heritage.png', id: 'unesco-heritage' },
              { category: 'Historic Fort', file: 'Historic Forts.png', id: 'historic-fort' },
              { category: 'Rock-cut Cave', file: 'Rock-cut Caves.png', id: 'rock-cave' },
              { category: 'Temple', file: 'Temples.png', id: 'temple' },
              { category: 'Monument', file: 'Monuments.png', id: 'monument' },
              { category: 'Palace', file: 'Palaces & Museums.png', id: 'palace' },
              { category: 'Museum', file: 'Palaces & Museums.png', id: 'museum' },
              { category: 'Historic Building', file: 'Historic Buildings.png', id: 'historic-building' }
            ];

            // Create a simple fallback icon with proper size
            const createFallbackIcon = () => {
              const size = 24; // Smaller size to avoid issues
              const canvas = document.createElement('canvas');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              
              // Draw a simple circle icon
              ctx.fillStyle = '#ff6b6b';
              ctx.beginPath();
              ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
              ctx.fill();
              
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();
              
              return canvas;
            };

            // Add fallback icon with error handling
            try {
              if (!map.current.hasImage('fallback-icon')) {
                const fallbackCanvas = createFallbackIcon();
                map.current.addImage('fallback-icon', fallbackCanvas);
                console.log('✅ Added fallback icon');
              }
            } catch (error) {
              console.warn('⚠️ Failed to add fallback icon:', error);
            }

            // Function to resize image to appropriate size for map icons
            const resizeImage = (img, maxSize = 64) => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calculate new size maintaining aspect ratio
              let { width, height } = img;
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              // Draw resized image
              ctx.drawImage(img, 0, 0, width, height);
              return canvas;
            };

            // Load each icon image with resizing
            iconCategories.map(({ category, file, id }) => {
              return new Promise((resolve) => {
                const iconUrl = `/assets/${file}`;
                
                console.log(`🔄 Loading icon: ${iconUrl} as ID: ${id}`);
                
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                  try {
                    console.log(`📏 Original image size: ${img.width}x${img.height}`);
                    
                    // Resize the image to appropriate size
                    const resizedCanvas = resizeImage(img, 48); // 48px max size
                    console.log(`📏 Resized to: ${resizedCanvas.width}x${resizedCanvas.height}`);
                    
                    if (!map.current.hasImage(id)) {
                      map.current.addImage(id, resizedCanvas);
                      console.log(`✅ Successfully loaded and resized icon: ${category} -> ${id}`);
                    }
                    resolve(true);
                  } catch (error) {
                    console.warn(`❌ Failed to process icon for ${category}:`, error);
                    resolve(true); // Still resolve as we have fallback
                  }
                };
                
                img.onerror = (error) => {
                  console.warn(`❌ Failed to load image for ${category}:`, error);
                  resolve(true); // Still resolve as we have fallback
                };
                
                img.src = iconUrl;
              });
            });

            // Add heritage sites source first
            if (!map.current.getSource('heritage-sites-source')) {
              map.current.addSource('heritage-sites-source', { 
                'type': 'geojson', 
                'data': heritageSites || { type: 'FeatureCollection', features: [] }
              });
              console.log('✅ Heritage sites source added');
            } else {
              // Update existing source with new data
              map.current.getSource('heritage-sites-source').setData(heritageSites || { type: 'FeatureCollection', features: [] });
              console.log('✅ Heritage sites source updated');
            }
            console.log('🗺️ Heritage sites source data:', heritageSites);
            console.log('📍 Number of features:', heritageSites?.features?.length || 0);

            // First, let's add a simple circle layer that we know works
            if (!map.current.getLayer('heritage-sites-circles')) {
              map.current.addLayer({
                'id': 'heritage-sites-circles',
                'type': 'circle',
                'source': 'heritage-sites-source',
                'paint': {
                  'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    6, 6,
                    10, 10,
                    14, 18
                  ],
                  'circle-color': [
                    'case',
                    ['==', ['get', 'category'], 'UNESCO World Heritage'], '#ff6b6b',
                    ['==', ['get', 'category'], 'Historic Fort'], '#4ecdc4',
                    ['==', ['get', 'category'], 'Rock-cut Cave'], '#45b7d1',
                    ['==', ['get', 'category'], 'Temple'], '#f9ca24',
                    ['==', ['get', 'category'], 'Monument'], '#6c5ce7',
                    ['==', ['get', 'category'], 'Palace'], '#a29bfe',
                    ['==', ['get', 'category'], 'Museum'], '#a29bfe',
                    ['==', ['get', 'category'], 'Historic Building'], '#fd79a8',
                    '#74b9ff'
                  ],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                  'circle-opacity': 0.8
                }
              });
              console.log('✅ Heritage sites circle layer added');
            }

            // Load heritage site icons with proper fallback to circles
            console.log('🔄 Starting heritage site icon loading...');

            // Load icons immediately after basic setup
            setTimeout(() => {
              console.log('🔄 Starting safe icon loading...');
              
              const loadIconSafely = (category, fileName, iconId) => {
                return new Promise((resolve) => {
                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  
                  img.onload = () => {
                    try {
                      // Create canvas with extra space for white outline
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const baseSize = 28; // Actual icon size
                      const padding = 4; // Extra space for outline
                      const totalSize = baseSize + (padding * 2);
                      
                      canvas.width = totalSize;
                      canvas.height = totalSize;
                      
                      // Clear canvas
                      ctx.clearRect(0, 0, totalSize, totalSize);
                      
                      // Create white outline by drawing the image multiple times with offset
                      const outlineWidth = 2;
                      ctx.globalCompositeOperation = 'source-over';
                      
                      // Draw white outline (multiple passes for smooth effect)
                      for (let x = -outlineWidth; x <= outlineWidth; x++) {
                        for (let y = -outlineWidth; y <= outlineWidth; y++) {
                          if (x !== 0 || y !== 0) {
                            ctx.save();
                            ctx.globalAlpha = 0.8;
                            // Create white outline by converting image to white silhouette
                            ctx.filter = 'brightness(0) invert(1)';
                            ctx.drawImage(img, padding + x, padding + y, baseSize, baseSize);
                            ctx.restore();
                          }
                        }
                      }
                      
                      // Draw the main icon on top
                      ctx.save();
                      ctx.globalCompositeOperation = 'source-over';
                      ctx.filter = 'contrast(1.1) brightness(1.05)';
                      ctx.drawImage(img, padding, padding, baseSize, baseSize);
                      ctx.restore();
                      
                      // Create ImageData object (this is what MapLibre expects)
                      const imageData = ctx.getImageData(0, 0, totalSize, totalSize);
                      
                      // Create proper image object for MapLibre
                      const mapImage = {
                        width: totalSize,
                        height: totalSize,
                        data: imageData.data
                      };
                      
                      if (!map.current.hasImage(iconId)) {
                        map.current.addImage(iconId, mapImage);
                        console.log(`✅ Loaded with white outline: ${category} (${totalSize}x${totalSize})`);
                      }
                      resolve(true);
                    } catch (error) {
                      console.warn(`⚠️ Error processing ${category}:`, error);
                      resolve(false);
                    }
                  };
                  
                  img.onerror = () => resolve(false);
                  img.src = `/assets/${fileName}`;
                });
              };

              // Load icons and add layer
              Promise.all([
                loadIconSafely('UNESCO World Heritage', 'UNESCO World Heritage.png', 'unesco-icon'),
                loadIconSafely('Historic Fort', 'Historic Forts.png', 'fort-icon'),
                loadIconSafely('Rock-cut Cave', 'Rock-cut Caves.png', 'cave-icon'),
                loadIconSafely('Temple', 'Temples.png', 'temple-icon'),
                loadIconSafely('Monument', 'Monuments.png', 'monument-icon'),
                loadIconSafely('Palace', 'Palaces & Museums.png', 'palace-icon'),
                loadIconSafely('Historic Building', 'Historic Buildings.png', 'building-icon')
              ]).then((results) => {
                const loaded = results.filter(Boolean).length;
                console.log(`📊 Loaded ${loaded}/7 icons`);
                
                if (loaded > 0 && !map.current.getLayer('heritage-sites-icons')) {
                  map.current.addLayer({
                    'id': 'heritage-sites-icons',
                    'type': 'symbol',
                    'source': 'heritage-sites-source',
                    'layout': {
                      'icon-image': [
                        'case',
                        ['==', ['get', 'category'], 'UNESCO World Heritage'], 'unesco-icon',
                        ['==', ['get', 'category'], 'Historic Fort'], 'fort-icon',
                        ['==', ['get', 'category'], 'Rock-cut Cave'], 'cave-icon',
                        ['==', ['get', 'category'], 'Temple'], 'temple-icon',
                        ['==', ['get', 'category'], 'Monument'], 'monument-icon',
                        ['==', ['get', 'category'], 'Palace'], 'palace-icon',
                        ['==', ['get', 'category'], 'Museum'], 'palace-icon',
                        ['==', ['get', 'category'], 'Historic Building'], 'building-icon',
                        'monument-icon'
                      ],
                      'icon-size': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 0.6,  // Smaller at low zoom for better overview
                        10, 0.8, // Medium size for mid-zoom
                        14, 1.0, // Full size at high zoom
                        16, 1.2  // Slightly larger at maximum zoom
                      ],
                      'icon-allow-overlap': true
                    }
                  });
                  
                  // Hide circles now that we have icons
                  if (map.current.getLayer('heritage-sites-circles')) {
                    map.current.setLayoutProperty('heritage-sites-circles', 'visibility', 'none');
                  }
                  
                  // Ensure text labels are visible and properly positioned for icons
                  if (map.current.getLayer('heritage-sites-layer')) {
                    // Update text layer to work better with icons
                    map.current.setLayoutProperty('heritage-sites-layer', 'text-offset', [0, 2]);
                    map.current.setLayoutProperty('heritage-sites-layer', 'text-anchor', 'top');
                    map.current.setLayoutProperty('heritage-sites-layer', 'visibility', 'visible');
                    console.log('✅ Text labels repositioned for icons');
                  }
                  
                  console.log('🎉 Heritage site icons loaded and displayed successfully!');
                } else if (loaded === 0) {
                  console.log('⚠️ No icons could be loaded, keeping circle markers');
                } else {
                  console.log('ℹ️ Icons layer already exists, skipping creation');
                }
              }).catch((error) => {
                console.error('❌ Error in icon loading process:', error);
                console.log('🔄 Falling back to circle markers');
              });
            }, 300); // Load icons quickly after basic setup

            // Add text labels
            if (!map.current.getLayer('heritage-sites-layer')) {
              map.current.addLayer({ 
                'id': 'heritage-sites-layer', 
                'type': 'symbol', 
                'source': 'heritage-sites-source', 
                'layout': { 
                  'text-field': ['get', 'name'],
                  'text-anchor': 'top',
                  'text-offset': [0, 1.5],
                  'text-size': [
                    'interpolate', ['linear'], ['zoom'],
                    6, 10,
                    10, 12,
                    14, 16
                  ],
                  'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                  'text-max-width': 10,
                  'text-line-height': 1.2
                }, 
                'paint': { 
                  'text-color': '#ffffff', 
                  'text-halo-color': '#000000', 
                  'text-halo-width': 2
                } 
              });
              console.log('Text labels layer added');
            }

            // Enhanced click interaction for both icons and circles
            const handleSiteClick = async (e) => {
              const properties = e.features[0].properties;
              const coordinates = e.features[0].geometry.coordinates.slice();
              
              console.log('Heritage site clicked:', properties.name);

              await openSiteInSidebar(
                {
                  name: properties.name,
                  category: properties.category,
                  year: properties.year,
                  coordinates
                },
                { flyTo: false }
              );
            };

            // Enhanced hover effects for both icons and circles
            const handleMouseEnter = () => {
              map.current.getCanvas().style.cursor = 'pointer';
            };

            const handleMouseLeave = () => {
              map.current.getCanvas().style.cursor = '';
            };

            // Add event listeners for both layer types
            map.current.on('click', 'heritage-sites-icons', handleSiteClick);
            map.current.on('click', 'heritage-sites-circles', handleSiteClick);
            map.current.on('mouseenter', 'heritage-sites-icons', handleMouseEnter);
            map.current.on('mouseenter', 'heritage-sites-circles', handleMouseEnter);
            map.current.on('mouseleave', 'heritage-sites-icons', handleMouseLeave);
            map.current.on('mouseleave', 'heritage-sites-circles', handleMouseLeave);
            
            console.log('✅ Event handlers attached to both icon and circle layers');

            // Initialize site counts

          } catch (error) {
            console.error('Error adding heritage sites:', error);
          }
        }, 500);
      });

      // Close image viewer functionality
      const setupCloseViewer = () => {
        const closeBtn = document.getElementById('close-viewer-btn');
        if (closeBtn) {
          closeBtn.removeEventListener('click', handleCloseViewer);
          closeBtn.addEventListener('click', handleCloseViewer);
        }
      };

      const handleCloseViewer = () => {
        const viewerContainer = document.getElementById('viewer-container');
        const viewer = document.querySelector('.viewer');
        
        if (viewerContainer) viewerContainer.style.display = 'none';
        if (viewer) viewer.innerHTML = '';
      };

      // Add keyboard shortcuts
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleCloseViewer();
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      // Setup event listeners after component mounts
      setTimeout(() => {
        console.log('Setting up event listeners...');
        setupCloseViewer();
        
        const latInput = document.getElementById('lat-input');
        const lonInput = document.getElementById('lon-input');
        
        if (latInput && lonInput) {
          if (!latInput.value && !lonInput.value) {
            latInput.placeholder = '18.52 (Mumbai)';
            lonInput.placeholder = '73.85 (Pune)';
          }
        }
      }, 1000);

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (map.current) {
          mapReadyRef.current = false;
          map.current.remove();
        }
      };
    }, 100);
  }, [heritageSites]); // Add heritageSites as dependency

  // Handle ESC key for Street View modal
  useEffect(() => {
    const handleModalKeyDown = (e) => {
      if (e.key === 'Escape' && streetViewModalOpen) {
        setStreetViewModalOpen(false);
      }
    };

    if (streetViewModalOpen) {
      document.addEventListener('keydown', handleModalKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [streetViewModalOpen]);

  const activeMonument = sidebarData || selectedMonument;
  const actionCards = [
    {
      id: 'multiplayer-quiz',
      icon: '👥',
      title: 'Multiplayer Quiz',
      description: 'Live head-to-head challenge mode.',
      accentClass: 'heritage-action-sunset',
      onClick: () => navigateWithSelection('/multiplayer/heritage-quiz')
    },
    {
      id: 'all-india-quiz',
      icon: '🎯',
      title: 'All India Quiz',
      description: 'Adaptive monument quiz session.',
      accentClass: 'heritage-action-orchid',
      onClick: () => navigateWithSelection('/heritage-quiz')
    },
    {
      id: 'storybook',
      icon: '📖',
      title: 'Heritage Storybook',
      description: 'Guided visual history chapters.',
      accentClass: 'heritage-action-azure',
      onClick: () => navigateWithSelection('/storybook-demo')
    },
    {
      id: 'safety-navigator',
      icon: '🚨',
      title: 'Safety Navigator',
      description: 'Route risk and emergency support.',
      accentClass: 'heritage-action-danger',
      onClick: () =>
        navigateWithSelection(
          '/safety-navigation',
          toSafetySiteState(sidebarData || selectedMonument) || {}
        )
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="heritage-loading-shell">
        <div className="heritage-shell-card">
          <h2 className="heritage-shell-title">Loading Heritage Atlas</h2>
          <p className="heritage-shell-subtitle">
            Preparing map layers, monument metadata, and enhanced image context.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="heritage-error-shell">
        <div className="heritage-shell-card">
          <h2 className="heritage-shell-title">Unable to Load Heritage Data</h2>
          <p className="heritage-shell-subtitle">{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="heritage-page-root heritage-theme-scope"
      data-heritage-theme={theme}
      // NOTE: no z-index here on purpose. `position: fixed` + `z-index` would
      // create a stacking context that trapped every modal inside this subtree
      // below the global nav, however high their own z-index was.
      style={{ margin: 0, padding: 0, overflow: 'hidden', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <div className="heritage-ambient-bg" aria-hidden="true">
        <span className="heritage-orb heritage-orb-one" />
        <span className="heritage-orb heritage-orb-two" />
        <span className="heritage-orb heritage-orb-three" />
      </div>

      {/* Map Container */}
      <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', zIndex: 1 }} />

      {activeMonument?.name && (
        <div className="heritage-selected-chip" style={{ zIndex: 15 }}>
          <div className="heritage-selected-title">Selected Monument</div>
          <div className="heritage-selected-name">{activeMonument.name}</div>
          <div className="heritage-selected-actions">
            <button
              className="heritage-mini-action"
              onClick={() => {
                if (activeMonument.coordinates && map.current) {
                  map.current.flyTo({
                    center: activeMonument.coordinates,
                    zoom: 14,
                    pitch: 45,
                    bearing: 0,
                    duration: 900,
                    essential: true
                  });
                }

                if (sidebarData?.name === activeMonument.name) {
                  setSidebarOpen(true);
                } else {
                  openSiteInSidebar(activeMonument, { flyTo: false });
                }
              }}
            >
              Focus
            </button>
            <button
              className={`heritage-mini-action ${chatbotPulse ? 'is-pulse' : ''}`}
              onClick={() => {
                window.dispatchEvent(new Event('heritage-chatbot-open'));
                setChatbotPulse(true);
                setTimeout(() => setChatbotPulse(false), 1200);
              }}
            >
              Chatbot
            </button>
          </div>
        </div>
      )}

      {/* Heritage Action Cards */}
      <div className="heritage-floating-action-grid">
        {actionCards.map((card) => (
          <motion.button
            key={card.id}
            className={`heritage-action-card ${card.accentClass}`}
            onClick={card.onClick}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          >
            <span className="heritage-action-icon">{card.icon}</span>
            <span className="heritage-action-label">{card.title}</span>
            <span className="heritage-action-desc">{card.description}</span>
          </motion.button>
        ))}
      </div>

      {/* Unified map control dock - replaces the previously scattered
          home button, info panel and legend, which were pinned to three
          different corners and always visible. */}
      {/* Map-specific controls. Home / theme / help live in the global nav
          (components/AppNav.jsx) so they are consistent across the product. */}
      <div className="heritage-dock" role="toolbar" aria-label="Map controls">
        <button
          type="button"
          className={`heritage-dock__btn gs-tip gs-tip--below${searchOpen ? ' is-active' : ''}`}
          data-tip={searchOpen ? 'Hide search' : 'Search places'}
          onClick={() => setSearchOpen((open) => !open)}
          aria-pressed={searchOpen}
          aria-label="Toggle search panel"
        >
          <span aria-hidden="true">🔍</span>
        </button>

        <button
          type="button"
          className={`heritage-dock__btn gs-tip gs-tip--below${openPanel === 'info' ? ' is-active' : ''}`}
          data-tip="About this map"
          onClick={() => togglePanel('info')}
          aria-pressed={openPanel === 'info'}
          aria-label="Toggle map information"
        >
          <span aria-hidden="true">ℹ️</span>
        </button>

        <button
          type="button"
          className={`heritage-dock__btn gs-tip gs-tip--below${openPanel === 'legend' ? ' is-active' : ''}`}
          data-tip="Legend"
          onClick={() => togglePanel('legend')}
          aria-pressed={openPanel === 'legend'}
          aria-label="Toggle category legend"
        >
          <span aria-hidden="true">🗂️</span>
        </button>
      </div>

      {/* Search / fly-to panel */}
      {searchOpen && (
      <div className="fly-to-box heritage-panel heritage-panel--search gs-animate-scale">
        <div className="heritage-panel__header">
          <span className="heritage-panel__title"><span aria-hidden="true">🛫</span> Fly to location</span>
          <button
            type="button"
            className="heritage-panel__close"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search panel"
          >
            ×
          </button>
        </div>
        
        {/* Mode Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              value="places"
              checked={searchMode === 'places'}
              onChange={(e) => setSearchMode(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Search by Place
          </label>
          <label>
            <input
              type="radio"
              value="coordinates"
              checked={searchMode === 'coordinates'}
              onChange={(e) => setSearchMode(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Coordinates
          </label>
        </div>

        {/* Coordinate Mode */}
        {searchMode === 'coordinates' && (
          <div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Latitude</label>
              <input
                type="number"
                id="lat-input"
                placeholder="19.076"
                step="0.001"
                min="-90"
                max="90"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFlyTo(e);
                  }
                }}
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Longitude</label>
              <input
                type="number"
                id="lon-input"
                placeholder="72.877"
                step="0.001"
                min="-180"
                max="180"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFlyTo(e);
                  }
                }}
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }}
              />
            </div>
          </div>
        )}

        {/* Place Search Mode */}
        {searchMode === 'places' && (
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Search Heritage Site</label>
            <input
              type="text"
              id="place-search-input"
              placeholder="Type place name (e.g., Aja for Ajanta)"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredPlaces.length > 0) {
                  setShowDropdown(true);
                }
              }}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                borderBottomLeftRadius: showDropdown ? '0' : '3px',
                borderBottomRightRadius: showDropdown ? '0' : '3px'
              }}
            />
            
            {/* Dropdown */}
            {showDropdown && filteredPlaces.length > 0 && (
              <div className="dropdown-container" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderTop: 'none',
                borderBottomLeftRadius: '3px',
                borderBottomRightRadius: '3px',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                scrollBehavior: 'smooth'
              }}>
                {filteredPlaces.map((place, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    data-dropdown-index={index}
                    onClick={() => handlePlaceSelect(place)}
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderBottom: index < filteredPlaces.length - 1 ? '1px solid #eee' : 'none',
                      backgroundColor: highlightedIndex === index ? '#007cba' : 'white',
                      color: highlightedIndex === index ? 'white' : 'black'
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '13px' }}>{place.name}</div>
                    <div style={{ fontSize: '11px', color: highlightedIndex === index ? 'rgba(255,255,255,0.8)' : '#666' }}>
                      {place.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleFlyTo}
          style={{
            width: '100%',
            padding: '8px 10px',
            background: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {searchMode === 'coordinates' ? '🛫 Fly to Coordinates' : '🛫 Fly to Place'}
        </button>
      </div>
      )}

      {/* Info panel (dock-toggled) */}
      {openPanel === 'info' && (
        <div className="info-panel heritage-panel heritage-panel--info gs-animate-scale">
          <div className="heritage-panel__header">
            <span className="heritage-panel__title"><span aria-hidden="true">🏛️</span> Indian Heritage Sites</span>
            <button
              type="button"
              className="heritage-panel__close"
              onClick={() => setOpenPanel(null)}
              aria-label="Close information panel"
            >
              ×
            </button>
          </div>

          <p className="heritage-panel__text">
            Click any site marker to explore. Sites with 360° views open in panoramic mode.
          </p>

          <div className="heritage-stat-row">
            <div className="heritage-stat">
              <span className="heritage-stat__value">{siteCounts.total}</span>
              <span className="heritage-stat__label">Total sites</span>
            </div>
            <div className="heritage-stat">
              <span className="heritage-stat__value">{siteCounts.unesco}</span>
              <span className="heritage-stat__label">UNESCO</span>
            </div>
          </div>

          {error && <div className="heritage-panel__error" role="alert">{error}</div>}
        </div>
      )}

      {/* Legend (dock-toggled) */}
      {openPanel === 'legend' && (
      <div className="legend heritage-panel heritage-panel--legend gs-animate-scale">
        <div className="heritage-panel__header">
          <span className="heritage-panel__title"><span aria-hidden="true">🗂️</span> Site categories</span>
          <button
            type="button"
            className="heritage-panel__close"
            onClick={() => setOpenPanel(null)}
            aria-label="Close legend"
          >
            ×
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/UNESCO World Heritage.png" 
            alt="UNESCO"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#ff6b6b', display: 'none' }}></div>
          <span>UNESCO World Heritage</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/Historic Forts.png" 
            alt="Fort"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#4ecdc4', display: 'none' }}></div>
          <span>Historic Forts</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/Rock-cut Caves.png" 
            alt="Cave"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#45b7d1', display: 'none' }}></div>
          <span>Rock-cut Caves</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/Temples.png" 
            alt="Temple"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#f9ca24', display: 'none' }}></div>
          <span>Temples</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/Monuments.png" 
            alt="Monument"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#6c5ce7', display: 'none' }}></div>
          <span>Monuments</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/Palaces & Museums.png" 
            alt="Palace"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#a29bfe', display: 'none' }}></div>
          <span>Palaces & Museums</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
          <img 
            src="/assets/Historic Buildings.png" 
            alt="Building"
            className="legend-icon-black-outline"
            style={{ width: '20px', height: '20px', marginRight: '10px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#fd79a8', display: 'none' }}></div>
          <span>Historic Buildings</span>
        </div>
      </div>
      )}

      {/* Sidebar for heritage site details */}
      {sidebarOpen && sidebarData && (
        <div
          ref={sidebarPanelRef}
          className={`heritage-sidebar-panel${sidebarExpanded ? ' is-expanded' : ''}`}
        >
          {/* Header */}
          <div className="h-sidebar__header">
            <div className="h-sidebar__heading">
              <h2 className="h-sidebar__title">{sidebarData.name}</h2>
              <span className="h-sidebar__meta">
                {sidebarData.category} &middot; {sidebarData.year}
              </span>
            </div>
            <div className="h-sidebar__actions">
              <button
                onClick={toggleSidebarFullscreen}
                className="h-modal__btn"
                title={sidebarExpanded ? 'Exit fullscreen panel' : 'Fullscreen panel'}
              >
                {sidebarExpanded ? '🡼' : '⛶'}
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="h-modal__btn h-modal__btn--close"
                aria-label="Close monument details"
                title="Close"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="h-sidebar__body gs-scroll">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${sidebarData.name}-${sidebarData.monumentImage?.imageUrl || sidebarData.media?.panorama_url || 'no-image'}`}
                className="heritage-sidebar-hero"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {(sidebarData.monumentImage?.imageUrl || sidebarData.media?.panorama_url) && (
                  <div
                    className="heritage-sidebar-hero-image"
                    style={{
                      backgroundImage: `url(${sidebarData.monumentImage?.imageUrl || sidebarData.media?.panorama_url})`
                    }}
                  />
                )}
                {!(sidebarData.monumentImage?.imageUrl || sidebarData.media?.panorama_url) && (
                  <div className="heritage-sidebar-hero-skeleton" />
                )}
                <div className="heritage-sidebar-hero-overlay" />
                <div className="heritage-sidebar-hero-content">
                  <div className="heritage-sidebar-kicker">Monument Spotlight</div>
                  <h3 className="heritage-sidebar-title">{sidebarData.name}</h3>
                  <div className="heritage-sidebar-meta">
                    {sidebarData.location?.city ? `${sidebarData.location.city}, ` : ''}
                    {sidebarData.location?.state ? `${sidebarData.location.state}, ` : ''}
                    {sidebarData.location?.country || 'India'}
                  </div>
                  <span className="heritage-sidebar-source">
                    Image: {sidebarData.monumentImage?.source || 'fallback'}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="heritage-hub-card">
              <div className="heritage-hub-title">Monument Hub</div>
              <div className="heritage-hub-subtitle">
                {sidebarData.location?.city ? `${sidebarData.location.city}, ` : ''}
                {sidebarData.location?.state ? `${sidebarData.location.state}, ` : ''}
                {sidebarData.location?.country || 'India'}
              </div>
              <div className="heritage-hub-actions">
                <button className="heritage-mini-action" onClick={() => setQuizModalOpen(true)}>
                  Quiz
                </button>
                <button className="heritage-mini-action" onClick={() => setTripPlannerModalOpen(true)}>
                  Trip
                </button>
                <button
                  className="heritage-mini-action"
                  onClick={() =>
                    navigateWithSelection('/safety-navigation', toSafetySiteState(sidebarData) || {})
                  }
                >
                  Safety
                </button>
              </div>
            </div>

            {sidebarLoading && <SidebarSkeleton />}

            {!sidebarLoading && (
              <>
            <div className="heritage-section-title">Overview</div>
            {/* Info Block */}
            {sidebarData.info && (
              <SidebarBlock
                icon="ℹ️"
                title="Information"
                summary={sidebarData.info.summary}
                onClick={async () => {
                  const hasStoryBook = await checkStoryBookAvailable(sidebarData.name);
                  if (hasStoryBook) {
                    const formattedName = sidebarData.name.toLowerCase().replace(/\s+/g, '-');
                    navigateWithSelection(`/heritage-storybook/${formattedName}`);
                  } else {
                    setInfoModalOpen(true);
                  }
                }}
              />
            )}

            {/* How to Reach Block */}
            {sidebarData.howToReach && (
              <SidebarBlock
                icon="🧭"
                title="How to Reach"
                summary={sidebarData.howToReach.summary}
                onClick={() => setDirectionsModalOpen(true)}
              />
            )}

            {/* 360° View Block */}
            {sidebarData.view360 && (
              <SidebarBlock
                icon="🌐"
                title="360° Street View"
                summary={sidebarData.view360.summary}
                onClick={() => {
                  setStreetViewData({
                    name: sidebarData.name,
                    iframeUrl: sidebarData.view360.iframeUrl,
                    full: sidebarData.view360.full
                  });
                  setStreetViewModalOpen(true);
                }}
              />
            )}

            {/* 3D Model Block */}
            {sidebarData.model3d && (
              <SidebarBlock
                icon="🏗️"
                title="3D Model"
                summary={sidebarData.model3d.summary}
                onClick={() => {
                  if (sidebarData.model3d.sketchfabId) {
                    navigateWithSelection(`/sketchfab/${sidebarData.model3d.sketchfabId}`);
                  } else {
                    window.open(sidebarData.model3d.url, '_blank');
                  }
                }}
              />
            )}

            {/* Heritage Quiz Block */}
            <SidebarBlock
              icon="🎯"
              title="Heritage Quiz"
              summary="Test your knowledge about this monument"
              onClick={() => setQuizModalOpen(true)}
            />

            {/* Trip Planner Block */}
            <SidebarBlock
              icon="🧳"
              title="Plan Trip"
              summary="Build a day-wise itinerary with budget and booking links"
              onClick={() => setTripPlannerModalOpen(true)}
            />

            <SidebarBlock
              icon="🤖"
              title="AI Chatbot"
              summary="Open the heritage assistant without leaving this monument context"
              onClick={() => {
                window.dispatchEvent(new Event('heritage-chatbot-open'));
                setChatbotPulse(true);
                setTimeout(() => setChatbotPulse(false), 1200);
              }}
            />

            <SidebarBlock
              icon="🚨"
              title="Safety Navigator"
              summary="Emergency mode, safe places, and route risk ranking"
              onClick={() =>
                navigateWithSelection('/safety-navigation', toSafetySiteState(sidebarData) || {})
              }
            />

            <div className="heritage-section-title">Map and Live Data</div>

            {/* Map Viewing Options */}
            <div style={{ 
              marginTop: '20px', 
              borderTop: '2px solid rgba(255,255,255,0.2)', 
              paddingTop: '20px',
              marginLeft: '12px',
              marginRight: '12px'
            }}>
              <h4 style={{ 
                color: '#fff', 
                marginBottom: '15px', 
                fontSize: '18px', 
                fontWeight: '700', 
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.5px'
              }}>🗺️ Map Views</h4>

              {/* Satellite View */}
              <SidebarBlock
                icon="🛰️"
                title="Satellite View"
                summary="High-resolution satellite imagery of the site"
                onClick={() => {
                  if (sidebarData.coordinates) {
                    switchMapStyle('satellite', 18, sidebarData.coordinates);
                  }
                }}
                isActive={currentMapStyle === 'satellite'}
                isLoading={mapStyleLoading && currentMapStyle !== 'satellite'}
              />

              {/* Topographic Map */}
              <SidebarBlock
                icon="⛰️"
                title="Terrain View"
                summary="Topographic map showing elevation and terrain"
                onClick={() => {
                  if (sidebarData.coordinates) {
                    switchMapStyle('topo', 15, sidebarData.coordinates);
                  }
                }}
                isActive={currentMapStyle === 'topo'}
                isLoading={mapStyleLoading && currentMapStyle !== 'topo'}
              />

              {/* Historical Map */}
              <SidebarBlock
                icon="📜"
                title="Historical Context"
                summary="View site in historical map context"
                onClick={() => {
                  if (sidebarData.coordinates) {
                    switchMapStyle('historical', 14, sidebarData.coordinates);
                  }
                }}
                isActive={currentMapStyle === 'historical'}
                isLoading={mapStyleLoading && currentMapStyle !== 'historical'}
              />

              {/* Navigation Map */}
              <SidebarBlock
                icon="🗺️"
                title="Navigation View"
                summary="Detailed street map for navigation"
                onClick={() => {
                  if (sidebarData.coordinates) {
                    switchMapStyle('streets', 16, sidebarData.coordinates);
                  }
                }}
                isActive={currentMapStyle === 'streets'}
                isLoading={mapStyleLoading && currentMapStyle !== 'streets'}
              />

              {/* Hybrid View */}
              <SidebarBlock
                icon="🌍"
                title="Hybrid Map"
                summary="Satellite imagery with street labels"
                onClick={() => {
                  if (sidebarData.coordinates) {
                    switchMapStyle('hybrid', 14, sidebarData.coordinates);
                  }
                }}
                isActive={currentMapStyle === 'hybrid'}
                isLoading={mapStyleLoading && currentMapStyle !== 'hybrid'}
              />

              {/* Location Context */}
              <SidebarBlock
                icon="📍"
                title="Area Overview"
                summary="See surrounding landmarks and context"
                onClick={() => {
                  if (sidebarData.coordinates && map.current) {
                    map.current.flyTo({
                      center: sidebarData.coordinates,
                      zoom: 12,
                      pitch: 30,
                      bearing: 0,
                      duration: 2000,
                      essential: true
                    });
                  }
                }}
              />

              {/* Weather Forecast */}
              {sidebarData.coordinates && (
                <SidebarBlock
                  icon="🌤️"
                  title="Weather Forecast"
                  summary="Current conditions & 5-day forecast"
                  onClick={handleWeatherClick}
                  isLoading={weatherLoading}
                />
              )}

              {/* Latest News */}
              <SidebarBlock
                icon="📰"
                title="Latest News"
                summary="Recent heritage & tourism updates"
                onClick={handleNewsClick}
                isLoading={newsLoading}
              />
            </div>
              </>
            )}
          </div>
          {/* End scrollable content area */}
        </div>
      )}

      {/* Full-Screen Street View Modal */}
      {streetViewModalOpen && streetViewData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 10000, display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
          {/* Modal Header */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{streetViewData.name}</h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>{streetViewData.full}</p>
            </div>
            <button
              onClick={() => setStreetViewModalOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '32px', color: '#666', cursor: 'pointer', padding: '5px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              &times;
            </button>
          </div>

          {/* Street View Iframe */}
          <div style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
            <iframe
              src={streetViewData.iframeUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`360° Street View of ${streetViewData.name}`}
            />
          </div>

          {/* Modal Footer */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '10px 20px', textAlign: 'center', fontSize: '12px', color: '#666', boxShadow: '0 -2px 10px rgba(0,0,0,0.3)' }}>
            <p style={{ margin: 0 }}>
              Use your mouse to explore the 360° view • Press <strong>ESC</strong> or click <strong>×</strong> to close
            </p>
          </div>
        </div>
      )}

      {/* Heritage Information Modal */}
      {infoModalOpen && sidebarData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{sidebarData.name}</h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
                  {sidebarData.category} • {sidebarData.year}
                </p>
              </div>
              <button
                onClick={() => setInfoModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '32px', color: '#666', cursor: 'pointer', padding: '8px', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              {/* Basic Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>About</h3>
                <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#444', marginBottom: '20px' }}>
                  {sidebarData.info?.full || 'No detailed information available.'}
                </p>
              </div>

              {/* History Section */}
              {sidebarData.info?.history && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>History</h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{sidebarData.info.history}</p>
                </div>
              )}

              {/* Architecture Section */}
              {sidebarData.info?.architecture && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Architecture</h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{sidebarData.info.architecture}</p>
                </div>
              )}

              {/* Significance Section */}
              {sidebarData.info?.significance && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Significance</h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{sidebarData.info.significance}</p>
                </div>
              )}

              {/* Visiting Tips */}
              {sidebarData.info?.visitingTips && sidebarData.info.visitingTips.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Visiting Tips</h3>
                  <ul style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', paddingLeft: '20px' }}>
                    {sidebarData.info.visitingTips.map((tip, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Visitor Information */}
              {sidebarData.visitorinfo && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Visitor Information</h3>
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    {sidebarData.visitorinfo.timings && (
                      <p style={{ marginBottom: '12px' }}><strong>Timings:</strong> {sidebarData.visitorinfo.timings}</p>
                    )}
                    {sidebarData.visitorinfo.entryFee && (
                      <p style={{ marginBottom: '12px' }}><strong>Entry Fee:</strong> {sidebarData.visitorinfo.entryFee}</p>
                    )}
                    {sidebarData.visitorinfo.bestTimeToVisit && (
                      <p style={{ marginBottom: '12px' }}><strong>Best Time to Visit:</strong> {sidebarData.visitorinfo.bestTimeToVisit}</p>
                    )}
                    {sidebarData.visitorinfo.duration && (
                      <p style={{ marginBottom: 0 }}><strong>Duration:</strong> {sidebarData.visitorinfo.duration}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Location Information */}
              {sidebarData.location && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Location</h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
                    {sidebarData.location.city && `${sidebarData.location.city}, `}
                    {sidebarData.location.state && `${sidebarData.location.state}, `}
                    {sidebarData.location.country}
                  </p>
                  {sidebarData.location.coordinates && (
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: 0 }}>
                      <strong>Coordinates:</strong> {sidebarData.location.coordinates[1]}, {sidebarData.location.coordinates[0]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How to Reach Modal */}
      {directionsModalOpen && sidebarData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', backdropFilter: 'blur(5px)' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: '20px', 
            width: '90%', 
            maxWidth: '900px', 
            maxHeight: '90vh', 
            overflow: 'hidden', 
            boxShadow: '0 25px 70px rgba(0,0,0,0.5)', 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '28px 36px', 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.2)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  color: '#fff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  marginBottom: '8px'
                }}>How to Reach {sidebarData.name}</h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: '500'
                }}>Travel directions and transportation options</p>
              </div>
              <button
                onClick={() => setDirectionsModalOpen(false)}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  border: 'none', 
                  fontSize: '32px', 
                  color: '#fff', 
                  cursor: 'pointer', 
                  padding: '8px', 
                  borderRadius: '50%', 
                  width: '48px', 
                  height: '48px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'rotate(0deg)';
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ 
              padding: '36px', 
              overflowY: 'auto', 
              flex: 1,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.3) transparent'
            }} className="modal-scroll">
              {/* Overview */}
              <div style={{ marginBottom: '36px' }}>
                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: '700', 
                  color: '#fff', 
                  marginBottom: '16px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '30px' }}>🗺️</span>
                  Overview
                </h3>
                <p style={{ 
                  fontSize: '18px', 
                  lineHeight: '1.8', 
                  color: 'rgba(255, 255, 255, 0.95)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {sidebarData.howToReach?.full || 'No travel information available.'}
                </p>
              </div>

              {/* By Air */}
              {sidebarData.howToReach?.byAir && (
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#fff', 
                    marginBottom: '16px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '28px' }}>✈️</span>
                    By Air
                  </h3>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(135, 206, 250, 0.2) 0%, rgba(30, 144, 255, 0.15) 100%)', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(135, 206, 250, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    {sidebarData.howToReach.byAir.nearestAirport && (
                      <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                        <strong style={{ color: '#fff', fontSize: '17px' }}>Nearest Airport:</strong> {sidebarData.howToReach.byAir.nearestAirport}
                      </p>
                    )}
                    {sidebarData.howToReach.byAir.distance && (
                      <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                        <strong style={{ color: '#fff', fontSize: '17px' }}>Distance:</strong> {sidebarData.howToReach.byAir.distance}
                      </p>
                    )}
                    {sidebarData.howToReach.byAir.description && (
                      <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: '1.7' }}>
                        {sidebarData.howToReach.byAir.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* By Rail */}
              {sidebarData.howToReach?.byRail && (
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#fff', 
                    marginBottom: '16px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '28px' }}>🚂</span>
                    By Train
                  </h3>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.2) 0%, rgba(34, 139, 34, 0.15) 100%)', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(144, 238, 144, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    {sidebarData.howToReach.byRail.nearestStation && (
                      <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                        <strong style={{ color: '#fff', fontSize: '17px' }}>Nearest Railway Station:</strong> {sidebarData.howToReach.byRail.nearestStation}
                      </p>
                    )}
                    {sidebarData.howToReach.byRail.distance && (
                      <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                        <strong style={{ color: '#fff', fontSize: '17px' }}>Distance:</strong> {sidebarData.howToReach.byRail.distance}
                      </p>
                    )}
                    {sidebarData.howToReach.byRail.description && (
                      <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: '1.7' }}>
                        {sidebarData.howToReach.byRail.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* By Road */}
              {sidebarData.howToReach?.byRoad && (
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#fff', 
                    marginBottom: '16px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '28px' }}>🚗</span>
                    By Road
                  </h3>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 179, 102, 0.2) 0%, rgba(255, 140, 0, 0.15) 100%)', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 179, 102, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                  }}>
                    {sidebarData.howToReach.byRoad.fromMajorCities && sidebarData.howToReach.byRoad.fromMajorCities.length > 0 && (
                      <>
                        <h4 style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#fff', 
                          marginBottom: '20px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>From Major Cities</h4>
                        {sidebarData.howToReach.byRoad.fromMajorCities.map((route, index) => (
                          <div key={index} style={{ 
                            marginBottom: '20px', 
                            padding: '20px', 
                            background: 'rgba(255, 255, 255, 0.15)', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateX(8px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}>
                            <p style={{ 
                              fontSize: '18px', 
                              fontWeight: '700', 
                              color: '#fff', 
                              marginBottom: '12px',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>From {route.city}</p>
                            {route.distance && (
                              <p style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '15px' }}>
                                <strong style={{ color: '#fff' }}>Distance:</strong> {route.distance}
                              </p>
                            )}
                            {route.duration && (
                              <p style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '15px' }}>
                                <strong style={{ color: '#fff' }}>Duration:</strong> {route.duration}
                              </p>
                            )}
                            {route.route && (
                              <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: '1.6' }}>
                                <strong style={{ color: '#fff' }}>Route:</strong> {route.route}
                              </p>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    {sidebarData.howToReach.byRoad.localTransport && (
                      <>
                        <h4 style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#fff', 
                          marginBottom: '12px',
                          marginTop: sidebarData.howToReach.byRoad.fromMajorCities?.length > 0 ? '24px' : '0',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>Local Transport</h4>
                        <p style={{ 
                          marginBottom: 0, 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontSize: '15px', 
                          lineHeight: '1.7',
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>{sidebarData.howToReach.byRoad.localTransport}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Location Information */}
              {sidebarData.location && (
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)', 
                  padding: '28px', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#fff', 
                    marginBottom: '20px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '28px' }}>📍</span>
                    Location
                  </h3>
                  <p style={{ 
                    fontSize: '18px', 
                    lineHeight: '1.6', 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    marginBottom: '16px',
                    fontWeight: '500'
                  }}>
                    {sidebarData.location.city && `${sidebarData.location.city}, `}
                    {sidebarData.location.state && `${sidebarData.location.state}, `}
                    {sidebarData.location.country}
                  </p>
                  {sidebarData.location.coordinates && (
                    <p style={{ 
                      fontSize: '16px', 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      marginBottom: 0,
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <strong style={{ color: '#fff' }}>Coordinates:</strong> {sidebarData.location.coordinates[1]}, {sidebarData.location.coordinates[0]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Heritage Quiz Modal */}
      {quizModalOpen && sidebarData && (
        <HeritageQuiz
          monumentName={sidebarData.name}
          initialMode="monument"
          onClose={() => setQuizModalOpen(false)}
        />
      )}

      {/* Trip Planner Modal */}
      {tripPlannerModalOpen && sidebarData && (
        <TripPlannerModal
          isOpen={tripPlannerModalOpen}
          onClose={() => setTripPlannerModalOpen(false)}
          siteData={sidebarData}
          onOpenDedicated={() => {
            setTripPlannerModalOpen(false);
            navigateWithSelection(`/trip-planner/${encodeURIComponent(sidebarData.name)}`);
          }}
        />
      )}

      {/* Custom styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .maplibregl-popup-content {
          background-color: #333 !important;
          color: #fff !important;
          padding: 15px !important;
          border-radius: 8px !important;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
          max-width: 250px !important;
        }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
          border-top-color: #333 !important;
        }
        .popup-category {
          color: #ffa500 !important;
          font-size: 12px !important;
          margin-bottom: 5px !important;
        }
        .popup-year {
          color: #ccc !important;
          font-size: 11px !important;
          margin-top: 5px !important;
        }
        .popup-title {
          font-weight: bold !important;
          margin-bottom: 5px !important;
        }
        #close-viewer-btn:hover {
          background: rgba(0,0,0,0.9) !important;
        }
        .fly-to-box button:hover {
          background: #005fa3 !important;
        }
        .dropdown-item:hover:not([style*="background-color: #007cba"]) {
          background-color: #f5f5f5 !important;
        }
        .fly-to-box input:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }
        
        /* Sidebar Scroll Styling */
        .sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Pulse Animation for Loading */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        /* Smooth transitions for sidebar blocks */
        .sidebar-block {
          position: relative;
          overflow: hidden;
        }
        
        .sidebar-block::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .sidebar-block:hover::before {
          left: 100%;
        }

        .heritage-section-title {
          margin: 16px 16px 8px;
          color: rgba(255, 255, 255, 0.92);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .heritage-hub-card {
          margin: 14px 12px 4px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08));
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
        }

        .heritage-hub-title {
          color: #ffffff;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .heritage-hub-subtitle {
          color: rgba(255, 255, 255, 0.82);
          font-size: 13px;
          line-height: 1.45;
        }

        .heritage-hub-actions {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .heritage-mini-action {
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .heritage-mini-action:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.24);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
        }

        .heritage-mini-action.is-pulse {
          animation: heritagePulse 0.65s ease;
        }

        .heritage-selected-chip {
          position: absolute;
          top: 300px;
          left: 12px;
          max-width: min(360px, calc(100vw - 26px));
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(9, 16, 24, 0.74);
          backdrop-filter: blur(10px);
          padding: 12px 14px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
        }

        .heritage-selected-title {
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.66);
          margin-bottom: 4px;
        }

        .heritage-selected-name {
          font-size: 16px;
          color: #ffffff;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        .heritage-selected-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .heritage-sidebar-skeleton {
          margin: 12px;
          display: grid;
          gap: 10px;
        }

        .heritage-skeleton-item {
          height: 70px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.08) 100%);
          background-size: 220% 100%;
          animation: shimmer 1.4s linear infinite;
        }

        .heritage-ambient-bg {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }

        .heritage-orb {
          position: absolute;
          width: clamp(220px, 28vw, 420px);
          height: clamp(220px, 28vw, 420px);
          border-radius: 50%;
          filter: blur(38px);
          opacity: 0.26;
          transform-origin: center;
        }

        .heritage-orb-one {
          top: -80px;
          left: -70px;
          background: radial-gradient(circle at 30% 30%, rgba(60, 179, 113, 0.9), rgba(60, 179, 113, 0));
          animation: orbFloatA 22s ease-in-out infinite;
        }

        .heritage-orb-two {
          top: 34%;
          right: -80px;
          background: radial-gradient(circle at 40% 50%, rgba(255, 179, 71, 0.92), rgba(255, 179, 71, 0));
          animation: orbFloatB 24s ease-in-out infinite;
        }

        .heritage-orb-three {
          bottom: -120px;
          left: 36%;
          background: radial-gradient(circle at 60% 40%, rgba(80, 156, 255, 0.9), rgba(80, 156, 255, 0));
          animation: orbFloatC 26s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 220% 0;
          }
          100% {
            background-position: -220% 0;
          }
        }

        @keyframes heritagePulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes orbFloatA {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(30px, 22px, 0) scale(1.08); }
        }

        @keyframes orbFloatB {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-26px, 28px, 0) scale(0.94); }
        }

        @keyframes orbFloatC {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(16px, -24px, 0) scale(1.07); }
        }

        @media (max-width: 880px) {
          .heritage-selected-chip {
            top: auto;
            bottom: 146px;
            left: 10px;
            max-width: calc(100vw - 20px);
          }
        }
      `}} />

      {/* Weather Modal */}
      {weatherModalOpen && (
        <div className="h-overlay" onClick={() => setWeatherModalOpen(false)}>
          <div
            ref={weatherModalCardRef}
            className={`h-modal${weatherExpanded ? ' is-expanded' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Weather"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="h-modal__header">
              <div className="h-modal__heading">
                <span className="h-modal__icon" aria-hidden="true">&#127780;&#65039;</span>
                <div>
                  <h2 className="h-modal__title">Weather</h2>
                  <p className="h-modal__subtitle">
                    {weatherData?.location
                      ? `${weatherData.location.name}, ${weatherData.location.country}`
                      : sidebarData?.name}
                    {weatherData?.fetchedAt && (
                      <>
                        {' · updated '}
                        {new Date(weatherData.fetchedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="h-modal__actions">
                <button
                  type="button"
                  className="h-modal__btn gs-hide-mobile"
                  onClick={toggleWeatherFullscreen}
                  aria-label={weatherExpanded ? 'Exit fullscreen' : 'Expand to fullscreen'}
                  title={weatherExpanded ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {weatherExpanded ? '⤡' : '⛶'}
                </button>
                <button
                  type="button"
                  className="h-modal__btn h-modal__btn--close"
                  onClick={() => setWeatherModalOpen(false)}
                  aria-label="Close weather"
                  title="Close (ESC)"
                >
                  &times;
                </button>
              </div>
            </header>

            <div className="h-modal__body gs-scroll">
              {weatherLoading && !weatherData ? (
                <>
                  <div className="gs-skeleton" style={{ height: '120px' }} />
                  <div className="h-weather-stats">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div className="gs-skeleton" style={{ height: '64px' }} key={i} />
                    ))}
                  </div>
                </>
              ) : weatherError ? (
                <div className="gs-state gs-state--error">
                  <div className="gs-state__icon" aria-hidden="true">&#9888;&#65039;</div>
                  <h3 className="gs-state__title">Weather unavailable</h3>
                  <p className="gs-state__text">{weatherError}</p>
                  <button type="button" className="gs-btn gs-btn--secondary" onClick={retryWeather}>
                    Try again
                  </button>
                </div>
              ) : weatherData ? (
                <>
                  <section className="h-section">
                    <h3 className="h-section__title">Current conditions</h3>
                    <div className="h-weather-now">
                      <img
                        className="h-weather-now__icon"
                        src={getWeatherIconUrl(weatherData.current.icon)}
                        alt=""
                        aria-hidden="true"
                      />
                      <div>
                        <div className="h-weather-now__temp">{weatherData.current.temp}&deg;C</div>
                        <div className="h-weather-now__condition">{weatherData.current.description}</div>
                        <div className="h-weather-now__meta">
                          Feels like {weatherData.current.feelsLike}&deg;C &middot; High{' '}
                          {weatherData.current.tempMax}&deg; / Low {weatherData.current.tempMin}&deg;
                        </div>
                      </div>
                    </div>

                    <div className="h-weather-stats">
                      <div className="h-stat">
                        <span className="h-stat__label">Humidity</span>
                        <span className="h-stat__value">{weatherData.current.humidity}%</span>
                      </div>
                      <div className="h-stat">
                        <span className="h-stat__label">Wind</span>
                        <span className="h-stat__value">
                          {weatherData.current.wind.speed} m/s {weatherData.current.wind.direction}
                        </span>
                      </div>
                      <div className="h-stat">
                        <span className="h-stat__label">Pressure</span>
                        <span className="h-stat__value">{weatherData.current.pressure} mb</span>
                      </div>
                      <div className="h-stat">
                        <span className="h-stat__label">Cloud cover</span>
                        <span className="h-stat__value">{weatherData.current.clouds}%</span>
                      </div>
                      <div className="h-stat">
                        <span className="h-stat__label">Visibility</span>
                        <span className="h-stat__value">{weatherData.current.visibility} km</span>
                      </div>
                    </div>
                  </section>

                  {Array.isArray(weatherData.forecast) && weatherData.forecast.length > 0 && (
                    <section className="h-section">
                      <h3 className="h-section__title">5-day forecast</h3>
                      <div className="h-forecast">
                        {weatherData.forecast.map((day, index) => (
                          <div className="h-forecast__day" key={index}>
                            <span className="h-forecast__label">{formatWeatherDate(day.date)}</span>
                            <img
                              className="h-forecast__icon"
                              src={getWeatherIconUrl(day.icon)}
                              alt=""
                              aria-hidden="true"
                            />
                            <span className="h-forecast__temps">
                              <span className="h-forecast__max">{day.tempMax}&deg;</span>
                              <span className="h-forecast__min">{day.tempMin}&deg;</span>
                            </span>
                            <span className="h-forecast__cond">{day.condition}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <p className="gs-caption" style={{ textAlign: 'center' }}>
                    Powered by OpenWeatherMap
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* News Modal */}
      {newsModalOpen && (
        <div className="h-overlay" onClick={() => setNewsModalOpen(false)}>
          <div
            ref={newsModalCardRef}
            className={`h-modal h-modal--wide${newsExpanded ? ' is-expanded' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Heritage news"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="h-modal__header">
              <div className="h-modal__heading">
                <span className="h-modal__icon" aria-hidden="true">&#128240;</span>
                <div>
                  <h2 className="h-modal__title">Latest news</h2>
                  <p className="h-modal__subtitle">{sidebarData?.name}</p>
                </div>
              </div>

              <div className="h-modal__actions">
                <button
                  type="button"
                  className="h-modal__btn gs-hide-mobile"
                  onClick={toggleNewsFullscreen}
                  aria-label={newsExpanded ? 'Exit fullscreen' : 'Expand to fullscreen'}
                  title={newsExpanded ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {newsExpanded ? '⤡' : '⛶'}
                </button>
                <button
                  type="button"
                  className="h-modal__btn h-modal__btn--close"
                  onClick={() => setNewsModalOpen(false)}
                  aria-label="Close news"
                  title="Close (ESC)"
                >
                  &times;
                </button>
              </div>
            </header>

            <div className="h-modal__body gs-scroll">
              {newsLoading && (
                <div className="h-news-list">
                  {[0, 1, 2].map((i) => (
                    <div className="h-news-item" key={i}>
                      <div className="gs-skeleton h-news-item__thumb" />
                      <div className="h-news-item__body" style={{ flex: 1 }}>
                        <div className="gs-skeleton gs-skeleton--title" />
                        <div className="gs-skeleton gs-skeleton--text" />
                        <div className="gs-skeleton gs-skeleton--text" style={{ width: '70%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {newsError && !newsLoading && (
                <div className="gs-state gs-state--error">
                  <div className="gs-state__icon" aria-hidden="true">&#9888;&#65039;</div>
                  <h3 className="gs-state__title">Could not load news</h3>
                  <p className="gs-state__text">{newsError}</p>
                  <button type="button" className="gs-btn gs-btn--secondary" onClick={retryNews}>
                    Try again
                  </button>
                </div>
              )}

              {!newsLoading && !newsError && newsData && (
                <>
                  <div className="h-tabs" role="tablist" aria-label="News source">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={newsTab === 'monument'}
                      className={`h-tab${newsTab === 'monument' ? ' is-active' : ''}`}
                      onClick={() => setNewsTab('monument')}
                    >
                      {newsData.monument.name} ({newsData.monument.articles.length})
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={newsTab === 'location'}
                      className={`h-tab${newsTab === 'location' ? ' is-active' : ''}`}
                      onClick={() => setNewsTab('location')}
                    >
                      {newsData.location.city} ({newsData.location.articles.length})
                    </button>
                  </div>

                  {(newsTab === 'monument'
                    ? newsData.monument.fallbackLabel
                    : newsData.location.fallbackLabel) && (
                    <div className="h-notice">
                      <span aria-hidden="true">&#8505;&#65039;</span>
                      {newsTab === 'monument'
                        ? newsData.monument.fallbackLabel
                        : newsData.location.fallbackLabel}
                    </div>
                  )}

                  {(() => {
                    const articles =
                      newsTab === 'monument'
                        ? newsData.monument.articles
                        : newsData.location.articles;

                    if (!articles || articles.length === 0) {
                      return (
                        <div className="gs-state">
                          <div className="gs-state__icon" aria-hidden="true">&#128240;</div>
                          <h3 className="gs-state__title">No recent stories</h3>
                          <p className="gs-state__text">
                            Nothing published recently for this topic. Try the other tab, or check
                            back later.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="h-news-list gs-stagger">
                        {articles.map((article, index) => (
                          <a
                            className="h-news-item"
                            key={index}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {article.image && (
                              <img
                                className="h-news-item__thumb"
                                src={article.image}
                                alt=""
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="h-news-item__body">
                              <h4 className="h-news-item__title">{article.title}</h4>
                              <p className="h-news-item__desc gs-clamp-2">{article.description}</p>
                              <div className="h-news-item__meta">
                                <span className="h-news-item__source">{article.source}</span>
                                <span aria-hidden="true">&middot;</span>
                                <span>{article.timeAgo}</span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    );
                  })()}

                  <p className="gs-caption" style={{ textAlign: 'center' }}>
                    Powered by NewsAPI
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Heritage Chatbot - Global AI Assistant */}
      <HeritageChatbot />
    </div>
  );
};

function SidebarSkeleton() {
  return (
    <div className="heritage-sidebar-skeleton" aria-live="polite" aria-label="Loading monument details">
      <div className="heritage-skeleton-item" />
      <div className="heritage-skeleton-item" />
      <div className="heritage-skeleton-item" />
      <div className="heritage-skeleton-item" />
    </div>
  );
}

// A clickable row in the monument sidebar. This used to be a <div onClick>,
// which keyboard and screen-reader users could not reach.
function SidebarBlock({ icon, title, summary, onClick, isActive = false, isLoading = false }) {
  return (
    <button
      type="button"
      className={`h-sidebar-block${isActive ? ' is-active' : ''}${isLoading ? ' is-loading' : ''}`}
      onClick={isLoading ? undefined : onClick}
      aria-busy={isLoading || undefined}
      aria-pressed={isActive || undefined}
    >
      <span className="h-sidebar-block__icon" aria-hidden="true">{icon}</span>
      <span className="h-sidebar-block__text">
        <span className="h-sidebar-block__title">
          {title}
          {isActive && <span className="h-sidebar-block__badge">Active</span>}
          {isLoading && <span className="gs-spinner gs-spinner--sm" />}
        </span>
        <span className="h-sidebar-block__summary">{summary}</span>
      </span>
      <span className="h-sidebar-block__chevron" aria-hidden="true">›</span>
    </button>
  );
}

export default HeritagePage;
