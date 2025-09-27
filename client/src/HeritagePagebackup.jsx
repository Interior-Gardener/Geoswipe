import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const HeritagePage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  // Sidebar state
  const [sidebarData, setSidebarData] = useState(null); // null or { info, howToReach, view360, model3d }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Street View Modal state
  const [streetViewModalOpen, setStreetViewModalOpen] = useState(false);
  const [streetViewData, setStreetViewData] = useState(null);
  
  // Search functionality state
  const [searchMode, setSearchMode] = useState('coordinates'); // 'coordinates' or 'places'
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
 // Add new state for API data
  const [heritageSites, setHeritageSites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Heritage sites data - moved outside useEffect for search functionality
  // const heritageSites = {
  //   'type': 'FeatureCollection',
  //   'features': [
  //     // UNESCO World Heritage Sites
  //     { 'type': 'Feature', 'properties': { 'name': 'Ajanta Caves', 'category': 'UNESCO World Heritage', 'year': '2nd century BCE - 480 CE', 'panorama_url': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [75.7033, 20.5522] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Ellora Caves', 'category': 'UNESCO World Heritage', 'year': '600-1000 CE', 'panorama_url': 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [75.1772, 20.0258] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Chhatrapati Shivaji Maharaj Terminus', 'category': 'UNESCO World Heritage', 'year': '1888', 'panorama_url': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8355, 18.9398] } },
      
  //     // Historic Forts
  //     { 'type': 'Feature', 'properties': { 'name': 'Shaniwar Wada', 'category': 'Historic Fort', 'year': '1732', 'panorama_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [73.8553, 18.5196] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Raigad Fort', 'category': 'Historic Fort', 'year': '1656', 'panorama_url': 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4462, 18.2343] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Janjira Fort', 'category': 'Historic Fort', 'year': '15th century', 'panorama_url': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.9613, 18.3006] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Sinhagad Fort', 'category': 'Historic Fort', 'year': '2nd century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.7553, 18.3669] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Pratapgad Fort', 'category': 'Historic Fort', 'year': '1656' }, 'geometry': { 'type': 'Point', 'coordinates': [73.5522, 17.9414] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Daulatabad Fort', 'category': 'Historic Fort', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [75.2347, 19.9372] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Torna Fort', 'category': 'Historic Fort', 'year': '13th century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.6028, 18.2144] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Rajgad Fort', 'category': 'Historic Fort', 'year': '15th century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.6719, 18.2403] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Lohagad Fort', 'category': 'Historic Fort', 'year': '18th century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4850, 18.7108] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Vishalgad Fort', 'category': 'Historic Fort', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [74.0231, 16.7719] } },
      
  //     // Monuments & Tombs
  //     { 'type': 'Feature', 'properties': { 'name': 'Bibi Ka Maqbara', 'category': 'Monument', 'year': '1660', 'panorama_url': 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [75.3204, 19.8974] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Gateway of India', 'category': 'Monument', 'year': '1924', 'panorama_url': 'https://images.unsplash.com/photo-1595402513890-acbc47954481?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8347, 18.9217] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Elephanta Caves', 'category': 'UNESCO World Heritage', 'year': '5th-8th century', 'panorama_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.9311, 18.9633] } },
      
  //     // Rock-cut Architecture
  //     { 'type': 'Feature', 'properties': { 'name': 'Karla Caves', 'category': 'Rock-cut Cave', 'year': '160 BCE' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4844, 18.7458] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Bhaja Caves', 'category': 'Rock-cut Cave', 'year': '2nd century BCE' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4850, 18.7317] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Bedse Caves', 'category': 'Rock-cut Cave', 'year': '1st century BCE' }, 'geometry': { 'type': 'Point', 'coordinates': [73.5033, 18.7481] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Kanheri Caves', 'category': 'Rock-cut Cave', 'year': '1st century BCE - 10th century CE' }, 'geometry': { 'type': 'Point', 'coordinates': [72.9056, 19.2078] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Aurangabad Caves', 'category': 'Rock-cut Cave', 'year': '6th-7th century' }, 'geometry': { 'type': 'Point', 'coordinates': [75.3433, 19.8878] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Lenyadri Caves', 'category': 'Rock-cut Cave', 'year': '1st-3rd century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.6928, 19.1850] } },
      
  //     // Temples
  //     { 'type': 'Feature', 'properties': { 'name': 'Trimbakeshwar Temple', 'category': 'Temple', 'year': '1755' }, 'geometry': { 'type': 'Point', 'coordinates': [73.5311, 19.9317] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Shirdi Sai Baba Temple', 'category': 'Temple', 'year': '20th century' }, 'geometry': { 'type': 'Point', 'coordinates': [74.4769, 19.7669] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Tuljapur Bhavani Temple', 'category': 'Temple', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [76.0683, 18.0089] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Mahalakshmi Temple, Kolhapur', 'category': 'Temple', 'year': '7th century' }, 'geometry': { 'type': 'Point', 'coordinates': [74.2264, 16.7050] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Aundha Nagnath Temple', 'category': 'Temple', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [77.0508, 19.5403] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Grishneshwar Temple', 'category': 'Temple', 'year': '18th century' }, 'geometry': { 'type': 'Point', 'coordinates': [75.1856, 20.0247] } },
      
  //     // Palaces & Museums
  //     { 'type': 'Feature', 'properties': { 'name': 'Aga Khan Palace', 'category': 'Palace', 'year': '1892' }, 'geometry': { 'type': 'Point', 'coordinates': [73.9078, 18.5372] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Raja Dinkar Kelkar Museum', 'category': 'Museum', 'year': '1962' }, 'geometry': { 'type': 'Point', 'coordinates': [73.8550, 18.5092] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Prince of Wales Museum', 'category': 'Museum', 'year': '1922' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8328, 18.9267] } },
      
  //     // Historic Buildings
  //     { 'type': 'Feature', 'properties': { 'name': 'Crawford Market', 'category': 'Historic Building', 'year': '1869' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8364, 18.9472] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'Rajabai Clock Tower', 'category': 'Historic Building', 'year': '1878' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8281, 18.9289] } },
  //     { 'type': 'Feature', 'properties': { 'name': 'High Court Bombay', 'category': 'Historic Building', 'year': '1878' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8322, 18.9300] } }
  //   ]
  // };
  
  // Search functionality
  const filterPlaces = (query) => {
    if (!query.trim()) return [];
    
    const filtered = heritageSites.features
      .filter(site => 
        site.properties.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5) // Limit to 5 results
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
  }, [searchMode]);

  // Enhanced Fly-to functionality with coordinate and place search support
  const handleFlyTo = (e) => {
    e.preventDefault();
    console.log('Fly-to button clicked, mode:', searchMode);
    
    let lat, lon;
    
    if (searchMode === 'coordinates') {
      // Handle coordinate input
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
      // Handle place search
      if (selectedPlace) {
        // Use selected place coordinates
        [lon, lat] = selectedPlace.coordinates;
        console.log('Using selected place:', selectedPlace.name, 'at', lat, lon);
      } else if (searchQuery.trim()) {
        // Try to find exact match or first filtered result
        const matchedPlaces = filterPlaces(searchQuery);
        if (matchedPlaces.length > 0) {
          const place = matchedPlaces[0];
          [lon, lat] = place.coordinates;
          console.log('Using first match:', place.name, 'at', lat, lon);
          // Update selected place
          setSelectedPlace(place);
          setSearchQuery(place.name);
        } else {
          alert('No heritage site found matching your search. Please select from the dropdown or try a different search term.');
          return;
        }
      } else {
        alert('Please search for and select a heritage site');
        return;
      }
    }
    
    // Execute fly-to with coordinates
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
        
        // Hide dropdown if in place search mode
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

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    console.log('Initializing map...');
    const apiKey = 'UItNGCy3GRgJ70RLvqlZ';
    
    // Test API key by fetching the style first
    console.log('Testing API key...');
    fetch(`https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`)
      .then(response => {
        console.log('API response status:', response.status);
        if (response.ok) {
          console.log('API key is valid');
        } else {
          console.error('API key validation failed:', response.status, response.statusText);
        }
        return response.json();
      })
      .then(style => {
        console.log('Style loaded successfully:', !!style);
      })
      .catch(error => {
        console.error('API key test failed:', error);
      });

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

    // Function to get color based on category
    function getCategoryColor(category) {
      return categoryColors[category] || '#74b9ff';
    }

    // Update site counts
    function updateSiteCounts() {
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
        
        // Add navigation controls (zoom buttons)
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        
        console.log('Map initialized successfully');
        
        // Enhanced error handling with retry logic
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
          // Silently handle source data abort - this is normal behavior
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
      
      // Wait a bit for the map to fully stabilize before adding layers
      setTimeout(() => {
        console.log('Adding heritage sites to map...');
        
        try {
          // Add terrain and 3D effects only if not already added
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

          // Add heritage sites source only if not already added
          if (!map.current.getSource('heritage-sites-source')) {
            map.current.addSource('heritage-sites-source', { 
              'type': 'geojson', 
              'data': heritageSites 
            });
          }

      // Add circle layer for better visibility only if not already added
      if (!map.current.getLayer('heritage-sites-circles')) {
        map.current.addLayer({
          'id': 'heritage-sites-circles',
          'type': 'circle',
          'source': 'heritage-sites-source',
        'paint': {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            6, 4,
            10, 8,
            14, 16
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
      }

      // Add text labels only if not already added
      if (!map.current.getLayer('heritage-sites-layer')) {
        map.current.addLayer({ 
          'id': 'heritage-sites-layer', 
          'type': 'symbol', 
          'source': 'heritage-sites-source', 
        'layout': { 
          'text-field': ['get', 'name'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.5,
          'text-justify': 'auto',
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            6, 10,
            10, 12,
            14, 16
          ],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
        }, 
        'paint': { 
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        } 
      });
      }

      // Enhanced click interaction

      map.current.on('click', 'heritage-sites-circles', async (e) => {
        const properties = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Simulate fetching detailed data from API/database
        // Replace this with your real API call
        const fetchDetails = async (siteName) => {
          // Helper function to generate Google Maps Street View iframe URL
          // Using a simpler approach that should work with Google Maps Street View
          const generateStreetViewUrl = (lat, lng, heading = 0, pitch = 0) => {
            // Use the example format provided by the user
            return `https://www.google.com/maps/embed?pb=!4v${Date.now()}!6m8!1m7!1s${lat},${lng}!2m2!1d${lat}!2d${lng}!3f${heading}!4f${pitch}!5f0.7820865974627469`;
          };

          // Simulate: Only Ajanta Caves and Shaniwar Wada have all details, others partial/none
          if (siteName === 'Ajanta Caves') {
            return {
              info: {
                summary: 'Ancient Buddhist cave monuments, UNESCO site.',
                full: 'Ajanta Caves are 30 rock-cut Buddhist cave monuments dating from the 2nd century BCE to about 480 CE in Maharashtra, India.'
              },
              howToReach: {
                summary: 'Nearest city: Aurangabad. Road/train connectivity.',
                full: 'Ajanta Caves are about 100 km from Aurangabad. You can reach by road, taxi, or bus from Aurangabad. Jalgaon is the nearest railway station.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(20.5522, 75.7033, 157.14547735902838, 0),
                full: 'Experience a 360° Street View of Ajanta Caves.'
              },
              model3d: {
                summary: '3D model available.',
                url: '/3dmodels/ajanta',
                full: 'Explore the 3D model of Ajanta Caves.'
              }
            };
          } else if (siteName === 'Shaniwar Wada') {
            return {
              info: {
                summary: 'Historic fortification in Pune.',
                full: 'Shaniwar Wada is an 18th-century fortification in Pune, India. Built in 1732, it was the seat of the Peshwas.'
              },
              howToReach: {
                summary: 'Located in Pune city center.',
                full: 'Shaniwar Wada is easily accessible by road and public transport within Pune.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(18.5196, 73.8553, 45, 0),
                full: 'Experience a 360° Street View of Shaniwar Wada.'
              }
            };
          } else if(siteName === 'Ellora Caves') {
            return {
              info: {
                summary: 'Famous for its monumental caves.',
                full: 'Ellora Caves are one of the largest rock-cut monastery-temple cave complexes in the world, featuring Buddhist, Hindu, and Jain monuments.'
              },
              howToReach: {
                summary: 'Nearest city: Aurangabad. Road/train connectivity.',
                full: 'Ellora Caves are about 30 km from Aurangabad. You can reach by road, taxi, or bus from Aurangabad. Aurangabad is the nearest railway station.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(20.0258, 75.1772, 90, 0),
                full: 'Experience a 360° Street View of Ellora Caves.'
              },
              model3d: {
                summary: '3D model available.',
                url: '/3dmodels/ellora',
                full: 'Explore the 3D model of Ellora Caves.'
              }
            };
          }
          else if(siteName === 'Gateway of India') {
            return {
              info: {
                summary: 'Iconic arch monument in Mumbai.',
                full: 'Gateway of India is a historical monument located in Mumbai, India. It was built in 1924 to commemorate the visit of King George V and Queen Mary to India.'
              },
              howToReach: {
                summary: 'Located in Colaba, easily accessible by road.',
                full: 'Gateway of India is situated in Colaba, Mumbai. It is well connected by local trains, buses, and taxis.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(18.9217, 72.8347, 180, 0),
                full: 'Experience a 360° Street View of Gateway of India.'
              },
              model3d: {
                summary: '3D model available.',
                url: '/3dmodels/gateway',
                full: 'Explore the 3D model of Gateway of India.'
              }
            };
          } else if(siteName === 'Chhatrapati Shivaji Maharaj Terminus') {
            return {
              info: {
                summary: 'Historic railway station, UNESCO World Heritage Site.',
                full: 'Chhatrapati Shivaji Maharaj Terminus is a historic railway station and UNESCO World Heritage Site in Mumbai, India.'
              },
              howToReach: {
                summary: 'Located in Mumbai, accessible by local trains.',
                full: 'CSMT is a major railway station in Mumbai, well connected by local trains and buses.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(18.9398, 72.8355, 270, 0),
                full: 'Experience a 360° Street View of Chhatrapati Shivaji Maharaj Terminus.'
              }
            };
          } else if(siteName === 'Raigad Fort') {
            return {
              info: {
                summary: 'Historic hill fort, capital of Maratha Empire.',
                full: 'Raigad Fort is a hill fort in Maharashtra, India. It was the capital of the Maratha Empire under Chhatrapati Shivaji Maharaj.'
              },
              howToReach: {
                summary: 'Located near Mahad, accessible by road.',
                full: 'Raigad Fort is accessible by road from Mahad. There is a ropeway to reach the fort.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(18.2343, 73.4462, 0, 0),
                full: 'Experience a 360° Street View of Raigad Fort.'
              }
            };
          } else if(siteName === 'Bibi Ka Maqbara') {
            return {
              info: {
                summary: 'Historic tomb monument in Aurangabad.',
                full: 'Bibi Ka Maqbara is a tomb located in Aurangabad, Maharashtra, India. It was built by Mughal emperor Aurangzeb in memory of his wife.'
              },
              howToReach: {
                summary: 'Located in Aurangabad city.',
                full: 'Bibi Ka Maqbara is easily accessible by road within Aurangabad city.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(19.8974, 75.3204, 45, 0),
                full: 'Experience a 360° Street View of Bibi Ka Maqbara.'
              }
            };
          } else if(siteName === 'Elephanta Caves') {
            return {
              info: {
                summary: 'UNESCO World Heritage rock-cut caves.',
                full: 'Elephanta Caves are a collection of cave temples predominantly dedicated to the Hindu god Shiva.'
              },
              howToReach: {
                summary: 'Accessible by ferry from Mumbai.',
                full: 'Elephanta Caves are accessible by ferry from Gateway of India, Mumbai.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(18.9633, 72.9311, 90, 0),
                full: 'Experience a 360° Street View of Elephanta Caves.'
              }
            };
          } else {
            // For other sites, try to generate Street View if available
            const [lon, lat] = coordinates;
            return {
              info: {
                summary: properties.name + ' - Basic information available.',
                full: properties.name + ' - Limited detailed information in database.'
              },
              view360: {
                summary: '360° Street View available.',
                iframeUrl: generateStreetViewUrl(lat, lon, 0, 0),
                full: 'Experience a 360° Street View of ' + properties.name + '.'
              }
            };
          }
        };

        const details = await fetchDetails(properties.name);
        setSidebarData({
          name: properties.name,
          category: properties.category,
          year: properties.year,
          ...details
        });
        setSidebarOpen(true);
      });

      // Enhanced hover effects
      map.current.on('mouseenter', 'heritage-sites-circles', (e) => { 
        map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'heritage-sites-circles', () => { 
        map.current.getCanvas().style.cursor = '';
      });

      // Initialize site counts
      updateSiteCounts();

      // Auto-rotation removed as requested
        
        } catch (error) {
          console.error('Error adding heritage sites:', error);
        }
      }, 500); // Wait 500ms before adding layers
    });

    // Note: handleFlyTo moved outside useEffect to component scope for React onClick handler

    // Close image viewer functionality
    const setupCloseViewer = () => {
      const closeBtn = document.getElementById('close-viewer-btn');
      if (closeBtn) {
        // Remove existing listener if any
        closeBtn.removeEventListener('click', handleCloseViewer);
        closeBtn.addEventListener('click', handleCloseViewer);
      }
    };

    const handleCloseViewer = () => {
      const viewerContainer = document.getElementById('viewer-container');
      const viewer = document.querySelector('#viewer');
      
      if (viewerContainer) {
        viewerContainer.style.display = 'none';
      }
      if (viewer) {
        viewer.innerHTML = '';
      }
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
        
        // Add some helpful default coordinates
        const latInput = document.getElementById('lat-input');
        const lonInput = document.getElementById('lon-input');
        if (latInput && lonInput && !latInput.value && !lonInput.value) {
          latInput.placeholder = '18.52 (Mumbai)';
          lonInput.placeholder = '73.85 (Pune)';
        }
      }, 1000); // Increased timeout to ensure DOM is ready

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (map.current) {
          map.current.remove();
        }
      };
    }, 100); // Close the main setTimeout

  }, []);

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

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      {/* Map Container - First so it's in background */}
      <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', zIndex: 1 }} />

      {/* Fly-to Box */}
      <div className="fly-to-box" style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        zIndex: 10,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minWidth: '280px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <strong>🧭 Fly to Location</strong>
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
              <label style={{ display: 'block', marginBottom: '5px' }}>Latitude:</label>
              <input 
                type="number" 
                id="lat-input" 
                placeholder="19.076" 
                step="0.001" 
                min="-90" 
                max="90" 
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Longitude:</label>
              <input 
                type="number" 
                id="lon-input" 
                placeholder="72.877" 
                step="0.001" 
                min="-180" 
                max="180" 
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} 
              />
            </div>
          </div>
        )}

        {/* Place Search Mode */}
        {searchMode === 'places' && (
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Search Heritage Site:</label>
            <input 
              type="text" 
              id="place-search-input"
              placeholder="Type place name (e.g., Aja for Ajanta)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (filteredPlaces.length > 0) setShowDropdown(true);
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
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderTop: 'none',
                borderBottomLeftRadius: '3px',
                borderBottomRightRadius: '3px',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {filteredPlaces.map((place, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handlePlaceSelect(place)}
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderBottom: index < filteredPlaces.length - 1 ? '1px solid #eee' : 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '13px' }}>{place.name}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{place.category}</div>
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
          {searchMode === 'coordinates' ? 'Fly to Coordinates' : 'Fly to Place'}
        </button>
      </div>

      {/* Info Panel */}
      {/* ...existing code... */}
      <div className="info-panel" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        zIndex: 10,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: '300px',
        fontSize: '14px'
      }}>
        <strong>🏛️ Maharashtra Heritage Sites</strong><br />
        <small>Click on any site marker to explore. Sites with 360° views will open in panoramic mode.</small><br /><br />
        <strong>Total Sites:</strong> <span id="site-count">0</span><br />
        <strong>UNESCO Sites:</strong> <span id="unesco-count">0</span>
      </div>

      {/* Legend */}
      {/* ...existing code... */}
      <div className="legend" style={{
        position: 'absolute',
        bottom: '30px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        zIndex: 10,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: '200px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🗺️ Site Categories</h4>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#ff6b6b' }}></div>
          <span>UNESCO World Heritage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#4ecdc4' }}></div>
          <span>Historic Forts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#45b7d1' }}></div>
          <span>Rock-cut Caves</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#f9ca24' }}></div>
          <span>Temples</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#6c5ce7' }}></div>
          <span>Monuments</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#a29bfe' }}></div>
          <span>Palaces & Museums</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#fd79a8' }}></div>
          <span>Historic Buildings</span>
        </div>
      </div>

      {/* Sidebar for heritage site details */}
      {sidebarOpen && sidebarData && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 350,
          height: '100%',
          background: 'rgba(255,255,255,0.98)',
          zIndex: 2000,
          boxShadow: '-4px 0 16px rgba(0,0,0,0.2)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <div style={{ padding: '20px 20px 10px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 20 }}>{sidebarData.name}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{sidebarData.category} &middot; {sidebarData.year}</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
          </div>
          {/* Info Block */}
          {sidebarData.info && (
            <SidebarBlock
              icon="📄"
              title="Information"
              summary={sidebarData.info.summary}
              onClick={() => window.open(`/heritage/info/${encodeURIComponent(sidebarData.name)}`, '_blank')}
            />
          )}
          {/* How to Reach Block */}
          {sidebarData.howToReach && (
            <SidebarBlock
              icon="🗺️"
              title="How to Reach"
              summary={sidebarData.howToReach.summary}
              onClick={() => window.open(`/heritage/howtoreach/${encodeURIComponent(sidebarData.name)}`, '_blank')}
            />
          )}
          {/* 360 View Block */}
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
              icon="🧊"
              title="3D Model"
              summary={sidebarData.model3d.summary}
              onClick={() => {
                // Add more models here as needed
                if (sidebarData.name === 'Ajanta Caves') {
                  navigate('/sketchfab/d916f1bc949c4284ab3fe56ddbfe660d');
                }
                else if(sidebarData.name === 'Ellora Caves') {
                  navigate('/sketchfab/1a5ec1e212f9451e80dc051e97164d17');
                } else if (sidebarData.name === 'Gateway of India') {
                  navigate('/sketchfab/38a652e9f3bf49039026ef65ef61ac92');
                } else {
                  window.open(sidebarData.model3d.url, '_blank');
                }
              }}
            />
          )}
        </div>
      )}

      {/* Full-Screen Street View Modal */}
      {streetViewModalOpen && streetViewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          {/* Modal Header */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                🌐 {streetViewData.name}
              </h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                {streetViewData.full}
              </p>
            </div>
            <button
              onClick={() => setStreetViewModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '32px',
                color: '#666',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
          
          {/* Street View Iframe */}
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#000'
          }}>
            <iframe
              src={streetViewData.iframeUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`360° Street View of ${streetViewData.name}`}
            />
          </div>
          
          {/* Modal Footer */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#666',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
          }}>
            <p style={{ margin: 0 }}>
              Use your mouse to explore the 360° view • Press <strong>ESC</strong> or click <strong>×</strong> to close
            </p>
          </div>
        </div>
      )}

      {/* Add custom styles for popups */}
      {/* ...existing code... */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .maplibregl-popup-content { 
            background-color: #333 !important; 
            color: #fff !important; 
            padding: 15px !important; 
            border-radius: 8px !important; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
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
          .sidebar-block:hover {
            background: #f0f4ff !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          }
          .dropdown-item:hover {
            background-color: #f5f5f5 !important;
          }
          .fly-to-box input:focus {
            outline: none;
            border-color: #007cba;
            box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
          }
          .fly-to-box button:hover {
            background: #005fa3 !important;
          }

        `
      }} />
    </div>
  );

function SidebarBlock({ icon, title, summary, onClick }) {
  return (
    <div
      className="sidebar-block"
      style={{
        padding: '18px 20px',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: 28, marginRight: 12 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{title}</div>
        <div style={{ color: '#444', fontSize: 14 }}>{summary}</div>
      </div>
    </div>
  );
};
};

export default HeritagePage;
