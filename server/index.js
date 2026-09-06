// server/index.js
const { isProduction, secrets, allowedOrigins, reportConfiguration } = require('./config/env');
const { securityHeaders, safeError, errorHandler } = require('./middleware/security');
const { exactMatchRegex, containsRegex, sanitizeText } = require('./middleware/validation');

const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Shared origin check for both HTTP and WebSocket transports.
// SECURITY: this replaces a blanket `origin: "*"`. In production only the
// configured ALLOWED_ORIGINS may connect; in development the localhost dev
// servers are allowed. Requests with no Origin header (curl, server-to-server,
// the Python gesture client) are permitted - they are not browser requests and
// carry no ambient credentials to protect.
function isOriginAllowed(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

function corsOriginCallback(origin, callback) {
  // Signal allow/deny rather than raising: a disallowed origin simply gets no
  // Access-Control-Allow-Origin header, which is what actually stops the
  // browser. Throwing here would turn every such request into a 500 and bury
  // genuine server errors in the noise.
  return callback(null, isOriginAllowed(origin));
}

const io = require('socket.io')(http, {
  cors: {
    origin: corsOriginCallback,
    // No cookies/authorization are used on the socket channel, so credentials
    // stay off - that also keeps a wildcard from ever becoming exploitable.
    credentials: false
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  // Video frames are capped far below this in the handler; keep the transport
  // ceiling modest so a single socket cannot buffer huge payloads.
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling']
});
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Country = require("./models/Country"); 
const HeritageSite = require("./models/HeritageSite");
const QuizQuestion = require("./models/QuizQuestion");
const { getFlagCountriesWithCache } = require('./services/flagImageService');
const STATIC_COUNTRIES = require('./data/countries');
const { resolveMonumentImageWithFallback } = require('./services/monumentImageService');

// Trust the first proxy hop so rate limiting keys on the real client IP rather
// than the proxy's, when deployed behind one.
app.set('trust proxy', 1);
// Don't advertise the framework version to attackers.
app.disable('x-powered-by');

// Security headers on every response.
app.use(securityHeaders);

// Body limits: no endpoint here accepts a large upload, and the previous 10mb
// ceiling let an anonymous caller tie up memory cheaply.
app.use(express.json({ limit: '128kb' }));
app.use(express.urlencoded({ extended: true, limit: '128kb' }));

app.use(cors({
  origin: corsOriginCallback,
  // No cookie or Authorization-based sessions exist, so credentialed
  // cross-origin requests are never needed.
  credentials: false
}));

// Add compression middleware for better performance
const compression = require('compression');
app.use(compression());

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
// Global safety net only. The frontend is chatty by design - opening Heritage
// Mode alone fetches the site list, GeoJSON and per-monument imagery - so a
// tight global cap locked real users out with 429s. The endpoints that
// actually cost money or third-party quota (/api/ai, /api/weather, /api/maps)
// carry their own much stricter limiters.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1200, // per-IP ceiling across the whole API surface
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
  // Never rate-limit the diagnostics/health probes.
  skip: (req) => req.path === '/diagnostics' || req.path === '/health'
});
app.use('/api/', limiter);

// Routes that spend money or third-party quota on our credentials.
app.use('/api/ai', require('./routes/aiProxy'));
app.use('/api/weather', require('./routes/weatherProxy'));
app.use('/api/maps', require('./routes/mapProxy'));
// Reports the live health of every external integration, with the provider's
// own error text and a concrete fix hint for anything failing.
app.use('/api/diagnostics', require('./routes/diagnostics'));

// ===== OPTIMIZED MONGO CONNECTION =====
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(secrets.mongodbUri || "mongodb://127.0.0.1:27017/geoswipedb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Connect to MongoDB
connectDB().then(() => {
  const shouldPrewarmImages =
    String(process.env.PREWARM_MONUMENT_IMAGES || 'true').toLowerCase() !== 'false';

  if (!shouldPrewarmImages) {
    return;
  }

  setTimeout(async () => {
    try {
      const hotSites = await HeritageSite.find({}, 'name location media').limit(6).lean();
      await Promise.allSettled(hotSites.map((site) => resolveMonumentImageWithFallback(site)));
      console.log(`🖼️ Monument image prewarm complete (${hotSites.length} sites)`);
    } catch (prewarmError) {
      console.warn('Monument image prewarm skipped:', prewarmError.message || prewarmError);
    }
  }, 1500);
});

// Cache for country data to avoid repeated DB queries
let countryCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

//Country population from the bundled static dataset (One Time)
//
// This previously fetched https://restcountries.com/v3.1/all. That API is now
// deprecated: it 301-redirects and returns {success:false,...} instead of an
// array, so `data.filter` threw, the Country collection stayed empty, and
// /api/country-question answered 503 - breaking the quiz game. Country names
// are static reference data and are now bundled with the server.
async function populateCountries() {
  try {
    const count = await Country.countDocuments();
    if (count > 0) {
      return;
    }

    const countryDocs = STATIC_COUNTRIES
      .filter((c) => c.name)
      .map((c) => ({ name: c.name.toLowerCase().trim() }));

    if (countryDocs.length === 0) {
      console.error('[countries] Static country dataset is empty - server/data/countries.js may be corrupt.');
      return;
    }

    await Country.insertMany(countryDocs, { ordered: false });
    console.log(`✅ Seeded ${countryDocs.length} countries from the bundled dataset`);

    countryCache = countryDocs.map((c) => c.name);
    cacheExpiry = Date.now() + CACHE_DURATION;
  } catch (error) {
    console.error('[countries] Failed to seed country list:', error.message || error);
    // Don't crash the server, just log the error
  }
}

//Optimized Country List Retrieval with Caching
async function getCountryListFromDB() {
  // Check cache first
  if (countryCache && cacheExpiry && Date.now() < cacheExpiry) {
    return countryCache;
  }
  
  try {
    const countries = await Country.find({}, 'name').lean(); // Use lean() for better performance
    countryCache = countries.map(c => c.name);
    cacheExpiry = Date.now() + CACHE_DURATION;
    return countryCache;
  } catch (error) {
    console.error('Error fetching countries from DB:', error);
    return countryCache || []; // Return cached data if available, otherwise empty array
  }
}

// Seeds the heritage quiz question bank if it is empty.
//
// The heritage quiz answered "No quiz questions available" (404) purely because
// the quiz_questions collection was never populated - the seed data shipped in
// heritage_quiz_data.js but had to be run by hand against a hardcoded local
// MongoDB. Seeding here makes the quiz work against whatever MONGODB_URI is
// configured, without a manual step.
async function populateQuizQuestions() {
  try {
    const count = await QuizQuestion.countDocuments();
    if (count > 0) {
      return;
    }

    const { quizQuestions } = require('./heritage_quiz_data');

    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      console.error('[quiz] heritage_quiz_data.js exported no questions - heritage quiz will be unavailable.');
      return;
    }

    await QuizQuestion.insertMany(quizQuestions, { ordered: false });
    console.log(`✅ Seeded ${quizQuestions.length} heritage quiz questions`);
  } catch (error) {
    console.error('[quiz] Failed to seed heritage quiz questions:', error.message || error);
    console.error('[quiz] The heritage quiz will return "No quiz questions available" until this is resolved.');
  }
}

// Initialize reference data on startup
populateCountries();
populateQuizQuestions();

