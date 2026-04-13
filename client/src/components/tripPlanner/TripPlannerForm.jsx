import React, { useEffect, useState } from 'react';
import { getTripPlannerDefaults } from '../../utils/tripPlannerService';
import './TripPlannerForm.css';

const PREFERENCE_OPTIONS = [
  { value: 'history', label: 'History' },
  { value: 'food', label: 'Food' },
  { value: 'relaxed', label: 'Relaxed pace' },
  { value: 'photography', label: 'Photography' },
  { value: 'culture', label: 'Culture' },
];

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePreference = (value) => {
    setFormData((prev) => {
      const active = new Set(prev.preferences || []);
      if (active.has(value)) {
        active.delete(value);
      } else {
        active.add(value);
      }

      return {
        ...prev,
        preferences: Array.from(active),
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!onSubmit || isLoading) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formRoot}>
      <div style={styles.headline}>Trip Inputs</div>
      <div style={styles.siteText}>Planning for: {siteName}</div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Number of Days</label>
        <input
          className="trip-planner-input"
          type="number"
          min="1"
          max="10"
          value={formData.days}
          onChange={(event) => updateField('days', event.target.value)}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Start Date (Optional)</label>
        <input
          className="trip-planner-input"
          type="date"
          value={formData.startDate || ''}
          onChange={(event) => updateField('startDate', event.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Budget</label>
        <select
          value={formData.budgetType}
          onChange={(event) => updateField('budgetType', event.target.value)}
          style={styles.selectInput}
        >
          <option style={styles.selectOption} value="low">Low</option>
          <option style={styles.selectOption} value="medium">Medium</option>
          <option style={styles.selectOption} value="high">High</option>
          <option style={styles.selectOption} value="custom">Custom</option>
        </select>
      </div>

      {formData.budgetType === 'custom' && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Custom Budget (INR)</label>
          <input
            className="trip-planner-input"
            type="number"
            min="1000"
            step="500"
            placeholder="e.g. 25000"
            value={formData.customBudget || ''}
            onChange={(event) => updateField('customBudget', event.target.value)}
            style={styles.input}
            required
          />
        </div>
      )}

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Travelers</label>
        <input
          className="trip-planner-input"
          type="number"
          min="1"
          max="20"
          value={formData.travelers}
          onChange={(event) => updateField('travelers', event.target.value)}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Origin City (Optional)</label>
        <input
          className="trip-planner-input"
          type="text"
          placeholder="e.g. Pune"
          value={formData.originCity || ''}
          onChange={(event) => updateField('originCity', event.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Preferred Intercity Mode</label>
        <select
          value={formData.transportPreference}
          onChange={(event) => updateField('transportPreference', event.target.value)}
          style={styles.selectInput}
        >
          <option style={styles.selectOption} value="any">Any / Flexible</option>
          <option style={styles.selectOption} value="flight">Flight</option>
          <option style={styles.selectOption} value="train">Train</option>
          <option style={styles.selectOption} value="road">Road</option>
        </select>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Preferences</label>
        <div style={styles.preferenceGrid}>
          {PREFERENCE_OPTIONS.map((option) => {
            const active = (formData.preferences || []).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePreference(option.value)}
                style={{
                  ...styles.prefChip,
                  ...(active ? styles.prefChipActive : null),
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <button type="submit" style={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Generating...' : submitLabel}
      </button>
    </form>
  );
}

const styles = {
  formRoot: {
    background: 'rgba(248, 245, 255, 0.1)',
    border: '1px solid rgba(236, 221, 255, 0.22)',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    color: 'white',
  },
  headline: {
    fontSize: '18px',
    fontWeight: 700,
  },
  siteText: {
    fontSize: '13px',
    color: 'rgba(246, 239, 255, 0.88)',
    marginBottom: '2px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
  },
  input: {
    height: '38px',
    borderRadius: '8px',
    border: '1px solid rgba(232, 214, 255, 0.42)',
    background: 'rgba(255,255,255,0.22)',
    color: '#f8f5ff',
    padding: '0 10px',
    fontSize: '14px',
    outline: 'none',
  },
  selectInput: {
    height: '38px',
    borderRadius: '8px',
    border: '1px solid rgba(232, 214, 255, 0.42)',
    background: 'rgba(255,255,255,0.22)',
    color: '#f8f5ff',
    padding: '0 10px',
    fontSize: '14px',
    outline: 'none',
  },
  selectOption: {
    backgroundColor: '#f7f4ff',
    color: '#2e1065',
  },
  preferenceGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  prefChip: {
    borderRadius: '999px',
    border: '1px solid rgba(230, 212, 255, 0.45)',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.16)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },
  prefChipActive: {
    background: 'rgba(244, 232, 255, 0.35)',
    borderColor: 'rgba(242, 229, 255, 0.78)',
  },
  submitButton: {
    marginTop: '6px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default TripPlannerForm;
