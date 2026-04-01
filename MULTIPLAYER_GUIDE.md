# 🎮 Multiplayer Game Guide - GeoSwipe

Welcome to GeoSwipe's multiplayer mode! Challenge your friends to geography battles in two exciting game modes: **Flag Guessing** and **Geography Quiz**.

---

## 🎯 Available Multiplayer Games

### 🏳️ **Multiplayer Flag Game**
- Guess countries by their flags
- 10 rounds of fast-paced flag identification
- Click the correct country on the 3D globe

### 🎯 **Multiplayer Quiz Game**  
- Answer geography trivia questions
- Choose difficulty: Easy, Medium, or Hard
- 10 rounds of knowledge testing
- Click the answer country on the globe

---

## 🚀 Quick Start Guide

### **Step 1: Start the Application**

You need to run **both** the server and client:

#### Option A: Start Everything at Once (Recommended)
```bash
# From the project root directory
npm start
```
This will launch:
- ✅ Client (React app) on http://localhost:5173
- ✅ Server (Node.js backend) on http://localhost:3001
- ✅ Gesture control system (optional)

#### Option B: Start Separately
```bash
# Terminal 1: Start the server
cd server
npm run dev
# Server runs on http://localhost:3001

# Terminal 2: Start the client  
cd client
npm run dev
# Client runs on http://localhost:5173
```

### **Step 2: Open the Application**

1. Open your browser and go to: **http://localhost:5173**
2. You should see the GeoSwipe landing page
3. Make sure you see **🟢 Connected to server** status (green indicator)

---

## 🎮 How to Play Multiplayer

### 🏳️ **Playing Multiplayer Flag Game**

#### **Creating a Room (Host)**

1. **Navigate to Multiplayer Flag Game**
   - From landing page, click on **"Multiplayer Flag Game"** button
   - Or go directly to: http://localhost:5173/multiplayer/flag-game

2. **Enter Your Name**
   - Type your player name (max 20 characters)
   - Example: "Player 1", "Alice", "GeoMaster"

3. **Create New Room**
   - Click the **"🎮 Create New Room"** button
   - A **6-digit room code** will be generated (e.g., `AB3K7N`)
   - You'll enter the waiting room