//Optimized Country questions api with timeout and error handling
app.get("/api/country-question", async (req, res) => {
  try {
    const countries = await getCountryListFromDB();
    
    if (countries.length === 0) {
      return res.status(503).json({ error: "Country data not available" });
    }

    // Validate and get difficulty parameter
    const difficulty = req.query.difficulty;
    const validDifficulties = ['easy', 'medium', 'hard'];
    const difficultyParam = difficulty && validDifficulties.includes(difficulty.toLowerCase()) 
      ? difficulty.toLowerCase() 
      : null;

    let question = null;
    let attempts = 0;
    let candidatesSeen = 0;
    let lastFailure = null;
    const maxAttempts = 3;
    // Only ~60% of "geography" questions have a COUNTRY as the answer (the rest
    // are cities, regions, rivers...), and this endpoint must return a country
    // so the globe can highlight it. Fetching a BATCH and picking a match makes
    // a miss vanishingly unlikely; the previous code requested a single
    // question per attempt and 503'd - silently - when ten in a row missed.
    const BATCH_SIZE = 20;

    while (!question && attempts < maxAttempts) {
      attempts++;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        // Build API URL with optional difficulty parameter
        const apiUrl = difficultyParam
          ? `https://the-trivia-api.com/v2/questions?categories=geography&difficulties=${difficultyParam}&limit=${BATCH_SIZE}`
          : `https://the-trivia-api.com/v2/questions?categories=geography&limit=${BATCH_SIZE}`;

        const triviaRes = await fetch(
          apiUrl,
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'GeoSwipe/1.0',
              'Accept': 'application/json'
            }
          }
        );

        if (!triviaRes.ok) {
          throw new Error(`the-trivia-api responded with status ${triviaRes.status}`);
        }

        const triviaData = await triviaRes.json();
        if (!Array.isArray(triviaData) || triviaData.length === 0) {
          throw new Error('the-trivia-api returned an unexpected response shape (expected a non-empty array)');
        }

        candidatesSeen += triviaData.length;

        // Take the first question whose answer is a country we know about.
        const match = triviaData.find(
          (q) => q?.correctAnswer && countries.includes(q.correctAnswer.toLowerCase().trim())
        );

        if (match) {
          question = {
            question: match.question?.text || match.question,
            correctAnswer: match.correctAnswer,
            options: [...(match.incorrectAnswers || []), match.correctAnswer]
              .sort(() => Math.random() - 0.5)
          };
        } else {
          console.warn(
            `[country-question] Attempt ${attempts}: none of ${triviaData.length} geography ` +
            `questions had a country answer (difficulty=${difficultyParam || 'any'}). Retrying.`
          );
        }
      } catch (fetchError) {
        lastFailure = fetchError.message || String(fetchError);
        console.warn(
          `[country-question] Attempt ${attempts}/${maxAttempts} failed: ` +
          (fetchError.name === 'AbortError' ? 'upstream timed out after 8000ms' : lastFailure)
        );
        if (attempts < maxAttempts) {
          // Brief backoff before retrying
          await new Promise((resolve) => setTimeout(resolve, 750));
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!question) {
      console.error(
        `[country-question] Giving up after ${attempts} attempt(s), ${candidatesSeen} candidate question(s) examined. ` +
        `Last upstream failure: ${lastFailure || 'none (no country-answer question found)'}. ` +
        `Upstream: https://the-trivia-api.com/v2/questions`
      );
      return res.status(503).json({
        error: "Unable to fetch a geography question at this time",
        detail: lastFailure
          ? `Upstream trivia API error: ${lastFailure}`
          : `No country-answer question found among ${candidatesSeen} candidates`,
        hint: 'the-trivia-api.com is a free public API with no key; this is usually transient. Retry.',
        retry: true
      });
    }

    res.json(question);
  } catch (err) {
    console.error('[country-question] Unexpected failure:', err.message || err);
    res.status(500).json({
      error: "Failed to fetch question",
      retry: true
    });
  }
});

// ===== FLAG GUESS GAME API =====
// Fetch and cache countries with DB persistence + in-memory optimization
async function getFlagCountries() {
  try {
    const countries = await getFlagCountriesWithCache();
    if (!Array.isArray(countries)) {
      return [];
    }

    return countries;
  } catch (error) {
    console.error('Error fetching flag countries:', error.message || error);
    return [];
  }
}

// Get a random country for flag guessing game
app.get("/api/random-flag-country", async (req, res) => {
  try {
    const countries = await getFlagCountries();
    
    if (!countries || countries.length === 0) {
      return res.status(503).json({ error: "Country data not available" });
    }
    
    // Get a random country
    const randomIndex = Math.floor(Math.random() * countries.length);
    const randomCountry = countries[randomIndex];
    
    res.json({
      name: randomCountry.name,
      code: randomCountry.code,
      flagUrl: randomCountry.flagUrl
    });
  } catch (err) {
    console.error('Error in random-flag-country endpoint:', err);
    res.status(500).json({ error: "Failed to fetch random country" });
  }
});

