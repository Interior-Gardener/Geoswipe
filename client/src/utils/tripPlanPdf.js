import { jsPDF } from 'jspdf';
import { formatINR } from './tripPlannerService';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 42;
const MARGIN_Y = 40;
const LINE_HEIGHT = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function sanitizeFileName(rawName = 'trip-plan') {
  return String(rawName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'trip-plan';
}

function addPageIfNeeded(doc, cursorY, requiredHeight = LINE_HEIGHT) {
  if (cursorY + requiredHeight <= PAGE_HEIGHT - MARGIN_Y) {
    return cursorY;
  }

  doc.addPage();
  return MARGIN_Y;
}

function writeWrappedText(doc, text, cursorY, options = {}) {
  const {
    fontSize = 11,
    fontStyle = 'normal',
    color = [35, 35, 35],
    extraGapAfter = 6
  } = options;

  if (!text) {
    return cursorY;
  }

  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);

  const lines = doc.splitTextToSize(String(text), CONTENT_WIDTH);
  let y = cursorY;

  lines.forEach((line) => {
    y = addPageIfNeeded(doc, y, LINE_HEIGHT);
    doc.text(line, MARGIN_X, y);
    y += LINE_HEIGHT;
  });

  return y + extraGapAfter;
}

function writeSectionTitle(doc, title, cursorY) {
  let y = addPageIfNeeded(doc, cursorY, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 43, 87);
  doc.text(title, MARGIN_X, y);
  return y + 18;
}

export function downloadTripPlanPdf(plan) {
  if (!plan) {
    return;
  }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = MARGIN_Y;

  const generatedAt = new Date();
  const title = plan.title || 'Trip Plan';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(18, 37, 70);
  doc.text(title, MARGIN_X, y);
  y += 24;

  y = writeWrappedText(doc, `Generated on ${generatedAt.toLocaleString()}`, y, {
    fontSize: 10,
    color: [90, 90, 90],
    extraGapAfter: 10
  });

  if (plan.summary) {
    y = writeWrappedText(doc, plan.summary, y, {
      fontSize: 11,
      color: [38, 38, 38]
    });
  }

  if (plan.weatherAdvice) {
    y = writeWrappedText(doc, `Weather note: ${plan.weatherAdvice}`, y, {
      fontSize: 11,
      color: [36, 64, 122],
      extraGapAfter: 10
    });
  }

  y = writeSectionTitle(doc, 'Cost Breakdown', y);

  const costItems = [
    ['Stay', formatINR(plan.costBreakdown?.stay)],
    ['Food', formatINR(plan.costBreakdown?.food)],
    ['Transport', formatINR(plan.costBreakdown?.transport)],
    ['Entry Fees', formatINR(plan.costBreakdown?.entryFees)],
    ['Total', formatINR(plan.costBreakdown?.total)]
  ];

  costItems.forEach(([label, value]) => {
    y = writeWrappedText(doc, `${label}: ${value}`, y, {
      fontSize: 11,
      color: [30, 30, 30],
      extraGapAfter: 2
    });
  });

  if (Array.isArray(plan.costBreakdown?.notes) && plan.costBreakdown.notes.length > 0) {
    y = writeWrappedText(doc, 'Notes:', y, {
      fontStyle: 'bold',
      fontSize: 11,
      color: [28, 54, 95],
      extraGapAfter: 3
    });

    plan.costBreakdown.notes.forEach((note) => {
      y = writeWrappedText(doc, `- ${note}`, y, {
        fontSize: 10,
        color: [45, 45, 45],
        extraGapAfter: 2
      });
    });
  }

  y += 6;
  y = writeSectionTitle(doc, 'Day-wise Itinerary', y);

  const days = Array.isArray(plan.days) ? plan.days : [];
  days.forEach((day) => {
    const dayTitle = `Day ${day.day || ''}${day.focus ? `: ${day.focus}` : ''}`;
    y = writeWrappedText(doc, dayTitle, y, {
      fontStyle: 'bold',
      fontSize: 12,
      color: [17, 42, 89],
      extraGapAfter: 3
    });

    if (day.dateLabel) {
      y = writeWrappedText(doc, day.dateLabel, y, {
        fontSize: 10,
        color: [95, 95, 95],
        extraGapAfter: 6
      });
    }

    if (Array.isArray(day.schedule) && day.schedule.length > 0) {
      y = writeWrappedText(doc, 'Schedule:', y, {
        fontStyle: 'bold',
        fontSize: 10,
        color: [34, 34, 34],
        extraGapAfter: 3
      });

      day.schedule.forEach((slot) => {
        const line = `${slot.time || ''} - ${slot.activity || ''}${slot.details ? ` (${slot.details})` : ''}`;
        y = writeWrappedText(doc, `- ${line}`, y, {
          fontSize: 10,
          color: [42, 42, 42],
          extraGapAfter: 2
        });
      });
    }

    if (Array.isArray(day.notes) && day.notes.length > 0) {
      y = writeWrappedText(doc, 'Day Notes:', y, {
        fontStyle: 'bold',
        fontSize: 10,
        color: [34, 34, 34],
        extraGapAfter: 3
      });

      day.notes.forEach((note) => {
        y = writeWrappedText(doc, `- ${note}`, y, {
          fontSize: 10,
          color: [42, 42, 42],
          extraGapAfter: 2
        });
      });
    }

    y += 6;
  });

  if (Array.isArray(plan.bookingLinks) && plan.bookingLinks.length > 0) {
    y = writeSectionTitle(doc, 'Booking Links', y);

    plan.bookingLinks.forEach((link) => {
      y = writeWrappedText(doc, `${link.label}: ${link.url}`, y, {
        fontSize: 9,
        color: [38, 85, 150],
        extraGapAfter: 4
      });
    });
  }

  const fileName = `${sanitizeFileName(title)}.pdf`;
  doc.save(fileName);
}
