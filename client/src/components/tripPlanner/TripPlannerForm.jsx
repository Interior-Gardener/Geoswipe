import React, { useEffect, useState } from 'react';
import { getTripPlannerDefaults } from '../../utils/tripPlannerService';

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
          style={styles.input}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {formData.budgetType === 'custom' && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Custom Budget (INR)</label>
          <input
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
          style={styles.input}
        >
          <option value="any">Any / Flexible</option>
          <option value="flight">Flight</option>
          <option value="train">Train</option>
          <option value="road">Road</option>
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
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
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
    color: 'rgba(255,255,255,0.8)',
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
    border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.18)',
    color: 'white',
    padding: '0 10px',
    fontSize: '14px',
    outline: 'none',
  },
  preferenceGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  prefChip: {
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.35)',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },
  prefChipActive: {
    background: 'rgba(255,255,255,0.28)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  submitButton: {
    marginTop: '6px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #22d3ee, #0284c7)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default TripPlannerForm;
