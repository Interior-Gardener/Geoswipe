# 🎮 Multiplayer System Architecture - GeoSwipe

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GEOSWIPE MULTIPLAYER                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐              ┌──────────────┐
│  Player 1    │              │  Player 2    │
│  (Browser)   │              │  (Browser)   │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │  WebSocket (Socket.IO)      │
       │                             │
       └─────────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │   Server    │
              │  Port 3001  │
              │             │
              │ - Room Mgmt │
              │ - Questions │
              │ - Scoring   │
              └─────────────┘
```

## Component Architecture

### Client Side (`/client/src/`)

```
Landing Page
    │
    ├──> Multiplayer Quiz Page
    │    └──> MultiplayerQuizGame Component
    │         ├── Room Management UI
    │         ├── Globe (EarthThreeJS)
    │         └── Socket Connection
    │
    └──> Multiplayer Flag Page
         └──> MultiplayerFlagGame Component
              ├── Room Management UI
              ├── Globe (EarthThreeJS)
              └── Socket Connection

Shared:
    └──> multiplayerSocket.js (Singleton)
         ├── Connection Management
         ├── Event Subscriptions
         └── Room Operations
```

### Server Side (`/server/index.js`)

```
Socket.IO Server
    │
    ├──> Room Manager
    │    ├── Create Room
    │    ├── Join Room
    │    ├── Leave Room
    │    └── Cleanup Stale Rooms
    │
    ├──> Game Logic
    │    ├── Generate Questions (Flag/Quiz)
    │    ├── Validate Answers
    │    ├── Calculate Scores
    │    └── Determine Winners
    │
    └──> Event Emitters
         ├── player-joined
         ├── game-started
         ├── new-question
         ├── player-answered
         ├── show-result
         └── game-over
```

## Socket Event Flow

### Creating & Joining a Room

```
Player 1 (Host)                     Server                      Player 2 (Guest)
      │                               │                               │
      │──[join-room]─────────────────>│                               │
      │  { roomId, playerName, mode } │                               │
      │                               │                               │
      │                               │ Create Room                   │
      │                               │ Add Player 1                  │
      │                               │                               │
      │<────[player-joined]───────────│                               │
      │  { players: [P1] }            │                               │
      │                               │                               │
      │                               │<──────[join-room]─────────────│
      │                               │  { roomId, playerName, mode } │
      │                               │                               │
      │                               │ Add Player 2                  │
      │                               │ Start Game                    │
      │                               │                               │
      │<────[player-joined]───────────│────[player-joined]───────────>│
      │  { players: [P1, P2] }        │  { players: [P1, P2] }        │
      │                               │                               │
      │<────[game-started]────────────│────[game-started]────────────>│
      │  { totalRounds: 10 }          │  { totalRounds: 10 }          │
      │                               │                               │
```

### Game Round Flow

```
Player 1                            Server                          Player 2
    │                                 │                                 │
    │<──────[new-question]────────────│──────[new-question]────────────>│
    │  { question, round: 1 }         │  { question, round: 1 }         │
    │                                 │                                 │
    │                                 │                                 │
    │──[submit-answer]───────────────>│                                 │
    │  { roomId, answer: "France" }   │                                 │
    │                                 │                                 │
    │                                 │ Store Answer                    │
    │                                 │ Wait for Player 2...            │
    │                                 │                                 │
    │                                 │<──────[submit-answer]───────────│
    │                                 │  { roomId, answer: "Germany" }  │
    │                                 │                                 │
    │                                 │ Both Answered!                  │
    │                                 │ Check Answers                   │
    │                                 │ Update Scores                   │
    │                                 │                                 │
    │<────[show-result]───────────────│────[show-result]───────────────>│
    │  { correctAnswer: "France",     │  { correctAnswer: "France",     │
    │    results: [                   │    results: [                   │
    │      {P1, correct, "France"},   │      {P1, correct, "France"},   │
    │      {P2, wrong, "Germany"}     │      {P2, wrong, "Germany"}     │
    │    ],                           │    ],                           │
    │    players: [{P1: 1}, {P2: 0}]  │    players: [{P1: 1}, {P2: 0}]  │
    │  }                              │  }                              │
    │                                 │                                 │
    │   (Wait 3 seconds)              │   (Wait 3 seconds)              │
    │                                 │                                 │
    │<────[next-round]────────────────│────[next-round]────────────────>│
    │                                 │                                 │
    │   ... Repeat for 10 rounds ...  │                                 │
    │                                 │                                 │
```

### Game End Flow

```
Player 1                            Server                          Player 2
    │                                 │                                 │
    │   (After Round 10)              │   (After Round 10)              │
    │                                 │                                 │
    │                                 │ Calculate Final Scores          │
    │                                 │ Determine Winner                │
    │                                 │                                 │
    │<────[game-over]─────────────────│────[game-over]─────────────────>│
    │  { winner: "Player 1",          │  { winner: "Player 1",          │
    │    finalScores: [               │    finalScores: [               │
    │      {P1: 7/10},                │      {P1: 7/10},                │
    │      {P2: 5/10}                 │      {P2: 5/10}                 │
    │    ]                            │    ]                            │
    │  }                              │  }                              │
    │                                 │                                 │
