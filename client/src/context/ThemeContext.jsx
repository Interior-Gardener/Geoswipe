import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'geoswipe:heritage:theme:v1';
const THEMES = {
  light: 'light',
  dark: 'dark'
};

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return THEMES.dark;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === THEMES.light || stored === THEMES.dark) {
      return stored;
    }
  } catch {
    // Ignore storage read failures.
  }

  const prefersLight =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches;

  return prefersLight ? THEMES.light : THEMES.dark;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  const setTheme = useCallback((nextTheme) => {
    const normalized = nextTheme === THEMES.light ? THEMES.light : THEMES.dark;
    setThemeState(normalized);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        // Ignore storage write failures.
      }
    }

    return normalized;
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEMES.dark ? THEMES.light : THEMES.dark);
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isLight: theme === THEMES.light,
      isDark: theme === THEMES.dark
    }),
    [setTheme, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
