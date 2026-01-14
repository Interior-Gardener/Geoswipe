# Security & Environment Variables Guide

## Overview
This document outlines sensitive data handling and environment variable configuration for the GeoSwipe project.

## Environment Variables

### Client (.env files in `/client`)

Create a `.env.development` file (already exists) with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_MAPTILER_API_KEY=your_maptiler_api_key_here

# Development
VITE_NODE_ENV=development
```

**⚠️ IMPORTANT:** Never commit `.env.development` or `.env.production` to version control!

### Server (.env files in `/server`)

Create a `.env` file in the server directory (copy from `.env.example`):

```env
# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/geoswipedb

# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development
```

### Gesture Control (.env files in `/gesture-control`)

Create a `.env` file in the gesture-control directory (copy from `.env.example`):

```env
# Socket.IO Server URL
SOCKET_SERVER_URL=http://localhost:3000

# Detection Settings
MIN_DETECTION_CONFIDENCE=0.7
MIN_TRACKING_CONFIDENCE=0.7
```

## API Keys

### MapTiler API Key
- **Location:** Used in client for map rendering
- **Environment Variable:** `VITE_MAPTILER_API_KEY`
- **Get Key:** https://cloud.maptiler.com/
- **Current Usage:** 
  - `client/src/HeritagePage.jsx`
  - `maharashtra_heritage_map.html` (⚠️ still hardcoded - see below)

### Trivia API (Quiz Questions)
- **Location:** Used in server for quiz questions
- **Current Status:** ✅ No API key required (free public API)
- **API Endpoint:** `https://the-trivia-api.com/v2/questions`
- **Risk:** ⚠️ Could start requiring authentication or implement stricter rate limits
- **Recommendation:** Monitor for changes; consider implementing question caching or alternative quiz sources
- **Current Usage:**
  - `server/index.js` - `/api/country-question` endpoint

### Note on maharashtra_heritage_map.html
The file `maharashtra_heritage_map.html` is a standalone HTML file that currently has a hardcoded MapTiler API key at line 227:
```javascript
const apiKey = 'Vgab3vK39KZDFqcYVOBA';
```

**Options:**
1. **Remove from repository** - If this is a demo file
2. **Replace with placeholder** - `const apiKey = 'YOUR_MAPTILER_API_KEY';`
3. **Add instructions** - Comment to replace before use

## Production Deployment

### Before deploying to production:

1. **Update `.gitignore`** - Ensure all `.env` files are ignored ✅
2. **Set production environment variables** in your hosting platform:
   - For client (Vercel/Netlify): Set `VITE_API_URL`, `VITE_MAPTILER_API_KEY`
   - For server (Heroku/Railway): Set `MONGODB_URI`, `PORT`, `NODE_ENV=production`
3. **Update CORS origins** in `server/index.js` line 22
4. **Regenerate API keys** for production use

## Security Checklist

- [ ] All API keys moved to environment variables ✅
- [ ] `.env` files added to `.gitignore` ✅
- [ ] `.env.example` files created with placeholders ✅
- [ ] Production credentials different from development
- [ ] `maharashtra_heritage_map.html` API key addressed
- [ ] MongoDB connection secured (use MongoDB Atlas for production)
- [ ] CORS configured for production domains
- [ ] **Sketchfab model IDs protected** ✅ (populate scripts gitignored)
- [ ] Data population scripts excluded from public repo ✅

## Files Updated

### Client
- ✅ `client/src/HeritagePage.jsx` - Uses `import.meta.env.VITE_MAPTILER_API_KEY`
- ✅ `client/src/EarthThreeJS.jsx` - Uses `import.meta.env.VITE_API_URL`
- ✅ `client/src/globe.jsx` - Uses `import.meta.env.VITE_API_URL`
- ✅ `client/src/GestureButton.jsx` - Uses `import.meta.env.VITE_API_URL`
- ✅ `client/src/GlobalGestureCursor.jsx` - Uses `import.meta.env.VITE_API_URL`
- ✅ `client/src/HowToReachPage.jsx` - Uses `import.meta.env.VITE_API_URL`
- ✅ `client/src/HeritageStoryBook.jsx` - Uses `import.meta.env.VITE_API_URL`
- ✅ `client/src/CountryQuiz.jsx` - Already uses `import.meta.env.VITE_API_URL`

### Server
- ✅ `server/index.js` - Already uses `process.env.MONGODB_URI`, `process.env.PORT`

### Gesture Control
- ✅ `gesture-control/detect.py` - Uses `os.getenv('SOCKET_SERVER_URL')`
- ✅ Added `python-dotenv` to requirements.txt

### Standalone Files
- ⚠️ `maharashtra_heritage_map.html` - Still has hardcoded API key (needs manual update)

### Data Population Scripts (Gitignored)
- 🚫 `server/populate-heritage-sites_only_India.js` - Contains Sketchfab model IDs
- 🚫 `server/populate-heritage-sites_only_maharshtra.js` - Contains Sketchfab model IDs
- ✅ `server/populate-heritage-sites.example.js` - Safe example template

## Sketchfab Model IDs

**Why they're sensitive:**
- Linked to your personal Sketchfab account
- May represent premium/licensed 3D models
- Could expose content usage patterns
- Potential copyright/licensing concerns

**Protection method:**
- Populate scripts are gitignored
- Example file provided with placeholder IDs
- Actual IDs stored only in your local database after running populate scripts

## Getting Started

1. Copy example files:
   ```bash
   cp client/.env.example client/.env.development
   cp server/.env.example server/.env
   cp gesture-control/.env.example gesture-control/.env
   ```

2. Update with your actual values

3. Install Python dependencies (for gesture control):
   ```bash
   cd gesture-control
   pip install -r requirements.txt
   ```

4. Never commit `.env` files!
