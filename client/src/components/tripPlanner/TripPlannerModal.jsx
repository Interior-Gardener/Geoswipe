import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TripPlannerForm from './TripPlannerForm';
import TripPlannerResult from './TripPlannerResult';
import { generateTripPlan, getTripPlannerDefaults } from '../../utils/tripPlannerService';
import { usePanelFullscreen } from '../../hooks/usePanelFullscreen';
import './TripPlannerModal.css';

function TripPlannerModal({ isOpen, onClose, siteData, onOpenDedicated }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState(getTripPlannerDefaults());
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

  return (
    <div className="gs-overlay tpm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <motion.div
        ref={modalRef}
        className={`tpm-modal${isExpanded ? ' is-expanded' : ''}`}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="tpm-header">
          <div className="tpm-heading">
            <span className="tpm-heading__icon" aria-hidden="true">&#129517;</span>
            <div>
              <h2 className="tpm-title">Trip Planner</h2>
              <p className="tpm-subtitle">
                {normalizedSite?.name || 'Select a site first'}
              </p>
            </div>
          </div>

          <div className="tpm-actions">
            <button
              type="button"
              className="gs-btn gs-btn--ghost gs-btn--sm gs-hide-mobile"
              onClick={togglePanelFullscreen}
            >
              {isExpanded ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
            <button
              type="button"
              className="gs-btn gs-btn--secondary gs-btn--sm"
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
              Open full page
            </button>
            <button
              type="button"
              className="gs-modal__close"
              onClick={onClose}
              aria-label="Close trip planner"
            >
              &times;
            </button>
          </div>
        </header>

        <div className="tpm-body">
          <div className="tpm-body__form">
            <TripPlannerForm
              siteName={normalizedSite?.name || 'No site selected'}
              defaults={lastInput}
              isLoading={isLoading}
              onSubmit={handleGenerate}
              submitLabel="Generate Itinerary"
            />
          </div>
          <div className="tpm-body__result gs-scroll">
            <TripPlannerResult
              plan={plan}
              isLoading={isLoading}
              error={error}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TripPlannerModal;
