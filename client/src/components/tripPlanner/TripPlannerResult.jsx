import React, { useState } from 'react';
import { formatINR } from '../../utils/tripPlannerService';
import { downloadTripPlanPdf } from '../../utils/tripPlanPdf';
import { renderRichText } from '../../utils/richText';
import './TripPlannerResult.css';

/** What a generated plan contains, shown while the reader has not made one. */
const PREVIEW_ITEMS = [
  {
    icon: '🕘',
    title: 'A day-by-day schedule',
    text: 'Timed stops for each day, with what to see and how long to spend.'
  },
  {
    icon: '💰',
    title: 'A cost estimate',
    text: 'Stay, food, transport and entry fees broken down against your budget.'
  },
  {
    icon: '🎟️',
    title: 'Booking links',
    text: 'Direct links for tickets, stays and transport for the dates you pick.'
  }
];

const COST_META = {
  stay: { label: 'Stay', icon: '🏨' },
  food: { label: 'Food', icon: '🍽️' },
  transport: { label: 'Transport', icon: '🚕' },
  entryFees: { label: 'Entry Fees', icon: '🎟️' },
};

/** Skeleton that mirrors the real layout, so the swap is not jarring. */
function LoadingState() {
  return (
    <div className="tpr" aria-busy="true" aria-live="polite">
      <div className="tpr-card tpr-hero">
        <div className="gs-skeleton gs-skeleton--title" />
        <div className="gs-skeleton gs-skeleton--text" style={{ width: '92%' }} />
        <div className="gs-skeleton gs-skeleton--text" style={{ width: '78%' }} />
      </div>

      <div className="tpr-section-title"><span>Cost estimation</span></div>
      <div className="tpr-cost-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="tpr-card tpr-cost" key={i}>
            <div className="gs-skeleton gs-skeleton--text" style={{ width: '52%' }} />
            <div className="gs-skeleton gs-skeleton--text" style={{ width: '72%', height: '1.1rem' }} />
          </div>
        ))}
      </div>

      <div className="tpr-section-title"><span>Itinerary</span></div>
      {[0, 1].map((i) => (
        <div className="tpr-card" key={i}>
          <div className="gs-skeleton gs-skeleton--title" />
          <div className="gs-skeleton gs-skeleton--text" />
          <div className="gs-skeleton gs-skeleton--text" style={{ width: '85%' }} />
          <div className="gs-skeleton gs-skeleton--text" style={{ width: '60%' }} />
        </div>
      ))}

      <div className="tpr-progress-note">
        <span className="gs-spinner gs-spinner--sm" />
        Building your day-by-day plan, costs and booking links…
      </div>
    </div>
  );
}

function CostCard({ id, value, total }) {
  const meta = COST_META[id];
  const numeric = Number(value) || 0;
  const share = total > 0 ? Math.round((numeric / total) * 100) : 0;

  return (
    <div className="tpr-card tpr-cost">
      <div className="tpr-cost__head">
        <span className="tpr-cost__icon" aria-hidden="true">{meta.icon}</span>
        <span className="tpr-cost__label">{meta.label}</span>
      </div>
      <div className="tpr-cost__value">{formatINR(value)}</div>
      {total > 0 && (
        <>
          <div className="tpr-cost__bar" role="presentation">
            <span style={{ width: `${share}%` }} />
          </div>
          <div className="tpr-cost__share">{share}% of total</div>
        </>
      )}
    </div>
  );
}

