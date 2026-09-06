/**
 * MultiplayerQuizPage.jsx
 * Page component for multiplayer geography quiz game
 * Includes room management UI + globe + game component
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import MultiplayerQuizGame from "./MultiplayerQuizGame";
import GestureButton from "./GestureButton";
import { usePanelFullscreen } from "./hooks/usePanelFullscreen";
import { 
  joinRoom, 
  leaveRoom, 
  generateRoomId, 
  getMultiplayerSocket,
  onConnectionChange 
} from "./utils/multiplayerSocket";

const MultiplayerQuizPage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const gamePanelRef = useRef(null);
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(gamePanelRef);
  
  // Room state
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [inputPlayerName, setInputPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [inRoom, setInRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Check connection status
  useEffect(() => {
    const socket = getMultiplayerSocket();
    setIsConnected(socket.connected);
    
    const cleanup = onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return cleanup;
  }, []);

  // Create a new room
  const handleCreateRoom = useCallback(() => {
    if (!inputPlayerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setPlayerName(inputPlayerName.trim());
    setInRoom(true);
    setError(null);
    
    joinRoom(newRoomId, inputPlayerName.trim(), 'quiz', difficulty);
  }, [inputPlayerName, difficulty]);

  // Join existing room
  const handleJoinRoom = useCallback(() => {
    if (!inputPlayerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!inputRoomId.trim()) {
      setError('Please enter room code');
      return;
    }

    const normalizedRoomId = inputRoomId.trim().toUpperCase();
    setRoomId(normalizedRoomId);
    setPlayerName(inputPlayerName.trim());
    setInRoom(true);
    setError(null);
    
    joinRoom(normalizedRoomId, inputPlayerName.trim(), 'quiz', difficulty);
  }, [inputPlayerName, inputRoomId, difficulty]);

  const handleExitToPrevious = useCallback(() => {
    if (roomId) {
      leaveRoom(roomId);
    }
    navigate(-1);
  }, [navigate, roomId]);

  // Room lobby UI (before joining a room)
  if (!inRoom) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000510 0%, #001030 50%, #000510 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(0, 20, 40, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          backdropFilter: 'blur(15px)',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            color: '#00d4ff',
            fontSize: '28px',
            textAlign: 'center',
            marginBottom: '10px',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
          }}>
            🎯 Multiplayer Quiz
          </h1>

          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '14px'
          }}>
            Test your geography knowledge against a friend!
          </p>

          {/* Connection status */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '8px',
            borderRadius: '8px',
            background: isConnected ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 100, 100, 0.1)',
            border: `1px solid ${isConnected ? 'rgba(0, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)'}`
          }}>
            <span style={{ color: isConnected ? '#00ff64' : '#ff6464', fontSize: '12px' }}>
              {isConnected ? '🟢 Connected to server' : '🔴 Connecting...'}
            </span>
          </div>

          {/* Player name input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Your Name
            </label>
            <input
              type="text"
              value={inputPlayerName}
              onChange={(e) => setInputPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontSize: '16px',
                fontFamily: "'Orbitron', sans-serif",
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Difficulty selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Difficulty
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: difficulty === level 
                      ? '2px solid #00d4ff' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    background: difficulty === level 
                      ? 'rgba(0, 212, 255, 0.2)' 
                      : 'rgba(0, 0, 0, 0.2)',
                    color: difficulty === level ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontFamily: "'Orbitron', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {level === 'easy' && '🟢'} 
                  {level === 'medium' && '🟡'} 
                  {level === 'hard' && '🔴'} 
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Create new room */}
          <GestureButton
            onClick={handleCreateRoom}
            disabled={!isConnected}
            style={{
              width: '100%',
              padding: '16px',
              background: isConnected 
                ? 'linear-gradient(135deg, #00d4ff, #0080ff)' 
                : 'rgba(100, 100, 100, 0.3)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: "'Orbitron', sans-serif",
              cursor: isConnected ? 'pointer' : 'not-allowed',
              marginBottom: '20px',
              boxShadow: isConnected ? '0 4px 20px rgba(0, 212, 255, 0.3)' : 'none'
            }}
          >
            🎮 Create New Room
          </GestureButton>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0',
            color: 'rgba(255, 255, 255, 0.4)'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
            <span style={{ padding: '0 15px', fontSize: '12px' }}>OR JOIN EXISTING</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
          </div>

          {/* Join existing room */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Room Code
            </label>
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontSize: '18px',
                fontFamily: "'Orbitron', sans-serif",
                textAlign: 'center',
                letterSpacing: '4px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <GestureButton
            onClick={handleJoinRoom}
            disabled={!isConnected}
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              border: '2px solid rgba(0, 212, 255, 0.4)',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: "'Orbitron', sans-serif",
              cursor: isConnected ? 'pointer' : 'not-allowed',
              marginBottom: '20px'
            }}
          >
            Join Room
          </GestureButton>

          {/* Error display */}
          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(255, 80, 80, 0.2)',
              border: '1px solid rgba(255, 80, 80, 0.4)',
              borderRadius: '8px',
              color: '#ff6b6b',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}

          {/* Back button */}
          <GestureButton
            onClick={() => navigate(-1)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Back to Menu
          </GestureButton>
        </div>
      </div>
    );
  }

  // In-game view with globe
  return (
    <div style={{ display: "flex" }}>
      {/* 3D Globe */}
      <EarthThreeJS 
        setSelectedCountry={setSelectedCountry} 
        hideInstructions={true} 
        hideControls={true} 
      />

      {/* Multiplayer Quiz Game Overlay */}
      <div
        ref={gamePanelRef}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: isExpanded ? "min(760px, 96vw)" : "auto",
          zIndex: 1000,
        }}
      >
        <MultiplayerQuizGame 
          roomId={roomId}
          playerName={playerName}
          selectedCountry={selectedCountry} 
          clearSelection={() => setSelectedCountry(null)}
          onLeaveGame={handleExitToPrevious}
        />
      </div>

      {/* Gesture Instructions */}
      <div
        style={{
          position: "absolute",
          bottom: "130px",
          right: "20px",
          zIndex: 1000,
          background: "rgba(0, 20, 40, 0.9)",
          padding: "12px 16px",
          borderRadius: "8px",
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: "12px",
          fontFamily: "'Orbitron', sans-serif",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          backdropFilter: "blur(10px)",
          maxWidth: "250px",
        }}
      >
        <div style={{ fontWeight: "bold", color: "#00d4ff", marginBottom: "8px" }}>
          🎮 How to Play
        </div>
        <div style={{ lineHeight: "1.5" }}>
          1️⃣ Read the question<br/>
          2️⃣ Find the answer country<br/>
          3️⃣ Click on the globe<br/>
          <br/>
          <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "11px" }}>
            ✋ Open palm: Move cursor<br/>
            👌 OK sign: Click
          </span>
        </div>
      </div>

      {/* Back Button */}
      <GestureButton
        onClick={togglePanelFullscreen}
        style={{
          position: "absolute",
          bottom: "70px",
          left: "260px",
          zIndex: 1000,
          background: "linear-gradient(135deg, rgba(80, 120, 220, 0.9), rgba(60, 90, 190, 0.9))",
          color: "#f0f7ff",
          border: "2px solid rgba(190, 220, 255, 0.55)",
          padding: "18px 20px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          fontFamily: "'Orbitron', sans-serif",
          cursor: "pointer",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>{isExpanded ? "🡼" : "⛶"}</span>
        {isExpanded ? "Exit Fullscreen" : "Fullscreen"}
      </GestureButton>

      <GestureButton
        onClick={handleExitToPrevious}
        style={{
          position: "absolute",
          bottom: "70px",
          left: "90px",
          zIndex: 1000,
          background: "linear-gradient(135deg, rgba(0, 40, 80, 0.9), rgba(0, 20, 40, 0.9))",
          color: "#00d4ff",
          border: "2px solid rgba(0, 212, 255, 0.4)",
          padding: "18px 26px",
          borderRadius: "12px",
          fontSize: "20px",
          fontWeight: "bold",
          fontFamily: "'Orbitron', sans-serif",
          cursor: "pointer",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "18px" }}>⬅️</span>
        Leave
      </GestureButton>
    </div>
  );
};

export default MultiplayerQuizPage;
