/**
 * MultiplayerFlagGame.jsx
 * Multiplayer flag guessing game component
 * Receives questions from server, submits answers via socket
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import GestureButton from "./GestureButton";
import { submitAnswer, subscribeToEvents } from "./utils/multiplayerSocket";

const MultiplayerFlagGame = ({ 
  roomId, 
  playerName, 
  selectedCountry, 
  clearSelection,
  onLeaveGame 
}) => {
  // Game state
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, result, gameover
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [flagLoading, setFlagLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedFlagsRef = useRef(new Set());

  // Get current player's score
  const myScore = players.find(p => p.name === playerName)?.score || 0;
  const opponentScore = players.find(p => p.name !== playerName)?.score || 0;
  const opponentName = players.find(p => p.name !== playerName)?.name || 'Opponent';

  const renderLeaveButton = () => (
    <GestureButton
      onClick={onLeaveGame}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.14)',
        color: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: "'Orbitron', sans-serif",
        cursor: 'pointer'
      }}
    >
      Exit
    </GestureButton>
  );

  // Subscribe to multiplayer events
  useEffect(() => {
    const cleanup = subscribeToEvents({
      'player-joined': (data) => {
        setPlayers(data.players);
      },
      'player-left': (data) => {
        setPlayers(data.players);
        if (data.reason === 'disconnected') {
          setError('Opponent disconnected');
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
        setWaitingForOpponent(false);
        const nextFlagUrl = data?.question?.flagUrl;
        setFlagLoading(nextFlagUrl ? !loadedFlagsRef.current.has(nextFlagUrl) : true);
        setGameState('playing');
        clearSelection();
      },
      'player-answered': (data) => {
        if (data.playerName !== playerName) {
          // Opponent has answered
          setWaitingForOpponent(false);
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
      'game-ended': (data) => {
        setError(data.reason);
        setGameState('waiting');
      },
      'room-error': (data) => {
        setError(data.message);
      },
      'answer-error': (data) => {
        console.warn('Answer error:', data.message);
      }
    });

    return cleanup;
  }, [playerName, clearSelection]);

  // Handle country selection from globe
  useEffect(() => {
    if (!selectedCountry || !currentQuestion || answered || gameState !== 'playing') return;

    setAnswered(true);
    setWaitingForOpponent(true);
    submitAnswer(roomId, selectedCountry);
  }, [selectedCountry, currentQuestion, answered, gameState, roomId]);

  // Get result for a specific player
  const getPlayerResult = useCallback((name) => {
    return results?.results?.find(r => r.name === name);
  }, [results]);

  // Waiting for opponent to join
  if (gameState === 'waiting' && players.length < 2) {
    return (
      <div style={containerStyle}>
        {renderLeaveButton()}
        <h2 style={titleStyle}>🏳️ Multiplayer Flag Game</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
            Room Code:
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#00d4ff',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '4px',
            padding: '10px 20px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '8px',
            border: '2px solid rgba(0, 212, 255, 0.3)'
          }}>
            {roomId}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #00d4ff", 
            borderTop: "4px solid transparent", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "20px auto"
          }} />
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Waiting for opponent to join...
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
            Share the room code with your friend!
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#00ff88', marginBottom: '5px' }}>
            ✓ You: {playerName}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            ○ Waiting for Player 2...
          </div>
        </div>

        {error && (
          <div style={errorStyle}>{error}</div>
        )}

        <GestureButton onClick={onLeaveGame} style={backButtonStyle}>
          ← Leave Room
        </GestureButton>
      </div>
    );
  }

  // Game Over screen
  if (gameState === 'gameover' && finalResults) {
    const isWinner = finalResults.winner === playerName;
    const isTie = finalResults.winner === 'tie';
    
    return (
      <div style={containerStyle}>
        {renderLeaveButton()}
        <h2 style={{ ...titleStyle, fontSize: '28px' }}>
          {isTie ? '🤝 It\'s a Tie!' : isWinner ? '🏆 You Win!' : '😔 You Lose'}
        </h2>

        <div style={{ 
          fontSize: '48px', 
          textAlign: 'center',
          margin: '20px 0'
        }}>
          {isTie ? '🤝' : isWinner ? '🎉' : '💪'}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {finalResults.finalScores.map((player, idx) => (
            <div key={idx} style={{
              padding: '12px 20px',
              margin: '8px 0',
              background: player.name === playerName 
                ? 'rgba(0, 212, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: player.name === finalResults.winner 
                ? '2px solid #00ff88' 
                : '1px solid rgba(255,255,255,0.2)'
            }}>
              <span style={{ fontWeight: player.name === playerName ? 'bold' : 'normal' }}>
                {player.name === playerName ? '👤 ' : ''}{player.name}
                {player.name === finalResults.winner && ' 👑'}
              </span>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: '#00d4ff'
              }}>
                {player.score} / {totalRounds}
              </span>
            </div>
          ))}
        </div>

        <GestureButton onClick={onLeaveGame} style={primaryButtonStyle}>
          🔄 Play Again
        </GestureButton>
      </div>
    );
  }

  // Result screen (between rounds)
  if (gameState === 'result' && results) {
    const myResult = getPlayerResult(playerName);
    const oppResult = getPlayerResult(opponentName);

    return (
      <div style={containerStyle}>
        {renderLeaveButton()}
        <div style={headerStyle}>
          <span>Round {currentRound} / {totalRounds}</span>
          <span style={{ color: '#00d4ff' }}>{myScore} - {opponentScore}</span>
        </div>

        <h3 style={{ textAlign: 'center', color: '#00d4ff', marginBottom: '15px' }}>
          Round Results
        </h3>

        <div style={{ 
          textAlign: 'center', 
          marginBottom: '15px',
          padding: '10px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Correct Answer:</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff88' }}>
            {results.correctAnswer}
          </div>
        </div>

        {/* Player results */}
        <div style={{ marginBottom: '15px' }}>
          {/* My result */}
          <div style={{
            padding: '10px',
            marginBottom: '8px',
            background: myResult?.isCorrect ? 'rgba(0, 255, 100, 0.15)' : 'rgba(255, 80, 80, 0.15)',
            borderRadius: '8px',
            border: `1px solid ${myResult?.isCorrect ? 'rgba(0, 255, 100, 0.4)' : 'rgba(255, 80, 80, 0.4)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>👤 You</span>
              <span>{myResult?.isCorrect ? '✅' : '❌'} {myResult?.answer || 'No answer'}</span>
            </div>
          </div>

          {/* Opponent result */}
          <div style={{
            padding: '10px',
            background: oppResult?.isCorrect ? 'rgba(0, 255, 100, 0.15)' : 'rgba(255, 80, 80, 0.15)',
            borderRadius: '8px',
            border: `1px solid ${oppResult?.isCorrect ? 'rgba(0, 255, 100, 0.4)' : 'rgba(255, 80, 80, 0.4)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>👥 {opponentName}</span>
              <span>{oppResult?.isCorrect ? '✅' : '❌'} {oppResult?.answer || 'No answer'}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          Next round starting...
        </div>
      </div>
    );
  }

  // Main game UI
  return (
    <div style={containerStyle}>
      {renderLeaveButton()}
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Round </span>
          <span>{currentRound} / {totalRounds}</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <span style={{ color: '#00d4ff' }}>You: </span>
            <span style={{ fontWeight: 'bold' }}>{myScore}</span>
          </div>
          <div>
            <span style={{ color: '#ff6b6b' }}>{opponentName}: </span>
            <span style={{ fontWeight: 'bold' }}>{opponentScore}</span>
          </div>
        </div>
      </div>

      <h2 style={titleStyle}>🏳️ Guess the Country</h2>

      {/* Flag Image */}
      {currentQuestion && (
        <div style={{ 
          position: "relative",
          textAlign: "center", 
          marginBottom: "20px",
          minHeight: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {flagLoading && (
            <div style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{ 
                width: "30px", 
                height: "30px", 
                border: "3px solid #00d4ff", 
                borderTop: "3px solid transparent", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite"
              }} />
            </div>
          )}
          <img 
            src={currentQuestion.flagUrl}
            alt="Country Flag"
            loading="eager"
            decoding="async"
            onLoad={() => {
              loadedFlagsRef.current.add(currentQuestion.flagUrl);
              setFlagLoading(false);
            }}
            onError={(e) => {
              e.target.src = `https://flagcdn.com/w320/${currentQuestion.code}.png`;
              loadedFlagsRef.current.add(e.target.src);
              setFlagLoading(false);
            }}
            style={{
              maxWidth: "280px",
              maxHeight: "160px",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              border: "3px solid rgba(255, 255, 255, 0.2)",
              opacity: flagLoading ? 0 : 1,
              transition: "opacity 0.3s ease"
            }}
          />
        </div>
      )}

      {/* Status */}
      {!answered && (
        <p style={{ 
          textAlign: "center", 
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px",
          marginBottom: "15px"
        }}>
          🌍 Click the country on the globe!
        </p>
      )}

      {answered && waitingForOpponent && (
        <div style={{
          textAlign: 'center',
          padding: '15px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <div style={{ marginBottom: '10px' }}>✅ Answer submitted!</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            Waiting for {opponentName}...
          </div>
        </div>
      )}

      {error && (
        <div style={errorStyle}>{error}</div>
      )}

      {/* Progress Bar */}
      <div style={{
        marginTop: "15px",
        height: "6px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "3px",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${(currentRound / totalRounds) * 100}%`,
          background: "linear-gradient(90deg, #00d4ff, #00ff88)",
          borderRadius: "3px",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  padding: "25px",
  background: "rgba(0, 20, 40, 0.95)",
  borderRadius: "16px",
  border: "2px solid rgba(0, 212, 255, 0.3)",
  backdropFilter: "blur(15px)",
  color: "white",
  minWidth: "320px",
  maxWidth: "380px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  position: 'relative'
};

const titleStyle = {
  fontFamily: "'Orbitron', sans-serif",
  color: "#00d4ff",
  fontSize: "20px",
  marginBottom: "15px",
  textAlign: "center",
  textShadow: "0 0 10px rgba(0, 212, 255, 0.4)"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  paddingBottom: "10px",
  borderBottom: "1px solid rgba(0, 212, 255, 0.2)",
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "14px"
};

const errorStyle = {
  padding: '10px',
  background: 'rgba(255, 80, 80, 0.2)',
  border: '1px solid rgba(255, 80, 80, 0.4)',
  borderRadius: '8px',
  color: '#ff6b6b',
  textAlign: 'center',
  marginBottom: '15px'
};

const primaryButtonStyle = {
  width: '100%',
  padding: "14px 24px",
  background: "linear-gradient(135deg, #00d4ff, #0080ff)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  fontFamily: "'Orbitron', sans-serif",
  marginTop: "15px"
};

const backButtonStyle = {
  width: '100%',
  padding: "12px 20px",
  background: "rgba(100, 100, 100, 0.3)",
  color: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "'Orbitron', sans-serif",
  marginTop: "15px"
};

export default MultiplayerFlagGame;
