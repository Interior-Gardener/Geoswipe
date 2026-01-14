// server/populate-heritage-sites.example.js
// EXAMPLE FILE - Copy to populate-heritage-sites_only_India.js and add your Sketchfab IDs
// Run: node populate-heritage-sites_only_India.js

const mongoose = require('mongoose');
const HeritageSite = require('./models/HeritageSite');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/geoswipedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// EXAMPLE: Heritage sites data structure
const heritageSites = [
  {
    name: "Ajanta Caves",
    country: "India",
    state: "Maharashtra",
    description: "Ancient Buddhist cave monuments",
    coordinates: {
      latitude: 20.5519,
      longitude: 75.7033
    },
    model3d: {
      summary: '3D model available.',
      url: '/3dmodels/ajanta',
      full: 'Explore the 3D model of Ajanta Caves.',
      sketchfabId: 'YOUR_SKETCHFAB_MODEL_ID_HERE' // ⚠️ Replace with your actual Sketchfab ID
    },
    images: [
      '/images/ajanta1.jpg',
      '/images/ajanta2.jpg'
    ],
    // ... add other fields as needed
  },
  // Add more heritage sites...
];

// Populate database
async function populateHeritageSites() {
  try {
    await HeritageSite.deleteMany({});
    console.log("🗑️  Cleared existing heritage sites");
    
    await HeritageSite.insertMany(heritageSites);
    console.log(`✅ Added ${heritageSites.length} heritage sites`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

populateHeritageSites();
