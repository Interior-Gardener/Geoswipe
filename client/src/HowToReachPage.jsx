import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import { API_BASE_URL } from './utils/apiConfig';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';
import './styles/how-to-reach.css';

/**
 * Whether a travel mode has anything worth showing. Records routinely carry a
 * mode key with nothing under it (`byRoad: { fromMajorCities: [] }`), which
 * would otherwise render as a card with a heading and no content.
 */
const hasModeContent = (mode) =>
  Boolean(
    mode &&
      (mode.nearestAirport ||
        mode.nearestStation ||
        mode.distance ||
        mode.description ||
        mode.localTransport ||
        mode.fromMajorCities?.length > 0)
  );

/** One travel mode (air / rail / road) rendered as a card. */
function ModeCard({ icon, title, accent, rows, description, children }) {
  return (
    <section className={`htr-mode htr-mode--${accent}`}>
      <header className="htr-mode__header">
        <span className="htr-mode__icon" aria-hidden="true">{icon}</span>
        <h2 className="htr-mode__title">{title}</h2>
      </header>

      {rows?.length > 0 && (
        <dl className="htr-facts">
          {rows.map((row) => (
            <div className="htr-fact" key={row.label}>
              <dt className="htr-fact__label">{row.label}</dt>
              <dd className="htr-fact__value">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {description && <p className="htr-mode__desc">{description}</p>}
      {children}
    </section>
  );
}

const HowToReachPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const derivedSiteSelection = site
    ? normalizeMonumentSelection({
        name: site.name,
        category: site.category,
        year: site.year,
        location: site.location,
        coordinates: site.location?.coordinates
      })
    : null;
  const currentSelection =
    derivedSiteSelection ||
    extractMonumentFromRouteState(location.state) ||
    selectedMonument;

  const navigateBackToHeritage = () => {
    const state = buildHeritageRouteState(currentSelection);
    if (state) {
      navigate('/heritage', { state });
      return;
    }
    navigate('/heritage');
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/heritage/${encodeURIComponent(name)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setSite(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load site information.');
        setLoading(false);
      });
  }, [name]);

  const topbar = (
    <nav className="htr-topbar" aria-label="Page navigation">
      <button type="button" className="gs-btn gs-btn--ghost gs-btn--sm" onClick={navigateBackToHeritage}>
        <span aria-hidden="true">←</span> Heritage map
      </button>
      <div className="gs-spacer" />
      <button type="button" className="gs-btn gs-btn--secondary gs-btn--sm" onClick={() => navigate('/')}>
        <span aria-hidden="true">⌂</span> Home
      </button>
    </nav>
  );

  if (loading) {
    return (
      <div className="htr-page">
        <div className="htr-inner">
          {topbar}
          <div className="htr-hero">
            <div className="gs-skeleton gs-skeleton--title" style={{ width: '45%', height: '2rem' }} />
            <div className="gs-skeleton gs-skeleton--text" style={{ width: '30%' }} />
          </div>
          <div className="htr-modes">
            {[0, 1, 2].map((i) => (
              <div className="htr-mode" key={i}>
                <div className="gs-skeleton gs-skeleton--title" />
                <div className="gs-skeleton gs-skeleton--text" />
                <div className="gs-skeleton gs-skeleton--text" style={{ width: '75%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="htr-page">
        <div className="htr-inner">
          {topbar}
          <div className="gs-state gs-state--error">
            <div className="gs-state__icon" aria-hidden="true">⚠️</div>
            <h1 className="gs-state__title">{error ? 'Could not load this site' : 'No data found'}</h1>
            <p className="gs-state__text">
              {error || 'We could not find travel information for this monument.'}
            </p>
            <button type="button" className="gs-btn gs-btn--primary" onClick={navigateBackToHeritage}>
              Back to Heritage map
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reach = site.howToReach || {};
  const place = [site.location?.city, site.location?.state, site.location?.country]
    .filter(Boolean)
    .join(', ');
  const coords = site.location?.coordinates;
  const hasAnyMode =
    hasModeContent(reach.byAir) ||
    hasModeContent(reach.byRail) ||
    hasModeContent(reach.byRoad);

  return (
    <div className="htr-page">
      <div className="htr-glow htr-glow--a" aria-hidden="true" />
      <div className="htr-glow htr-glow--b" aria-hidden="true" />

      <div className="htr-inner">
        {topbar}

        <header className="htr-hero">
          <p className="gs-overline htr-hero__eyebrow">Getting there</p>
          <h1 className="htr-hero__title">{site.name}</h1>
          <div className="htr-hero__chips">
            {site.category && <span className="gs-badge gs-badge--accent">{site.category}</span>}
            {site.year && <span className="gs-badge">{site.year}</span>}
          </div>
          {place && (
            <p className="htr-hero__place">
              <span aria-hidden="true">📍</span> {place}
            </p>
          )}
        </header>

        {reach.full && (
          <section className="htr-overview">
            <h2 className="htr-section-title"><span aria-hidden="true">🗺️</span> Overview</h2>
            <p className="htr-overview__text">{reach.full}</p>
          </section>
        )}

        {hasAnyMode && (
        <div className="htr-modes">
          {hasModeContent(reach.byAir) && (
            <ModeCard
              icon="✈️"
              title="By air"
              accent="air"
              rows={[
                reach.byAir.nearestAirport && { label: 'Nearest airport', value: reach.byAir.nearestAirport },
                reach.byAir.distance && { label: 'Distance', value: reach.byAir.distance }
              ].filter(Boolean)}
              description={reach.byAir.description}
            />
          )}

          {hasModeContent(reach.byRail) && (
            <ModeCard
              icon="🚂"
              title="By rail"
              accent="rail"
              rows={[
                reach.byRail.nearestStation && { label: 'Nearest station', value: reach.byRail.nearestStation },
                reach.byRail.distance && { label: 'Distance', value: reach.byRail.distance }
              ].filter(Boolean)}
              description={reach.byRail.description}
            />
          )}

          {hasModeContent(reach.byRoad) && (
            <ModeCard
              icon="🚗"
              title="By road"
              accent="road"
              rows={[
                reach.byRoad.localTransport && { label: 'Local transport', value: reach.byRoad.localTransport }
              ].filter(Boolean)}
            >
              {reach.byRoad.fromMajorCities?.length > 0 && (
                <>
                  <h3 className="htr-sub">From major cities</h3>
                  <ul className="htr-cities">
                    {reach.byRoad.fromMajorCities.map((city, index) => (
                      <li className="htr-city" key={`${city}-${index}`}>{city}</li>
                    ))}
                  </ul>
                </>
              )}
            </ModeCard>
          )}
        </div>
        )}

        {!hasAnyMode && (
          <section className="htr-overview">
            <h2 className="htr-section-title"><span aria-hidden="true">🧭</span> Travel modes</h2>
            <p className="htr-overview__text">
              Mode-by-mode directions have not been recorded for this site yet.
              {reach.full ? ' The overview above covers how to get there.' : ''} You can still
              plan a safe route or a full trip below.
            </p>
          </section>
        )}

        {(place || coords) && (
          <section className="htr-location">
            <h2 className="htr-section-title"><span aria-hidden="true">📍</span> Location</h2>
            <div className="htr-location__body">
              {place && <p className="htr-location__place">{place}</p>}
              {Array.isArray(coords) && coords.length === 2 && (
                <p className="htr-location__coords">
                  {Number(coords[1]).toFixed(4)}°, {Number(coords[0]).toFixed(4)}°
                </p>
              )}
              <div className="htr-location__actions">
                <button
                  type="button"
                  className="gs-btn gs-btn--primary"
                  onClick={() =>
                    navigate('/safety-navigation', {
                      state: buildHeritageRouteState(currentSelection) || undefined
                    })
                  }
                >
                  <span aria-hidden="true">🛡️</span> Plan a safe route
                </button>
                <button
                  type="button"
                  className="gs-btn gs-btn--secondary"
                  onClick={() =>
                    navigate(`/trip-planner/${encodeURIComponent(site.name)}`, {
                      state: buildHeritageRouteState(currentSelection) || undefined
                    })
                  }
                >
                  <span aria-hidden="true">🧭</span> Plan a trip
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HowToReachPage;
