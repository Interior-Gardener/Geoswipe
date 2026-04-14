import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TripPlannerForm from './TripPlannerForm';
import TripPlannerResult from './TripPlannerResult';
import { generateTripPlan, getTripPlannerDefaults } from '../../utils/tripPlannerService';
import { usePanelFullscreen } from '../../hooks/usePanelFullscreen';
import { useTheme } from '../../context/ThemeContext';

function TripPlannerModal({ isOpen, onClose, siteData, onOpenDedicated }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 980 : false
  );
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState(getTripPlannerDefaults());
  const { theme } = useTheme();
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(modalRef);

  const normalizedSite = useMemo(() => {
    if (!siteData) return null;
    return {
      ...siteData,
      visitorinfo: siteData.visitorinfo || siteData.visitor_info,
    };
  }, [siteData]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 980);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setPlan(null);
    setError(null);
    setLastInput(getTripPlannerDefaults());
  }, [normalizedSite?.name, isOpen]);

  const handleGenerate = async (input) => {
    if (!normalizedSite?.name) {
      setError('No heritage site selected for planning.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedPlan = await generateTripPlan({
        siteData: normalizedSite,
        input,
        useAI: true,
      });
      setPlan(generatedPlan);
      setLastInput(input);
    } catch (generationError) {
      setError(generationError?.message || 'Trip generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(lastInput || getTripPlannerDefaults());
  };

  if (!isOpen) {
    return null;
  }

  const contentGridStyle = {
    ...styles.contentGrid,
    gridTemplateColumns: isCompact ? '1fr' : 'minmax(300px, 360px) 1fr',
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        ref={modalRef}
        className="heritage-animated-panel"
        style={{
          ...styles.modal,
          ...(theme === 'light' ? styles.modalLight : null),
          ...(isExpanded ? styles.modalExpanded : null)
        }}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        <div style={{ ...styles.header, ...(theme === 'light' ? styles.headerLight : null) }}>
          <div>
            <div style={{ ...styles.title, ...(theme === 'light' ? styles.titleLight : null) }}>Trip Planner</div>
            <div style={{ ...styles.subtitle, ...(theme === 'light' ? styles.subtitleLight : null) }}>
              {normalizedSite?.name ? `Site: ${normalizedSite.name}` : 'Select a site first'}
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={{ ...styles.pageButton, ...(theme === 'light' ? styles.pageButtonLight : null) }}
              onClick={togglePanelFullscreen}
            >
              {isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button
              style={{ ...styles.pageButton, ...(theme === 'light' ? styles.pageButtonLight : null) }}
              onClick={() => {
                if (onOpenDedicated) {
                  onOpenDedicated();
                  return;
                }

                if (normalizedSite?.name) {
                  navigate(`/trip-planner/${encodeURIComponent(normalizedSite.name)}`);
                } else {
                  navigate('/trip-planner');
                }
              }}
            >
              Open Full Page
            </button>
            <button
              style={{ ...styles.closeButton, ...(theme === 'light' ? styles.closeButtonLight : null) }}
              onClick={onClose}
            >
              x
            </button>
          </div>
        </div>

        <div style={contentGridStyle}>
          <TripPlannerForm
            siteName={normalizedSite?.name || 'No site selected'}
            defaults={lastInput}
            isLoading={isLoading}
            onSubmit={handleGenerate}
            submitLabel="Generate Itinerary"
          />
          <TripPlannerResult
            plan={plan}
            isLoading={isLoading}
            error={error}
            onRegenerate={handleRegenerate}
          />
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.82)',
    zIndex: 12000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: 'min(1220px, 96vw)',
    maxHeight: '92vh',
    overflow: 'auto',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #3b1f68, #5b2a86 45%, #4c1d95)',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  modalLight: {
    background: 'linear-gradient(145deg, #e8f1ff, #dbeafe 45%, #eef5ff)',
    border: '1px solid rgba(45, 88, 163, 0.24)',
    color: '#132a4c',
  },
  modalExpanded: {
    width: '100vw',
    maxHeight: '100vh',
    height: '100vh',
    borderRadius: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.07)',
  },
  headerLight: {
    borderBottom: '1px solid rgba(49, 88, 164, 0.2)',
    background: 'rgba(255,255,255,0.55)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    lineHeight: 1.15,
  },
  titleLight: {
    color: '#132a4c',
  },
  subtitle: {
    marginTop: '6px',
    fontSize: '13px',
    color: 'rgba(244, 236, 255, 0.88)',
  },
  subtitleLight: {
    color: 'rgba(18, 42, 76, 0.74)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pageButton: {
    height: '34px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.14)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px',
  },
  pageButtonLight: {
    background: 'rgba(59, 104, 178, 0.14)',
    border: '1px solid rgba(59, 104, 178, 0.3)',
    color: '#183863',
  },
  closeButton: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.14)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1,
  },
  closeButtonLight: {
    background: 'rgba(59, 104, 178, 0.14)',
    border: '1px solid rgba(59, 104, 178, 0.3)',
    color: '#183863',
  },
  contentGrid: {
    display: 'grid',
    gap: '12px',
    padding: '14px',
  },
};

export default TripPlannerModal;
