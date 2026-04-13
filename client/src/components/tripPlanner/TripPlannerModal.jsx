import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripPlannerForm from './TripPlannerForm';
import TripPlannerResult from './TripPlannerResult';
import { generateTripPlan, getTripPlannerDefaults } from '../../utils/tripPlannerService';

function TripPlannerModal({ isOpen, onClose, siteData, onOpenDedicated }) {
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 980 : false
  );
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState(getTripPlannerDefaults());

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
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Trip Planner</div>
            <div style={styles.subtitle}>
              {normalizedSite?.name ? `Site: ${normalizedSite.name}` : 'Select a site first'}
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.pageButton}
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
            <button style={styles.closeButton} onClick={onClose}>
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
      </div>
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
    background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    lineHeight: 1.15,
  },
  subtitle: {
    marginTop: '6px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.84)',
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
    background: 'rgba(255,255,255,0.18)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '12px',
  },
  closeButton: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.18)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1,
  },
  contentGrid: {
    display: 'grid',
    gap: '12px',
    padding: '14px',
  },
};

export default TripPlannerModal;
