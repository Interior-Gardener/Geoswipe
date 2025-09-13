import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const HeritagePage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const viewer = useRef(null);

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

    const heritageSites = {
      'type': 'FeatureCollection',
      'features': [
        // UNESCO World Heritage Sites
        { 'type': 'Feature', 'properties': { 'name': 'Ajanta Caves', 'category': 'UNESCO World Heritage', 'year': '2nd century BCE - 480 CE', 'panorama_url': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [75.7033, 20.5522] } },
        { 'type': 'Feature', 'properties': { 'name': 'Ellora Caves', 'category': 'UNESCO World Heritage', 'year': '600-1000 CE', 'panorama_url': 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [75.1772, 20.0258] } },
        { 'type': 'Feature', 'properties': { 'name': 'Chhatrapati Shivaji Maharaj Terminus', 'category': 'UNESCO World Heritage', 'year': '1888', 'panorama_url': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8355, 18.9398] } },
        
        // Historic Forts
        { 'type': 'Feature', 'properties': { 'name': 'Shaniwar Wada', 'category': 'Historic Fort', 'year': '1732', 'panorama_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [73.8553, 18.5196] } },
        { 'type': 'Feature', 'properties': { 'name': 'Raigad Fort', 'category': 'Historic Fort', 'year': '1656', 'panorama_url': 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4462, 18.2343] } },
        { 'type': 'Feature', 'properties': { 'name': 'Janjira Fort', 'category': 'Historic Fort', 'year': '15th century', 'panorama_url': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.9613, 18.3006] } },
        { 'type': 'Feature', 'properties': { 'name': 'Sinhagad Fort', 'category': 'Historic Fort', 'year': '2nd century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.7553, 18.3669] } },
        { 'type': 'Feature', 'properties': { 'name': 'Pratapgad Fort', 'category': 'Historic Fort', 'year': '1656' }, 'geometry': { 'type': 'Point', 'coordinates': [73.5522, 17.9414] } },
        { 'type': 'Feature', 'properties': { 'name': 'Daulatabad Fort', 'category': 'Historic Fort', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [75.2347, 19.9372] } },
        { 'type': 'Feature', 'properties': { 'name': 'Torna Fort', 'category': 'Historic Fort', 'year': '13th century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.6028, 18.2144] } },
        { 'type': 'Feature', 'properties': { 'name': 'Rajgad Fort', 'category': 'Historic Fort', 'year': '15th century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.6719, 18.2403] } },
        { 'type': 'Feature', 'properties': { 'name': 'Lohagad Fort', 'category': 'Historic Fort', 'year': '18th century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4850, 18.7108] } },
        { 'type': 'Feature', 'properties': { 'name': 'Vishalgad Fort', 'category': 'Historic Fort', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [74.0231, 16.7719] } },
        
        // Monuments & Tombs
        { 'type': 'Feature', 'properties': { 'name': 'Bibi Ka Maqbara', 'category': 'Monument', 'year': '1660', 'panorama_url': 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [75.3204, 19.8974] } },
        { 'type': 'Feature', 'properties': { 'name': 'Gateway of India', 'category': 'Monument', 'year': '1924', 'panorama_url': 'https://images.unsplash.com/photo-1595402513890-acbc47954481?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8347, 18.9217] } },
        { 'type': 'Feature', 'properties': { 'name': 'Elephanta Caves', 'category': 'UNESCO World Heritage', 'year': '5th-8th century', 'panorama_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop' }, 'geometry': { 'type': 'Point', 'coordinates': [72.9311, 18.9633] } },
        
        // Rock-cut Architecture
        { 'type': 'Feature', 'properties': { 'name': 'Karla Caves', 'category': 'Rock-cut Cave', 'year': '160 BCE' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4844, 18.7458] } },
        { 'type': 'Feature', 'properties': { 'name': 'Bhaja Caves', 'category': 'Rock-cut Cave', 'year': '2nd century BCE' }, 'geometry': { 'type': 'Point', 'coordinates': [73.4850, 18.7317] } },
        { 'type': 'Feature', 'properties': { 'name': 'Bedse Caves', 'category': 'Rock-cut Cave', 'year': '1st century BCE' }, 'geometry': { 'type': 'Point', 'coordinates': [73.5033, 18.7481] } },
        { 'type': 'Feature', 'properties': { 'name': 'Kanheri Caves', 'category': 'Rock-cut Cave', 'year': '1st century BCE - 10th century CE' }, 'geometry': { 'type': 'Point', 'coordinates': [72.9056, 19.2078] } },
        { 'type': 'Feature', 'properties': { 'name': 'Aurangabad Caves', 'category': 'Rock-cut Cave', 'year': '6th-7th century' }, 'geometry': { 'type': 'Point', 'coordinates': [75.3433, 19.8878] } },
        { 'type': 'Feature', 'properties': { 'name': 'Lenyadri Caves', 'category': 'Rock-cut Cave', 'year': '1st-3rd century' }, 'geometry': { 'type': 'Point', 'coordinates': [73.6928, 19.1850] } },
        
        // Temples
        { 'type': 'Feature', 'properties': { 'name': 'Trimbakeshwar Temple', 'category': 'Temple', 'year': '1755' }, 'geometry': { 'type': 'Point', 'coordinates': [73.5311, 19.9317] } },
        { 'type': 'Feature', 'properties': { 'name': 'Shirdi Sai Baba Temple', 'category': 'Temple', 'year': '20th century' }, 'geometry': { 'type': 'Point', 'coordinates': [74.4769, 19.7669] } },
        { 'type': 'Feature', 'properties': { 'name': 'Tuljapur Bhavani Temple', 'category': 'Temple', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [76.0683, 18.0089] } },
        { 'type': 'Feature', 'properties': { 'name': 'Mahalakshmi Temple, Kolhapur', 'category': 'Temple', 'year': '7th century' }, 'geometry': { 'type': 'Point', 'coordinates': [74.2264, 16.7050] } },
        { 'type': 'Feature', 'properties': { 'name': 'Aundha Nagnath Temple', 'category': 'Temple', 'year': '12th century' }, 'geometry': { 'type': 'Point', 'coordinates': [77.0508, 19.5403] } },
        { 'type': 'Feature', 'properties': { 'name': 'Grishneshwar Temple', 'category': 'Temple', 'year': '18th century' }, 'geometry': { 'type': 'Point', 'coordinates': [75.1856, 20.0247] } },
        
        // Palaces & Museums
        { 'type': 'Feature', 'properties': { 'name': 'Aga Khan Palace', 'category': 'Palace', 'year': '1892' }, 'geometry': { 'type': 'Point', 'coordinates': [73.9078, 18.5372] } },
        { 'type': 'Feature', 'properties': { 'name': 'Raja Dinkar Kelkar Museum', 'category': 'Museum', 'year': '1962' }, 'geometry': { 'type': 'Point', 'coordinates': [73.8550, 18.5092] } },
        { 'type': 'Feature', 'properties': { 'name': 'Prince of Wales Museum', 'category': 'Museum', 'year': '1922' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8328, 18.9267] } },
        
        // Historic Buildings
        { 'type': 'Feature', 'properties': { 'name': 'Crawford Market', 'category': 'Historic Building', 'year': '1869' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8364, 18.9472] } },
        { 'type': 'Feature', 'properties': { 'name': 'Rajabai Clock Tower', 'category': 'Historic Building', 'year': '1878' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8281, 18.9289] } },
        { 'type': 'Feature', 'properties': { 'name': 'High Court Bombay', 'category': 'Historic Building', 'year': '1878' }, 'geometry': { 'type': 'Point', 'coordinates': [72.8322, 18.9300] } }
      ]
    };

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
      map.current.on('click', 'heritage-sites-circles', (e) => {
        const properties = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();
        const panoramaUrl = properties.panorama_url;
        
        let popupContent = `
          <div class="popup-category">${properties.category}</div>
          <div class="popup-title">${properties.name}</div>
          <div class="popup-year">${properties.year}</div>
        `;
        
        if (panoramaUrl) {
          popupContent += '<br><small>Click to view panorama</small>';
          
          // Show panorama in viewer
          const viewerContainer = document.getElementById('viewer-container');
          const viewerDiv = document.querySelector('#viewer');
          
          viewerDiv.innerHTML = `<img src="${panoramaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${properties.name}">`;
          viewerContainer.style.display = 'block';
        }

        new maplibregl.Popup({ closeOnClick: false })
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map.current);
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

    // Fly-to functionality with better error handling
    const handleFlyTo = (e) => {
      e.preventDefault();
      console.log('Fly-to button clicked');
      
      const latInput = document.getElementById('lat-input');
      const lonInput = document.getElementById('lon-input');
      
      console.log('Input elements found:', !!latInput, !!lonInput);
      
      if (latInput && lonInput) {
        const latValue = latInput.value.trim();
        const lonValue = lonInput.value.trim();
        
        console.log('Input values:', latValue, lonValue);
        
        const lat = parseFloat(latValue);
        const lon = parseFloat(lonValue);
        
        console.log('Parsed coordinates:', lat, lon);
        
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          console.log('Flying to:', lat, lon);
          if (map.current && map.current.isStyleLoaded()) {
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
            } catch (error) {
              console.error('Error during flyTo:', error);
            }
          } else if (map.current) {
            console.log('Map not fully loaded, waiting...');
            // Wait for map to be ready
            map.current.once('idle', () => {
              map.current.flyTo({ 
                center: [lon, lat], 
                zoom: 14, 
                pitch: 60,
                bearing: -15,
                essential: true,
                duration: 3000
              });
              console.log('FlyTo command executed after map idle');
            });
          } else {
            console.error('Map not initialized');
          }
        } else {
          alert('Please enter valid coordinates (Lat: -90 to 90, Lon: -180 to 180)');
        }
      } else {
        console.error('Input elements not found');
        alert('Input fields not found');
      }
    };

    const setupFlyTo = () => {
      const flyToButton = document.getElementById('fly-to-button');
      console.log('Setting up fly-to button:', !!flyToButton);
      if (flyToButton) {
        // Remove existing listener if any
        flyToButton.removeEventListener('click', handleFlyTo);
        flyToButton.addEventListener('click', handleFlyTo);
        console.log('Fly-to button listener added');
      }
    };

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
        setupFlyTo();
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
        maxWidth: '250px'
      }}>
        <strong>🧭 Fly to Location</strong><br /><br />
        <label>Lat:</label> <input type="number" id="lat-input" placeholder="19.076" step="0.001" min="-90" max="90" style={{ marginRight: '5px', width: '80px', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} />
        <label>Lon:</label> <input type="number" id="lon-input" placeholder="72.877" step="0.001" min="-180" max="180" style={{ marginRight: '5px', width: '80px', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} />
        <button id="fly-to-button" style={{ padding: '5px 10px', background: '#007cba', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Go</button>
      </div>

      {/* Info Panel */}
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


      {/* Viewer Container */}
      <div id="viewer-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, background: 'black', display: 'none' }}>
        <button id="close-viewer-btn" style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1001, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '24px', cursor: 'pointer', transition: 'background 0.3s' }}>&times;</button>
        <div id="viewer" style={{ width: '100%', height: '100%' }}></div>
      </div>

      {/* Add custom styles for popups */}
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
        `
      }} />
    </div>
  );
};

export default HeritagePage;
