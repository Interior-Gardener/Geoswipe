// server/index.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const cors = require("cors");

const mongoose = require("mongoose");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Country = require("./models/Country"); 
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

// ===== API ROUTES =====
app.get('/api/start', (req, res) => {
  // Here you could check something before allowing
  res.json({ allow: true });
});

//start server
http.listen(3000, () => console.log("Server running on http://localhost:3000"));