// Get heritage sites for map display (GeoJSON format)
app.get("/api/heritage-sites/geojson", async (req, res) => {
  try {
    const sites = await HeritageSite.find({});
    
    const geoJsonData = {
      type: 'FeatureCollection',
      features: sites.map(site => ({
        type: 'Feature',
        properties: {
          name: site.name,
          category: site.category,
          year: site.year,
          panorama_url: site.media?.panorama_url
        },
        geometry: {
          type: 'Point',
          coordinates: site.location.coordinates
        }
      }))
    };
    
    res.json(geoJsonData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage sites GeoJSON" });
  }
});

// Get detailed heritage site data (for sidebar)
app.get("/api/heritage-sites/:name/details", async (req, res) => {
  try {
    const siteName = decodeURIComponent(req.params.name);
    const site = await HeritageSite.findOne({ 
      name: { $regex: exactMatchRegex(siteName) } 
    });
    
    if (!site) {
      return res.status(404).json({ error: "Heritage site not found" });
    }
    
    // Generate Street View URL dynamically
    const generateStreetViewUrl = (lat, lng, heading = 0, pitch = 0) => {
      return `https://www.google.com/maps/embed?pb=!4v${Date.now()}!6m8!1m7!1s${lat},${lng}!2m2!1d${lat}!2d${lng}!3f${heading}!4f${pitch}!5f0.7820865974627469`;
    };
    
    const [lon, lat] = site.location.coordinates;
    const streetViewUrl = site.view360 ? 
      generateStreetViewUrl(lat, lon, site.view360.heading || 0, site.view360.pitch || 0) : 
      null;

    let monumentImage = null;
    try {
      monumentImage = await resolveMonumentImageWithFallback(site);
    } catch (imageError) {
      console.warn(`Image resolution failed for ${site.name}:`, imageError.message || imageError);
    }
    
    const response = {
      name: site.name,
      category: site.category,
      year: site.year,
      info: site.info,
      howToReach: site.howToReach,
      location: site.location, // Include location data with city/state
      view360: site.view360 ? {
        ...site.view360,
        iframeUrl: streetViewUrl
      } : null,

      model3d: site.model3d,
      media: site.media,
      visitor_info: site.visitor_info,
      monumentImage
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage site details" });
  }
});

// Resolve and return monument image with DB caching and fallback
app.get("/api/heritage-sites/:name/image", async (req, res) => {
  try {
    const siteName = decodeURIComponent(req.params.name);
    const site = await HeritageSite.findOne({
      name: { $regex: exactMatchRegex(siteName) }
    });

    if (!site) {
      return res.status(404).json({ error: 'Heritage site not found' });
    }

    const monumentImage = await resolveMonumentImageWithFallback(site);
    if (!monumentImage?.imageUrl) {
      return res.status(404).json({ error: 'No image available for this monument' });
    }

    return res.json({ success: true, image: monumentImage });
  } catch (error) {
    console.error('Error resolving monument image:', error);
    return res.status(500).json({ error: 'Failed to resolve monument image' });
  }
});

// ===== NEWS API INTEGRATION WITH FALLBACK SYSTEM =====
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2/everything';
// SECURITY: this key was previously hardcoded here as a literal fallback and is
// therefore permanently in git history - it must be rotated. It now resolves
// only from server-side configuration, with no fallback and no VITE_* name.
const NEWSAPI_KEY = secrets.newsApiKey;
const NEWS_ARTICLE_LIMIT = 5; // Limit results for clean UI

/**
 * Fetch news from NewsAPI with a given query
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of articles or empty array
 */
// Remembered so the same misconfiguration isn't logged on every single query.
let newsApiFailureLogged = false;

async function fetchNewsWithQuery(query) {
  // Without a configured key, degrade to "no articles" rather than firing an
  // unauthenticated request at NewsAPI.
  if (!NEWSAPI_KEY) {
    if (!newsApiFailureLogged) {
      console.error('[news] NEWSAPI_KEY is not set in server/.env - news features will return no articles.');
      newsApiFailureLogged = true;
    }
    return [];
  }

  try {
    console.log(`📰 Trying query: ${query}`);

    const response = await fetch(`${NEWSAPI_BASE_URL}?${new URLSearchParams({
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '10',
      apiKey: NEWSAPI_KEY
    })}`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      // Report WHY, not just the status code - a bare "401" left the actual
      // cause (a wrong key in the NEWSAPI_KEY slot) invisible.
      const body = await response.text().catch(() => '');
      let detail = body.slice(0, 300);
      try {
        const parsed = JSON.parse(body);
        detail = `${parsed.code || ''} ${parsed.message || ''}`.trim() || detail;
      } catch { /* keep raw body */ }

      console.error(`[news] NewsAPI ${response.status} for query "${query}": ${detail}`);

      if ((response.status === 401 || response.status === 403) && !newsApiFailureLogged) {
        console.error(
          '[news] NewsAPI rejected the credential. Check NEWSAPI_KEY in server/.env - ' +
          'it must be a NewsAPI key (get one at https://newsapi.org/account), ' +
          'not a key belonging to another provider.'
        );
        newsApiFailureLogged = true;
      }
      if (response.status === 429 && !newsApiFailureLogged) {
        console.error('[news] NewsAPI rate limit / quota exhausted for this key.');
        newsApiFailureLogged = true;
      }
      return [];
    }

    const data = await response.json();

    if (data.status === 'error') {
      console.error(`[news] NewsAPI error response: ${data.code || ''} ${data.message || ''}`);
      return [];
    }

    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
      return data.articles;
    }

    console.log(`[news] NewsAPI returned 0 articles for query "${query}"`);
    return [];
  } catch (err) {
    console.error(`[news] Request to NewsAPI failed for query "${query}": ${err.message || err}`);
    return [];
  }
}

/**
 * Multi-level fallback news fetching
 * Level 1: Monument name + city
 * Level 2: City tourism/heritage
 * Level 3: State tourism/heritage
 * Level 4: India heritage tourism
 * @returns {Object} - { articles, fallbackLevel, fallbackLabel }
 */
async function fetchNewsWithFallback(monumentName, city, state) {
  // Level 1: Monument + City (simplified query using OR)
  const level1Query = city 
    ? `${monumentName} OR "${city} tourism" OR "${city} heritage"`
    : `${monumentName} OR "India heritage"`;
  
  let articles = await fetchNewsWithQuery(level1Query);
  
  if (articles.length > 0) {
    console.log(`✅ Level 1 success: ${articles.length} articles for monument`);
    return {
      articles: articles,
      fallbackLevel: 1,
      fallbackLabel: null
    };
  }

  // Level 2: City tourism/heritage (fallback)
  if (city) {
    const level2Query = `"${city}" AND (tourism OR heritage OR travel OR culture OR monument)`;
    articles = await fetchNewsWithQuery(level2Query);
    
    if (articles.length > 0) {
      console.log(`✅ Level 2 success: ${articles.length} articles for ${city}`);
      return {
        articles: articles,
        fallbackLevel: 2,
        fallbackLabel: `Showing tourism news for ${city}`
      };
    }
  }

  // Level 3: State tourism (fallback)
  if (state) {
    const level3Query = `"${state}" AND (tourism OR heritage OR travel OR monument)`;
    articles = await fetchNewsWithQuery(level3Query);
    
    if (articles.length > 0) {
      console.log(`✅ Level 3 success: ${articles.length} articles for ${state}`);
      return {
        articles: articles,
        fallbackLevel: 3,
        fallbackLabel: `Showing heritage news for ${state}`
      };
    }
  }

  // Level 4: India heritage (final fallback)
  const level4Query = 'India heritage tourism OR "Indian monuments" OR "historical sites India"';
  articles = await fetchNewsWithQuery(level4Query);
  
  if (articles.length > 0) {
    console.log(`✅ Level 4 success: ${articles.length} articles for India heritage`);
    return {
      articles: articles,
      fallbackLevel: 4,
      fallbackLabel: 'Showing heritage news from India'
    };
  }

  // No results at any level
  console.log(`❌ No news found at any fallback level`);
  return {
    articles: [],
    fallbackLevel: 0,
    fallbackLabel: null
  };
}

// Helper: Format articles and add time ago
function formatNewsArticles(articles) {
  return articles.map(article => {
    const now = new Date();
    const published = new Date(article.publishedAt);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeAgo;
    if (diffMins < 1) timeAgo = 'Just now';
    else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
    else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
    else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
    else timeAgo = published.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      title: article.title,
      description: article.description || 'No description available',
      url: article.url,
      source: article.source?.name || 'Unknown Source',
      // Passed through so the client can show a thumbnail; NewsAPI supplies it
      // but it was previously dropped.
      image: article.urlToImage || null,
      publishedAt: article.publishedAt,
      author: article.author || null,
      timeAgo: timeAgo
    };
  }).filter(article => {
    return article.title && 
           article.title !== '[Removed]' && 
           article.url &&
           !article.url.includes('removed.com');
  }).slice(0, NEWS_ARTICLE_LIMIT); // Limit to 5 articles
}

