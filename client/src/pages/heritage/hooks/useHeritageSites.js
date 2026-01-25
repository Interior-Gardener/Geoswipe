import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const useHeritageSites = () => {
  const [heritageSites, setHeritageSites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const fetchHeritageSites = useCallback(async () => {
    // Check cache first
    const cached = cacheRef.current.get('heritage-sites');
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      setHeritageSites(cached.data);
      setLoading(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/heritage-sites/geojson`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      cacheRef.current.set('heritage-sites', {
        data,
        timestamp: Date.now(),
      });

      setHeritageSites(data);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch heritage sites:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHeritageSites = useCallback(() => {
    cacheRef.current.delete('heritage-sites');
    fetchHeritageSites();
  }, [fetchHeritageSites]);

  useEffect(() => {
    fetchHeritageSites();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHeritageSites]);

  return {
    heritageSites,
    loading,
    error,
    refreshHeritageSites,
  };
};

export const useStoryBookCheck = () => {
  const checkStoryBookAvailable = useCallback(async (siteName) => {
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
      } catch (error) {
        console.warn(`Could not check storybook at ${path}:`, error);
      }
    }
    return false;
  }, []);

  return { checkStoryBookAvailable };
};