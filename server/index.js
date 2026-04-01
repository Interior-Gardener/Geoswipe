// server/index.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 5e6,  // 5MB to handle video frames from browser
  transports: ['websocket', 'polling']
});
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Country = require("./models/Country"); 
const HeritageSite = require("./models/HeritageSite");

// Middleware for parsing JSON and enabling CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://your-domain.com'] : '*',
  credentials: true
}));

// Add compression middleware for better performance
const compression = require('compression');
app.use(compression());

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ===== OPTIMIZED MONGO CONNECTION =====
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/geoswipedb", {
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
connectDB();

// Cache for country data to avoid repeated DB queries
let countryCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

//Optimized Country Population (One Time)
async function populateCountries() {
  try {
    const count = await Country.countDocuments();
    if (count === 0) {
      console.log("🌍 Fetching countries from API...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch("https://restcountries.com/v3.1/all?fields=name", {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GeoSwipe/1.0'
        }
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const countryDocs = data
        .filter(c => c.name?.common)
        .map(c => ({ name: c.name.common.toLowerCase().trim() }));
      
      if (countryDocs.length > 0) {
        await Country.insertMany(countryDocs);
        console.log(`✅ Inserted ${countryDocs.length} countries into DB`);
        
        // Update cache
        countryCache = countryDocs.map(c => c.name);
        cacheExpiry = Date.now() + CACHE_DURATION;
      }
    }
  } catch (error) {
    console.error('Error populating countries:', error.message);
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

// Initialize countries on startup
populateCountries();

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
    const maxAttempts = 10; // Limit attempts to avoid infinite loops

    while (!question && attempts < maxAttempts) {
      attempts++;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        // Build API URL with optional difficulty parameter
        const apiUrl = difficultyParam
          ? `https://the-trivia-api.com/v2/questions?categories=geography&difficulties=${difficultyParam}&limit=1`
          : "https://the-trivia-api.com/v2/questions?categories=geography&limit=1";
        
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
        clearTimeout(timeoutId);

        if (!triviaRes.ok) {
          throw new Error(`API responded with status: ${triviaRes.status}`);
        }

        const triviaData = await triviaRes.json();
        if (!triviaData || !Array.isArray(triviaData) || triviaData.length === 0) {
          throw new Error('Invalid response format from trivia API');
        }

        const q = triviaData[0];
        if (q?.correctAnswer && countries.includes(q.correctAnswer.toLowerCase().trim())) {
          question = {
            question: q.question?.text || q.question,
            correctAnswer: q.correctAnswer,
            options: [...(q.incorrectAnswers || []), q.correctAnswer]
              .sort(() => Math.random() - 0.5)
          };
        }
      } catch (fetchError) {
        console.warn(`Trivia API attempt ${attempts} failed:`, fetchError.message);
        if (attempts === maxAttempts) {
          throw fetchError;
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!question) {
      return res.status(503).json({ 
        error: "Unable to fetch geography question at this time",
        retry: true 
      });
    }

    res.json(question);
  } catch (err) {
    console.error('Error in country-question endpoint:', err);
    res.status(500).json({ 
      error: "Failed to fetch question",
      retry: true 
    });
  }
});

