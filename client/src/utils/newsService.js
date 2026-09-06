// client/src/utils/newsService.js
// Frontend service for fetching heritage site news from backend

import { API_BASE_URL } from './apiConfig';
import { reportApiFailure, reportNetworkFailure } from './apiError';

// Session-based cache for news data (fetches once per session per site)
const newsSessionCache = new Map();

/**
 * Get cache key for a site
 * @param {string} siteName - Heritage site name
 * @returns {string} - Cache key
 */
function getCacheKey(siteName) {
  return siteName.toLowerCase().trim();
}

/**
 * Check if news is cached for current session
 * @param {string} siteName - Heritage site name
 * @returns {Object|null} - Cached news data or null
 */
function getFromSessionCache(siteName) {
  const key = getCacheKey(siteName);
  
  if (newsSessionCache.has(key)) {
    console.log(`📰 Using session-cached news for ${siteName}`);
    return newsSessionCache.get(key);
  }
  
  return null;
}

/**
 * Store news in session cache
 * @param {string} siteName - Heritage site name
 * @param {Object} newsData - News data to cache
 */
function storeInSessionCache(siteName, newsData) {
  const key = getCacheKey(siteName);
  newsSessionCache.set(key, newsData);
  console.log(`📰 Cached news for ${siteName}`);
}

/**
 * Clear all cached news
 */
export function clearNewsCache() {
  newsSessionCache.clear();
  console.log('📰 News cache cleared');
}

/**
 * Fetch news for a heritage site from backend
 * @param {string} siteName - Name of the heritage site
 * @returns {Promise<Object>} - News data with monument and location articles
 */
export async function fetchHeritageNews(siteName) {
  try {
    if (!siteName) {
      throw new Error('Site name is required');
    }

    console.log(`📰 Fetching news for: ${siteName}`);

    // Check session cache first (once per session)
    const cachedNews = getFromSessionCache(siteName);
    if (cachedNews) {
      return cachedNews;
    }

    // Fetch from backend
    const url = `${API_BASE_URL}/api/news/${encodeURIComponent(siteName)}`;

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (networkError) {
      throw reportNetworkFailure(networkError, 'Heritage news', url);
    }

    if (!response.ok) {
      const reported = await reportApiFailure(response, 'Heritage news', url);
      if (response.status === 404) {
        throw new Error('Heritage site not found');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw reported;
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('News fetch was not successful');
    }

    console.log(`✅ News fetched for ${siteName}`);

    // Store in session cache
    storeInSessionCache(siteName, data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    throw error;
  }
}

/**
 * Check if a site has cached news
 * @param {string} siteName - Heritage site name
 * @returns {boolean} - True if cached
 */
export function isCached(siteName) {
  return newsSessionCache.has(getCacheKey(siteName));
}
