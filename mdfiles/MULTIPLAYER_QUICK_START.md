# 🎮 Multiplayer Quick Start - GeoSwipe

**TL;DR: Get playing in 60 seconds!**

---

## ⚡ Super Quick Start

### **Step 1: Launch Everything**
```bash
npm start
```
Wait for both server and client to start (should open automatically at http://localhost:5173)

### **Step 2: Player 1 (Host) - Create Room**
1. Click **"Multiplayer Flag Game"** or **"Multiplayer Quiz"**
2. Enter your name
3. Click **"🎮 Create New Room"**
4. **Share the 6-digit code** that appears (e.g., `AB3K7N`)

### **Step 3: Player 2 (Guest) - Join Room**
1. Go to same multiplayer game page
2. Enter your name  
3. Type the **6-digit code** from Player 1
4. Click **"Join Room"**

### **Step 4: Play!**
- Flag Game: Click the country that matches the flag
- Quiz Game: Click the country that answers the question
- Race to get the most correct answers in 10 rounds!

---

## 🎯 Two Game Modes

| Game Mode | URL | How to Win |
|-----------|-----|------------|
| 🏳️ **Flag Game** | `/multiplayer/flag-game` | Identify countries by their flags |
| 🎯 **Quiz Game** | `/multiplayer/quiz` | Answer geography trivia questions |

---

## 🔧 If Something Goes Wrong

| Problem | Quick Fix |
|---------|-----------|
| 🔴 Red "Connecting..." | Restart server: `cd server && npm run dev` |
| ❌ Can't join room | Double-check the 6-digit code |
| 🌍 Globe not loading | Refresh the page (F5) |
| 😔 Opponent left | Create a new room and try again |

---

## 📱 Play on Two Devices

### On Same WiFi:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On second device, go to: `http://YOUR_IP:5173`
3. Create/join rooms as normal

### On Same Computer (Testing):
1. Open **two browser windows**
2. Go to `http://localhost:5173` in both
3. Create room in window 1, join in window 2

---

## 🎮 Controls

- **🖱️ Mouse**: Drag globe, scroll to zoom, click country
- **✋ Gesture**: Open palm moves cursor, OK sign (👌) clicks
- **⬅️ Leave**: Button in bottom-left to exit

---

## 🏆 Winning

- **10 rounds** total
- **1 point** per correct answer
- **Highest score** wins
- **👑 Crown** for the champion!

---

**Full guide available in MULTIPLAYER_GUIDE.md**

**Ready? Let's play! 🌍**
