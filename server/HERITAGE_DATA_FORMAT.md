# Heritage Site Data Format for MongoDB

This document shows the complete data structure for storing heritage sites in MongoDB.

## Complete JSON Structure:

```json
{
  "name": "Site Name",
  "category": "UNESCO World Heritage | Historic Fort | Rock-cut Cave | Temple | Monument | Palace | Museum | Historic Building",
  "year": "Construction year or period",
  "location": {
    "coordinates": [longitude, latitude], // Important: longitude first, then latitude
    "city": "City name",
    "state": "State name", 
    "country": "Country name"
  },
  "info": {
    "summary": "Brief 1-2 sentence description for cards/previews",
    "full": "Detailed description for main info page",
    "history": "Historical background and timeline",
    "architecture": "Architectural details and style",
    "significance": "Cultural, historical, or religious importance",
    "visitingTips": [
      "Tip 1 for visitors",
      "Tip 2 for visitors",
      "Tip 3 for visitors"
    ]
  },
  "howToReach": {
    "summary": "Brief travel summary for cards",
    "full": "Detailed travel description",
    "byAir": {
      "nearestAirport": "Airport name",
      "distance": "Distance from airport",
      "description": "Detailed air travel instructions"
    },
    "byRail": {
      "nearestStation": "Railway station name", 
      "distance": "Distance from station",
      "description": "Detailed rail travel instructions"
    },
    "byRoad": {
      "fromMajorCities": [
        {
          "city": "Major city name",
          "distance": "Distance",
          "route": "Route description", 
          "duration": "Travel time"
        }
      ],
      "localTransport": "Local transportation options"
    }
  },
  "media": {
    "panorama_url": "URL for 360° view or main image",
    "images": ["url1", "url2", "url3"],
    "video_url": "URL for promotional video"
  },
  "visitor_info": {
    "timings": "Opening hours and days",
    "entryFee": "Ticket prices",
    "bestTimeToVisit": "Recommended visiting season",
    "duration": "Time needed for visit"
  }
}
```

## Required Fields:
- `name` (string, unique)
- `category` (enum value from list above)
- `year` (string)
- `location.coordinates` (array of [longitude, latitude])
- `info.summary` (string)
- `info.full` (string)
- `howToReach.summary` (string) 
- `howToReach.full` (string)

## Optional Fields:
All other fields are optional but recommended for better user experience.

## Adding New Sites:

### Option 1: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. Navigate to `geoswipedb` → `heritagesites` collection
4. Click "Add Data" → "Insert Document"
5. Paste your JSON data

### Option 2: Using Script
Add your data to `populate-heritage-sites.js` and run:
```bash
node populate-heritage-sites.js
```

### Option 3: Using API (Future Enhancement)
You can create an admin panel to add sites via web interface.

## Example Sites You Can Add:

1. **Shaniwar Wada** (Historic Fort, Pune)
2. **Elephanta Caves** (UNESCO World Heritage)
3. **Bibi Ka Maqbara** (Monument, Aurangabad)
4. **Raigad Fort** (Historic Fort)
5. **Trimbakeshwar Temple** (Temple)

## API Endpoints Available:

- `GET /api/heritage-sites` - Get all sites
- `GET /api/heritage/:name` - Get specific site by name
- `GET /api/heritage/category/:category` - Get sites by category

## Testing Your Setup:

1. Start server: `node index.js`
2. Test API: http://localhost:3000/api/heritage/Ajanta%20Caves
3. Test frontend: Open your React app and navigate to heritage info pages
