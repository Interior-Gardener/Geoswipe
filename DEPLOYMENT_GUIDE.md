# GeoSwipe - Deployment Guide for Render.com

This guide explains how to properly deploy your 3 services (Backend, Python Gesture Detection, Frontend) on Render.com.

## Issues Fixed

1. ✅ Fixed hardcoded `localhost:3000` URLs in `HeritagePage.jsx` to use environment variables
2. ✅ Fixed map container null error by adding proper initialization checks
3. ✅ Identified MapTiler API key configuration requirements
4. ✅ Analyzed gesture detection service socket connection flow

## Architecture Overview

Your application consists of 3 separate services:

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  Frontend       │◄─────►│  Backend (Node.js)   │◄─────►│  Python Gesture     │
│  (Static Site)  │       │  Port: 3000          │       │  Detection Service  │
│                 │       │  Socket.IO Server    │       │                     │
└─────────────────┘       └──────────────────────┘       └─────────────────────┘
         │                         │                                │
         │                         │                                │
         └─────────────────────────┴────────────────────────────────┘
                         All connect via WebSocket/HTTP
```

## Service 1: Backend (Node.js)

### Render Configuration

**Service Type:** Web Service
**Build Command:** `cd server && npm install`
**Start Command:** `cd server && node index.js`

### Environment Variables (Set in Render Dashboard)

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://Geoswipe-User:K.J.Somaiya@geoswipe-cluster.gsyijqp.mongodb.net/geoswipedb?appName=Geoswipe-Cluster

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URLs (IMPORTANT: Add your actual frontend URL)
FRONTEND_URL=https://your-frontend-app.onrender.com

# If using custom domain, also add it:
# FRONTEND_URL_CUSTOM=https://geoswipe.com
```

### Required Code Change in `server/index.js`

Update CORS configuration to be dynamic based on environment variable:

```javascript
// Replace lines 7-12 and 27-30 with:
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_CUSTOM,
  'http://localhost:5173',       // Local development
  'https://geoswipe.onrender.com' // Fallback
].filter(Boolean); // Remove undefined values

const io = require('socket.io')(http, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 5e6,
  transports: ['websocket', 'polling']
});

// ... later in the file ...

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ALLOWED_ORIGINS : '*',
  credentials: true
}));
```

**Deploy URL Example:** `https://geoswipe-backend.onrender.com`

---

## Service 2: Python Gesture Detection Service

### Render Configuration

**Service Type:** Web Service
**Build Command:** `cd gesture-control && pip install -r requirements.txt`
**Start Command:** `cd gesture-control && python detect.py`

### Environment Variables (Set in Render Dashboard)

```bash
# Socket Server URL - MUST match your backend URL
SOCKET_SERVER_URL=https://geoswipe-backend.onrender.com

# Camera Mode
CAMERA_MODE=browser

# Detection Settings (optional)
MIN_DETECTION_CONFIDENCE=0.5
MIN_TRACKING_CONFIDENCE=0.5
```

### Important Notes

- The Python service connects TO the backend as a socket client
- It listens on a port for Render health checks (Flask server)
- Make sure your backend URL is correct in `SOCKET_SERVER_URL`

**Deploy URL Example:** `https://geoswipe-gesture.onrender.com`

---

## Service 3: Frontend (Static Site)

### Render Configuration

**Service Type:** Static Site
**Build Command:** `cd client && npm install && npm run build`
**Publish Directory:** `client/dist`

### Environment Variables (Set in Render Dashboard)

**CRITICAL:** These environment variables must be set BEFORE building the frontend, as Vite bakes them into the build at compile time.

```bash
# Backend API URLs (REQUIRED)
VITE_API_URL=https://geoswipe-backend.onrender.com
VITE_API_BASE_URL=https://geoswipe-backend.onrender.com

# MapTiler API Key (REQUIRED for maps)
# Get your key from: https://cloud.maptiler.com/account/keys/
VITE_MAPTILER_API_KEY=k1cMDZwkBPaXJ5FGDll8

# Optional Configuration
VITE_NODE_ENV=production
VITE_ENABLE_PERFORMANCE_MONITORING=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
```

### Getting MapTiler API Key

1. Go to https://cloud.maptiler.com/
2. Sign up for a free account
3. Navigate to Account → Keys
4. Copy your API key
5. Replace `k1cMDZwkBPaXJ5FGDll8` with your key

**Deploy URL Example:** `https://geoswipe.onrender.com` or `https://your-custom-domain.com`

---

## Deployment Order

Deploy in this order to avoid connection issues:

1. **Backend First** - Deploy and wait until fully running
   - Verify at `https://geoswipe-backend.onrender.com/`
   - Should return API information

2. **Python Gesture Service** - Deploy after backend is running
   - Check logs for "Connected to server" message
   - Verify at `https://geoswipe-gesture.onrender.com/health`

3. **Frontend Last** - Deploy after both services are running
   - **IMPORTANT:** Set all `VITE_*` environment variables FIRST
   - Then trigger a rebuild

---

## Troubleshooting

### Issue: Heritage Sites Not Loading

**Symptoms:**
- Console error: `Failed to load resource: net::ERR_CONNECTION_REFUSED`
- Error fetching from `localhost:3000/api/heritage-sites/geojson`

