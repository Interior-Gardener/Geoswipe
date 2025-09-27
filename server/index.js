// server/index.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const cors = require("cors");

const mongoose = require("mongoose");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Country = require("./models/Country"); 
const HeritageSite = require("./models/HeritageSite");
//const path = require('path');

// Enable CORS for all requests (safe for dev; restrict in prod if needed)
app.use(cors());

// ===== MONGO CONNECTION =====
mongoose.connect("mongodb://127.0.0.1:27017/geoswipedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

//Populate Countries (One Time)
async function populateCountries() {
  const count = await Country.countDocuments();
  if (count === 0) {
    console.log("🌍 Fetching countries from API...");
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
    const data = await res.json();
    const countryDocs = data.map(c => ({ name: c.name.common.toLowerCase() }));
    await Country.insertMany(countryDocs);
    console.log(`✅ Inserted ${countryDocs.length} countries into DB`);
  }
}
populateCountries();

//Get Country List from DB
async function getCountryListFromDB() {
  const countries = await Country.find({});
  return countries.map(c => c.name);
}

//Country questions api
app.get("/api/country-question", async (req, res) => {
  try {
    const countries = await getCountryListFromDB();

    let question = null;

    while (!question) {
      const triviaRes = await fetch("https://the-trivia-api.com/v2/questions?categories=geography&limit=1");
      const triviaData = await triviaRes.json();
      const q = triviaData[0];

      if (countries.includes(q.correctAnswer.toLowerCase())) {
        question = {
          question: q.question.text,
          correctAnswer: q.correctAnswer,
          options: [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5)
        };
      }
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch question" });
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

//socket io logic
io.on('connection', (socket) => {
  console.log("Frontend connected.");

  socket.on('gesture', (data) => {
    console.log("Gesture from Python:", data);
    io.emit('gesture', data); // Forward to frontend
  });

  socket.on('cursor', (data) => {
    // Forward index finger position to all clients
    io.emit('cursor', data);
  });

  socket.on('disconnect', () => {
    console.log("Frontend disconnected");
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
    const siteName = decodeURIComponent(req.params.name);
    const site = await HeritageSite.findOne({ 
      name: { $regex: new RegExp(`^${siteName}$`, 'i') } 
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

//start server
http.listen(3000, () => console.log("Server running on http://localhost:3000"));
