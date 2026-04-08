// OpenWeatherMap API Service
// Handles weather data fetching with caching for Heritage Mode

const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Simple cache implementation
const weatherCache = {
  data: new Map(),
  timestamps: new Map(),
  
  set(key, value) {
    this.data.set(key, value);
    this.timestamps.set(key, Date.now());
  },
  
  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > CACHE_DURATION) {
      // Cache expired
      this.data.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.data.get(key);
  },
  
  has(key) {
    return this.get(key) !== null;
  }
};

/**
 * Generate cache key from coordinates
 */
function getCacheKey(lat, lon) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

/**
 * Fetch current weather data
 */
async function fetchCurrentWeather(lat, lon) {
  const url = `${OPENWEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key configuration');
    } else if (response.status === 429) {
      throw new Error('Weather service temporarily unavailable. Please try again later.');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }
  }
  
  return await response.json();
}

/**
 * Fetch 5-day forecast data (3-hour intervals)
 */
async function fetchForecast(lat, lon) {
  const url = `${OPENWEATHER_API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key configuration');
    } else if (response.status === 429) {
      throw new Error('Weather service temporarily unavailable. Please try again later.');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch forecast data');
    }
  }
  
  return await response.json();
}

/**
 * Group forecast data by day (daily summary)
 */
function groupForecastByDay(forecastData) {
  const dailyData = {};
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        dateObj: date,
        temps: [],
        conditions: [],
        icons: [],
        humidity: [],
        wind: []
      };
    }
    
    dailyData[dateKey].temps.push(item.main.temp);
    dailyData[dateKey].conditions.push(item.weather[0].main);
    dailyData[dateKey].icons.push(item.weather[0].icon);
    dailyData[dateKey].humidity.push(item.main.humidity);
    dailyData[dateKey].wind.push(item.wind.speed);
  });
  
  // Process into daily summaries
  const dailySummaries = Object.values(dailyData).map(day => {
    const tempMax = Math.round(Math.max(...day.temps));
    const tempMin = Math.round(Math.min(...day.temps));
    
    // Most common condition during the day
    const conditionCounts = {};
    day.conditions.forEach(cond => {
      conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
    });
    const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
      conditionCounts[a] > conditionCounts[b] ? a : b
    );
    
    // Most representative icon (from afternoon if available)
    const afternoonIcons = day.icons.filter(icon => icon.includes('d'));
    const representativeIcon = afternoonIcons.length > 0 
      ? afternoonIcons[Math.floor(afternoonIcons.length / 2)]
      : day.icons[Math.floor(day.icons.length / 2)];
    
    return {
      date: day.dateObj,
      dateStr: day.date,
      tempMax,
      tempMin,
      condition: mostCommonCondition,
      icon: representativeIcon,
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWind: Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length)
    };
  });
  
  // Return first 5 days
  return dailySummaries.slice(0, 5);
}

/**
 * Get weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Format date for display
 */
export function formatWeatherDate(date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateObj = new Date(date);
  
  // Check if today
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if tomorrow
  if (dateObj.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Return day name + date
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Main function: Fetch complete weather data (current + forecast)
 * Uses caching to minimize API calls
 */
export async function fetchWeatherData(lat, lon) {
  // Validate coordinates
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid location coordinates');
  }
  
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error('Coordinates out of valid range');
  }
  
  // Validate API key
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }
  
  // Check cache
  const cacheKey = getCacheKey(lat, lon);
  const cachedData = weatherCache.get(cacheKey);
  
  if (cachedData) {
    console.log('🌤️ Using cached weather data for', cacheKey);
    return cachedData;
  }
  
  console.log('🌤️ Fetching fresh weather data for', cacheKey);
  
  try {
    // Fetch both current weather and forecast in parallel
    const [currentData, forecastData] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon)
    ]);
    
    // Process forecast into daily summaries
    const dailyForecast = groupForecastByDay(forecastData);
    
    // Combine data
    const weatherData = {
      location: {
        name: currentData.name,
        country: currentData.sys.country,
        coordinates: {
          lat: currentData.coord.lat,
          lon: currentData.coord.lon
        }
      },
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        tempMin: Math.round(currentData.main.temp_min),
        tempMax: Math.round(currentData.main.temp_max),
        pressure: currentData.main.pressure,
        humidity: currentData.main.humidity,
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        wind: {
          speed: currentData.wind.speed,
          deg: currentData.wind.deg,
          direction: getWindDirection(currentData.wind.deg)
        },
        clouds: currentData.clouds.all,
        visibility: currentData.visibility / 1000, // Convert to km
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        timestamp: currentData.dt
      },
      forecast: dailyForecast,
      fetchedAt: new Date().toISOString()
    };
    
    // Store in cache
    weatherCache.set(cacheKey, weatherData);
    
    console.log('✅ Weather data fetched and cached');
    
    return weatherData;
    
  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Get wind direction from degrees
 */
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Clear cache (for testing or manual refresh)
 */
export function clearWeatherCache() {
  weatherCache.data.clear();
  weatherCache.timestamps.clear();
  console.log('🗑️ Weather cache cleared');
}