function DayCard({ day, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const schedule = Array.isArray(day.schedule) ? day.schedule : [];
  const food = day.foodRecommendations || [];
  const travel = day.travelSuggestions || [];
  const notes = day.notes || [];

  return (
    <article className={`tpr-card tpr-day${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="tpr-day__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="tpr-day__badge">Day {day.day}</span>
        <span className="tpr-day__headings">
          <span className="tpr-day__focus">{day.focus}</span>
          {day.dateLabel && <span className="tpr-day__date">{day.dateLabel}</span>}
        </span>
        <span className="tpr-day__meta">
          {schedule.length > 0 && <span className="tpr-day__count">{schedule.length} stops</span>}
          <span className="tpr-day__chevron" aria-hidden="true">⌄</span>
        </span>
      </button>

      {open && (
        <div className="tpr-day__body">
          {schedule.length > 0 && (
            <ol className="tpr-timeline">
              {schedule.map((slot, index) => (
                <li className="tpr-timeline__item" key={`${slot.time}-${index}`}>
                  <div className="tpr-timeline__time">{slot.time}</div>
                  <div className="tpr-timeline__marker" aria-hidden="true" />
                  <div className="tpr-timeline__content">
                    <div className="tpr-timeline__activity">{slot.activity}</div>
                    {slot.details && <div className="tpr-timeline__detail">{slot.details}</div>}
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="tpr-day__lists">
            {food.length > 0 && (
              <div className="tpr-list-block">
                <h5 className="tpr-list-block__title"><span aria-hidden="true">🍽️</span> Food</h5>
                <ul className="tpr-list">
                  {food.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>
            )}

            {travel.length > 0 && (
              <div className="tpr-list-block">
                <h5 className="tpr-list-block__title"><span aria-hidden="true">🧭</span> Getting around</h5>
                <ul className="tpr-list">
                  {travel.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>

          {notes.length > 0 && (
            <div className="tpr-notes">
              <h5 className="tpr-list-block__title"><span aria-hidden="true">💡</span> Notes</h5>
              <ul className="tpr-list">
                {notes.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function TripPlannerResult({ plan, error, isLoading, onRegenerate }) {
  const [downloading, setDownloading] = useState(false);

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <div className="gs-state gs-state--error tpr-state">
        <div className="gs-state__icon" aria-hidden="true">⚠️</div>
        <h3 className="gs-state__title">Unable to generate trip plan</h3>
        <p className="gs-state__text">{error}</p>
        {onRegenerate && (
          <button type="button" className="gs-btn gs-btn--secondary" onClick={onRegenerate}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="gs-state tpr-state">
        <div className="gs-state__icon" aria-hidden="true">🗺️</div>
        <h3 className="gs-state__title">Your itinerary will appear here</h3>
        <p className="gs-state__text">
          Set your days, budget and interests on the left, then generate a plan.
        </p>

        {/* The right column is the largest area on the page and used to sit
            empty until a plan existed. Showing what a plan contains makes the
            wait legible instead of blank. */}
        <ul className="tpr-preview">
          {PREVIEW_ITEMS.map((item) => (
            <li className="tpr-preview__item" key={item.title}>
              <span className="tpr-preview__icon" aria-hidden="true">{item.icon}</span>
              <span className="tpr-preview__body">
                <span className="tpr-preview__title">{item.title}</span>
                <span className="tpr-preview__text">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const cost = plan.costBreakdown || {};
  const total = Number(cost.total) || 0;
  const notes = Array.isArray(cost.notes) ? cost.notes : [];
  const days = Array.isArray(plan.days) ? plan.days : [];
  const links = Array.isArray(plan.bookingLinks) ? plan.bookingLinks : [];
  const isAi = plan?.metadata?.source === 'ai';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTripPlanPdf(plan);
    } catch (err) {
      console.error('Trip plan PDF export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="tpr">
      {/* Hero summary */}
      <section className="tpr-card tpr-hero">
        <div className="tpr-hero__top">
          <h2 className="tpr-hero__title">{plan.title}</h2>
          <span className={`gs-badge ${isAi ? 'gs-badge--accent' : ''}`}>
            {isAi ? '✨ AI-assisted' : 'Logical planner'}
          </span>
        </div>

        {plan.summary && (
          <div className="tpr-hero__summary">{renderRichText(plan.summary)}</div>
        )}

        {plan.weatherAdvice && (
          <div className="tpr-advice">
            <span className="tpr-advice__icon" aria-hidden="true">🌤️</span>
            <div className="tpr-advice__text">{renderRichText(plan.weatherAdvice)}</div>
          </div>
        )}

        <div className="tpr-hero__stats">
          {days.length > 0 && (
            <div className="tpr-stat">
              <span className="tpr-stat__value">{days.length}</span>
              <span className="tpr-stat__label">{days.length === 1 ? 'Day' : 'Days'}</span>
            </div>
          )}
          {total > 0 && (
            <div className="tpr-stat">
              <span className="tpr-stat__value">{formatINR(total)}</span>
              <span className="tpr-stat__label">Est. total</span>
            </div>
          )}
          {links.length > 0 && (
            <div className="tpr-stat">
              <span className="tpr-stat__value">{links.length}</span>
              <span className="tpr-stat__label">Booking links</span>
            </div>
          )}
        </div>
      </section>

      {/* Cost */}
      <div className="tpr-section-title"><span>Cost estimation</span></div>
      <div className="tpr-cost-grid">
        {Object.keys(COST_META).map((id) => (
          <CostCard key={id} id={id} value={cost[id]} total={total} />
        ))}
      </div>

      <div className="tpr-total">
        <span className="tpr-total__label">Total estimate</span>
        <span className="tpr-total__value">{formatINR(cost.total)}</span>
      </div>

      {notes.length > 0 && (
        <ul className="tpr-cost-notes">
          {notes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}
        </ul>
      )}

      {/* Itinerary */}
      {days.length > 0 && (
        <>
          <div className="tpr-section-title"><span>Day-wise itinerary</span></div>
          <div className="tpr-days">
            {days.map((day, index) => (
              <DayCard key={day.day ?? index} day={day} defaultOpen={index === 0} />
            ))}
          </div>
        </>
      )}

      {/* Booking links */}
      {links.length > 0 && (
        <>
          <div className="tpr-section-title"><span>Booking links</span></div>
          <div className="tpr-links">
            {links.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tpr-link"
              >
                <span className="tpr-link__label">{link.label}</span>
                <span className="tpr-link__arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="tpr-actions">
        <button
          type="button"
          className={`gs-btn gs-btn--primary${downloading ? ' gs-btn--loading' : ''}`}
          onClick={handleDownload}
          disabled={downloading}
        >
          <span aria-hidden="true">⬇</span> Download PDF
        </button>
        <button type="button" className="gs-btn gs-btn--secondary" onClick={onRegenerate}>
          <span aria-hidden="true">↻</span> Regenerate
        </button>
      </div>
    </div>
  );
}

export default TripPlannerResult;
