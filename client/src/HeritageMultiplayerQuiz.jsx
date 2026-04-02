/**
 * HeritageMultiplayerQuiz.jsx
 * Multiplayer Heritage Quiz - room lobby + game component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GestureButton from './GestureButton';
import {
  joinRoom,
  leaveRoom,
  generateRoomId,
  getMultiplayerSocket,
  onConnectionChange,
  submitAnswer,
  subscribeToEvents
} from './utils/multiplayerSocket';

const HeritageMultiplayerQuiz = ({ monumentName: propMonumentName, mode: propMode }) => {
  const navigate = useNavigate();
  const { name: paramMonumentName } = useParams();
  
  // Determine monument name and mode from props or URL params
  const monumentName = propMonumentName || paramMonumentName;
  const mode = propMode || (monumentName ? 'monument' : 'all-india');

  // Room state
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [inputPlayerName, setInputPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [inRoom, setInRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Game state
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, result, gameover
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // Get current player's info
  const myScore = players.find((p) => p.name === playerName)?.score || 0;
  const myPlayer = players.find((p) => p.name === playerName);
  const opponents = players.filter((p) => p.name !== playerName);

  // Check connection status
  useEffect(() => {
    const socket = getMultiplayerSocket();
    setIsConnected(socket.connected);

    const cleanup = onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return cleanup;
  }, []);

  // Subscribe to multiplayer events
  useEffect(() => {
    const cleanup = subscribeToEvents({
      'player-joined': (data) => {
        setPlayers(data.players);
        setError(null);
      },
      'player-left': (data) => {
        setPlayers(data.players);
        if (data.players.length === 0) {
          setError('All players left the room');
        }
      },
      'game-started': (data) => {
        setGameState('playing');
        setTotalRounds(data.totalRounds);
        setPlayers(data.players);
        setError(null);
      },
      'new-question': (data) => {
        setCurrentQuestion(data.question);
        setCurrentRound(data.round);
        setAnswered(false);
        setSelectedOption(null);
        setWaitingForOpponent(false);
        setGameState('playing');
      },
      'player-answered': (data) => {
        // Someone answered, show waiting indicator
        if (data.playerName !== playerName) {
          // Opponent answered
        }
      },
      'show-result': (data) => {
        setResults(data);
        setPlayers(data.players);
        setGameState('result');
      },
      'next-round': () => {
        setResults(null);
        setGameState('playing');
      },
      'game-over': (data) => {
        setFinalResults(data);
        setGameState('gameover');
      },
      'room-error': (data) => {
        setError(data.message);
      },
      'answer-error': (data) => {
        console.warn('Answer error:', data.message);
      }
    });

    return cleanup;
  }, [playerName]);

  // Create a new room
  const handleCreateRoom = useCallback(() => {
    if (!inputPlayerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const newRoomId = generateRoomId();
    const gameMode = mode === 'monument' ? 'heritage-monument' : 'heritage-quiz';
    setRoomId(newRoomId);
    setPlayerName(inputPlayerName.trim());
    setInRoom(true);
    setError(null);

    joinRoom(newRoomId, inputPlayerName.trim(), gameMode, difficulty, monumentName);
  }, [inputPlayerName, difficulty, mode, monumentName]);

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
    const gameMode = mode === 'monument' ? 'heritage-monument' : 'heritage-quiz';
    setRoomId(normalizedRoomId);
    setPlayerName(inputPlayerName.trim());
    setInRoom(true);
    setError(null);

    joinRoom(normalizedRoomId, inputPlayerName.trim(), gameMode, difficulty, monumentName);
  }, [inputPlayerName, inputRoomId, difficulty, mode, monumentName]);

  // Leave room
  const handleLeaveRoom = useCallback(() => {
    if (roomId) {
      leaveRoom(roomId);
    }
    setInRoom(false);
    setRoomId('');
    setGameState('waiting');
    setPlayers([]);
  }, [roomId]);

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (answered || gameState !== 'playing') return;

    setSelectedOption(optionIndex);
    setAnswered(true);
    setWaitingForOpponent(true);

    submitAnswer(roomId, optionIndex);
  };

  // Room lobby UI (before joining a room)
  if (!inRoom) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000510 0%, #001030 50%, #000510 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <button
          onClick={() => navigate('/heritage')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ← Back to Heritage
        </button>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '50px 40px',
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(15px)'
          }}
        >
          <h1
            style={{
              color: '#ffd700',
              textAlign: 'center',
              marginBottom: '10px',
              fontSize: '36px',
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
            }}
          >
            🏛️ Heritage Quiz
          </h1>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              marginBottom: '35px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {mode === 'monument' ? `Multiplayer • ${monumentName}` : 'Multiplayer • All India'}
          </p>

          {!isConnected && (
            <div
              style={{
                background: 'rgba(255, 68, 68, 0.2)',
                border: '1px solid rgba(255, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'center',
                color: '#ff4444'
              }}
            >
              ⚠️ Connecting to server...
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(255, 68, 68, 0.2)',
                border: '1px solid rgba(255, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'center',
                color: '#ff4444'
              }}
            >
              {error}
            </div>
          )}

          {/* Player Name Input */}
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                color: '#fff',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
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
                padding: '14px',
                fontSize: '16px',
                borderRadius: '10px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 215, 0, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            />
          </div>

          {/* Difficulty Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                color: '#fff',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Difficulty
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${
                      difficulty === diff ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)'
                    }`,
                    background:
                      difficulty === diff ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    color: difficulty === diff ? '#ffd700' : '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Create Room */}
          <GestureButton
            onClick={handleCreateRoom}
            disabled={!isConnected || !inputPlayerName.trim()}
            style={{
              width: '100%',
              padding: '16px',
              marginBottom: '20px',
              background:
                'linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 128, 64, 0.4))',
              color: '#00ff80',
              border: '2px solid rgba(0, 255, 128, 0.5)',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              opacity: !isConnected || !inputPlayerName.trim() ? 0.5 : 1
            }}
          >
            🎮 Create New Room
          </GestureButton>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '25px 0',
              color: 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
            <span style={{ padding: '0 15px', fontSize: '14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
          </div>

          {/* Join Room */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: '#fff',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Room Code
            </label>
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={6}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '18px',
                borderRadius: '10px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: '3px',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 215, 0, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            />
          </div>

          <GestureButton
            onClick={handleJoinRoom}
            disabled={!isConnected || !inputPlayerName.trim() || !inputRoomId.trim()}
            style={{
              width: '100%',
              padding: '16px',
              background:
                'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 144, 255, 0.4))',
              color: '#87ceeb',
              border: '2px solid rgba(65, 105, 225, 0.5)',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              opacity: !isConnected || !inputPlayerName.trim() || !inputRoomId.trim() ? 0.5 : 1
            }}
          >
            🚪 Join Room
          </GestureButton>
        </div>
      </div>
    );
  }

  // Waiting for players
  if (gameState === 'waiting') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000510 0%, #001030 50%, #000510 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '50px 40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              color: '#ffd700',
              marginBottom: '20px',
              fontSize: '32px',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            Waiting for Players...
          </h2>

          <div
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffd700',
                letterSpacing: '8px',
                marginBottom: '10px'
              }}
            >
              {roomId}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Share this code with your friend
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <div
              style={{
                color: '#fff',
                fontSize: '16px',
                marginBottom: '15px',
                fontWeight: 'bold'
              }}
            >
              Players in Room: {players.length}/2
            </div>
            {players.map((player, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 255, 128, 0.1)',
                  border: '1px solid rgba(0, 255, 128, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '8px 0',
                  color: '#00ff80',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {player.name} {player.name === playerName ? '(You)' : ''}
              </div>
            ))}
          </div>

          {players.length < 2 && (
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                marginBottom: '25px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              Waiting for another player to join...
            </div>
          )}

          <button
            onClick={handleLeaveRoom}
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 68, 68, 0.2)',
              color: '#ff4444',
              border: '2px solid rgba(255, 68, 68, 0.4)',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 68, 68, 0.2)';
            }}
          >
            Leave Room
          </button>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Playing - Question screen
  if (gameState === 'playing' && currentQuestion) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000510 0%, #001030 50%, #000510 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '800px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}
          >
            <div>
              <div style={{ color: '#ffd700', fontSize: '14px', fontWeight: 'bold' }}>
                Round {currentRound} / {totalRounds}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginTop: '3px' }}>
                {difficulty.toUpperCase()}
              </div>
            </div>

            {/* Scores */}
            <div style={{ display: 'flex', gap: '20px' }}>
              {players.map((player, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: 'center',
                    opacity: player.name === playerName ? 1 : 0.7
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '4px'
                    }}
                  >
                    {player.name === playerName ? 'You' : player.name}
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: player.name === playerName ? '#00ff80' : '#87ceeb'
                    }}
                  >
                    {player.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monument name for All-India quiz */}
          {mode === 'all-india' && currentQuestion.site && (
            <div
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                padding: '10px 15px',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>Monument: </span>
              <span style={{ color: '#ffd700', fontSize: '16px', fontWeight: 'bold' }}>
                {currentQuestion.site}
              </span>
            </div>
          )}

          {/* Question */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <h3
              style={{
                color: '#fff',
                fontSize: '22px',
                margin: 0,
                textAlign: 'center',
                lineHeight: '1.4'
              }}
            >
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;

              return (
                <GestureButton
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={answered}
                  style={{
                    padding: '20px',
                    background: isSelected
                      ? 'rgba(255, 215, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#ffd700' : '#fff',
                    border: `2px solid ${
                      isSelected ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)'
                    }`,
                    borderRadius: '10px',
                    fontSize: '16px',
                    textAlign: 'left',
                    cursor: answered ? 'default' : 'pointer',
                    opacity: answered ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', opacity: 0.7 }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </GestureButton>
              );
            })}
          </div>

          {/* Waiting indicator */}
          {waitingForOpponent && (
            <div
              style={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              Waiting for other players...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show result
  if (gameState === 'result' && results) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000510 0%, #001030 50%, #000510 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '50px 40px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              color: '#ffd700',
              marginBottom: '30px',
              fontSize: '32px',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            Round {currentRound} Results
          </h2>

          {/* Correct Answer */}
          <div
            style={{
              background: 'rgba(0, 255, 128, 0.1)',
              border: '2px solid rgba(0, 255, 128, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Correct Answer:
            </div>
            <div style={{ color: '#00ff80', fontSize: '20px', fontWeight: 'bold' }}>
              {results.correctAnswer}
            </div>
          </div>

          {/* Players Results */}
          <div style={{ marginBottom: '30px' }}>
            {results.results.map((result, idx) => {
              const isMe = result.name === playerName;
              return (
                <div
                  key={idx}
                  style={{
                    background: result.isCorrect
                      ? 'rgba(0, 255, 128, 0.1)'
                      : 'rgba(255, 68, 68, 0.1)',
                    border: `2px solid ${
                      result.isCorrect ? 'rgba(0, 255, 128, 0.3)' : 'rgba(255, 68, 68, 0.3)'
                    }`,
                    borderRadius: '10px',
                    padding: '15px 20px',
                    margin: '12px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div
                      style={{
                        fontSize: '24px',
                        color: result.isCorrect ? '#00ff80' : '#ff4444'
                      }}
                    >
                      {result.isCorrect ? '✓' : '✗'}
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#fff',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '3px'
                        }}
                      >
                        {result.name} {isMe ? '(You)' : ''}
                      </div>
                      <div
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '14px'
                        }}
                      >
                        Answer: {result.answer}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#ffd700'
                    }}
                  >
                    {result.score}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            Next round starting soon...
          </div>
        </div>
      </div>
    );
  }

  // Game Over
  if (gameState === 'gameover' && finalResults) {
    const winner = finalResults.winner;
    const isWinner = winner === playerName;
    const isTie = winner === 'tie';

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000510 0%, #001030 50%, #000510 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '60px 40px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {isTie ? '🤝' : isWinner ? '🏆' : '👏'}
          </div>

          <h2
            style={{
              color: '#ffd700',
              marginBottom: '15px',
              fontSize: '40px',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            {isTie ? "It's a Tie!" : isWinner ? 'You Win!' : `${winner} Wins!`}
          </h2>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '18px',
              marginBottom: '35px'
            }}
          >
            {isTie ? 'Great game! Both played well!' : isWinner ? 'Congratulations!' : 'Good game!'}
          </p>

          {/* Final Scores */}
          <div style={{ marginBottom: '35px' }}>
            <h3
              style={{
                color: '#87ceeb',
                fontSize: '18px',
                marginBottom: '20px'
              }}
            >
              Final Scores
            </h3>
            {finalResults.finalScores
              .sort((a, b) => b.score - a.score)
              .map((player, idx) => (
                <div
                  key={idx}
                  style={{
                    background:
                      player.name === winner && !isTie
                        ? 'rgba(255, 215, 0, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${
                      player.name === winner && !isTie
                        ? 'rgba(255, 215, 0, 0.5)'
                        : 'rgba(255, 255, 255, 0.2)'
                    }`,
                    borderRadius: '10px',
                    padding: '18px 25px',
                    margin: '12px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '28px'
                      }}
                    >
                      {idx === 0 && !isTie ? '🥇' : '🥈'}
                    </div>
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}
                    >
                      {player.name} {player.name === playerName ? '(You)' : ''}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#ffd700'
                    }}
                  >
                    {player.score}
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={handleLeaveRoom}
            style={{
              padding: '18px 40px',
              background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 144, 255, 0.4))',
              color: '#87ceeb',
              border: '2px solid rgba(65, 105, 225, 0.5)',
              borderRadius: '12px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                'linear-gradient(135deg, rgba(65, 105, 225, 0.4), rgba(30, 144, 255, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 144, 255, 0.4))';
            }}
          >
            Back to Heritage Mode
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default HeritageMultiplayerQuiz;
