// server/models/HeritageSite.js
const mongoose = require('mongoose');

const HeritageSiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['UNESCO World Heritage', 'Historic Fort', 'Rock-cut Cave', 'Temple', 'Monument', 'Palace', 'Museum', 'Historic Building']
  },
  year: {
    type: String,
    required: true
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  info: {
    summary: {
      type: String,
      required: true
    },
    full: {
      type: String,
      required: true
    },
    history: String,
    architecture: String,
    significance: String,
    visitingTips: [String]
  },
  howToReach: {
    summary: {
      type: String,
      required: true
    },
    full: {
      type: String,
      required: true
    },
    byAir: {
      nearestAirport: String,
      distance: String,
      description: String
    },
    byRail: {
      nearestStation: String,
      distance: String,
      description: String
    },
    byRoad: {
      fromMajorCities: [{
        city: String,
        distance: String,
        route: String,
        duration: String
      }],
      localTransport: String
    }
  },
  media: {
    panorama_url: String,
    images: [String],
    video_url: String
  },
  view360: { // for 360 degree street view
    summary: String,
    iframeUrl: String,
    full: String,
    heading: { type: Number, default: 0 },
    pitch: { type: Number, default: 0 }
  },
  model3d: {  // for 3d model
    summary: String,
    url: String,
    full: String,
    sketchfabId: String // For Sketchfab integration
  },
  visitor_info: {
    timings: String,
    entryFee: String,
    bestTimeToVisit: String,
    duration: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
HeritageSiteSchema.index({ name: 1 });
HeritageSiteSchema.index({ category: 1 });
HeritageSiteSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('HeritageSite', HeritageSiteSchema);
