// Trip planner AI service.
//
// SECURITY: previously called api.groq.com directly from the browser using
// VITE_GROQ_CHATBOT_API_KEY. The key is now server-side only; this talks to the
// server's /api/ai/chat proxy under the 'tripPlanner' profile.

import { API_BASE_URL } from './apiConfig';
import { reportApiFailure, reportNetworkFailure } from './apiError';

function stripJsonFence(text) {
  if (!text || typeof text !== 'string') return null;
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function buildWeatherSummary(weatherData) {
  if (!weatherData || !weatherData.current) {
    return 'Weather data unavailable.';
  }

  const current = weatherData.current;
  const forecast = Array.isArray(weatherData.forecast)
    ? weatherData.forecast.slice(0, 5).map((day) => ({
        date: day.dateStr,
        condition: day.condition,
        max: day.tempMax,
        min: day.tempMin,
      }))
    : [];

  return JSON.stringify({
    current: {
      condition: current.condition,
      description: current.description,
      temp: current.temp,
      humidity: current.humidity,
      wind: current.wind?.speed,
    },
    forecast,
  });
}

function buildPrompt({ siteData, tripInput, weatherData }) {
  const siteName = siteData?.name || 'Unknown Site';
  const city = siteData?.location?.city || 'Unknown City';
  const state = siteData?.location?.state || 'Unknown State';

  const context = {
    site: {
      name: siteName,
      category: siteData?.category || '',
      city,
      state,
      country: siteData?.location?.country || 'India',
      infoSummary: siteData?.info?.summary || '',
      visitingTips: siteData?.info?.visitingTips || [],
      timings: siteData?.visitorinfo?.timings || siteData?.visitor_info?.timings || '',
      entryFee: siteData?.visitorinfo?.entryFee || siteData?.visitor_info?.entryFee || '',
      bestTimeToVisit:
        siteData?.visitorinfo?.bestTimeToVisit ||
        siteData?.visitor_info?.bestTimeToVisit ||
        '',
      howToReach: siteData?.howToReach || {},
    },
    tripInput,
    weatherSummary: buildWeatherSummary(weatherData),
  };

  return `Create a practical and contextual trip plan for an Indian heritage destination.\n\nRules:\n- Output JSON only. No markdown, no explanation text.\n- Keep recommendations realistic for India and specific to the given city/site context.\n- Include day-wise itinerary with timings, food suggestions, and travel suggestions.\n- Keep the language concise and actionable.\n- Currency must be INR.\n- Add booking links for hotels, flights, trains, and local transport.\n\nJSON schema:\n{\n  "title": string,\n  "summary": string,\n  "weatherAdvice": string,\n  "days": [\n    {\n      "day": number,\n      "focus": string,\n      "dateLabel": string,\n      "schedule": [\n        {"time": string, "activity": string, "details": string}\n      ],\n      "foodRecommendations": [string],\n      "travelSuggestions": [string],\n      "notes": [string]\n    }\n  ],\n  "costBreakdown": {\n    "currency": "INR",\n    "stay": number,\n    "food": number,\n    "transport": number,\n    "entryFees": number,\n    "total": number,\n    "notes": [string]\n  },\n  "bookingLinks": [\n    {"label": string, "url": string}\n  ]\n}\n\nInput context:\n${JSON.stringify(context, null, 2)}`;
}

function normalizeAiPlan(rawPlan) {
  if (!rawPlan || typeof rawPlan !== 'object') return null;

  const normalizedDays = Array.isArray(rawPlan.days)
    ? rawPlan.days
        .filter((day) => day && typeof day === 'object')
        .map((day, index) => ({
          day: Number(day.day) || index + 1,
          focus: day.focus || `Day ${index + 1}`,
          dateLabel: day.dateLabel || '',
          schedule: Array.isArray(day.schedule)
            ? day.schedule
                .filter((item) => item && typeof item === 'object')
                .map((item) => ({
                  time: item.time || 'Flexible',
                  activity: item.activity || 'Planned activity',
                  details: item.details || '',
                }))
            : [],
          foodRecommendations: Array.isArray(day.foodRecommendations)
            ? day.foodRecommendations.filter(Boolean)
            : [],
          travelSuggestions: Array.isArray(day.travelSuggestions)
            ? day.travelSuggestions.filter(Boolean)
            : [],
          notes: Array.isArray(day.notes) ? day.notes.filter(Boolean) : [],
        }))
    : [];

  const cost = rawPlan.costBreakdown || {};
  const stay = Number(cost.stay) || 0;
  const food = Number(cost.food) || 0;
  const transport = Number(cost.transport) || 0;
  const entryFees = Number(cost.entryFees) || 0;
  const total = Number(cost.total) || stay + food + transport + entryFees;

  const bookingLinks = Array.isArray(rawPlan.bookingLinks)
    ? rawPlan.bookingLinks
        .filter((item) => item?.url)
        .map((item) => ({
          label: item.label || 'Booking Link',
          url: item.url,
        }))
    : [];

  if (normalizedDays.length === 0 || bookingLinks.length === 0) {
    return null;
  }

  return {
    title: rawPlan.title || 'Trip Plan',
    summary: rawPlan.summary || '',
    weatherAdvice: rawPlan.weatherAdvice || '',
    days: normalizedDays,
    costBreakdown: {
      currency: 'INR',
      stay,
      food,
      transport,
      entryFees,
      total,
      notes: Array.isArray(cost.notes) ? cost.notes.filter(Boolean) : [],
    },
    bookingLinks,
  };
}

export async function generateTripPlanWithAI({ siteData, tripInput, weatherData }) {
  const url = `${API_BASE_URL}/api/ai/chat`;

  try {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: 'tripPlanner',
          messages: [
            {
              role: 'user',
              content: buildPrompt({ siteData, tripInput, weatherData }),
            },
          ],
        }),
      });
    } catch (networkError) {
      reportNetworkFailure(networkError, 'Trip planner AI', url);
      return null;
    }

    if (!response.ok) {
      await reportApiFailure(response, 'Trip planner AI', url);
      return null;
    }

    const data = await response.json();
    const content = data?.message;
    const jsonText = stripJsonFence(content);
    if (!jsonText) {
      return null;
    }

    const parsed = JSON.parse(jsonText);
    return normalizeAiPlan(parsed);
  } catch (error) {
    console.warn('Trip Planner AI generation failed:', error?.message || error);
    return null;
  }
}
