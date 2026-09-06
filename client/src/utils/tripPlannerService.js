import { fetchWeatherData } from './openWeatherService';
import { generateTripPlanWithAI } from './tripPlannerAIService';

const BUDGET_PRESETS = {
  low: {
    stayPerPersonPerNight: 1500,
    foodPerPersonPerDay: 700,
    localTransportPerPersonPerDay: 500,
    intercityBase: 3000,
  },
  medium: {
    stayPerPersonPerNight: 3500,
    foodPerPersonPerDay: 1300,
    localTransportPerPersonPerDay: 900,
    intercityBase: 7000,
  },
  high: {
    stayPerPersonPerNight: 8000,
    foodPerPersonPerDay: 2500,
    localTransportPerPersonPerDay: 1800,
    intercityBase: 14000,
  },
};

const DEFAULT_PREFERENCES = ['history', 'food'];

function toDateLabel(startDate, dayOffset) {
  if (!startDate) {
    return `Day ${dayOffset + 1}`;
  }

  const date = new Date(startDate);
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function getSafeSiteLocation(siteData) {
  return {
    city: siteData?.location?.city || 'the destination city',
    state: siteData?.location?.state || 'the region',
    country: siteData?.location?.country || 'India',
    coordinates: Array.isArray(siteData?.coordinates)
      ? siteData.coordinates
      : Array.isArray(siteData?.location?.coordinates)
      ? siteData.location.coordinates
      : null,
  };
}

function parseEntryFee(entryFeeText, category = 'Monument') {
  if (!entryFeeText || typeof entryFeeText !== 'string') {
    const fallbackByCategory = {
      'UNESCO World Heritage': 60,
      'Historic Fort': 35,
      'Rock-cut Cave': 50,
      Temple: 40,
      Monument: 45,
      Palace: 80,
      Museum: 100,
      'Historic Building': 50,
    };
    return fallbackByCategory[category] || 50;
  }

  const inrMatches = entryFeeText.match(/₹\s?([\d,]+)/g);
  if (!inrMatches || inrMatches.length === 0) {
    return 50;
  }

  const values = inrMatches
    .map((token) => Number(token.replace(/[^\d]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return 50;
  }

  return Math.min(...values);
}

function roundToHundreds(value) {
  return Math.round(value / 100) * 100;
}

function buildBookingLinks({ siteName, city, state, originCity, coordinates }) {
  const destinationLabel = [city, state].filter(Boolean).join(', ') || siteName;
  const encodedDestination = encodeURIComponent(destinationLabel);
  const encodedRouteQuery = encodeURIComponent(`flights from ${originCity || 'India'} to ${destinationLabel}`);

  const links = [
    {
      label: `Book Hotels in ${destinationLabel}`,
      url: `https://www.booking.com/searchresults.html?ss=${encodedDestination}`,
    },
    {
      label: `Find Flights (${originCity || 'Your City'} to ${destinationLabel})`,
      url: `https://www.google.com/search?q=${encodedRouteQuery}`,
    },
    {
      label: `Check Trains on IRCTC`,
      url: 'https://www.irctc.co.in/nget/train-search',
    },
    {
      label: `Find Local Transport on Google Maps`,
      url: coordinates
        ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationLabel)}`,
    },
  ];

  return links;
}

function getWeatherForDay(weatherData, index) {
  if (!weatherData?.forecast || !Array.isArray(weatherData.forecast)) {
    return null;
  }

  return weatherData.forecast[index] || weatherData.forecast[weatherData.forecast.length - 1] || null;
}

function weatherNote(dayWeather) {
  if (!dayWeather) {
    return 'No weather forecast available. Keep a flexible plan.';
  }

  const condition = (dayWeather.condition || '').toLowerCase();

  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm')) {
    return 'Rain is likely. Keep museum/indoor activities in the afternoon and carry rain protection.';
  }

  if (dayWeather.tempMax >= 35) {
    return 'Warm day expected. Plan outdoor exploration early morning and after 4 PM.';
  }

  if (dayWeather.tempMin <= 12) {
    return 'Cool morning/evening expected. Carry a light jacket for sunrise/sunset slots.';
  }

  return 'Weather looks travel-friendly. Outdoor exploration windows are good through the day.';
}

function getPreferenceActivities(preferences, siteName, city) {
  const prefSet = new Set(preferences || []);

  const activities = [];
  if (prefSet.has('history')) {
    activities.push(`Guided deep-dive on the history of ${siteName}`);
  }
  if (prefSet.has('food')) {
    activities.push(`Regional food trail in ${city}`);
  }
  if (prefSet.has('relaxed')) {
    activities.push(`Slow evening walk and sunset photography around ${siteName}`);
  }
  if (prefSet.has('photography')) {
    activities.push(`Golden-hour photography spots near ${siteName}`);
  }
  if (prefSet.has('culture')) {
    activities.push(`Cultural market and handicraft exploration in ${city}`);
  }

  if (activities.length === 0) {
    activities.push(`Local heritage and food immersion in ${city}`);
  }

  return activities;
}

function createDayPlan({
  day,
  days,
  siteName,
  city,
  preferences,
  startDate,
  weatherData,
  visitorTips,
}) {
  const dailyWeather = getWeatherForDay(weatherData, day - 1);
  const rainExpected =
    dailyWeather &&
    typeof dailyWeather.condition === 'string' &&
    /rain|drizzle|storm/i.test(dailyWeather.condition);

  const preferenceActivities = getPreferenceActivities(preferences, siteName, city);
  const focus = day === 1
    ? `${siteName} Core Experience`
    : day === days
    ? `${city} Wrap-up + Local Exploration`
    : `${city} Heritage + Culture Day ${day}`;

  const schedule = [
    {
      time: '08:00 - 10:30',
      activity: `Primary visit to ${siteName}`,
      details: rainExpected
        ? `Start with ticketed/covered sections first and keep outdoor photo points for clear windows.`
        : `Explore main viewpoints and architecture details while crowds are lighter.`,
    },
    {
      time: '11:00 - 13:00',
      activity: rainExpected ? 'Indoor heritage museum/cultural center' : 'Nearby attraction circuit',
      details: rainExpected
        ? `Use this slot for indoor exhibits and interpretation centers in ${city}.`
        : `Add one nearby monument, craft hub, or old-city walk in ${city}.`,
    },
    {
      time: '14:30 - 17:30',
      activity: preferenceActivities[(day - 1) % preferenceActivities.length],
      details: `Keep buffer for local traffic and ticket queues.`,
    },
    {
      time: '18:30 - 20:30',
      activity: 'Evening local cuisine and market stroll',
      details: `Reserve dinner near your stay to reduce late-night transfers.`,
    },
  ];

  const foodRecommendations = [
    `Breakfast: local cafe with regional staples in ${city}`,
    'Lunch: authentic thali or regional cuisine near the heritage circuit',
    'Evening: street-food or curated local dining in a well-reviewed area',
  ];

  const travelSuggestions = [
    'Use app-based cabs for point-to-point city travel during peak hours.',
    'Keep 30-40 minutes transfer buffer between itinerary slots.',
    day === 1
      ? `Confirm opening hours and ticket windows for ${siteName} in advance.`
      : 'Bundle nearby attractions in one direction to avoid backtracking.',
  ];

  const notes = [
    weatherNote(dailyWeather),
    ...(visitorTips?.slice(0, 2) || []),
  ];

  return {
    day,
    focus,
    dateLabel: toDateLabel(startDate, day - 1),
    schedule,
    foodRecommendations,
    travelSuggestions,
    notes,
  };
}

function estimateCosts({
  days,
  travelers,
  budgetType,
  customBudget,
  siteData,
  originCity,
  transportPreference,
}) {
  const normalizedBudget = budgetType === 'custom' ? 'medium' : budgetType;
  const rates = BUDGET_PRESETS[normalizedBudget] || BUDGET_PRESETS.medium;

  if (budgetType === 'custom' && Number(customBudget) > 0) {
    const total = Number(customBudget);
    const stay = roundToHundreds(total * 0.36);
    const food = roundToHundreds(total * 0.24);
    const transport = roundToHundreds(total * 0.30);
    const entryFees = Math.max(500, roundToHundreds(total * 0.1));

    return {
      currency: 'INR',
      stay,
      food,
      transport,
      entryFees,
      total: stay + food + transport + entryFees,
      notes: [
        'Custom budget split applied (Stay 36%, Food 24%, Transport 30%, Entry 10%).',
        'Adjust stay class or travel mode to stay within your exact cap.',
      ],
    };
  }

  const stay = roundToHundreds(rates.stayPerPersonPerNight * travelers * Math.max(days - 1, 1));
  const food = roundToHundreds(rates.foodPerPersonPerDay * travelers * days);
  const localTransport = roundToHundreds(rates.localTransportPerPersonPerDay * travelers * days);

  let intercityMultiplier = 1;
  if (transportPreference === 'flight') intercityMultiplier = 1.35;
  if (transportPreference === 'train') intercityMultiplier = 0.7;
  if (transportPreference === 'road') intercityMultiplier = 0.9;

  const intercityTransport = originCity
    ? roundToHundreds(rates.intercityBase * intercityMultiplier * travelers)
    : 0;

  const entryFeePerPerson = parseEntryFee(
    siteData?.visitorinfo?.entryFee || siteData?.visitor_info?.entryFee,
    siteData?.category
  );

  const entryFees = roundToHundreds(entryFeePerPerson * travelers * Math.max(1, Math.ceil(days / 2)));
  const transport = localTransport + intercityTransport;
  const total = stay + food + transport + entryFees;

  return {
    currency: 'INR',
    stay,
    food,
    transport,
    entryFees,
    total,
    notes: [
      originCity
        ? `Includes approximate intercity transfer from ${originCity}.`
        : 'Intercity transfer excluded (origin city not provided).',
      'Transport includes local commuting and transfer buffers.',
    ],
  };
}

function normalizeInput(input = {}) {
  const days = Number(input.days) || 2;
  const travelers = Number(input.travelers) || 1;

  return {
    days: Math.min(Math.max(days, 1), 10),
    travelers: Math.min(Math.max(travelers, 1), 20),
    budgetType: input.budgetType || 'medium',
    customBudget: Number(input.customBudget) || 0,
    originCity: (input.originCity || '').trim(),
    preferences:
      Array.isArray(input.preferences) && input.preferences.length > 0
        ? input.preferences
        : DEFAULT_PREFERENCES,
    startDate: input.startDate || '',
    transportPreference: input.transportPreference || 'any',
  };
}

function validateSiteData(siteData) {
  return !!siteData?.name;
}

function createFallbackPlan({ siteData, tripInput, weatherData }) {
  const siteName = siteData.name;
  const { city, state, coordinates } = getSafeSiteLocation(siteData);

  const days = [];
  for (let index = 0; index < tripInput.days; index += 1) {
    days.push(
      createDayPlan({
        day: index + 1,
        days: tripInput.days,
        siteName,
        city,
        preferences: tripInput.preferences,
        startDate: tripInput.startDate,
        weatherData,
        visitorTips: siteData?.info?.visitingTips,
      })
    );
  }

  const costBreakdown = estimateCosts({
    days: tripInput.days,
    travelers: tripInput.travelers,
    budgetType: tripInput.budgetType,
    customBudget: tripInput.customBudget,
    siteData,
    originCity: tripInput.originCity,
    transportPreference: tripInput.transportPreference,
  });

  const bookingLinks = buildBookingLinks({
    siteName,
    city,
    state,
    originCity: tripInput.originCity,
    coordinates,
  });

  const weatherAdvice = weatherNote(getWeatherForDay(weatherData, 0));

  return {
    title: `${tripInput.days}-Day Trip Plan for ${siteName}`,
    summary: `A ${tripInput.days}-day itinerary for ${siteName}, tuned for ${tripInput.travelers} traveler(s) with ${tripInput.budgetType} budget in ${city}.`,
    weatherAdvice,
    days,
    costBreakdown,
    bookingLinks,
    metadata: {
      source: 'logical',
      generatedAt: new Date().toISOString(),
      weatherUsed: Boolean(weatherData),
    },
  };
}

function mergeAiWithFallback(aiPlan, fallbackPlan) {
  if (!aiPlan) {
    return fallbackPlan;
  }

  return {
    ...fallbackPlan,
    ...aiPlan,
    costBreakdown: {
      ...fallbackPlan.costBreakdown,
      ...(aiPlan.costBreakdown || {}),
      currency: 'INR',
    },
    bookingLinks:
      Array.isArray(aiPlan.bookingLinks) && aiPlan.bookingLinks.length > 0
        ? aiPlan.bookingLinks
        : fallbackPlan.bookingLinks,
    metadata: {
      source: 'ai',
      generatedAt: new Date().toISOString(),
      weatherUsed: Boolean(fallbackPlan.metadata?.weatherUsed),
    },
  };
}

export async function generateTripPlan({ siteData, input, useAI = true }) {
  if (!validateSiteData(siteData)) {
    throw new Error('Trip planner requires a valid heritage site selection.');
  }

  const tripInput = normalizeInput(input);

  const coordinates = Array.isArray(siteData?.coordinates)
    ? siteData.coordinates
    : Array.isArray(siteData?.location?.coordinates)
    ? siteData.location.coordinates
    : null;

  let weatherData = null;
  if (coordinates && coordinates.length === 2) {
    try {
      weatherData = await fetchWeatherData(coordinates[1], coordinates[0]);
    } catch (error) {
      console.warn('Trip planner weather fetch skipped:', error?.message || error);
    }
  }

  const fallbackPlan = createFallbackPlan({ siteData, tripInput, weatherData });

  if (!useAI) {
    return fallbackPlan;
  }

  const aiPlan = await generateTripPlanWithAI({
    siteData,
    tripInput,
    weatherData,
  });

  return mergeAiWithFallback(aiPlan, fallbackPlan);
}

export function getTripPlannerDefaults() {
  return {
    days: 2,
    budgetType: 'medium',
    customBudget: '',
    travelers: 2,
    originCity: '',
    preferences: ['history', 'food'],
    startDate: '',
    transportPreference: 'any',
  };
}

export function formatINR(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
