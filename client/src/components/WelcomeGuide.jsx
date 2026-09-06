import React, { useCallback, useEffect, useState } from 'react';
import './WelcomeGuide.css';

const STORAGE_KEY = 'geoswipe:guide:seen:v1';

const FEATURES = [
  {
    icon: '🌍',
    title: 'Explore the globe',
    path: '/explore',
    body: 'Spin a photoreal 3D Earth, click any country, and jump into geography games — solo or head-to-head with a friend.',
  },
  {
    icon: '🏛️',
    title: 'Heritage Mode',
    path: '/heritage',
    body: 'An interactive map of India’s heritage sites. Open a monument for its history, photos, 360° views, 3D models and live news.',
  },
  {
    icon: '🧭',
    title: 'Plan a trip',
    path: '/trip-planner',
    body: 'Pick a monument, set your days, budget and interests, and get an AI day-by-day itinerary with cost estimates and booking links.',
  },
  {
    icon: '🛡️',
    title: 'Travel safely',
    path: '/safety-navigation',
    body: 'Compare safer routes, find nearby hospitals and police, check local alerts and keep emergency numbers one tap away.',
  },
  {
    icon: '💬',
    title: 'Ask the AI guide',
    body: 'The Heritage Assistant answers questions about monuments, architecture and travel tips — look for “Ask AI” in Heritage Mode.',
  },
  {
    icon: '✋',
    title: 'Control it with gestures',
    body: 'Allow camera access and steer the globe with your hand: open palm moves the cursor, an OK sign clicks. A mouse works everywhere too.',
  },
];

const STEPS = [
  { n: 1, text: 'Start on the globe or open Heritage Mode from the menu.' },
  { n: 2, text: 'Click a country or a monument marker to open its details.' },
  { n: 3, text: 'From a monument you can plan a trip, take a quiz, or read its storybook.' },
  { n: 4, text: 'Use ☰ at the top-right to move between sections at any time.' },
];

/**
 * First-run explainer. Opens automatically the first time someone visits and
 * is re-openable from the "?" control in the global nav.
 */
const WelcomeGuide = ({ open, onClose, onNavigate }) => {
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        // Let the page paint before interrupting.
        const timer = setTimeout(() => setAutoOpen(true), 900);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable (private mode) - simply don't auto-open.
    }
    return undefined;
  }, []);

  const isOpen = open || autoOpen;

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore storage failures; the guide stays reachable from the nav.
    }
    setAutoOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="gs-overlay guide-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="gs-modal gs-modal--full guide-modal">
        <header className="gs-modal__header guide-modal__header">
          <div>
            <p className="gs-overline guide-modal__eyebrow">Welcome to</p>
            <h2 className="guide-modal__title" id="guide-title">
              Geo<span className="guide-modal__title-accent">Swipe</span>
            </h2>
            <p className="guide-modal__lede">
              An interactive way to explore the world — and India’s heritage — through a 3D globe,
              maps, games, AI trip planning and hand-gesture controls.
            </p>
          </div>
          <button type="button" className="gs-modal__close" onClick={dismiss} aria-label="Close guide">
            ×
          </button>
        </header>

        <div className="gs-modal__body guide-modal__body gs-scroll">
          <section>
            <h3 className="guide-section-title">What you can do</h3>
            <div className="guide-grid gs-stagger">
              {FEATURES.map((feature) => {
                const clickable = Boolean(feature.path && onNavigate);
                return (
                  <div
                    key={feature.title}
                    className={`guide-card${clickable ? ' is-clickable' : ''}`}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={clickable ? () => { dismiss(); onNavigate(feature.path); } : undefined}
                    onKeyDown={
                      clickable
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              dismiss();
                              onNavigate(feature.path);
                            }
                          }
                        : undefined
                    }
                  >
                    <span className="guide-card__icon" aria-hidden="true">{feature.icon}</span>
                    <h4 className="guide-card__title">{feature.title}</h4>
                    <p className="guide-card__body">{feature.body}</p>
                    {clickable && <span className="guide-card__cta" aria-hidden="true">Open →</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="guide-section-title">Getting started</h3>
            <ol className="guide-steps">
              {STEPS.map((step) => (
                <li className="guide-step" key={step.n}>
                  <span className="guide-step__num" aria-hidden="true">{step.n}</span>
                  <span className="guide-step__text">{step.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <p className="guide-note">
            <span aria-hidden="true">💡</span> Gesture control is optional — everything works with a
            mouse, keyboard or touch. Camera access is only used on the globe pages, and video never
            leaves your session.
          </p>
        </div>

        <footer className="gs-modal__footer guide-modal__footer">
          {onNavigate && (
            <button
              type="button"
              className="gs-btn gs-btn--secondary"
              onClick={() => { dismiss(); onNavigate('/heritage'); }}
            >
              🏛️ Heritage Mode
            </button>
          )}
          <button type="button" className="gs-btn gs-btn--primary" onClick={dismiss}>
            Start exploring
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeGuide;