4. **Share the Room Code**
   - Share the 6-digit code with your friend
   - They can join from any device on the same network
   - Wait for your friend to join (you'll see their name appear)

5. **Game Starts Automatically**
   - Once 2 players are in the room, the game starts automatically
   - You'll see the first flag immediately

#### **Joining a Room (Guest)**

1. **Navigate to Multiplayer Flag Game**
   - Go to http://localhost:5173/multiplayer/flag-game

2. **Enter Your Name**
   - Type your player name

3. **Enter Room Code**
   - Type the **6-digit code** your friend shared
   - Example: `AB3K7N`
   - Code is case-insensitive

4. **Click "Join Room"**
   - You'll join the existing room
   - Game starts automatically when you join

#### **Playing the Flag Game**

1. **Look at the Flag** displayed in the game panel
2. **Find the Country** on the 3D globe
3. **Click the Country** to submit your answer
4. **Wait for Results** after both players answer
5. **See Round Results**:
   - ✅ Green = Correct answer
   - ❌ Red = Wrong answer
   - See what both players answered
6. **Repeat** for 10 rounds
7. **Final Results** show winner with crown 👑

**Controls:**
- 🖱️ **Mouse**: Click and drag to rotate globe, scroll to zoom
- ✋ **Gestures**: Open palm to move cursor, OK sign (👌) to click
- 🌍 **Globe**: Click any country to submit your answer

---

### 🎯 **Playing Multiplayer Quiz Game**

#### **Creating a Room (Host)**

1. **Navigate to Multiplayer Quiz**
   - From landing page, click **"Multiplayer Quiz"**
   - Or go to: http://localhost:5173/multiplayer/quiz

2. **Enter Your Name**
   - Type your player name (max 20 characters)

3. **Select Difficulty**
   - 🟢 **Easy**: Simple geography questions
   - 🟡 **Medium**: Moderate difficulty (default)
   - 🔴 **Hard**: Challenging questions

4. **Create New Room**
   - Click **"🎮 Create New Room"**
   - Get your **6-digit room code**

5. **Share & Wait**
   - Share the code with your friend
   - Wait in the lobby until they join

6. **Game Starts**
   - Automatic start when 2 players join
   - First question appears immediately

#### **Joining a Room (Guest)**

1. **Navigate to Multiplayer Quiz**
   - Go to http://localhost:5173/multiplayer/quiz

2. **Enter Details**
   - Type your name
   - The difficulty is set by the host

3. **Enter Room Code**
   - Type the 6-digit code (e.g., `MK4P2R`)

4. **Click "Join Room"**
   - Game starts when you join

#### **Playing the Quiz Game**

1. **Read the Question** displayed in the panel
2. **See 4 Possible Answers** listed below
3. **Find the Correct Country** on the 3D globe
4. **Click the Country** to submit
5. **Wait** for your opponent to answer
6. **View Results**:
   - See correct answer highlighted
   - See what both players answered
   - Scores update automatically
7. **Continue** for 10 rounds total
8. **Winner Announced** after final round

**Example Questions:**
- "Which country has the capital Paris?"
- "What is the largest country by area?"
- "Which country is known as the Land of the Rising Sun?"

---

## 🎨 Game Features

### 📊 **Score Tracking**
- Real-time score display for both players
- Round-by-round results
- Final leaderboard with winner

### ⏱️ **Game Flow**
- 10 rounds per game
- Automatic progression between rounds
- 2-3 second result display between rounds
- Automatic game end after round 10

### 🏆 **Winner Determination**
- Player with most correct answers wins
- 🤝 Tie if scores are equal
- 👑 Crown icon for winner
- Option to play again

### 👥 **Player Management**
- 2 players maximum per room
- Automatic disconnect handling
- Game ends if a player leaves
- Room cleanup after game ends

---

## 🎮 Controls & Navigation

### **Globe Controls**
- **Mouse Drag**: Rotate the Earth
- **Scroll Wheel**: Zoom in/out
- **Click Country**: Submit answer

### **Gesture Controls** (if enabled)
- ✋ **Open Palm**: Move the blue cursor
- 👌 **OK Sign**: Click/select
- 🤏 **Pinch**: Zoom out
- ✌️ **Two Fingers**: Zoom in

### **Buttons**
- **Leave Room**: Exit to main menu
- **Back**: Return to landing page
- All buttons work with gestures too!

---

## 📱 Playing on Multiple Devices

### **Same Network (Local)**

**Setup:**
1. Start server and client on one computer (host)
2. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for "inet" address
   ```

3. On the second device, open browser and go to:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```
   Example: `http://192.168.1.100:5173`

4. Both players create/join the same room code

**Note:** Make sure both devices are on the same WiFi network!

### **Same Computer (Testing)**

1. Open **two browser windows** side by side
2. Go to http://localhost:5173 in both
3. Player 1: Create room in first window
4. Player 2: Join room in second window
5. Play against yourself to test!

---

## ⚠️ Troubleshooting

### **🔴 "Connecting..." Status (Red)**

**Problem:** Client can't connect to server

**Solutions:**
1. Make sure the server is running:
   ```bash
   cd server
   npm run dev
   ```
2. Check server is on port 3001 (or 3000)
3. Check console for errors
4. Restart both server and client

### **❌ "Room is full"**

**Problem:** Trying to join a room with 2 players already

**Solutions:**
1. Create a new room instead
2. Ask one player to leave
3. Wait for current game to finish

### **🚫 "Room not found"**

**Problem:** Invalid room code

**Solutions:**
1. Double-check the room code (6 characters)
2. Code is case-insensitive but must be exact
3. Room might have expired (10 min inactive)
4. Create a new room

### **😔 "Opponent disconnected"**

**Problem:** Other player lost connection

**Solutions:**
1. Automatic - game ends, return to lobby
2. Start a new game with fresh room code
3. Check network stability

### **🌍 Globe Not Responding**

**Problem:** Can't click countries

**Solutions:**
1. Wait for globe to fully load
2. Try zooming in closer to country
3. Refresh the page
4. Check browser console for errors

### **⌛ Game Stuck on "Waiting for opponent..."**

**Problem:** Other player submitted but you're still waiting

**Solutions:**
1. Check if you already submitted (blue checkmark)
2. Try clicking a country again
3. Check browser console
4. Leave and rejoin room if persistent

---

## 🎯 Tips for Best Experience

### **For Smooth Gameplay**
- ✅ Use Chrome, Firefox, or Edge (latest versions)
- ✅ Good internet connection for both players
- ✅ Close unnecessary browser tabs
- ✅ Enable hardware acceleration in browser

### **For Better Accuracy**
- ✅ Zoom in to see smaller countries clearly
- ✅ Rotate globe to see hidden countries
- ✅ Take your time - no rush timer!
- ✅ Learn country locations in single-player first

### **For Gesture Control**
- ✅ Ensure good lighting
- ✅ Camera has clear view of your hand
- ✅ Use defined gestures clearly
- ✅ Practice in single-player mode first

---

## 🔧 Technical Details

### **Server Requirements**
- Node.js 18+ installed
- MongoDB running (for heritage data)
- Port 3001 available

### **Client Requirements**
- Modern web browser
- Port 5173 available
- WebSocket support

### **Network Requirements**
- Same WiFi network for local multiplayer
- Firewall allows ports 3001 and 5173

### **Socket Events Used**
- `join-room`: Join/create a game room
- `leave-room`: Exit current room
- `submit-answer`: Send player's answer
- `player-joined`: New player notification
- `game-started`: Game begins (2 players)
- `new-question`: New round starts
- `show-result`: Round results display
- `game-over`: Final results

---

## 📋 Game Flow Diagram

```
Player 1 (Host)                    Player 2 (Guest)
     |                                  |
     |-- Creates Room                   |
     |   (Gets: AB3K7N)                 |
     |                                  |
     |-- Shares Code: "AB3K7N" ------> |
     |                                  |
     |   Waiting for Player 2...        |-- Enters Code: AB3K7N
     |                                  |-- Joins Room
     |                                  |
     | <--------- Game Auto-Starts ---------> |
     |                                  |
     |-- Round 1: Flag/Question Shown -->|
     |                                  |
     |-- Submits Answer (Germany) ----> |-- Submits Answer (France)
     |                                  |
     | <------- Results: Correct = Germany ---> |
     |   Player 1: ✅ +1 point          |   Player 2: ❌ 0 points
     |                                  |
     |-- Round 2-10: Repeat ----------> |
     |                                  |
     | <--------- Final Results -----------> |
     |   Winner: Player 1 (7/10) 👑     |   Player 2: (5/10)
     |                                  |
     |-- Play Again or Leave ----------> |
```

---

## 🎊 Example Play Session

### **Flag Game Example**

```
1. You: "Hey, let's play Flag Game!"
2. Friend: "Sure! Create a room."

3. You create room → Get code: NK5M2P
4. You: "Join room NK5M2P"

5. Friend joins → Game starts!

Round 1:
- Flag shown: 🇯🇵 (Red circle on white)
- You click: Japan ✅
- Friend clicks: China ❌
- Score: You 1 - Friend 0

Round 2:
- Flag shown: 🇧🇷 (Green, yellow, blue)
- You click: Brazil ✅
- Friend clicks: Brazil ✅  
- Score: You 2 - Friend 1

... 8 more rounds ...

Final Score: You 7 - Friend 6
🏆 You Win!
```

---

## 🆘 Need Help?

### **Common Questions**

**Q: Can we play with more than 2 players?**  
A: Currently, rooms support exactly 2 players. For more players, create multiple rooms.

**Q: How long do rooms stay active?**  
A: Rooms auto-delete after 10 minutes of inactivity or when all players leave.

**Q: Can I pause the game?**  
A: No pause feature. If you leave, the game ends for both players.

**Q: Do I need to install anything?**  
A: Just Node.js and npm. Everything else runs in the browser.

**Q: Can I play over the internet (not local network)?**  
A: You'd need to deploy the server to a public hosting service (Heroku, Railway, etc.).

**Q: What if the flag image doesn't load?**  
A: The game uses flagcdn.com. Check your internet connection or try a different flag API.

---

## 🚀 Advanced: Deploying for Internet Play

To play with friends anywhere in the world:

1. **Deploy Server** to Heroku/Railway/Render
2. **Update Client** environment variable:
   ```
   VITE_API_URL=https://your-server.herokuapp.com
   ```
3. **Deploy Client** to Vercel/Netlify
4. Share the client URL with friends!

---

## 📝 Game Rules Summary

### **Flag Game Rules**
- 10 flags shown, one per round
- Click the matching country on globe
- 1 point per correct answer
- Highest score wins
- Tie if equal scores

### **Quiz Game Rules**  
- 10 questions, based on difficulty
- 4 options shown per question
- Click the correct country on globe
- 1 point per correct answer
- Highest score wins

### **General Rules**
- Must have exactly 2 players
- Both players must submit before seeing results
- Game auto-progresses after results shown
- Leaving ends game for both players
- No time limit per question

---

**Built with ❤️ for geography enthusiasts and competitive friends!**

**Enjoy your multiplayer geography battles! 🌍🎮**