**Solution:**
```bash
# In Render Dashboard → Frontend Static Site → Environment:
VITE_API_BASE_URL=https://geoswipe-backend.onrender.com
VITE_API_URL=https://geoswipe-backend.onrender.com

# Then: Redeploy/Rebuild the frontend
```

The issue occurs because Vite environment variables are baked into the build at compile time. You must set them BEFORE building.

---

### Issue: Map Not Loading

**Symptoms:**
- Console error: "Map container: null"
- Error: "Invalid type: 'container' must be a String or HTMLElement"

**Solution:**
This has been fixed in the code. Make sure you rebuild the frontend after pulling the latest changes.

---

### Issue: Hand Gesture Not Working

**Symptoms:**
- Frames being sent (console shows "📊 Frames sent: 100, 200...")
- No gesture cursor appearing
- No gesture responses

**Possible Causes & Solutions:**

1. **Python service not connected to backend:**
   ```bash
   # Check Python service logs for:
   "✅ Connected to server"

   # If not connected, verify:
   SOCKET_SERVER_URL=https://geoswipe-backend.onrender.com
   ```

2. **Backend CORS not allowing frontend:**
   ```javascript
   // In server/index.js, make sure FRONTEND_URL is set correctly
   FRONTEND_URL=https://geoswipe.onrender.com
   ```

3. **Socket.IO connection failing:**
   - Check browser console for socket errors
   - Verify no CORS errors
   - Check Network tab for WebSocket connection

---

### Issue: MapTiler Tiles Not Loading

**Symptoms:**
- Map shows but no satellite imagery or terrain
- Console errors about tile loading

**Solution:**
```bash
# Set valid MapTiler API key in Frontend environment:
VITE_MAPTILER_API_KEY=your_actual_key_here

# Then rebuild frontend
```

Get a free API key from: https://cloud.maptiler.com/account/keys/

---

## Verifying Deployment

### 1. Backend Health Check
```bash
curl https://geoswipe-backend.onrender.com/
# Should return JSON with API info

curl https://geoswipe-backend.onrender.com/api/heritage-sites/geojson
# Should return GeoJSON with heritage sites
```

### 2. Python Service Health Check
```bash
curl https://geoswipe-gesture.onrender.com/health
# Should return: {"status": "healthy" or "connecting"}
```

### 3. Frontend Check
- Open `https://geoswipe.onrender.com`
- Open Developer Console (F12)
- Check for:
  - ✅ "🔗 Socket connected to backend for gesture control"
  - ✅ "Map loaded successfully"
  - ✅ Heritage sites appearing on map
  - ❌ No CORS errors
  - ❌ No "localhost" references

---

## Common Mistakes to Avoid

1. ❌ **Forgetting to rebuild frontend after changing environment variables**
   - Vite bakes env vars at build time
   - Always rebuild after changing `VITE_*` variables

2. ❌ **Using wrong URLs in environment variables**
   - Use HTTPS URLs for production
   - Don't include `/api` in base URLs
   - Example: `https://geoswipe-backend.onrender.com` ✅
   - Example: `https://geoswipe-backend.onrender.com/api` ❌

3. ❌ **Not updating backend CORS for frontend URL**
   - Backend CORS must explicitly allow your frontend URL
   - Check `server/index.js` line 7-12 and 27-30

4. ❌ **Python service connecting to wrong backend**
   - `SOCKET_SERVER_URL` must match backend deploy URL
   - Check Python service logs for connection errors

---

## Environment Variables Quick Reference

### Backend (Node.js)
```bash
MONGODB_URI=mongodb+srv://...
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
```

### Python Gesture Service
```bash
SOCKET_SERVER_URL=https://geoswipe-backend.onrender.com
CAMERA_MODE=browser
```

### Frontend (Static Site)
```bash
VITE_API_URL=https://geoswipe-backend.onrender.com
VITE_API_BASE_URL=https://geoswipe-backend.onrender.com
VITE_MAPTILER_API_KEY=your_actual_key_here
VITE_NODE_ENV=production
```

---

## Testing Locally Before Deployment

Before deploying, test the full stack locally:

```bash
# Terminal 1 - Backend
cd server
npm install
PORT=3000 node index.js

# Terminal 2 - Python Gesture Service
cd gesture-control
pip install -r requirements.txt
SOCKET_SERVER_URL=http://localhost:3000 CAMERA_MODE=browser python detect.py

# Terminal 3 - Frontend
cd client
npm install
VITE_API_URL=http://localhost:3000 VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

Visit `http://localhost:5173` and verify:
- ✅ Map loads with heritage sites
- ✅ Can click on heritage sites
- ✅ Socket connected message in console
- ✅ Gesture detection working (if camera enabled)

---

## Need Help?

If you're still experiencing issues after following this guide:

1. Check service logs in Render dashboard
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure services are deployed in correct order
5. Try redeploying services in order: Backend → Python → Frontend

---

## Summary of Code Changes Made

### `client/src/HeritagePage.jsx`
- Added `API_BASE_URL` constant using environment variables
- Fixed line 466: Changed from `'http://localhost:3000/api/heritage-sites/geojson'` to `${API_BASE_URL}/api/heritage-sites/geojson`
- Fixed line 735: Changed from `http://localhost:3000/api/heritage-sites/...` to `${API_BASE_URL}/api/heritage-sites/...`
- Added null check for `mapContainer.current` before initializing map (lines 771-774)

These changes ensure your frontend uses the deployed backend URL instead of localhost.

---

**Last Updated:** February 15, 2026
