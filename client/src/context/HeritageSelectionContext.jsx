import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from '../utils/heritageNavigationState';

const STORAGE_KEY = 'geoswipe:heritage:selected-monument:v1';

const HeritageSelectionContext = createContext(null);

function readStoredSelection() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return normalizeMonumentSelection(parsed);
  } catch {
    return null;
  }
}

function writeStoredSelection(value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!value) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore localStorage write failures.
  }
}

export function HeritageSelectionProvider({ children }) {
  const [selectedMonument, setSelectedMonumentState] = useState(() => readStoredSelection());

  const setSelectedMonument = useCallback((monument) => {
    const normalized = normalizeMonumentSelection(monument);
    setSelectedMonumentState(normalized);
    return normalized;
  }, []);

  const clearSelectedMonument = useCallback(() => {
    setSelectedMonumentState(null);
  }, []);

  const hydrateSelectionFromRoute = useCallback((routeState) => {
    const normalized = extractMonumentFromRouteState(routeState);
    if (normalized) {
      setSelectedMonumentState(normalized);
    }
    return normalized;
  }, []);

  useEffect(() => {
    writeStoredSelection(selectedMonument);
  }, [selectedMonument]);

  const contextValue = useMemo(
    () => ({
      selectedMonument,
      setSelectedMonument,
      clearSelectedMonument,
      hydrateSelectionFromRoute
    }),
    [selectedMonument, setSelectedMonument, clearSelectedMonument, hydrateSelectionFromRoute]
  );

  return (
    <HeritageSelectionContext.Provider value={contextValue}>
      {children}
    </HeritageSelectionContext.Provider>
  );
}

export function useHeritageSelection() {
  const context = useContext(HeritageSelectionContext);
  if (!context) {
    throw new Error('useHeritageSelection must be used inside HeritageSelectionProvider');
  }
  return context;
}
