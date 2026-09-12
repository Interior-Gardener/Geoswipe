import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import TripPlannerForm from './components/tripPlanner/TripPlannerForm';
import './components/tripPlanner/TripPlannerPage.css';
import TripPlannerResult from './components/tripPlanner/TripPlannerResult';
import { generateTripPlan, getTripPlannerDefaults } from './utils/tripPlannerService';
import { fetchMonumentImage, primeMonumentImageCache } from './utils/heritageImageService';
import { useTheme } from './context/ThemeContext';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import { usePanelFullscreen } from './hooks/usePanelFullscreen';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';

import { API_BASE_URL } from './utils/apiConfig';

function TripPlannerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const pageRef = useRef(null);
  const { theme } = useTheme();
  const { selectedMonument } = useHeritageSelection();
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState(null);

  const [selectedSiteName, setSelectedSiteName] = useState('');
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteImage, setSiteImage] = useState(null);
  const [siteLoading, setSiteLoading] = useState(false);
  const [siteError, setSiteError] = useState(null);

  const [plan, setPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [lastInput, setLastInput] = useState(getTripPlannerDefaults());
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(pageRef);

  useEffect(() => {
    const routeSiteName = params?.name ? decodeURIComponent(params.name) : '';
    if (routeSiteName) {
      setSelectedSiteName(routeSiteName);
    }
  }, [params?.name]);

  useEffect(() => {
    let mounted = true;

    const fetchSites = async () => {
      setSitesLoading(true);
      setSitesError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/heritage-sites`);
        if (!response.ok) {
          throw new Error('Failed to load heritage sites list.');
        }

        const data = await response.json();
        if (!mounted) return;

        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          : [];

        setSites(sorted);

        if (!selectedSiteName && sorted.length > 0) {
          setSelectedSiteName(sorted[0].name);
        }
      } catch (error) {
        if (!mounted) return;
        setSitesError(error?.message || 'Unable to load heritage sites.');
      } finally {
        if (mounted) {
          setSitesLoading(false);
        }
      }
    };

    fetchSites();

    return () => {
      mounted = false;
    };
  }, [selectedSiteName]);

  useEffect(() => {
    let mounted = true;

    const fetchSelectedSite = async () => {
      if (!selectedSiteName) {
        setSelectedSite(null);
        return;
      }

      setSiteLoading(true);
      setSiteError(null);
      setPlan(null);
      setGenerationError(null);

      try {
        const detailsResponse = await fetch(
          `${API_BASE_URL}/api/heritage-sites/${encodeURIComponent(selectedSiteName)}/details`
        );

        if (!detailsResponse.ok) {
          throw new Error('Could not load selected heritage site details.');
        }

        const data = await detailsResponse.json();
        if (!mounted) return;

        setSelectedSite({
          ...data,
          visitorinfo: data.visitorinfo || data.visitor_info,
        });
      } catch (error) {
        if (!mounted) return;
        setSiteError(error?.message || 'Unable to load selected site details.');
        setSelectedSite(null);
      } finally {
        if (mounted) {
          setSiteLoading(false);
        }
      }
    };

    fetchSelectedSite();

    return () => {
      mounted = false;
    };
  }, [selectedSiteName]);

  useEffect(() => {
    let active = true;

    if (!selectedSite?.name) {
      setSiteImage(null);
      return () => {
        active = false;
      };
    }

    const localFallback = selectedSite?.monumentImage?.imageUrl
      ? selectedSite.monumentImage
      : selectedSite?.media?.panorama_url
      ? {
          imageUrl: selectedSite.media.panorama_url,
          source: 'fallback'
        }
      : null;

    if (localFallback?.imageUrl) {
      setSiteImage(localFallback);
      primeMonumentImageCache(selectedSite.name, localFallback);
    } else {
      setSiteImage(null);
    }

    fetchMonumentImage(selectedSite.name)
      .then((resolvedImage) => {
        if (!active || !resolvedImage?.imageUrl) {
          return;
        }

        setSiteImage(resolvedImage);
        primeMonumentImageCache(selectedSite.name, resolvedImage);
      })
      .catch(() => {
        // Keep fallback image if network fetch fails.
      });

    return () => {
      active = false;
    };
  }, [selectedSite]);

  const subtitle = useMemo(() => {
    if (!selectedSite) {
      return 'Create personalized day-wise itineraries with budgets and booking links.';
    }

    const city = selectedSite.location?.city || 'Unknown city';
    const state = selectedSite.location?.state || 'Unknown state';
    return `${selectedSite.name} • ${city}, ${state}`;
  }, [selectedSite]);

  const derivedSiteSelection = selectedSite
    ? normalizeMonumentSelection({
        name: selectedSite.name,
        category: selectedSite.category,
        year: selectedSite.year,
        location: selectedSite.location,
        coordinates: selectedSite.coordinates || selectedSite.location?.coordinates
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

  const handleGenerate = async (input) => {
    if (!selectedSite) {
      setGenerationError('Please select a heritage site first.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const generatedPlan = await generateTripPlan({
        siteData: selectedSite,
        input,
        useAI: true,
      });

      setPlan(generatedPlan);
      setLastInput(input);
    } catch (error) {
      setGenerationError(error?.message || 'Could not generate trip plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(lastInput || getTripPlannerDefaults());
  };

  const handleSiteSelection = (event) => {
    const nextSite = event.target.value;
    setSelectedSiteName(nextSite);
    if (nextSite) {
      navigate(`/trip-planner/${encodeURIComponent(nextSite)}`);
    } else {
      navigate('/trip-planner');
    }
  };

  return (
    <div
      ref={pageRef}
      className={`tp-page heritage-animated-panel${isExpanded ? ' is-expanded' : ''}`}
      data-theme={theme}
    >
      <div className="tp-page__glow tp-page__glow--top" aria-hidden="true" />
      <div className="tp-page__glow tp-page__glow--bottom" aria-hidden="true" />

      <div className="tp-page__inner">
        {/* Top navigation */}
        <nav className="tp-topbar" aria-label="Trip planner navigation">
          <button
            type="button"
            className="gs-btn gs-btn--ghost gs-btn--sm"
            onClick={navigateBackToHeritage}
          >
            <span aria-hidden="true">←</span> Heritage
          </button>

          <div className="gs-spacer" />

          <button
            type="button"
            className="gs-btn gs-btn--ghost gs-btn--sm gs-hide-mobile"
            onClick={togglePanelFullscreen}
          >
            <span aria-hidden="true">{isExpanded ? '⤡' : '⛶'}</span>
            {isExpanded ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <button
            type="button"
            className="gs-btn gs-btn--secondary gs-btn--sm"
            onClick={() => navigate('/')}
          >
            <span aria-hidden="true">⌂</span> Home
          </button>
        </nav>

        {/* Hero */}
        <motion.header
          className="tp-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="tp-hero__visual"
            style={
              siteImage?.imageUrl
                ? { backgroundImage: `url(${siteImage.imageUrl})` }
                : undefined
            }
            aria-hidden="true"
          />
          <div className="tp-hero__scrim" aria-hidden="true" />
          <div className="tp-hero__content">
            <p className="gs-overline tp-hero__eyebrow">Smart Monument Journey Builder</p>
            <h1 className="tp-hero__title">Trip Planner</h1>
            <p className="tp-hero__subtitle">{subtitle}</p>
            {siteImage?.source && (
              <span className="tp-hero__credit">Image: {siteImage.source}</span>
            )}
          </div>
        </motion.header>

        {/* Content */}
        <div className="tp-layout">
          <motion.aside
            className="tp-layout__side"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
          >
            <div className="tp-selector">
              <label className="tp-label" htmlFor="tp-site-select">
                <span aria-hidden="true">🏛️</span> Heritage site
              </label>
              <select
                id="tp-site-select"
                className="gs-select"
                value={selectedSiteName}
                onChange={handleSiteSelection}
                disabled={sitesLoading}
              >
                {sitesLoading && <option value="">Loading sites…</option>}
                {!sitesLoading && sites.length === 0 && <option value="">No sites available</option>}
                {sites.map((site) => (
                  <option key={site._id || site.name} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>

              {(sitesLoading || siteLoading) && (
                <div className="tp-inline tp-inline--info">
                  <span className="gs-spinner gs-spinner--sm" />
                  {sitesLoading ? 'Loading site list…' : 'Loading site details…'}
                </div>
              )}
              {sitesError && (
                <div className="tp-inline tp-inline--error" role="alert">
                  <span aria-hidden="true">⚠️</span> {sitesError}
                </div>
              )}
              {siteError && (
                <div className="tp-inline tp-inline--error" role="alert">
                  <span aria-hidden="true">⚠️</span> {siteError}
                </div>
              )}
            </div>

            <TripPlannerForm
              siteName={selectedSite?.name || 'No site selected'}
              defaults={lastInput}
              isLoading={isGenerating}
              onSubmit={handleGenerate}
              submitLabel="Generate Itinerary"
            />
          </motion.aside>

          <motion.main
            className="tp-layout__main gs-scroll"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <TripPlannerResult
              plan={plan}
              isLoading={isGenerating}
              error={generationError}
              onRegenerate={handleRegenerate}
            />
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default TripPlannerPage;
