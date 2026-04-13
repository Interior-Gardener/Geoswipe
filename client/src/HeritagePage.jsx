import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './assets/map-icon-outlines.css';
import HeritageQuiz from './HeritageQuiz';
import HeritageChatbot from './components/HeritageChatbot';
import TripPlannerModal from './components/tripPlanner/TripPlannerModal';
import { fetchWeatherData, getWeatherIconUrl, formatWeatherDate } from './utils/openWeatherService';
import { fetchHeritageNews } from './utils/newsService';

const HeritagePage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
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
      } catch (_) {
        // continue checking next path
      }
    }
    return false;
  };
  
  // Sidebar state
  const [sidebarData, setSidebarData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
  const [searchMode, setSearchMode] = useState('coordinates');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // API data state
  const [heritageSites, setHeritageSites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Map style management
  const [currentMapStyle, setCurrentMapStyle] = useState('hybrid');
  const [mapStyleLoading, setMapStyleLoading] = useState(false);
  
  const navigate = useNavigate();

  // Map style switching function
  const switchMapStyle = async (styleName, zoomLevel = 14, siteCoordinates = null) => {
    if (!map.current || mapStyleLoading) return;
    
    console.log(`🔄 Switching to ${styleName} map style...`);
    setMapStyleLoading(true);
    
    let timeoutId = null;
    let styleLoadCompleted = false;
    
    try {
      const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
      const styleUrls = {
        satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
        hybrid: `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`,
        topo: `https://api.maptiler.com/maps/topo-v2/style.json?key=${apiKey}`,
        streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
        historical: `https://api.maptiler.com/maps/backdrop/style.json?key=${apiKey}`
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
                  url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`,
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
                const details = await fetchDetails(properties.name);
                setSidebarData({
                  name: properties.name,
                  category: properties.category,
                  year: properties.year,
                  coordinates: e.features[0].geometry.coordinates,
                  ...details
                });
                setSidebarOpen(true);
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
    console.log('Initializing map...');
    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    
    // Color mapping for different categories
    const categoryColors = {
      'UNESCO World Heritage': '#ff6b6b',
      'Historic Fort': '#4ecdc4',
      'Rock-cut Cave': '#45b7d1',
      'Temple': '#f9ca24',
      'Monument': '#6c5ce7',
      'Palace': '#a29bfe',
      'Museum': '#a29bfe',
      'Historic Building': '#fd79a8'
    };

    function getCategoryColor(category) {
      return categoryColors[category] || '#74b9ff';
    }

    // Update site counts
    function updateSiteCounts() {
      if (!heritageSites?.features) return;
      
      const totalSites = heritageSites.features.length;
      const unescoSites = heritageSites.features.filter(site => 
        site.properties.category === 'UNESCO World Heritage'
      ).length;
      
      const siteCountElement = document.getElementById('site-count');
      const unescoCountElement = document.getElementById('unesco-count');
      
      if (siteCountElement) siteCountElement.textContent = totalSites;
      if (unescoCountElement) unescoCountElement.textContent = unescoSites;
    }

    // Initialize the map with timeout
    setTimeout(() => {
      try {
        console.log('Map container:', mapContainer.current);
        console.log('Creating MapLibre instance...');
        
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`,
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
        
        map.current.on('sourcedataabort', (e) => {
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

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        
        setTimeout(() => {
          console.log('Adding heritage sites to map...');
          
          try {
            // Add terrain and 3D effects
            if (!map.current.getSource('maptiler-terrain')) {
              map.current.addSource('maptiler-terrain', { 
                type: 'raster-dem', 
                url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`, 
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
            const loadIconPromises = iconCategories.map(({ category, file, id }) => {
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
              
              const details = await fetchDetails(properties.name);
              setSidebarData({
                name: properties.name,
                category: properties.category,
                year: properties.year,
                coordinates: coordinates, // Add coordinates for map switching
                ...details
              });
              setSidebarOpen(true);
            };

            // Enhanced hover effects for both icons and circles
            const handleMouseEnter = (e) => {
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
            updateSiteCounts();

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

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666' }}>
        Loading heritage sites from database...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>Error loading heritage sites</div>
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>{error}</div>
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
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      {/* Map Container */}
      <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', zIndex: 1 }} />

      {/* Heritage Action Buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          maxWidth: 'calc(100vw - 320px)'
        }}
      >
        <button
          onClick={() => navigate('/multiplayer/heritage-quiz')}
          style={{
            background: 'linear-gradient(135deg, #ff9800, #f57c00)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
          }}
        >
          👥 Multiplayer Quiz
        </button>

        <button
          onClick={() => navigate('/heritage-quiz')}
          style={{
            background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(156, 39, 176, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(156, 39, 176, 0.3)';
          }}
        >
          🎯 All India Quiz
        </button>

        <button
          onClick={() => navigate('/storybook-demo')}
          style={{
            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
          }}
        >
          📖 Open Heritage Storybook
        </button>
      </div>

      {/* Home Navigation Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '10px',
          right: '50px',
          background: 'transparent',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
        }}
      >
        🏠 Home
      </button>

      {/* Fly-to Box */}
      <div className="fly-to-box" style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 10, fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', minWidth: '280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <strong>🛫 Fly to Location</strong>
        </div>
        
        {/* Mode Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              value="coordinates"
              checked={searchMode === 'coordinates'}
              onChange={(e) => setSearchMode(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Coordinates
          </label>
          <label>
            <input
              type="radio"
              value="places"
              checked={searchMode === 'places'}
              onChange={(e) => setSearchMode(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Places
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

      {/* Info Panel */}
      <div className="info-panel" style={{ position: 'absolute', top: '100px', right: '10px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 10, fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', maxWidth: '300px', fontSize: '14px' }}>
        <strong>🏛️ Indian Heritage Sites</strong><br />
        <small>Click on any site marker to explore. Sites with 360° views will open in panoramic mode.</small><br />
        <br />
        <strong>Total Sites:</strong> <span id="site-count">0</span><br />
        <strong>UNESCO Sites:</strong> <span id="unesco-count">0</span>
        {error && (
          <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="legend" style={{ position: 'absolute', bottom: '30px', left: '10px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 10, fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', maxWidth: '220px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Site Categories</h4>
        
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

      {/* Sidebar for heritage site details */}
      {sidebarOpen && sidebarData && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '380px', 
          height: '100%', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          zIndex: 2000, 
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)', 
          padding: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '24px', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '22px', 
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                marginBottom: '6px'
              }}>{sidebarData.name}</div>
              <div style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '14px',
                fontWeight: '500',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                backdropFilter: 'blur(10px)'
              }}>{sidebarData.category} • {sidebarData.year}</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                fontSize: '28px', 
                color: '#fff', 
                cursor: 'pointer', 
                lineHeight: '1',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              &times;
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 0, scrollbarWidth: 'thin', scrollbarColor: '#ccc #f0f0f0' }} className="sidebar-scroll">
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
                    navigate(`/heritage-storybook/${formattedName}`);
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
                    navigate(`/sketchfab/${sidebarData.model3d.sketchfabId}`);
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
            navigate(`/trip-planner/${encodeURIComponent(sidebarData.name)}`);
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
      `}} />

      {/* Weather Modal */}
      {weatherModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setWeatherModalOpen(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '40px',
              color: 'white',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setWeatherModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '28px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                lineHeight: '1'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'rotate(0deg)';
              }}
              title="Close (ESC)"
            >
              ×
            </button>

            {/* Header */}
            <div style={{ marginBottom: '30px', paddingRight: '40px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🌤️ Weather at {sidebarData?.name}
              </h2>
              {weatherData?.location && (
                <div style={{ 
                  fontSize: '16px', 
                  opacity: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span>{weatherData.location.name}, {weatherData.location.country}</span>
                  <span>•</span>
                  <span style={{ fontSize: '14px', opacity: 0.8 }}>
                    Updated {new Date(weatherData.fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            {weatherError ? (
              /* Error State */
              <div style={{
                background: 'rgba(255, 87, 87, 0.2)',
                border: '2px solid rgba(255, 87, 87, 0.5)',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
                <div style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '500' }}>
                  {weatherError}
                </div>
                <button 
                  onClick={retryWeather}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  🔄 Retry
                </button>
              </div>
            ) : weatherData ? (
              /* Weather Content */
              <>
                {/* Current Weather */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '30px',
                  backdropFilter: 'blur(10px)',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginTop: 0, 
                    marginBottom: '20px',
                    opacity: 0.9
                  }}>
                    CURRENT CONDITIONS
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px', 
                    marginBottom: '24px' 
                  }}>
                    <img 
                      src={getWeatherIconUrl(weatherData.current.icon)} 
                      alt={weatherData.current.description}
                      style={{ width: '80px', height: '80px' }}
                    />
                    <div>
                      <div style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1' }}>
                        {weatherData.current.temp}°C
                      </div>
                      <div style={{ fontSize: '18px', marginTop: '8px', textTransform: 'capitalize' }}>
                        {weatherData.current.description}
                      </div>
                      <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>
                        Feels like {weatherData.current.feelsLike}°C
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>💧 Humidity</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{weatherData.current.humidity}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>💨 Wind</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {weatherData.current.wind.speed} m/s {weatherData.current.wind.direction}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>🌡️ Pressure</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{weatherData.current.pressure} mb</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>☁️ Cloud Cover</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{weatherData.current.clouds}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>👁️ Visibility</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{weatherData.current.visibility} km</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>🌡️ High/Low</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {weatherData.current.tempMax}° / {weatherData.current.tempMin}°
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast */}
                {weatherData.forecast && weatherData.forecast.length > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '24px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      marginTop: 0, 
                      marginBottom: '20px',
                      opacity: 0.9
                    }}>
                      5-DAY FORECAST
                    </h3>
                    
                    {weatherData.forecast.map((day, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 0',
                          borderBottom: index < weatherData.forecast.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                        }}
                      >
                        <div style={{ flex: '1', fontSize: '16px', fontWeight: '500' }}>
                          {formatWeatherDate(day.date)}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px',
                          flex: '2',
                          justifyContent: 'flex-end'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img 
                              src={getWeatherIconUrl(day.icon)} 
                              alt={day.condition}
                              style={{ width: '40px', height: '40px' }}
                            />
                            <span style={{ fontSize: '14px', minWidth: '80px' }}>{day.condition}</span>
                          </div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '600',
                            minWidth: '100px',
                            textAlign: 'right'
                          }}>
                            {day.tempMax}° / {day.tempMin}°
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ 
                  marginTop: '24px', 
                  textAlign: 'center', 
                  fontSize: '12px', 
                  opacity: 0.7 
                }}>
                  Powered by OpenWeatherMap
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* News Modal */}
      {newsModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setNewsModalOpen(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: 'white',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setNewsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                📰 Latest News
              </h2>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '14px' }}>
                {sidebarData?.name || 'Heritage Site'}
              </p>
            </div>

            {/* Loading State */}
            {newsLoading && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
                <p style={{ opacity: 0.8 }}>Loading latest news...</p>
              </div>
            )}

            {/* Error State */}
            {newsError && !newsLoading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: 'rgba(255, 87, 87, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 87, 87, 0.4)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <p style={{ marginBottom: '16px' }}>{newsError}</p>
                <button
                  onClick={retryNews}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔄 Retry
                </button>
              </div>
            )}

            {/* News Content */}
            {!newsLoading && !newsError && newsData && (
              <>
                {/* Tab Selector */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  padding: '6px'
                }}>
                  <button
                    onClick={() => setNewsTab('monument')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      background: newsTab === 'monument' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                      color: 'white'
                    }}
                  >
                    🏛️ {newsData.monument.name} ({newsData.monument.articles.length})
                  </button>
                  <button
                    onClick={() => setNewsTab('location')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      background: newsTab === 'location' ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                      color: 'white'
                    }}
                  >
                    📍 {newsData.location.city} ({newsData.location.articles.length})
                  </button>
                </div>

                {/* Fallback Indicator */}
                {((newsTab === 'monument' && newsData.monument.fallbackLabel) || 
                  (newsTab === 'location' && newsData.location.fallbackLabel)) && (
                  <div style={{
                    background: 'rgba(255, 193, 7, 0.2)',
                    border: '1px solid rgba(255, 193, 7, 0.4)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>💡</span>
                    <span style={{ opacity: 0.9 }}>
                      {newsTab === 'monument' ? newsData.monument.fallbackLabel : newsData.location.fallbackLabel}
                    </span>
                  </div>
                )}

                {/* Articles List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(newsTab === 'monument' ? newsData.monument.articles : newsData.location.articles).length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                      <p style={{ opacity: 0.8, margin: 0 }}>
                        No recent news found for {newsTab === 'monument' ? newsData.monument.name : newsData.location.city}.
                      </p>
                    </div>
                  ) : (
                    (newsTab === 'monument' ? newsData.monument.articles : newsData.location.articles).map((article, index) => (
                      <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'block'
                        }}
                      >
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '20px',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >
                          {/* Article Title */}
                          <h3 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            margin: 0, 
                            marginBottom: '8px',
                            lineHeight: 1.4
                          }}>
                            {article.title}
                          </h3>
                          
                          {/* Source and Time */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '10px',
                            fontSize: '12px',
                            opacity: 0.7
                          }}>
                            <span style={{ 
                              background: 'rgba(255, 255, 255, 0.15)',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              {article.source}
                            </span>
                            <span>⏰ {article.timeAgo}</span>
                          </div>
                          
                          {/* Description */}
                          <p style={{ 
                            fontSize: '14px', 
                            opacity: 0.9, 
                            margin: 0,
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {article.description}
                          </p>

                          {/* Read More Link */}
                          <div style={{ 
                            marginTop: '12px', 
                            fontSize: '13px', 
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Read Full Article 
                            <span style={{ fontSize: '16px' }}>↗</span>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div style={{ 
                  marginTop: '24px', 
                  textAlign: 'center', 
                  fontSize: '12px', 
                  opacity: 0.6 
                }}>
                  Powered by NewsAPI • Updated: {new Date(newsData.fetchedAt).toLocaleTimeString()}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Heritage Chatbot - Global AI Assistant */}
      <HeritageChatbot />
    </div>
  );
};

function SidebarBlock({ icon, title, summary, onClick, isActive = false, isLoading = false }) {
  return (
    <div
      className="sidebar-block"
      style={{
        padding: '16px 20px',
        margin: '8px 12px',
        borderRadius: '12px',
        cursor: isLoading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isActive 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))' 
          : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: isActive ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: isActive 
          ? '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        opacity: isLoading ? 0.7 : 1,
        color: '#fff',
        transform: isActive ? 'translateX(-4px) scale(1.02)' : 'translateX(0) scale(1)'
      }}
      onClick={!isLoading ? onClick : undefined}
      onMouseEnter={(e) => {
        if (!isLoading && !isActive) {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))';
          e.currentTarget.style.transform = 'translateX(-4px) scale(1.01)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading && !isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'translateX(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }
      }}
    >
      <span style={{ 
        fontSize: '32px', 
        lineHeight: '1',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
      }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: '700', 
          fontSize: '16px', 
          marginBottom: '6px', 
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {title}
          {isActive && (
            <span style={{ 
              fontSize: '14px', 
              background: 'rgba(255,255,255,0.3)',
              padding: '2px 8px',
              borderRadius: '8px',
              fontWeight: '600'
            }}>✓</span>
          )}
          {isLoading && (
            <span style={{ 
              fontSize: '14px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>⏳</span>
          )}
        </div>
        <div style={{ 
          color: 'rgba(255,255,255,0.85)', 
          fontSize: '13px',
          lineHeight: '1.5',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>{summary}</div>
      </div>
    </div>
  );
}

export default HeritagePage;
