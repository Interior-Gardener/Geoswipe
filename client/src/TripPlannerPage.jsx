import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import TripPlannerForm from './components/tripPlanner/TripPlannerForm';
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function TripPlannerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const pageRef = useRef(null);
  const { theme } = useTheme();
  const { selectedMonument } = useHeritageSelection();
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 980 : false
  );

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
    const handleResize = () => {
      setIsCompact(window.innerWidth < 980);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const contentGridStyle = {
    ...styles.contentGrid,
    gridTemplateColumns: isCompact ? '1fr' : 'minmax(300px, 360px) 1fr',
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
      style={{
        ...styles.pageRoot,
        ...(theme === 'light' ? styles.pageRootLight : null),
        ...(isExpanded ? styles.pageRootExpanded : null)
      }}
      className="heritage-animated-panel"
    >
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

      <div style={styles.mainContainer}>
        <div style={styles.topBar}>
          <button style={styles.navButton} onClick={togglePanelFullscreen}>
            {isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button style={styles.navButton} onClick={navigateBackToHeritage}>
            Back to Heritage
          </button>
          <button style={styles.navButton} onClick={() => navigate('/')}>
            Home
          </button>
        </div>

        <motion.div
          style={styles.headerCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: 'easeOut' }}
        >
          <div
            style={{
              ...styles.headerVisual,
              backgroundImage: siteImage?.imageUrl
                ? `linear-gradient(140deg, rgba(7, 18, 40, 0.78), rgba(25, 34, 71, 0.82)), url(${siteImage.imageUrl})`
                : styles.headerVisual.backgroundImage
            }}
          >
            <div style={styles.pageEyebrow}>Smart Monument Journey Builder</div>
            <div style={styles.pageTitle}>Trip Planner</div>
            <div style={styles.pageSubtitle}>{subtitle}</div>
            {siteImage?.source && (
              <div style={styles.imageSourceTag}>Image source: {siteImage.source}</div>
            )}
          </div>
        </motion.div>

        <motion.div
          style={contentGridStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
        >
          <motion.div style={styles.leftColumn} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
            <div style={styles.selectorCard}>
              <label style={styles.selectorLabel}>Select Heritage Site</label>
              <select
                value={selectedSiteName}
                onChange={handleSiteSelection}
                style={styles.selectorInput}
                disabled={sitesLoading}
              >
                {sites.map((site) => (
                  <option key={site._id || site.name} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>

              {sitesLoading && <div style={styles.inlineInfo}>Loading site list...</div>}
              {sitesError && <div style={styles.inlineError}>{sitesError}</div>}
              {siteLoading && <div style={styles.inlineInfo}>Loading selected site details...</div>}
              {siteError && <div style={styles.inlineError}>{siteError}</div>}
            </div>

            <TripPlannerForm
              siteName={selectedSite?.name || 'No site selected'}
              defaults={lastInput}
              isLoading={isGenerating}
              onSubmit={handleGenerate}
              submitLabel="Generate Itinerary"
            />
          </motion.div>

          <motion.div style={styles.rightColumn} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
            <TripPlannerResult
              plan={plan}
              isLoading={isGenerating}
              error={generationError}
              onRegenerate={handleRegenerate}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  pageRoot: {
    position: 'relative',
    minHeight: '100vh',
    padding: '18px',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 42%, #5b21b6 100%)',
    overflow: 'hidden',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  pageRootLight: {
    background: 'linear-gradient(135deg, #cfe8ff 0%, #dbeafe 42%, #f4f8ff 100%)',
    color: '#10243e',
  },
  pageRootExpanded: {
    width: '100vw',
    height: '100vh',
    padding: '10px',
  },
  backgroundGlowTop: {
    position: 'absolute',
    width: '460px',
    height: '460px',
    borderRadius: '999px',
    top: '-150px',
    left: '-120px',
    background: 'radial-gradient(circle, rgba(34,211,238,0.35), transparent 70%)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    width: '520px',
    height: '520px',
    borderRadius: '999px',
    bottom: '-170px',
    right: '-140px',
    background: 'radial-gradient(circle, rgba(249,115,22,0.32), transparent 70%)',
    filter: 'blur(10px)',
    pointerEvents: 'none',
  },
  mainContainer: {
    position: 'relative',
    zIndex: 1,
    width: 'min(1280px, 100%)',
    margin: '0 auto',
    color: 'white',
  },
  topBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  navButton: {
    height: '36px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.14)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  headerCard: {
    padding: 0,
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.22)',
    background: 'rgba(255,255,255,0.1)',
    marginBottom: '14px',
    backdropFilter: 'blur(14px)',
    overflow: 'hidden',
  },
  headerVisual: {
    minHeight: '170px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage:
      'linear-gradient(145deg, rgba(8, 16, 38, 0.82), rgba(34, 33, 88, 0.8), rgba(91, 33, 182, 0.72))',
  },
  pageEyebrow: {
    fontSize: '11px',
    letterSpacing: '1.1px',
    textTransform: 'uppercase',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 800,
    lineHeight: 1.1,
    textShadow: '0 4px 16px rgba(2, 6, 20, 0.32)',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.92)',
  },
  imageSourceTag: {
    marginTop: '4px',
    width: 'fit-content',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '3px 10px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.84)',
    background: 'rgba(8, 16, 38, 0.4)',
  },
  contentGrid: {
    display: 'grid',
    gap: '12px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  rightColumn: {
    minHeight: '420px',
  },
  selectorCard: {
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  selectorLabel: {
    fontSize: '13px',
    fontWeight: 700,
  },
  selectorInput: {
    height: '38px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.18)',
    color: 'white',
    padding: '0 10px',
  },
  inlineInfo: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.85)',
  },
  inlineError: {
    fontSize: '12px',
    color: '#fecaca',
  },
};

export default TripPlannerPage;
