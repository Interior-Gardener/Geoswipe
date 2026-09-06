import React, { useEffect, useState } from 'react';
import { getTripPlannerDefaults } from '../../utils/tripPlannerService';
import './TripPlannerForm.css';

const PREFERENCE_OPTIONS = [
  { value: 'history', label: 'History', icon: '📜' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'relaxed', label: 'Relaxed pace', icon: '🌿' },
  { value: 'photography', label: 'Photography', icon: '📷' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
];

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'custom', label: 'Custom' },
];

const TRANSPORT_OPTIONS = [
  { value: 'any', label: 'Any', icon: '✨' },
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'train', label: 'Train', icon: '🚆' },
  { value: 'road', label: 'Road', icon: '🚗' },
];

const DAYS_MIN = 1;
const DAYS_MAX = 10;
const TRAVELERS_MIN = 1;
const TRAVELERS_MAX = 20;

/** Numeric stepper - clearer and far easier to tap than a bare number input. */
function Stepper({ id, label, hint, value, min, max, onChange, icon }) {
  const numeric = Number(value) || min;
  const clamp = (next) => Math.min(max, Math.max(min, next));

  return (
    <div className="tp-field">
      <label className="tp-label" htmlFor={id}>
        {icon && <span aria-hidden="true">{icon}</span>} {label}
      </label>
      <div className="tp-stepper">
        <button
          type="button"
          className="tp-stepper__btn"
          onClick={() => onChange(String(clamp(numeric - 1)))}
          disabled={numeric <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          id={id}
          className="tp-stepper__value"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onChange(String(clamp(Number(event.target.value) || min)))}
          required
        />
        <button
          type="button"
          className="tp-stepper__btn"
          onClick={() => onChange(String(clamp(numeric + 1)))}
          disabled={numeric >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
      {hint && <span className="tp-hint">{hint}</span>}
    </div>
  );
}

function TripPlannerForm({
  siteName,
  defaults,
  isLoading,
  onSubmit,
  submitLabel = 'Generate Trip Plan',
}) {
  const [formData, setFormData] = useState(defaults || getTripPlannerDefaults());

  useEffect(() => {
    setFormData(defaults || getTripPlannerDefaults());
  }, [defaults, siteName]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePreference = (value) => {
    setFormData((prev) => {
      const active = new Set(prev.preferences || []);
      if (active.has(value)) active.delete(value);
      else active.add(value);
      return { ...prev, preferences: Array.from(active) };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!onSubmit || isLoading) return;
    onSubmit(formData);
  };

  const activePreferences = formData.preferences || [];

  return (
    <form onSubmit={handleSubmit} className="tp-form">
      <header className="tp-form__header">
        <div>
          <h2 className="tp-form__title">Plan your trip</h2>
          {siteName && (
            <p className="tp-form__subtitle">
              <span aria-hidden="true">📍</span> {siteName}
            </p>
          )}
        </div>
      </header>

      <div className="tp-form__body gs-scroll">
        {/* --- Trip basics --- */}
        <section className="tp-section">
          <h3 className="tp-section__title">Trip basics</h3>
          <div className="tp-grid-2">
            <Stepper
              id="tp-days"
              label="Days"
              icon="🗓️"
              value={formData.days}
              min={DAYS_MIN}
              max={DAYS_MAX}
              onChange={(value) => updateField('days', value)}
            />
            <Stepper
              id="tp-travelers"
              label="Travelers"
              icon="👥"
              value={formData.travelers}
              min={TRAVELERS_MIN}
              max={TRAVELERS_MAX}
              onChange={(value) => updateField('travelers', value)}
            />
          </div>

          <div className="tp-field">
            <label className="tp-label" htmlFor="tp-start-date">
              <span aria-hidden="true">📅</span> Start date <span className="tp-optional">optional</span>
            </label>
            <input
              id="tp-start-date"
              className="gs-input trip-planner-input"
              type="date"
              value={formData.startDate || ''}
              onChange={(event) => updateField('startDate', event.target.value)}
            />
          </div>
        </section>

        {/* --- Budget --- */}
        <section className="tp-section">
          <h3 className="tp-section__title">Budget</h3>
          <div className="gs-segmented tp-segmented" role="tablist" aria-label="Budget level">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={formData.budgetType === option.value}
                className="gs-segmented__item"
                onClick={() => updateField('budgetType', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {formData.budgetType === 'custom' && (
            <div className="tp-field gs-animate-in">
              <label className="tp-label" htmlFor="tp-custom-budget">Custom budget</label>
              <div className="tp-prefix-input">
                <span className="tp-prefix-input__prefix" aria-hidden="true">₹</span>
                <input
                  id="tp-custom-budget"
                  className="gs-input trip-planner-input"
                  type="number"
                  min="1000"
                  step="500"
                  inputMode="numeric"
                  placeholder="25000"
                  value={formData.customBudget || ''}
                  onChange={(event) => updateField('customBudget', event.target.value)}
                  required
                />
              </div>
              <span className="tp-hint">Total for the whole trip, in INR.</span>
            </div>
          )}
        </section>

        {/* --- Journey --- */}
        <section className="tp-section">
          <h3 className="tp-section__title">Getting there</h3>

          <div className="tp-field">
            <label className="tp-label" htmlFor="tp-origin">
              <span aria-hidden="true">🏙️</span> Origin city <span className="tp-optional">optional</span>
            </label>
            <input
              id="tp-origin"
              className="gs-input trip-planner-input"
              type="text"
              placeholder="e.g. Pune"
              autoComplete="address-level2"
              value={formData.originCity || ''}
              onChange={(event) => updateField('originCity', event.target.value)}
            />
          </div>

          <div className="tp-field">
            <span className="tp-label">Preferred mode</span>
            <div className="tp-mode-grid" role="group" aria-label="Preferred intercity mode">
              {TRANSPORT_OPTIONS.map((option) => {
                const active = formData.transportPreference === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`tp-mode${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => updateField('transportPreference', option.value)}
                  >
                    <span className="tp-mode__icon" aria-hidden="true">{option.icon}</span>
                    <span className="tp-mode__label">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- Interests --- */}
        <section className="tp-section">
          <h3 className="tp-section__title">
            Interests
            {activePreferences.length > 0 && (
              <span className="tp-section__count">{activePreferences.length} selected</span>
            )}
          </h3>
          <div className="tp-chip-grid">
            {PREFERENCE_OPTIONS.map((option) => {
              const active = activePreferences.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className="gs-chip tp-chip"
                  aria-pressed={active}
                  onClick={() => togglePreference(option.value)}
                >
                  <span aria-hidden="true">{option.icon}</span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="tp-form__footer">
        <button
          type="submit"
          className={`gs-btn gs-btn--primary gs-btn--lg gs-btn--block${isLoading ? ' gs-btn--loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Generating' : submitLabel}
        </button>
      </footer>
    </form>
  );
}

export default TripPlannerForm;
