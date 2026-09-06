import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import WelcomeGuide from './WelcomeGuide';
import './AppNav.css';

/**
 * Destinations reachable from anywhere in the app.
 * Previously every page rolled its own back/home button at a hardcoded
 * position, so there was no consistent way to move around the product.
 */
const DESTINATIONS = [
  { path: '/', icon: '🏠', label: 'Home', hint: 'Landing page' },
  { path: '/explore', icon: '🌍', label: 'Explore', hint: '3D globe & games' },
  { path: '/heritage', icon: '🏛️', label: 'Heritage', hint: 'Indian heritage map' },
  { path: '/trip-planner', icon: '🧭', label: 'Trip Planner', hint: 'Build an itinerary' },
  { path: '/safety-navigation', icon: '🛡️', label: 'Safety', hint: 'Routes & emergency info' },
];

const AppNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isLight } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const activePath = useMemo(() => {
    const match = DESTINATIONS.filter(
      (d) => d.path !== '/' && location.pathname.startsWith(d.path)
    ).sort((a, b) => b.path.length - a.path.length)[0];
    return match ? match.path : location.pathname === '/' ? '/' : null;
  }, [location.pathname]);

  const go = useCallback(
    (path) => {
      setMenuOpen(false);
      navigate(path);
    },
    [navigate]
  );

  return (
    <>
      <nav className="app-nav" aria-label="Main navigation">
        <div className="app-nav__cluster">
          <button
            type="button"
            className={`app-nav__btn app-nav__btn--menu${menuOpen ? ' is-active' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
          </button>

          <span className="app-nav__divider" aria-hidden="true" />

          <button
            type="button"
            className="app-nav__btn gs-tip gs-tip--below"
            data-tip={isLight ? 'Switch to dark' : 'Switch to light'}
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          <button
            type="button"
            className="app-nav__btn gs-tip gs-tip--below"
            data-tip="What is GeoSwipe?"
            onClick={() => setGuideOpen(true)}
            aria-label="Open the GeoSwipe guide"
          >
            <span aria-hidden="true">?</span>
          </button>
        </div>

        {menuOpen && (
          <>
            {/* Click-away layer so the menu closes when the map is clicked. */}
            <div
              className="app-nav__scrim"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="app-nav__menu gs-animate-scale" role="menu">
              <p className="app-nav__menu-label">Go to</p>
              {DESTINATIONS.map((destination) => (
                <button
                  key={destination.path}
                  type="button"
                  role="menuitem"
                  className={`app-nav__item${activePath === destination.path ? ' is-current' : ''}`}
                  onClick={() => go(destination.path)}
                >
                  <span className="app-nav__item-icon" aria-hidden="true">{destination.icon}</span>
                  <span className="app-nav__item-text">
                    <span className="app-nav__item-label">{destination.label}</span>
                    <span className="app-nav__item-hint">{destination.hint}</span>
                  </span>
                  {activePath === destination.path && (
                    <span className="app-nav__item-current" aria-label="Current page">●</span>
                  )}
                </button>
              ))}

              <div className="app-nav__menu-footer">
                <button
                  type="button"
                  className="app-nav__footer-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    setGuideOpen(true);
                  }}
                >
                  <span aria-hidden="true">📖</span> How GeoSwipe works
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      <WelcomeGuide open={guideOpen} onClose={() => setGuideOpen(false)} onNavigate={go} />
    </>
  );
};

export default AppNav;
