# GeoSwipe 🌍 - Interactive Heritage & Geography Explorer

A modern, interactive web application that combines 3D Earth visualization, cultural heritage exploration, geography learning, and gesture-controlled navigation. Discover UNESCO World Heritage sites, historic monuments, and geographical wonders through an immersive map experience.

## 🎬 Demo Video

[![Watch Demo](https://img.shields.io/badge/▶%20Watch%20Demo-GeoSwipe-blue?style=for-the-badge)](https://drive.google.com/file/d/13jWqWI3qgzt3HObZ80NEqZqjEjKYIqeV/view?usp=sharing)

## ✨ Key Features

### 🗺️ **Interactive Heritage Map**
- Explore **UNESCO World Heritage Sites**, historic forts, temples, palaces, and monuments
- **Multiple map styles**: Satellite, Street, Terrain, and Dark modes
- **Custom category icons** for different heritage site types
- **Detailed information panels** with images, descriptions, and historical context

### 🌍 **3D Earth Globe**
- **Three.js powered** interactive 3D Earth visualization
- **Smooth country selection** with real-time highlighting
- **Performance optimized** rendering with 60 FPS target

### 🎮 **Advanced Gesture Control**
- **Hand gesture navigation** using MediaPipe and OpenCV
- **Real-time gesture recognition** for map interactions
- **Gesture button system** for enhanced user experience

### 📚 **Educational Features**
- **Geography Quiz Mode** with country-based questions
- **Heritage StoryBooks** with detailed historical narratives
- **"How to Reach"** guides for heritage sites
- **Explore Mode** for free-form discovery

### 🛠️ **Technical Excellence**
- **React 19** with modern hooks and performance optimizations
- **MapLibre GL JS** for professional-grade mapping
- **Socket.IO** for real-time communication
- **MongoDB** for heritage site data management
- **Vite** for lightning-fast development builds

---

## 🚀 Quick Start for Developers

### Prerequisites
- **Node.js** ≥ 18.0.0
- **Python** 3.8+ (for gesture control)
- **MongoDB** (local or cloud instance)
- **Git**

### 1️⃣ Clone & Navigate
```bash
git clone <your-repository-url>
cd Geoswipe
```

### 2️⃣ Install Dependencies
```bash
# Install main project dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

> **No Python setup.** Gesture recognition runs in the browser via MediaPipe
> Tasks-Vision. The WASM runtime and hand-landmark model are fetched
> automatically by `client/scripts/setup-mediapipe.mjs` the first time you run
> `npm run dev` or `npm run build` in `client/`.

### 3️⃣ Environment Setup
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.development
```
Then fill in `server/.env`:
- **MongoDB connection** (`MONGODB_URI`)
- **API keys** — MapTiler, OpenWeather, NewsAPI, Unsplash, Groq

Each key accepts either a single value (`OPENWEATHER_API_KEY`) or a
comma-separated pool from several free accounts (`OPENWEATHER_API_KEYS`). The
server rotates through a pool and steps past any key that hits its quota. See
`server/.env.example` for the full list, and
[ARCHITECTURE_CHANGES.md](mdfiles/ARCHITECTURE_CHANGES.md) for how caching keeps usage
inside the free tiers.

**Never put a key in `client/.env.*`** — Vite compiles those into the browser
bundle.

### 4️⃣ Launch the Application

#### Option A: Run Everything at Once (Recommended)
```bash
npm start
```
This will start:
- ✅ Client on `http://localhost:5173`
- ✅ Server on `http://localhost:3000`

#### Option B: Run Components Separately
```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

Gesture control needs no process of its own — it runs in the browser tab as
soon as you allow camera access.

### 5️⃣ Access the Application
- **Main App**: http://localhost:5173
- **Server API**: http://localhost:3000
- **Integration health**: http://localhost:3000/api/diagnostics
- **Gesture Control**: in-browser; allow camera access when prompted

---

## 🏗️ Project Structure

```
Geoswipe/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── LandingPage.jsx        # Home page
│   │   ├── HeritagePage.jsx       # Main heritage map interface
│   │   ├── ExplorePage.jsx        # 3D Earth exploration
│   │   ├── QuizPage.jsx           # Geography quiz
│   │   ├── HeritageStoryBook.jsx  # Historical narratives
│   │   └── components/            # Reusable components
│   ├── public/assets/             # Images, icons, audio files
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js                   # Main server file
│   ├── models/                    # MongoDB models
│   └── package.json
└── package.json           # Root project configuration
```

---

## 🛠️ Development Commands

### Root Project
```bash
npm start              # Launch all services
npm run start:client   # Start only React client
npm run start:server   # Start only Node.js server
npm run start:gesture  # Start only gesture control
```

### Client Development
```bash
cd client
npm run dev           # Development server with hot reload
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # Code linting
npm run lint:fix      # Auto-fix linting issues
```

### Server Development
```bash
cd server
npm run dev           # Development with auto-restart
npm start             # Production server
```

---

## 🌟 Usage Guide

1. **🏠 Landing Page**: Navigate between different modes (Heritage, Explore, Quiz)
2. **🗺️ Heritage Mode**: 
   - Browse heritage sites on interactive map
   - Filter by categories (UNESCO, Forts, Temples, etc.)
   - Click sites for detailed information
   - Use gesture controls for navigation
3. **🌍 Explore Mode**: Interact with 3D Earth globe and learn about countries
4. **❓ Quiz Mode**: Test your geography knowledge
5. **📖 StoryBook**: Read detailed historical narratives

---

## 🎯 Key Technologies

- **Frontend**: React 19, Three.js, MapLibre GL JS, Socket.IO Client
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Gesture Control**: Python, OpenCV, MediaPipe
- **Build Tools**: Vite, ESLint
- **Deployment**: Optimized for modern web hosting

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🚀 What's Next?

- 🌐 PWA support for offline usage
- 📱 Mobile-responsive gesture controls
- 🎨 Additional map themes and customization
- 🔍 Advanced search and filtering
- 📊 Analytics and user engagement metrics

---

**Built with ❤️ for heritage preservation and geographical education**