// ===== FLAG GUESS GAME API =====
// Cache for country data with codes for flag game
let flagCountryCache = null;
let flagCacheExpiry = null;
const FLAG_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fetch and cache countries with codes for flag game
async function getFlagCountries() {
  // Check cache first
  if (flagCountryCache && flagCacheExpiry && Date.now() < flagCacheExpiry) {
    return flagCountryCache;
  }
  
  try {
    console.log("🏳️ Fetching countries for flag game...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2", {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GeoSwipe/1.0'
      }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Filter and map countries with valid data
    flagCountryCache = data
      .filter(c => c.name?.common && c.cca2)
      .map(c => ({
        name: c.name.common,
        code: c.cca2.toLowerCase(),
        flagUrl: `https://flagcdn.com/w320/${c.cca2.toLowerCase()}.png`
      }));
    
    flagCacheExpiry = Date.now() + FLAG_CACHE_DURATION;
    console.log(`✅ Cached ${flagCountryCache.length} countries for flag game`);
    
    return flagCountryCache;
  } catch (error) {
    console.error('Error fetching flag countries:', error.message);
    return flagCountryCache || []; // Return cached data if available
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
      name: { $regex: new RegExp(`^${siteName}$`, 'i') } 
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
    
    const response = {
      name: site.name,
      category: site.category,
      year: site.year,
      info: site.info,
      howToReach: site.howToReach,
      view360: site.view360 ? {
        ...site.view360,
        iframeUrl: streetViewUrl
      } : null,

      model3d: site.model3d,
      media: site.media,
      visitor_info: site.visitor_info
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage site details" });
  }
});

//Optimized Socket.IO logic with NO rate limiting for gesture controls
const socketConnections = new Set(); // Track connections for cleanup only
let frameCount = 0; // Track frames received
let lastFrameLogTime = Date.now();

// ===== MULTIPLAYER GAME SYSTEM =====
const TOTAL_ROUNDS = 10;
const multiplayerRooms = new Map(); // roomId -> { players, gameMode, currentQuestion, answers, scores, currentRound }

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
  const maxAttempts = 5;

  while (!question && attempts < maxAttempts) {
    attempts++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const apiUrl = difficulty
        ? `https://the-trivia-api.com/v2/questions?categories=geography&difficulties=${difficulty}&limit=1`
        : "https://the-trivia-api.com/v2/questions?categories=geography&limit=1";
      
      const triviaRes = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'GeoSwipe/1.0', 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!triviaRes.ok) throw new Error(`API responded with status: ${triviaRes.status}`);

      const triviaData = await triviaRes.json();
      if (!triviaData || !Array.isArray(triviaData) || triviaData.length === 0) {
        throw new Error('Invalid response format');
      }

      const q = triviaData[0];
      if (q?.correctAnswer && countries.includes(q.correctAnswer.toLowerCase().trim())) {
        question = {
          type: 'quiz',
          question: q.question?.text || q.question,
          correctAnswer: q.correctAnswer,
          options: [...(q.incorrectAnswers || []), q.correctAnswer].sort(() => Math.random() - 0.5)
        };
      }
    } catch (fetchError) {
      console.warn(`Multiplayer trivia attempt ${attempts} failed:`, fetchError.message);
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
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

io.on('connection', (socket) => {
  console.log(`🤝 Client connected: ${socket.id}`);

  // Add to connection tracking
  socketConnections.add(socket.id);

  socket.on('gesture', (data) => {
    try {
      // NO RATE LIMITING - Allow unlimited gesture controls for full website accessibility
      if (!data || typeof data !== 'object') {
        console.warn('⚠️ Invalid gesture data received');
        return;
      }

      console.log("👋 Gesture from Python:", data.gesture || data);
      // Broadcast to all other clients for full gesture accessibility
      socket.broadcast.emit('gesture', data);
    } catch (error) {
      console.error('❌ Error handling gesture:', error);
    }
  });

  socket.on('cursor', (data) => {
    try {
      // NO RATE LIMITING - Allow unlimited cursor updates for smooth gesture navigation
      if (!data || typeof data !== 'object') {
        return; // Silently ignore invalid cursor data (high frequency event)
      }

      // Forward cursor position to all clients for gesture-controlled navigation
      socket.broadcast.emit('cursor', data);
    } catch (error) {
      console.error('❌ Error handling cursor:', error);
    }
  });

  // NEW: Handle video frames from browser for gesture detection
  socket.on('video_frame', (data) => {
    try {
      // Validate payload structure
      if (!data || typeof data !== 'object') {
        console.warn('⚠️ Invalid video_frame: not an object');
        return;
      }

      if (!data.frame || typeof data.frame !== 'string') {
        console.warn('⚠️ Invalid video_frame: missing or invalid frame');
        return;
      }

      // Validate base64 format (data URL)
      if (!data.frame.startsWith('data:image/')) {
        console.warn('⚠️ Invalid video_frame: not a data URL');
        return;
      }

      // Size check to prevent DoS (max ~500 KB)
      if (data.frame.length > 500000) {
        console.warn('⚠️ Frame too large, rejecting');
        return;
      }

      // Log frame reception periodically (every 50 frames)
      frameCount++;
      if (frameCount === 1) {
        console.log('📸 First video frame received from browser');
        console.log(`   - Frame size: ${(data.frame.length / 1024).toFixed(1)} KB`);
        console.log('   - Forwarding to Python gesture detection...');
      }

      if (frameCount % 50 === 0) {
        const elapsed = (Date.now() - lastFrameLogTime) / 1000;
        const fps = 50 / elapsed;
        console.log(`📊 Frames received: ${frameCount} | FPS: ${fps.toFixed(1)}`);
        lastFrameLogTime = Date.now();
      }

      // Forward frame to Python client for processing
      socket.broadcast.emit('process_frame', {
        frame: data.frame,
        timestamp: data.timestamp || Date.now()
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
      const { roomId, playerName, gameMode } = data;
      
      if (!roomId || !playerName || !gameMode) {
        socket.emit('room-error', { message: 'Missing roomId, playerName, or gameMode' });
        return;
      }

      // Validate game mode
      if (!['flag', 'quiz'].includes(gameMode)) {
        socket.emit('room-error', { message: 'Invalid game mode. Use "flag" or "quiz"' });
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
          difficulty: data.difficulty || null
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
        
        // Generate first question
        const question = room.gameMode === 'flag' 
          ? await generateFlagQuestion()
          : await generateQuizQuestion(room.difficulty);
        
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

      // Store answer
      const isCorrect = answer.toLowerCase().trim() === room.currentQuestion.correctAnswer.toLowerCase().trim();
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

            const question = room.gameMode === 'flag'
              ? await generateFlagQuestion()
              : await generateQuizQuestion(room.difficulty);

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
       name: { $regex: new RegExp(siteName, 'i') } 
      //name: { $regex: new RegExp(`^${siteName}$`, 'i') } 
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
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    env: process.env.NODE_ENV || 'development'
  };
  res.json(healthcheck);
});

//start server with error handling
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';  // Bind to all interfaces (was 'localhost')

http.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Listening on: ${HOST}:${PORT} (all interfaces)`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