```

## Room Data Structure

```javascript
Room {
  roomId: "AB3K7N",
  gameMode: "flag" | "quiz",
  players: [
    {
      socketId: "xyz123",
      name: "Player 1",
      score: 0
    },
    {
      socketId: "abc456",
      name: "Player 2",
      score: 0
    }
  ],
  currentQuestion: {
    // Flag mode
    country: "France",
    flagUrl: "https://flagcdn.com/w320/fr.png",
    code: "fr"
    
    // Quiz mode
    question: "Which country has Paris as capital?",
    correctAnswer: "France",
    options: ["France", "Germany", "Italy", "Spain"]
  },
  answers: Map {
    "xyz123" => "France",
    "abc456" => "Germany"
  },
  currentRound: 1,
  gameStarted: true,
  lastActivity: 1234567890,
  difficulty: "medium" // Quiz only
}
```

## File Locations

### Client Files
- `/client/src/MultiplayerQuizPage.jsx` - Quiz lobby & game container
- `/client/src/MultiplayerQuizGame.jsx` - Quiz game logic & UI
- `/client/src/MultiplayerFlagPage.jsx` - Flag game lobby & container
- `/client/src/MultiplayerFlagGame.jsx` - Flag game logic & UI
- `/client/src/utils/multiplayerSocket.js` - Shared socket connection
- `/client/src/GestureButton.jsx` - Gesture-enabled button component
- `/client/src/EarthThreeJS.jsx` - 3D globe component

### Server Files
- `/server/index.js` - Lines 379-903 (Multiplayer system)
  - Room management
  - Question generation
  - Answer validation
  - Score tracking
  - Event handling

## Socket Events Reference

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join-room` | `{ roomId, playerName, gameMode, difficulty? }` | Create or join a room |
| `leave-room` | `{ roomId }` | Exit current room |
| `submit-answer` | `{ roomId, answer }` | Submit answer for current round |
| `get-room-info` | `{ roomId }` | Request room information |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `player-joined` | `{ players, roomId }` | Another player joined |
| `player-left` | `{ players, playerName, reason }` | Player disconnected |
| `game-started` | `{ totalRounds, gameMode, players }` | Game begins (2 players) |
| `new-question` | `{ question, round }` | New round starts |
| `player-answered` | `{ playerName }` | Someone submitted answer |
| `show-result` | `{ correctAnswer, results, players }` | Round results |
| `next-round` | `{}` | Proceed to next round |
| `game-over` | `{ winner, finalScores }` | Game ended |
| `game-ended` | `{ reason }` | Game terminated early |
| `room-error` | `{ message }` | Room operation failed |
| `answer-error` | `{ message }` | Answer submission failed |

## Configuration

### Environment Variables

**Client** (`/client/.env.development`):
```env
VITE_API_URL=http://localhost:3001
```

**Server** (`/server/.env`):
```env
PORT=3001
NODE_ENV=development
```

### Constants

**Server**:
- `TOTAL_ROUNDS = 10` - Rounds per game
- Room timeout: 10 minutes of inactivity
- Max players: 2 per room

**Client**:
- Room code length: 6 characters
- Auto-reconnection: 10 attempts
- Reconnection delay: 1-5 seconds

## Network Requirements

### Ports Used
- **3001**: Server (Socket.IO + Express API)
- **5173**: Client (Vite dev server)

### Firewall Settings
For local network multiplayer:
- Allow inbound on port 3001 (server)
- Allow inbound on port 5173 (client)

### WebSocket Transports
1. **WebSocket** (preferred) - Real-time bidirectional
2. **Polling** (fallback) - HTTP long-polling if WebSocket fails

## Performance Considerations

### Client-Side
- Single socket connection shared across components (singleton pattern)
- Lazy-loaded multiplayer pages (code splitting)
- React.memo for feature components
- useCallback for event handlers

### Server-Side
- In-memory room storage (Map)
- Automatic stale room cleanup (every 60 seconds)
- Connection tracking to prevent leaks
- Efficient event broadcasting (Socket.IO rooms)

## Security Notes

⚠️ **Current Implementation**
- No authentication (names are self-declared)
- No room passwords
- No rate limiting
- No input validation on names

✅ **For Production, Add**
- Input sanitization
- Room password protection
- Player authentication
- Rate limiting on room creation
- Anti-cheat measures
- Profanity filter on names

## Debugging

### Enable Logs

**Client Console**:
```javascript
// In multiplayerSocket.js, socket connection logs:
console.log('🎮 Multiplayer socket connected:', socket.id)
```

**Server Console**:
```bash
# Look for these logs:
🎮 Created multiplayer room: AB3K7N (flag mode)
👋 Player joined room AB3K7N: Player 1
🎮 Starting game in room AB3K7N with 2 players
```

### Common Issues

**Socket not connecting**:
- Check `VITE_API_URL` matches server port
- Verify server is running
- Check browser console for CORS errors

**Questions not loading**:
- Check internet connection (flag CDN)
- Verify trivia API is accessible
- Check server logs for errors

**Answers not registering**:
- Check room still exists
- Verify both players in same room
- Check socket connection status

---

**Built for real-time multiplayer geography education! 🌍🎮**