// Get news for a heritage site with multi-level fallback
app.get("/api/news/:siteName", async (req, res) => {
  try {
    const siteName = decodeURIComponent(req.params.siteName);
    console.log(`📰 Fetching news for: ${siteName}`);
    
    // Find the heritage site to get location details
    const site = await HeritageSite.findOne({ 
      name: { $regex: exactMatchRegex(siteName) } 
    });
    
    if (!site) {
      return res.status(404).json({ error: "Heritage site not found" });
    }

    const city = site.location?.city || '';
    const state = site.location?.state || '';

    console.log(`📍 Location: ${city}, ${state}`);

    // Fetch monument news with fallback
    const monumentResult = await fetchNewsWithFallback(siteName, city, state);
    const monumentArticles = formatNewsArticles(monumentResult.articles);

    // Fetch location news (city-focused, separate from monument)
    let locationArticles = [];
    let locationFallbackLabel = null;
    
    if (city) {
      const cityQuery = `"${city}" AND (tourism OR heritage OR travel OR news OR development)`;
      const cityArticles = await fetchNewsWithQuery(cityQuery);
      
      if (cityArticles.length > 0) {
        locationArticles = formatNewsArticles(cityArticles);
      } else if (state) {
        // Fallback to state news
        const stateQuery = `"${state}" AND (tourism OR heritage OR travel OR news)`;
        const stateArticles = await fetchNewsWithQuery(stateQuery);
        locationArticles = formatNewsArticles(stateArticles);
        if (stateArticles.length > 0) {
          locationFallbackLabel = `Showing news for ${state}`;
        }
      }
    }

    // If still no location news, use India news
    if (locationArticles.length === 0) {
      const indiaQuery = 'India tourism OR "India travel" OR "Indian heritage"';
      const indiaArticles = await fetchNewsWithQuery(indiaQuery);
      locationArticles = formatNewsArticles(indiaArticles);
      if (indiaArticles.length > 0) {
        locationFallbackLabel = 'Showing heritage news from India';
      }
    }

    console.log(`✅ Final: ${monumentArticles.length} monument articles, ${locationArticles.length} location articles`);

    res.json({
      success: true,
      monument: {
        name: siteName,
        articles: monumentArticles,
        totalResults: monumentArticles.length,
        fallbackLevel: monumentResult.fallbackLevel,
        fallbackLabel: monumentResult.fallbackLabel
      },
      location: {
        city: city || 'Unknown',
        state: state || 'Unknown',
        articles: locationArticles,
        totalResults: locationArticles.length,
        fallbackLabel: locationFallbackLabel
      },
      fetchedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching news:', err);
    
    if (err.message && err.message.includes('rate limit')) {
      return res.status(429).json({ error: "News API rate limit exceeded. Please try again later." });
    }
    
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ===== SAFETY + EMERGENCY + NAVIGATION APIs =====
// Server-side only. Never sent to the browser - the client reaches MapTiler
// through /api/maps/* instead.
const MAPTILER_API_KEY = secrets.maptilerApiKey || '';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const SAFETY_DEFAULT_RADIUS = 3000;

function parseCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidCoordinatePair(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

function haversineMeters(lon1, lat1, lon2, lat2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function pathDistanceKm(path = []) {
  if (!Array.isArray(path) || path.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let i = 1; i < path.length; i += 1) {
    const [prevLon, prevLat] = path[i - 1];
    const [nextLon, nextLat] = path[i];
    distance += haversineMeters(prevLon, prevLat, nextLon, nextLat);
  }

  return distance / 1000;
}

function buildFallbackSafePlaces(lat, lon, limit = 10) {
  const syntheticPlaces = [
    { name: 'Nearest Hospital', type: 'hospital', dLat: 0.012, dLon: 0.008 },
    { name: 'Police Station', type: 'police', dLat: -0.009, dLon: 0.014 },
    { name: 'Emergency Shelter', type: 'shelter', dLat: 0.006, dLon: -0.012 },
    { name: 'Fire Station', type: 'fire_station', dLat: -0.013, dLon: -0.009 },
    { name: '24x7 Pharmacy', type: 'pharmacy', dLat: 0.017, dLon: 0.005 }
  ];

  return syntheticPlaces.slice(0, Math.max(1, limit)).map((item, index) => {
    const coordinates = [lon + item.dLon, lat + item.dLat];
    return {
      id: `fallback-safe-${index + 1}`,
      name: item.name,
      type: item.type,
      coordinates,
      distanceMeters: Math.round(haversineMeters(lon, lat, coordinates[0], coordinates[1])),
      address: 'Approximate fallback location'
    };
  });
}

async function fetchSafePlacesFromOverpass(lat, lon, radius, limit) {
  const query = `
[out:json][timeout:25];
(
  node["amenity"~"hospital|police|fire_station|pharmacy|shelter"](around:${radius},${lat},${lon});
  way["amenity"~"hospital|police|fire_station|pharmacy|shelter"](around:${radius},${lat},${lon});
  relation["amenity"~"hospital|police|fire_station|pharmacy|shelter"](around:${radius},${lat},${lon});
);
out center tags;
`;

  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    body: query,
    headers: {
      'Content-Type': 'text/plain',
      'User-Agent': 'GeoSwipe/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Overpass lookup failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rawElements = Array.isArray(payload?.elements) ? payload.elements : [];

  const places = rawElements
    .map((element, index) => {
      const coords =
        element.type === 'node'
          ? [element.lon, element.lat]
          : element.center
            ? [element.center.lon, element.center.lat]
            : null;

      if (!coords || !Array.isArray(coords)) {
        return null;
      }

      const amenity = element.tags?.amenity || 'support';
      const name = element.tags?.name || amenity.replace(/_/g, ' ');

      const address = [
        element.tags?.['addr:housenumber'],
        element.tags?.['addr:street'],
        element.tags?.['addr:city']
      ]
        .filter(Boolean)
        .join(', ');

      return {
        id: `safe-place-${element.id || index + 1}`,
        name,
        type: amenity,
        coordinates: coords,
        distanceMeters: Math.round(haversineMeters(lon, lat, coords[0], coords[1])),
        address: address || 'Address unavailable'
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, Math.max(1, limit));

  return places;
}

function buildFallbackRoutes(fromLat, fromLon, toLat, toLon) {
  const midpointLon = (fromLon + toLon) / 2;
  const midpointLat = (fromLat + toLat) / 2;
  const lateralOffset = 0.12 * Math.max(Math.abs(toLon - fromLon), Math.abs(toLat - fromLat), 0.03);

  const paths = [
    {
      id: 'route-1',
      summary: 'Primary corridor',
      path: [
        [fromLon, fromLat],
        [midpointLon, midpointLat],
        [toLon, toLat]
      ],
      speedKmph: 38
    },
    {
      id: 'route-2',
      summary: 'Northern bypass',
      path: [
        [fromLon, fromLat],
        [midpointLon - lateralOffset, midpointLat + lateralOffset],
        [toLon, toLat]
      ],
      speedKmph: 34
    },
    {
      id: 'route-3',
      summary: 'Southern bypass',
      path: [
        [fromLon, fromLat],
        [midpointLon + lateralOffset, midpointLat - lateralOffset],
        [toLon, toLat]
      ],
      speedKmph: 30
    }
  ];

  return paths.map((route) => {
    const distanceKm = Number(pathDistanceKm(route.path).toFixed(2));
    const durationMin = Number(((distanceKm / Math.max(route.speedKmph, 1)) * 60).toFixed(1));

    return {
      id: route.id,
      summary: route.summary,
      distanceKm,
      durationMin,
      geometry: {
        type: 'LineString',
        coordinates: route.path
      }
    };
  });
}

function classifySafetySeverity(text = '') {
  const content = String(text).toLowerCase();

  if (/(evacuation|curfew|red alert|major|emergency declared|severe)/.test(content)) {
    return 'high';
  }

  if (/(warning|advisory|flood|cyclone|landslide|accident|road closed|protest)/.test(content)) {
    return 'medium';
  }

  return 'low';
}

function safetyHeadlineFromAlerts(alerts = [], locationName = 'this area') {
  if (!alerts.length) {
    return `No major safety alerts reported for ${locationName}.`;
  }

  const hasHigh = alerts.some((alert) => alert.severity === 'high');
  const hasMedium = alerts.some((alert) => alert.severity === 'medium');

  if (hasHigh) {
    return `High-priority advisories detected near ${locationName}. Travel cautiously.`;
  }

  if (hasMedium) {
    return `Moderate advisories active near ${locationName}. Prefer safer routes.`;
  }

  return `Low-priority advisories available for ${locationName}.`;
}

app.get('/api/safety/nearby-safe-places', async (req, res) => {
  const lat = parseCoordinate(req.query.lat);
  const lon = parseCoordinate(req.query.lon);
  const radius = Math.min(10000, Math.max(500, Number(req.query.radius) || SAFETY_DEFAULT_RADIUS));
  const limit = Math.min(30, Math.max(3, Number(req.query.limit) || 12));

  if (!isValidCoordinatePair(lat, lon)) {
    return res.status(400).json({ error: 'Valid lat and lon query parameters are required.' });
  }

  try {
    const places = await fetchSafePlacesFromOverpass(lat, lon, radius, limit);

    if (!places.length) {
      return res.json({
        places: buildFallbackSafePlaces(lat, lon, limit),
        provider: 'fallback',
        fetchedAt: new Date().toISOString()
      });
    }

    res.json({
      places,
      provider: 'overpass',
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Safety places lookup failed, using fallback:', error.message);
    res.json({
      places: buildFallbackSafePlaces(lat, lon, limit),
      provider: 'fallback',
      fetchedAt: new Date().toISOString()
    });
  }
});

app.get('/api/safety/routes', async (req, res) => {
  const fromLat = parseCoordinate(req.query.fromLat);
  const fromLon = parseCoordinate(req.query.fromLon);
  const toLat = parseCoordinate(req.query.toLat);
  const toLon = parseCoordinate(req.query.toLon);

  if (!isValidCoordinatePair(fromLat, fromLon) || !isValidCoordinatePair(toLat, toLon)) {
    return res.status(400).json({ error: 'Valid from/to coordinates are required.' });
  }

  const profileInput = String(req.query.profile || 'driving').toLowerCase();
  const profile = ['driving', 'walking', 'cycling'].includes(profileInput)
    ? profileInput
    : 'driving';

  const fallbackRoutes = buildFallbackRoutes(fromLat, fromLon, toLat, toLon);

  if (!MAPTILER_API_KEY) {
    return res.json({
      routes: fallbackRoutes,
      provider: 'fallback',
      fetchedAt: new Date().toISOString()
    });
  }

  try {
    const directionsUrl =
      `https://api.maptiler.com/directions/${profile}/` +
      `${fromLon},${fromLat};${toLon},${toLat}.json` +
      `?alternatives=true&steps=true&geometries=geojson&overview=full&key=${MAPTILER_API_KEY}`;

    const response = await fetch(directionsUrl, {
      headers: { 'User-Agent': 'GeoSwipe/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Directions provider responded ${response.status}`);
    }

    const data = await response.json();
    const providerRoutes = Array.isArray(data?.routes)
      ? data.routes
          .slice(0, 3)
          .map((route, index) => ({
            id: `route-${index + 1}`,
            summary: route.legs?.[0]?.summary || `Route ${index + 1}`,
            distanceKm: Number(((route.distance || 0) / 1000).toFixed(2)),
            durationMin: Number(((route.duration || 0) / 60).toFixed(1)),
            geometry: route.geometry
          }))
      : [];

    res.json({
      routes: providerRoutes.length ? providerRoutes : fallbackRoutes,
      provider: providerRoutes.length ? 'maptiler' : 'fallback',
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Route provider failed, using fallback:', error.message);
    res.json({
      routes: fallbackRoutes,
      provider: 'fallback',
      fetchedAt: new Date().toISOString()
    });
  }
});

app.get('/api/safety/alerts', async (req, res) => {
  const city = String(req.query.city || '').trim();
  const state = String(req.query.state || '').trim();
  const country = String(req.query.country || 'India').trim();
  const locationName = city || state || country || 'this area';

  const riskTerms =
    '(flood OR cyclone OR landslide OR storm OR accident OR protest OR curfew OR evacuation OR advisory OR "road closed")';

  const queries = [];
  if (city) queries.push(`"${city}" AND ${riskTerms}`);
  if (state) queries.push(`"${state}" AND ${riskTerms}`);
  if (country) queries.push(`"${country}" AND ${riskTerms}`);
  if (!queries.length) queries.push(`India AND ${riskTerms}`);

  try {
    const alerts = [];
    const seenUrls = new Set();

    for (const query of queries.slice(0, 3)) {
      // Reuse existing NewsAPI helper for consistency with current backend stack.
      const articles = await fetchNewsWithQuery(query);
      for (const article of articles) {
        if (!article?.url || seenUrls.has(article.url)) {
          continue;
        }

        seenUrls.add(article.url);

        const severity = classifySafetySeverity(
          `${article.title || ''} ${article.description || ''}`
        );

        alerts.push({
          title: article.title,
          summary: article.description || 'No description available',
          source: article.source?.name || 'Unknown source',
          url: article.url,
          publishedAt: article.publishedAt,
          severity
        });

        if (alerts.length >= 8) {
          break;
        }
      }

      if (alerts.length >= 8) {
        break;
      }
    }

    const severityRank = { high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => (severityRank[b.severity] || 1) - (severityRank[a.severity] || 1));

    res.json({
      safetyHeadline: safetyHeadlineFromAlerts(alerts, locationName),
      alerts,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Safety alerts fetch failed:', error.message);
    res.json({
      safetyHeadline: `Could not fetch live safety alerts for ${locationName}.`,
      alerts: [],
      fetchedAt: new Date().toISOString()
    });
  }
});

//Optimized Socket.IO logic with NO rate limiting for gesture controls
const socketConnections = new Set(); // Track connections for cleanup only
// Ceiling on concurrently tracked rooms; each room holds question state, so
// unbounded creation was a cheap memory-exhaustion vector.
const MAX_ACTIVE_ROOMS = 500;
let frameCount = 0; // Track frames received
let lastFrameLogTime = Date.now();

// ===== MULTIPLAYER GAME SYSTEM =====
const TOTAL_ROUNDS = 10;
const multiplayerRooms = new Map(); // roomId -> { players, gameMode, currentQuestion, answers, scores, currentRound }

// Generate a heritage quiz question
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

async function generateHeritageQuizQuestion(difficulty = 'easy', mode = 'all-india', monumentName = null) {
  try {
    const query = {};

    // A default parameter only applies when the argument is `undefined`. The
    // multiplayer room stores `data.difficulty || null`, so an unspecified
    // difficulty arrived here as an explicit `null`, producing the query
    // { difficulty: null } - which matches nothing and made every heritage
    // multiplayer game fail with "Failed to generate question".
    // Treat any unrecognised value as "no difficulty filter".
    if (VALID_DIFFICULTIES.includes(difficulty)) {
      query.difficulty = difficulty;
    }

    if (mode === 'monument' && monumentName) {
      query.site = { $regex: exactMatchRegex(monumentName) };
    }

    const count = await QuizQuestion.countDocuments(query);
    if (count === 0) {
      console.error(
        `[quiz] No heritage questions matched (mode=${mode}, ` +
        `difficulty=${JSON.stringify(difficulty)}, monument=${JSON.stringify(monumentName)}). ` +
        `Total questions in collection: ${await QuizQuestion.estimatedDocumentCount()}.`
      );
      return null;
    }

    const random = Math.floor(Math.random() * count);
    const question = await QuizQuestion.findOne(query).skip(random);
    
    if (!question) return null;
    
    return {
      type: 'heritage-quiz',
      site: question.site,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      category: question.category
    };
  } catch (error) {
    console.error('Error generating heritage quiz question:', error);
    return null;
  }
}

// Generate a flag question using cached country data
async function generateFlagQuestion() {
  const countries = await getFlagCountries();
  if (!countries || countries.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * countries.length);
  const country = countries[randomIndex];
  return {
    type: 'flag',
    name: country.name,
    code: country.code,
    flagUrl: country.flagUrl,
    correctAnswer: country.name
  };
}

// Generate a quiz question using trivia API
async function generateQuizQuestion(difficulty = null) {
  const countries = await getCountryListFromDB();
  if (countries.length === 0) return null;

  let question = null;
  let attempts = 0;
  let candidatesSeen = 0;
  let lastFailure = null;
  const maxAttempts = 3;
  // Batch the request for the same reason as /api/country-question: only ~60%
  // of geography questions have a country as the answer. Requesting one at a
  // time meant a run of misses ended the multiplayer round with
  // "Failed to generate question".
  const BATCH_SIZE = 20;

  // Only pass a difficulty the upstream understands.
  const difficultyParam = VALID_DIFFICULTIES.includes(difficulty) ? difficulty : null;

  while (!question && attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const apiUrl = difficultyParam
        ? `https://the-trivia-api.com/v2/questions?categories=geography&difficulties=${difficultyParam}&limit=${BATCH_SIZE}`
        : `https://the-trivia-api.com/v2/questions?categories=geography&limit=${BATCH_SIZE}`;

      const triviaRes = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'GeoSwipe/1.0', 'Accept': 'application/json' }
      });

      if (!triviaRes.ok) throw new Error(`the-trivia-api responded with status ${triviaRes.status}`);

      const triviaData = await triviaRes.json();
      if (!Array.isArray(triviaData) || triviaData.length === 0) {
        throw new Error('the-trivia-api returned an unexpected response shape');
      }

      candidatesSeen += triviaData.length;

      const match = triviaData.find(
        (q) => q?.correctAnswer && countries.includes(q.correctAnswer.toLowerCase().trim())
      );

      if (match) {
        question = {
          type: 'quiz',
          question: match.question?.text || match.question,
          correctAnswer: match.correctAnswer,
          options: [...(match.incorrectAnswers || []), match.correctAnswer].sort(() => Math.random() - 0.5)
        };
      }
    } catch (fetchError) {
      lastFailure = fetchError.name === 'AbortError'
        ? 'upstream timed out after 8000ms'
        : (fetchError.message || String(fetchError));
      console.warn(`[multiplayer-quiz] Attempt ${attempts}/${maxAttempts} failed: ${lastFailure}`);
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (!question) {
    console.error(
      `[multiplayer-quiz] Could not build a question after ${attempts} attempt(s), ` +
      `${candidatesSeen} candidate(s) examined. Last failure: ${lastFailure || 'no country-answer question found'}.`
    );
  }

  return question;
}

// Cleanup empty/stale rooms periodically
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of multiplayerRooms.entries()) {
    // Remove rooms that have been empty or inactive for 10 minutes
    if (room.players.length === 0 || (room.lastActivity && now - room.lastActivity > 600000)) {
      console.log(`🧹 Cleaning up stale room: ${roomId}`);
      multiplayerRooms.delete(roomId);
    }
  }
}, 60000); // Check every minute

// ===== GESTURE PIPELINE =====
//
// SECURITY: this pipeline previously used `socket.broadcast.emit`, which sent
// every browser's webcam frame to EVERY other connected socket - any client
// that connected could passively watch all users' cameras. Frames now travel
// only to registered gesture workers, and detection results travel only back to
// the originating browser tab.
//
// Tabs are identified by a per-tab session id supplied in the socket handshake.
// A tab opens several sockets (one per gesture-aware component), so results are
// addressed to the tab's room rather than to a single socket.
const GESTURE_WORKER_ROOM = 'gesture-workers';
const GESTURE_WORKER_TOKEN = (process.env.GESTURE_WORKER_TOKEN || '').trim();
// Opt-in for CAMERA_MODE=local single-user setups only. See forwardDetection.
const GESTURE_ALLOW_BROADCAST =
  String(process.env.GESTURE_ALLOW_BROADCAST || 'false').toLowerCase() === 'true';

function gestureSessionRoom(sessionId) {
  return `gs:${sessionId}`;
}

// Lightweight per-socket token bucket for high-frequency socket events.
function createRateLimiter(maxEvents, windowMs) {
  const buckets = new Map();
  return function allow(socketId) {
    const now = Date.now();
    const bucket = buckets.get(socketId);
    if (!bucket || now - bucket.start > windowMs) {
      buckets.set(socketId, { start: now, count: 1 });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= maxEvents;
  };
}

// ~60fps of frames, plus headroom, per socket.
const allowFrame = createRateLimiter(120, 1000);
const allowGestureResult = createRateLimiter(240, 1000);
const allowRoomAction = createRateLimiter(30, 10000);

io.on('connection', (socket) => {
  console.log(`🤝 Client connected: ${socket.id}`);

  // Add to connection tracking
  socketConnections.add(socket.id);

  // A browser tab declares its session id at handshake time; every socket from
  // that tab shares it, so gesture results reach all of the tab's components.
  const handshakeSession = sanitizeText(socket.handshake?.auth?.gestureSession, 64);
  const sessionId = handshakeSession && /^[A-Za-z0-9_-]{8,64}$/.test(handshakeSession)
    ? handshakeSession
    : null;

  if (sessionId) {
    socket.join(gestureSessionRoom(sessionId));
  }

  // The Python detector registers itself as a worker. When
  // GESTURE_WORKER_TOKEN is configured, registration requires it - that stops
  // an arbitrary client from registering as a worker to receive camera frames.
  socket.on('register-gesture-worker', (data, ack) => {
    const providedToken = typeof data?.token === 'string' ? data.token.trim() : '';

    if (GESTURE_WORKER_TOKEN && providedToken !== GESTURE_WORKER_TOKEN) {
      console.warn(`⛔ Rejected gesture-worker registration from ${socket.id}: bad token`);
      if (typeof ack === 'function') ack({ ok: false, error: 'unauthorized' });
      return;
    }

    if (!GESTURE_WORKER_TOKEN && isProduction) {
      console.warn('⛔ Refusing gesture-worker registration: GESTURE_WORKER_TOKEN is required in production.');
      if (typeof ack === 'function') ack({ ok: false, error: 'worker registration disabled' });
      return;
    }

    socket.data.isGestureWorker = true;
    socket.join(GESTURE_WORKER_ROOM);
    console.log(`🧠 Gesture worker registered: ${socket.id}`);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // Detection results. Only a registered worker may produce these, and they are
  // delivered solely to the tab whose frame was analysed.
  const forwardDetection = (eventName, data) => {
    if (!socket.data.isGestureWorker) {
      return;
    }
    if (!data || typeof data !== 'object') {
      return;
    }
    if (!allowGestureResult(socket.id)) {
      return;
    }

    const { session, ...payload } = data;
    const target = sanitizeText(session, 64);

    if (target && /^[A-Za-z0-9_-]{8,64}$/.test(target)) {
      io.to(gestureSessionRoom(target)).emit(eventName, payload);
      return;
    }

    // No addressable session. This happens only in CAMERA_MODE=local, where the
    // detector uses its own webcam and there is no originating tab. Broadcasting
    // hand-position data is opt-in and off by default; webcam FRAMES are never
    // broadcast under any setting.
    if (GESTURE_ALLOW_BROADCAST) {
      socket.broadcast.emit(eventName, payload);
    }
  };

  socket.on('gesture', (data) => {
    try {
      forwardDetection('gesture', data);
    } catch (error) {
      console.error('❌ Error handling gesture:', error);
    }
  });

  socket.on('cursor', (data) => {
    try {
      forwardDetection('cursor', data);
    } catch (error) {
      console.error('❌ Error handling cursor:', error);
    }
  });

  // Video frames from the browser, destined for gesture detection.
  socket.on('video_frame', (data) => {
    try {
      // Validate payload structure
      if (!data || typeof data !== 'object') {
        return;
      }

      if (!data.frame || typeof data.frame !== 'string') {
        return;
      }

      // Validate base64 format (data URL)
      if (!data.frame.startsWith('data:image/')) {
        return;
      }

      // Size check to prevent DoS (max ~500 KB)
      if (data.frame.length > 500000) {
        return;
      }

      // Per-socket flood protection.
      if (!allowFrame(socket.id)) {
        return;
      }

      // A frame with no session cannot have its result routed back, and must
      // not be broadcast - drop it.
      if (!sessionId) {
        return;
      }

      // Log frame reception periodically (every 50 frames)
      frameCount++;
      if (frameCount === 1) {
        console.log('📸 First video frame received from browser');
        console.log(`   - Frame size: ${(data.frame.length / 1024).toFixed(1)} KB`);
        console.log('   - Forwarding to gesture worker...');
      }

      if (frameCount % 50 === 0) {
        const elapsed = (Date.now() - lastFrameLogTime) / 1000;
        const fps = 50 / elapsed;
        console.log(`📊 Frames received: ${frameCount} | FPS: ${fps.toFixed(1)}`);
        lastFrameLogTime = Date.now();
      }

      // Deliver ONLY to registered gesture workers, tagged with the session so
      // the worker can address its answer back to this tab.
      io.to(GESTURE_WORKER_ROOM).emit('process_frame', {
        frame: data.frame,
        timestamp: data.timestamp || Date.now(),
        session: sessionId
      });
    } catch (error) {
      console.error('❌ Error handling video frame:', error);
      // Don't crash - just log and continue
    }
  });

  // ===== MULTIPLAYER GAME EVENTS =====
  
  // Join a multiplayer room
  socket.on('join-room', async (data) => {
    try {
      // Per-socket flood protection: room creation allocates server memory.
      if (!allowRoomAction(socket.id)) {
        socket.emit('room-error', { message: 'Too many room actions. Please slow down.' });
        return;
      }

      const { roomId: rawRoomId, playerName: rawPlayerName, gameMode } = data || {};

      // Bound and sanitise identifiers before they become Map keys or are
      // echoed to the other player.
      const roomId = sanitizeText(rawRoomId, 64);
      const playerName = sanitizeText(rawPlayerName, 32);

      if (!roomId || !playerName || !gameMode) {
        socket.emit('room-error', { message: 'Missing roomId, playerName, or gameMode' });
        return;
      }

      if (!/^[A-Za-z0-9_-]{4,64}$/.test(roomId)) {
        socket.emit('room-error', { message: 'Room code must be 4-64 letters, digits, dashes or underscores.' });
        return;
      }

      // Validate game mode
      if (!['flag', 'quiz', 'heritage-quiz', 'heritage-monument'].includes(gameMode)) {
        socket.emit('room-error', { message: 'Invalid game mode. Use "flag", "quiz", "heritage-quiz", or "heritage-monument"' });
        return;
      }

      // Global ceiling so room creation cannot exhaust server memory.
      if (!multiplayerRooms.has(roomId) && multiplayerRooms.size >= MAX_ACTIVE_ROOMS) {
        socket.emit('room-error', { message: 'Server is at capacity. Please try again shortly.' });
        return;
      }

      // Leave any existing room first
      for (const [existingRoomId, room] of multiplayerRooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          socket.leave(existingRoomId);
          io.to(existingRoomId).emit('player-left', { 
            playerName: room.players[playerIndex]?.name,
            players: room.players.map(p => ({ name: p.name, score: p.score }))
          });
        }
      }

      // Get or create room
      let room = multiplayerRooms.get(roomId);
      
      if (!room) {
        // Create new room
        room = {
          players: [],
          gameMode,
          currentQuestion: null,
          answers: new Map(),
          currentRound: 0,
          gameStarted: false,
          lastActivity: Date.now(),
          difficulty: data.difficulty || null,
          monumentName: data.monumentName || null
        };
        multiplayerRooms.set(roomId, room);
        console.log(`🎮 Created multiplayer room: ${roomId} (${gameMode} mode)`);
      }

      // Check if room is full
      if (room.players.length >= 2) {
        socket.emit('room-error', { message: 'Room is full (max 2 players)' });
        return;
      }

      // Check if game mode matches
      if (room.gameMode !== gameMode) {
        socket.emit('room-error', { message: `Room is for ${room.gameMode} mode, not ${gameMode}` });
        return;
      }

      // Add player to room
      const player = {
        socketId: socket.id,
        name: playerName,
        score: 0
      };
      room.players.push(player);
      room.lastActivity = Date.now();
      
      // Join socket room
      socket.join(roomId);
      
      console.log(`👤 ${playerName} joined room ${roomId} (${room.players.length}/2 players)`);

      // Notify all players in room
      io.to(roomId).emit('player-joined', {
        playerName,
        players: room.players.map(p => ({ name: p.name, score: p.score })),
        gameMode: room.gameMode
      });

      // Auto-start game when 2 players join
      if (room.players.length === 2 && !room.gameStarted) {
        room.gameStarted = true;
        room.currentRound = 1;
        
        console.log(`🚀 Starting game in room ${roomId}`);
        
        // Generate first question based on game mode
        let question;
        if (room.gameMode === 'flag') {
          question = await generateFlagQuestion();
        } else if (room.gameMode === 'heritage-quiz') {
          question = await generateHeritageQuizQuestion(room.difficulty, 'all-india');
        } else if (room.gameMode === 'heritage-monument') {
          question = await generateHeritageQuizQuestion(room.difficulty, 'monument', data.monumentName);
        } else {
          question = await generateQuizQuestion(room.difficulty);
        }
        
        if (!question) {
          io.to(roomId).emit('room-error', { message: 'Failed to generate question. Please try again.' });
          room.gameStarted = false;
          return;
        }

        room.currentQuestion = question;
        room.answers.clear();

        // Emit game start and first question
        io.to(roomId).emit('game-started', {
          totalRounds: TOTAL_ROUNDS,
          gameMode: room.gameMode,
          players: room.players.map(p => ({ name: p.name, score: p.score }))
        });

        io.to(roomId).emit('new-question', {
          round: room.currentRound,
          totalRounds: TOTAL_ROUNDS,
          question: room.gameMode === 'flag' 
            ? { type: 'flag', flagUrl: question.flagUrl, code: question.code }
            : room.gameMode === 'heritage-quiz' || room.gameMode === 'heritage-monument'
            ? { type: 'heritage-quiz', site: question.site, question: question.question, options: question.options, category: question.category }
            : { type: 'quiz', question: question.question, options: question.options }
        });
      }
    } catch (error) {
      console.error('Error in join-room:', error);
      socket.emit('room-error', { message: 'Server error joining room' });
    }
  });

  // Submit an answer
  socket.on('submit-answer', async (data) => {
    try {
      const { roomId, answer } = data;
      
      if (!roomId || answer === undefined) {
        socket.emit('answer-error', { message: 'Missing roomId or answer' });
        return;
      }

      const room = multiplayerRooms.get(roomId);
      if (!room) {
        socket.emit('answer-error', { message: 'Room not found' });
        return;
      }

      if (!room.gameStarted || !room.currentQuestion) {
        socket.emit('answer-error', { message: 'Game not in progress' });
        return;
      }

      // Find player
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) {
        socket.emit('answer-error', { message: 'Player not in room' });
        return;
      }

      // Check if already answered
      if (room.answers.has(socket.id)) {
        socket.emit('answer-error', { message: 'Already answered this round' });
        return;
      }

      // Store answer and check correctness
      let isCorrect;
      if (room.gameMode === 'heritage-quiz' || room.gameMode === 'heritage-monument') {
        // Heritage quiz uses numeric index for answer
        isCorrect = parseInt(answer) === room.currentQuestion.correctAnswer;
      } else {
        // Flag and regular quiz use string comparison
        isCorrect = answer.toLowerCase().trim() === room.currentQuestion.correctAnswer.toLowerCase().trim();
      }
      
      room.answers.set(socket.id, {
        answer,
        isCorrect,
        timestamp: Date.now()
      });
      room.lastActivity = Date.now();

      if (isCorrect) {
        player.score += 1;
      }

      console.log(`📝 ${player.name} answered in room ${roomId}: ${isCorrect ? '✅' : '❌'}`);

      // Notify that player has answered (without revealing if correct)
      io.to(roomId).emit('player-answered', {
        playerName: player.name,
        answeredCount: room.answers.size,
        totalPlayers: room.players.length
      });

      // Check if all players answered
      if (room.answers.size === room.players.length) {
        // Build results
        const results = room.players.map(p => {
          const answerData = room.answers.get(p.socketId);
          return {
            name: p.name,
            answer: answerData?.answer || 'No answer',
            isCorrect: answerData?.isCorrect || false,
            score: p.score
          };
        });

        // Emit results
        io.to(roomId).emit('show-result', {
          round: room.currentRound,
          correctAnswer: room.currentQuestion.correctAnswer,
          results,
          players: room.players.map(p => ({ name: p.name, score: p.score }))
        });

        // Check if game is over
        if (room.currentRound >= TOTAL_ROUNDS) {
          // Determine winner
          const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
          const winner = sortedPlayers[0].score > sortedPlayers[1].score 
            ? sortedPlayers[0].name 
            : sortedPlayers[0].score === sortedPlayers[1].score 
              ? 'tie' 
              : sortedPlayers[0].name;

          io.to(roomId).emit('game-over', {
            winner,
            finalScores: room.players.map(p => ({ name: p.name, score: p.score })),
            totalRounds: TOTAL_ROUNDS
          });

          // Reset room for new game
          room.gameStarted = false;
          room.currentRound = 0;
          room.currentQuestion = null;
          room.answers.clear();
          room.players.forEach(p => p.score = 0);
        } else {
          // Schedule next round after delay
          setTimeout(async () => {
            room.currentRound += 1;
            room.answers.clear();

            // Generate next question based on game mode
            let question;
            if (room.gameMode === 'flag') {
              question = await generateFlagQuestion();
            } else if (room.gameMode === 'heritage-quiz') {
              question = await generateHeritageQuizQuestion(room.difficulty, 'all-india');
            } else if (room.gameMode === 'heritage-monument') {
              question = await generateHeritageQuizQuestion(room.difficulty, 'monument', room.monumentName);
            } else {
              question = await generateQuizQuestion(room.difficulty);
            }

            if (!question) {
              io.to(roomId).emit('room-error', { message: 'Failed to generate next question' });
              return;
            }

            room.currentQuestion = question;

            io.to(roomId).emit('next-round', { round: room.currentRound });
            
            io.to(roomId).emit('new-question', {
              round: room.currentRound,
              totalRounds: TOTAL_ROUNDS,
              question: room.gameMode === 'flag'
                ? { type: 'flag', flagUrl: question.flagUrl, code: question.code }
                : room.gameMode === 'heritage-quiz' || room.gameMode === 'heritage-monument'
                ? { type: 'heritage-quiz', site: question.site, question: question.question, options: question.options, category: question.category }
                : { type: 'quiz', question: question.question, options: question.options }
            });
          }, 3000); // 3 second delay between rounds
        }
      }
    } catch (error) {
      console.error('Error in submit-answer:', error);
      socket.emit('answer-error', { message: 'Server error processing answer' });
    }
  });

  // Leave room
  socket.on('leave-room', (data) => {
    try {
      const { roomId } = data;
      const room = multiplayerRooms.get(roomId);
      
      if (room) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          socket.leave(roomId);
          
          console.log(`👋 ${player.name} left room ${roomId}`);
          
          io.to(roomId).emit('player-left', {
            playerName: player.name,
            players: room.players.map(p => ({ name: p.name, score: p.score }))
          });

          // End game if player leaves during game
          if (room.gameStarted && room.players.length < 2) {
            room.gameStarted = false;
            io.to(roomId).emit('game-ended', { reason: 'Player left the game' });
          }

          // Delete empty rooms
          if (room.players.length === 0) {
            multiplayerRooms.delete(roomId);
            console.log(`🗑️ Deleted empty room: ${roomId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in leave-room:', error);
    }
  });

  // Get room info
  socket.on('get-room-info', (data) => {
    try {
      const { roomId } = data;
      const room = multiplayerRooms.get(roomId);
      
      if (room) {
        socket.emit('room-info', {
          roomId,
          gameMode: room.gameMode,
          players: room.players.map(p => ({ name: p.name, score: p.score })),
          gameStarted: room.gameStarted,
          currentRound: room.currentRound
        });
      } else {
        socket.emit('room-info', { roomId, exists: false });
      }
    } catch (error) {
      console.error('Error in get-room-info:', error);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`👋 Client disconnected: ${socket.id}, reason: ${reason}`);
    // Clean up connection tracking
    socketConnections.delete(socket.id);
    
    // Clean up multiplayer rooms when player disconnects
    for (const [roomId, room] of multiplayerRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        console.log(`🎮 ${player.name} disconnected from room ${roomId}`);
        
        io.to(roomId).emit('player-left', {
          playerName: player.name,
          players: room.players.map(p => ({ name: p.name, score: p.score })),
          reason: 'disconnected'
        });

        // End game if player disconnects during game
        if (room.gameStarted && room.players.length < 2) {
          room.gameStarted = false;
          io.to(roomId).emit('game-ended', { reason: 'Opponent disconnected' });
        }

        // Delete empty rooms
        if (room.players.length === 0) {
          multiplayerRooms.delete(roomId);
          console.log(`🗑️ Deleted empty room: ${roomId}`);
        }
        break; // Player can only be in one room
      }
    }
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// ===== HERITAGE SITE API ROUTES =====

// Get all heritage sites
app.get("/api/heritage-sites", async (req, res) => {
  try {
    const sites = await HeritageSite.find({});
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage sites" });
  }
});

// Get specific heritage site by name
app.get("/api/heritage/:name", async (req, res) => {
  try {
    let siteName = decodeURIComponent(req.params.name).replace(/-/g, ' ').toLowerCase();
    const site = await HeritageSite.findOne({ 
       name: { $regex: containsRegex(siteName) } 
      //name: { $regex: exactMatchRegex(siteName) } 
    });
    
    if (!site) {
      return res.status(404).json({ error: "Heritage site not found" });
    }
    
    res.json(site);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage site" });
  }
});

// Get heritage sites by category
app.get("/api/heritage/category/:category", async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const sites = await HeritageSite.find({ category: category });
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage sites by category" });
  }
});

// ===== HERITAGE QUIZ API ROUTES =====

// Get quiz question for specific monument
app.get("/api/quiz/monument/:name", async (req, res) => {
  try {
    const siteName = decodeURIComponent(req.params.name);
    const difficulty = req.query.difficulty || 'easy';
    
    // Check if questions exist
    const count = await QuizQuestion.countDocuments({ 
      site: { $regex: exactMatchRegex(siteName) },
      difficulty 
    });
    
    if (count === 0) {
      return res.json({ 
        available: false, 
        message: "No quiz questions available for this monument at this difficulty level" 
      });
    }
    
    // Get random question
    const random = Math.floor(Math.random() * count);
    const question = await QuizQuestion.findOne({
      site: { $regex: exactMatchRegex(siteName) },
      difficulty
    }).skip(random);
    
    res.json({ 
      available: true, 
      question: {
        id: question._id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        category: question.category
      }
    });
  } catch (error) {
    console.error("Error fetching monument quiz:", error);
    return safeError(res, 500, "Request failed.", error);
  }
});

// Get all-India quiz question (from any monument)
app.get("/api/quiz/all-india", async (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'easy';
    
    const count = await QuizQuestion.countDocuments({ difficulty });
    
    if (count === 0) {
      return res.status(404).json({ error: "No quiz questions available" });
    }
    
    const random = Math.floor(Math.random() * count);
    const question = await QuizQuestion.findOne({ difficulty }).skip(random);
    
    res.json({
      id: question._id,
      site: question.site,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      category: question.category
    });
  } catch (error) {
    console.error("Error fetching all-India quiz:", error);
    return safeError(res, 500, "Request failed.", error);
  }
});

// Get list of monuments with available quizzes
app.get("/api/quiz/available-monuments", async (req, res) => {
  try {
    const monuments = await QuizQuestion.distinct('site');
    res.json(monuments.sort());
  } catch (error) {
    console.error("Error fetching available monuments:", error);
    return safeError(res, 500, "Request failed.", error);
  }
});

// Get multiple unique questions for a quiz session (no repetition)
app.get("/api/quiz/session/:mode", async (req, res) => {
  try {
    const mode = req.params.mode; // 'monument' or 'all-india'
    const difficulty = req.query.difficulty || 'easy';
    const monumentName = req.query.monument;
    const count = parseInt(req.query.count) || 10;
    
    let query = { difficulty };
    
    if (mode === 'monument' && monumentName) {
      query.site = { $regex: exactMatchRegex(monumentName) };
    }
    
    // Get random sample of questions
    const questions = await QuizQuestion.aggregate([
      { $match: query },
      { $sample: { size: count } }
    ]);
    
    if (questions.length === 0) {
      return res.json({ available: false, questions: [] });
    }
    
    res.json({ 
      available: true,
      questions: questions.map(q => ({
        id: q._id,
        site: q.site,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        category: q.category
      }))
    });
  } catch (error) {
    console.error("Error fetching quiz session:", error);
    return safeError(res, 500, "Request failed.", error);
  }
});

// ===== API ROUTES =====
app.get('/api/start', (req, res) => {
  // Here you could check something before allowing
  res.json({ allow: true });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\nReceived shutdown signal, closing server gracefully...');
  
  http.close(() => {
    console.log('HTTP server closed.');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Health check endpoint
app.get('/health', (req, res) => {
  // Deliberately minimal: uptime and environment name are useful to an attacker
  // profiling the deployment and are not needed by a liveness probe.
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Terminal error handler. Registered last so it sees errors from every route
// above, and returns a generic message instead of a stack trace.
app.use(errorHandler);

//start server with error handling
const PORT = process.env.PORT || 3000;
// Bind to loopback by default. Binding to every interface exposes the API (and
// the gesture socket) to the whole local network; opt in explicitly via HOST
// when that is actually wanted, e.g. HOST=0.0.0.0 in a container.
const HOST = process.env.HOST || '127.0.0.1';

http.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Listening on: ${HOST}:${PORT}`);
  console.log(`🛡️  Allowed browser origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : '(none configured)'}`);
  reportConfiguration();
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
