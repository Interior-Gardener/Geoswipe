import React from 'react';
import { formatINR } from '../../utils/tripPlannerService';

function TripPlannerResult({ plan, error, isLoading, onRegenerate }) {
  if (isLoading) {
    return (
      <div style={styles.placeholderCard}>
        <div style={styles.loadingTitle}>Generating your itinerary...</div>
        <div style={styles.loadingSubtext}>This includes day plan, cost estimation, and booking links.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorCard}>
        <div style={styles.errorTitle}>Unable to generate trip plan</div>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={styles.placeholderCard}>
        <div style={styles.loadingTitle}>Your itinerary will appear here</div>
        <div style={styles.loadingSubtext}>Submit trip inputs to generate day-wise recommendations.</div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.summaryCard}>
        <div style={styles.title}>{plan.title}</div>
        <div style={styles.summary}>{plan.summary}</div>
        <div style={styles.weatherAdvice}>{plan.weatherAdvice}</div>
        <div style={styles.metaLine}>
          Source: {plan?.metadata?.source === 'ai' ? 'AI-assisted' : 'Logical planner'}
        </div>
      </div>

      <div style={styles.sectionTitle}>Cost Estimation (INR)</div>
      <div style={styles.costGrid}>
        <CostItem label="Stay" value={plan.costBreakdown?.stay} />
        <CostItem label="Food" value={plan.costBreakdown?.food} />
        <CostItem label="Transport" value={plan.costBreakdown?.transport} />
        <CostItem label="Entry Fees" value={plan.costBreakdown?.entryFees} />
      </div>
      <div style={styles.totalLine}>Total Estimate: {formatINR(plan.costBreakdown?.total)}</div>
      {Array.isArray(plan.costBreakdown?.notes) && plan.costBreakdown.notes.length > 0 && (
        <div style={styles.noteBox}>
          {plan.costBreakdown.notes.map((note, index) => (
            <div key={`${note}-${index}`} style={styles.noteItem}>{note}</div>
          ))}
        </div>
      )}

      <div style={styles.sectionTitle}>Day-wise Itinerary</div>
      <div style={styles.daysRoot}>
        {Array.isArray(plan.days) && plan.days.map((day) => (
          <div key={day.day} style={styles.dayCard}>
            <div style={styles.dayHeader}>
              <div style={styles.dayTitle}>Day {day.day}: {day.focus}</div>
              <div style={styles.dayDate}>{day.dateLabel}</div>
            </div>

            <div style={styles.subSection}>Schedule</div>
            <div style={styles.scheduleList}>
              {Array.isArray(day.schedule) && day.schedule.map((slot, index) => (
                <div key={`${slot.time}-${index}`} style={styles.scheduleItem}>
                  <div style={styles.scheduleTime}>{slot.time}</div>
                  <div>
                    <div style={styles.scheduleActivity}>{slot.activity}</div>
                    <div style={styles.scheduleDetail}>{slot.details}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.subSection}>Food Recommendations</div>
            <ul style={styles.list}>
              {(day.foodRecommendations || []).map((item, index) => (
                <li key={`${item}-${index}`} style={styles.listItem}>{item}</li>
              ))}
            </ul>

            <div style={styles.subSection}>Travel Suggestions</div>
            <ul style={styles.list}>
              {(day.travelSuggestions || []).map((item, index) => (
                <li key={`${item}-${index}`} style={styles.listItem}>{item}</li>
              ))}
            </ul>

            {(day.notes || []).length > 0 && (
              <>
                <div style={styles.subSection}>Notes</div>
                <ul style={styles.list}>
                  {(day.notes || []).map((item, index) => (
                    <li key={`${item}-${index}`} style={styles.listItem}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={styles.sectionTitle}>Booking Links</div>
      <div style={styles.linkGrid}>
        {(plan.bookingLinks || []).map((link, index) => (
          <a
            key={`${link.url}-${index}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.linkButton}
          >
            {link.label}
          </a>
        ))}
      </div>

      <button style={styles.regenerateButton} onClick={onRegenerate}>
        Regenerate Plan
      </button>
    </div>
  );
}

function CostItem({ label, value }) {
  return (
    <div style={styles.costItem}>
      <div style={styles.costLabel}>{label}</div>
      <div style={styles.costValue}>{formatINR(value)}</div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    color: 'white',
  },
  summaryCard: {
    background: 'rgba(248, 245, 255, 0.12)',
    border: '1px solid rgba(236, 221, 255, 0.22)',
    borderRadius: '14px',
    padding: '14px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  summary: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.92)',
  },
  weatherAdvice: {
    marginTop: '8px',
    fontSize: '13px',
    lineHeight: 1.5,
    background: 'rgba(255,255,255,0.16)',
    borderRadius: '8px',
    padding: '8px',
  },
  metaLine: {
    marginTop: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    marginTop: '4px',
  },
  costGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '8px',
  },
  costItem: {
    background: 'rgba(248, 245, 255, 0.1)',
    border: '1px solid rgba(236, 221, 255, 0.2)',
    borderRadius: '10px',
    padding: '10px',
  },
  costLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.85)',
  },
  costValue: {
    fontSize: '16px',
    fontWeight: 700,
    marginTop: '4px',
  },
  totalLine: {
    fontSize: '18px',
    fontWeight: 800,
    padding: '8px 10px',
    background: 'rgba(251, 191, 36, 0.2)',
    borderRadius: '10px',
    border: '1px solid rgba(251, 191, 36, 0.45)',
  },
  noteBox: {
    background: 'rgba(248, 245, 255, 0.1)',
    borderRadius: '10px',
    padding: '10px',
    border: '1px solid rgba(236, 221, 255, 0.2)',
  },
  noteItem: {
    fontSize: '12px',
    lineHeight: 1.4,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: '4px',
  },
  daysRoot: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dayCard: {
    background: 'rgba(248, 245, 255, 0.09)',
    border: '1px solid rgba(236, 221, 255, 0.2)',
    borderRadius: '12px',
    padding: '12px',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  dayTitle: {
    fontSize: '15px',
    fontWeight: 700,
  },
  dayDate: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)',
  },
  subSection: {
    fontSize: '13px',
    fontWeight: 700,
    marginTop: '8px',
    marginBottom: '4px',
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  scheduleItem: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr',
    gap: '10px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '8px',
  },
  scheduleTime: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.9)',
  },
  scheduleActivity: {
    fontSize: '13px',
    fontWeight: 700,
  },
  scheduleDetail: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.88)',
    marginTop: '2px',
    lineHeight: 1.45,
  },
  list: {
    margin: 0,
    paddingLeft: '18px',
  },
  listItem: {
    fontSize: '12px',
    lineHeight: 1.5,
    marginBottom: '3px',
    color: 'rgba(255,255,255,0.9)',
  },
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '8px',
  },
  linkButton: {
    background: 'rgba(255,255,255,0.16)',
    border: '1px solid rgba(236, 221, 255, 0.26)',
    borderRadius: '10px',
    color: 'white',
    textDecoration: 'none',
    padding: '10px',
    fontSize: '13px',
    fontWeight: 600,
  },
  regenerateButton: {
    height: '38px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
    color: 'white',
    fontWeight: 700,
  },
  placeholderCard: {
    background: 'rgba(248, 245, 255, 0.1)',
    border: '1px solid rgba(236, 221, 255, 0.22)',
    borderRadius: '12px',
    padding: '18px',
    color: 'white',
  },
  loadingTitle: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  loadingSubtext: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.85)',
  },
  errorCard: {
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid rgba(248,113,113,0.45)',
    borderRadius: '12px',
    padding: '14px',
    color: 'white',
  },
  errorTitle: {
    fontWeight: 700,
    marginBottom: '6px',
  },
  errorText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.92)',
  },
};

export default TripPlannerResult;
