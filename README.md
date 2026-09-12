<div align="center">

# 🌍 GeoSwipe
### Interactive Heritage & Geography Explorer

A modern, interactive web application that combines 3D Earth visualization, cultural heritage exploration, geography learning, and gesture-controlled navigation. Discover UNESCO World Heritage sites, historic monuments, and geographical wonders through an immersive map experience.

---

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-geoswipe.pages.dev-success?style=for-the-badge&logoColor=white)](https://geoswipe.pages.dev/)
[![Watch Demo Video](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-red?style=for-the-badge)](https://drive.google.com/file/d/13jWqWI3qgzt3HObZ80NEqZqjEjKYIqeV/view?usp=sharing)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Features at a Glance

<table>
<tr>
<td width="50%">

### 🗺️ Interactive Heritage Map
- Explore **UNESCO World Heritage Sites**
- 🎨 Multiple map styles: Satellite, Street, Terrain, Dark
- 🏷️ Custom category icons for site types
- 📋 Detailed information panels with images

</td>
<td width="50%">

### 🌍 3D Earth Globe
- 🎬 Three.js powered visualization
- ✨ Smooth country selection & highlighting
- ⚡ Performance optimized (60 FPS target)

</td>
</tr>
</table>

<table>
<tr>
<td width="50%">

### 🎮 Advanced Gesture Control
- 👋 Hand gesture navigation
- 🤖 MediaPipe & OpenCV powered
- ⚙️ Real-time gesture recognition
- 🎛️ Enhanced gesture button system

</td>
<td width="50%">

### 📚 Educational Features
- 🧠 Geography Quiz Mode
- 📖 Heritage StoryBooks
- 🗺️ "How to Reach" guides
- 🔍 Explore Mode for discovery

</td>
</tr>
</table>

### 🛠️ Powered by Modern Tech

<div align="center">

| Frontend | Backend | Tools |
|----------|---------|-------|
| **React 19** | **Node.js + Express** | **Vite** |
| **Three.js** | **MongoDB** | **ESLint** |
| **MapLibre GL JS** | **Socket.IO** | **Git** |
| **Socket.IO Client** | **REST API** | **Vite** |

</div>

---

## 🚀 Quick Start for Developers

### 📋 Prerequisites

<table>
<td>

✅ **Node.js** ≥ 18.0.0  
✅ **Python** 3.8+  
✅ **MongoDB** (local or cloud)  
✅ **Git**

</td>
</table>

### Step 1️⃣ Clone & Navigate
```bash
git clone <your-repository-url>
cd Geoswipe
```

### Step 2️⃣ Install Dependencies
```bash
# Install main project dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

> **✨ No Python setup required.** Gesture recognition runs in the browser via MediaPipe Tasks-Vision. The WASM runtime and hand-landmark model are fetched automatically.

### Step 3️⃣ Environment Setup
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.development
```

**Fill in `server/.env` with:**
- 🔑 **MongoDB connection** (`MONGODB_URI`)
- 🔑 **API Keys**: MapTiler, OpenWeather, NewsAPI, Unsplash, Groq

> 💡 You can use single keys or comma-separated pools from multiple free accounts. The server rotates through pools.

### Step 4️⃣ Launch the Application

#### 🎯 Option A: Run Everything Together (Recommended)
```bash
npm start
```
Starts:
- ✅ Client → `http://localhost:5173`
- ✅ Server → `http://localhost:3000`

#### 🎯 Option B: Run Separately
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### Step 5️⃣ Access & Explore
```
🏠 Main App          → http://localhost:5173
📡 Server API        → http://localhost:3000
🔧 Health Check      → http://localhost:3000/api/diagnostics
🎮 Gesture Control   → Enabled in-browser (allow camera)
```

---

## 📂 Project Structure

```
Geoswipe/
│
├── 📁 client/                      # React frontend application
│   ├── src/
│   │   ├── LandingPage.jsx         # 🏠 Home page
│   │   ├── HeritagePage.jsx        # 🗺️  Main heritage map
│   │   ├── ExplorePage.jsx         # 🌍 3D Earth exploration
│   │   ├── QuizPage.jsx            # 🧠 Geography quiz
│   │   ├── HeritageStoryBook.jsx   # 📖 Historical narratives
│   │   └── components/             # 🧩 Reusable components
│   └── public/assets/              # 🖼️  Images, icons, audio
│
├── 📁 server/                      # Node.js backend
│   ├── index.js                    # 🚀 Server entry point
│   ├── models/                     # 📊 MongoDB schemas
│   ├── routes/                     # 🛣️  API endpoints
│   └── services/                   # ⚙️  Business logic
│
├── 📁 mdfiles/                     # 📚 Documentation
│
└── 📄 package.json                 # 📦 Root dependencies
```

---

## 🛠️ Development Commands

### 🎯 Root Level
| Command | Purpose |
|---------|---------|
| `npm start` | 🚀 Launch all services |
| `npm run start:client` | ⚛️ React client only |
| `npm run start:server` | 🖥️ Node.js server only |
| `npm run start:gesture` | 👋 Gesture control only |

### ⚛️ Client Commands
```bash
cd client

npm run dev           # 🔄 Dev server with hot reload
npm run build         # 📦 Production build
npm run preview       # 👁️  Preview built app
npm run lint          # ✅ Check code quality
npm run lint:fix      # 🔧 Auto-fix linting issues
```

### 🖥️ Server Commands
```bash
cd server

npm run dev           # 🔄 Dev with auto-restart
npm start             # 🚀 Production server
```

---

## 📖 Usage Guide

| Page | Description |
|------|-------------|
| 🏠 **Landing Page** | Navigate between different exploration modes |
| 🗺️ **Heritage Mode** | Browse UNESCO sites, filter by category, view details, gesture navigation |
| 🌍 **Explore Mode** | Interact with 3D Earth globe and learn about countries |
| ❓ **Quiz Mode** | Test your geography knowledge with interactive questions |
| 📖 **StoryBook** | Read detailed historical narratives and heritage stories |

---

## 🎯 Technology Stack

<div align="center">

```
🎨 Frontend             🖥️  Backend              ⚙️ Infrastructure
├─ React 19            ├─ Node.js              ├─ Vite
├─ Three.js            ├─ Express.js           ├─ ESLint
├─ MapLibre GL JS      ├─ MongoDB              ├─ Socket.IO
├─ Socket.IO Client    ├─ Socket.IO            └─ REST API
└─ MediaPipe           └─ OpenCV (Python)
```

</div>

---

## 🤝 Contributing

We love contributions! Here's how to help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** to branch (`git push origin feature/AmazingFeature`)
5. 🔄 **Open** a Pull Request

---

## 📄 License

Licensed under the **ISC License** - see [LICENSE](LICENSE) file for details.

---

## 🚀 Coming Soon

- 🌐 Progressive Web App (PWA) support
- 📱 Enhanced mobile gesture controls
- 🎨 Additional map themes
- 🔍 Advanced search & filtering
- 📊 Analytics & engagement metrics

---

<div align="center">

### 🌟 Show Your Support

If you found this project helpful, please consider giving it a ⭐ on GitHub!

### 🔗 Quick Links

[![Website](https://img.shields.io/badge/🌐%20Website-geoswipe.pages.dev-blue?style=flat-square)](https://geoswipe.pages.dev/)
[![GitHub](https://img.shields.io/badge/💻%20GitHub-Repository-black?style=flat-square)](https://github.com)

---

**Built with ❤️ for heritage preservation and geographical education**

</div>

