import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import { API_BASE_URL } from './utils/apiConfig';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';
import './styles/storybook-library.css';

/** Site name -> the slug used for /chapters/<slug>.json and the route param. */
const toSlug = (name) => String(name || '').trim().toLowerCase().replace(/\s+/g, '-');

const StoryBookLibrary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();

  const currentSelection = extractMonumentFromRouteState(location.state) || selectedMonument;

  const [sites, setSites] = useState([]);
  const [illustrated, setIllustrated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Every heritage site has a story: sites with a hand-authored chapter file get
  // the illustrated version, the rest are generated from their site data. This
  // page used to list three hardcoded names, so the other 120+ were unreachable.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/heritage-sites`);
        if (!response.ok) throw new Error(`Could not load heritage sites (${response.status})`);
        const data = await response.json();
        if (!cancelled) setSites(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load heritage sites.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Optional manifest of hand-authored chapter files.
    fetch('/chapters/index.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && Array.isArray(json?.slugs)) setIllustrated(json.slugs);
      })
      .catch(() => {
        // No manifest is fine - every site still opens a generated story.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(sites.map((s) => s.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [sites]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites
      .filter((s) => (category === 'all' ? true : s.category === category))
      .filter((s) => {
        if (!q) return true;
        const city = s.location?.city || '';
        const state = s.location?.state || '';
        return `${s.name} ${city} ${state} ${s.category || ''}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        // Illustrated stories first, then alphabetical.
        const ai = illustrated.includes(toSlug(a.name)) ? 0 : 1;
        const bi = illustrated.includes(toSlug(b.name)) ? 0 : 1;
        return ai - bi || a.name.localeCompare(b.name);
      });
  }, [sites, query, category, illustrated]);

  const openStory = (site) => {
    const state = buildHeritageRouteState(
      normalizeMonumentSelection(site) || currentSelection
    );
    const path = `/heritage-storybook/${toSlug(site.name)}`;
    if (state) navigate(path, { state });
    else navigate(path);
  };

  const backToHeritage = () => {
    const state = buildHeritageRouteState(currentSelection);
    if (state) navigate('/heritage', { state });
    else navigate('/heritage');
  };

  return (
    <div className="sbl-page">
      <div className="sbl-glow sbl-glow--a" aria-hidden="true" />
      <div className="sbl-glow sbl-glow--b" aria-hidden="true" />

      <div className="sbl-inner">
        <nav className="sbl-topbar" aria-label="Storybook navigation">
          <button type="button" className="gs-btn gs-btn--ghost gs-btn--sm" onClick={backToHeritage}>
            <span aria-hidden="true">←</span> Heritage map
          </button>
          <div className="gs-spacer" />
          <button
            type="button"
            className="gs-btn gs-btn--secondary gs-btn--sm"
            onClick={() => navigate('/')}
          >
            <span aria-hidden="true">⌂</span> Home
          </button>
        </nav>

        <header className="sbl-hero">
          <p className="gs-overline sbl-hero__eyebrow">Illustrated heritage</p>
          <h1 className="sbl-hero__title">Story Library</h1>
          <p className="sbl-hero__lede">
            Every monument has a story. Open any site to read it as a chapter-by-chapter
            book — history, architecture, legends and travel notes.
          </p>

          <div className="sbl-hero__stats">
            <div className="sbl-stat">
              <span className="sbl-stat__value">{loading ? '—' : sites.length}</span>
              <span className="sbl-stat__label">Stories</span>
            </div>
            <div className="sbl-stat">
              <span className="sbl-stat__value">{illustrated.length || '—'}</span>
              <span className="sbl-stat__label">Illustrated</span>
            </div>
            <div className="sbl-stat">
              <span className="sbl-stat__value">{Math.max(0, categories.length - 1)}</span>
              <span className="sbl-stat__label">Categories</span>
            </div>
          </div>
        </header>

        <div className="sbl-controls">
          <div className="gs-input-group sbl-search">
            <span className="gs-input-group__icon" aria-hidden="true">🔍</span>
            <input
              className="gs-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a monument, city or state…"
              aria-label="Search stories"
            />
          </div>

          <div className="sbl-filters gs-hide-scrollbar" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="gs-chip"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="sbl-grid">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="sbl-card sbl-card--skeleton" key={i}>
                <div className="gs-skeleton" style={{ height: '18px', width: '65%' }} />
                <div className="gs-skeleton gs-skeleton--text" />
                <div className="gs-skeleton gs-skeleton--text" style={{ width: '80%' }} />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="gs-state gs-state--error">
            <div className="gs-state__icon" aria-hidden="true">⚠️</div>
            <h2 className="gs-state__title">Could not load stories</h2>
            <p className="gs-state__text">{error}</p>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="gs-state">
            <div className="gs-state__icon" aria-hidden="true">🔍</div>
            <h2 className="gs-state__title">No stories match that search</h2>
            <p className="gs-state__text">Try a different monument, city or category.</p>
            <button
              type="button"
              className="gs-btn gs-btn--secondary"
              onClick={() => { setQuery(''); setCategory('all'); }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <>
            <p className="sbl-count">
              Showing <strong>{visible.length}</strong> of {sites.length} stories
            </p>
            <div className="sbl-grid">
              {visible.map((site) => {
                const isIllustrated = illustrated.includes(toSlug(site.name));
                const city = site.location?.city;
                const state = site.location?.state;
                return (
                  <button
                    type="button"
                    className={`sbl-card${isIllustrated ? ' is-illustrated' : ''}`}
                    key={site._id || site.name}
                    onClick={() => openStory(site)}
                  >
                    <span className="sbl-card__top">
                      <span className="sbl-card__icon" aria-hidden="true">
                        {isIllustrated ? '📖' : '📜'}
                      </span>
                      {isIllustrated && (
                        <span className="gs-badge gs-badge--gold">Illustrated</span>
                      )}
                    </span>

                    <span className="sbl-card__title">{site.name}</span>

                    <span className="sbl-card__meta">
                      {[site.category, site.year].filter(Boolean).join(' · ')}
                    </span>

                    {(city || state) && (
                      <span className="sbl-card__place">
                        <span aria-hidden="true">📍</span>{' '}
                        {[city, state].filter(Boolean).join(', ')}
                      </span>
                    )}

                    <span className="sbl-card__cta">Read story <span aria-hidden="true">→</span></span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <aside className="sbl-help">
          <h2 className="sbl-help__title"><span aria-hidden="true">💡</span> How stories work</h2>
          <ul className="sbl-help__list">
            <li>Pick any monument to open its story book full-screen.</li>
            <li>Turn pages with the Previous / Next controls or the arrow keys.</li>
            <li><strong>Illustrated</strong> stories are hand-written chapters with imagery; the rest are generated from the site&apos;s own history and travel data.</li>
            <li>Press <kbd>Esc</kbd> to close and return here.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default StoryBookLibrary;
