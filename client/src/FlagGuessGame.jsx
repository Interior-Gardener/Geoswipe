import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import GestureButton from "./GestureButton";

const TOTAL_ROUNDS = 10;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FlagGuessGame = ({ selectedCountry, clearSelection, onExit }) => {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [error, setError] = useState(null);
  const [flagLoading, setFlagLoading] = useState(true);
  const loadedFlagsRef = useRef(new Set());

  // Fetch random country for flag
  const fetchRandomCountry = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFlagLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/api/random-flag-country`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCurrentCountry(data);
      setFlagLoading(!loadedFlagsRef.current.has(data.flagUrl));
    } catch (err) {
      console.error("Error fetching country:", err);
      setError(err.message);
      setCurrentCountry(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load first country on mount
  useEffect(() => {
    fetchRandomCountry();
  }, [fetchRandomCountry]);

  // Handle country selection from globe
  useEffect(() => {
    if (!selectedCountry || !currentCountry || answered) return;

    setAnswered(true);
    
    // Compare selected country with target (case-insensitive)
    const correct = selectedCountry.toLowerCase().trim() === currentCountry.name.toLowerCase().trim();
    setIsCorrect(correct);
    
    if (correct) {
      setScore((prev) => prev + 1);
    }
    
    // Auto advance to next round after 2 seconds
    setTimeout(() => {
      nextRound();
    }, 2500);
  }, [selectedCountry, currentCountry, answered]);

  // Go to next round
  const nextRound = useCallback(() => {
    if (currentRound >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }
    
    clearSelection();
    setCurrentRound((prev) => prev + 1);
    setAnswered(false);
    setIsCorrect(null);
    fetchRandomCountry();
  }, [currentRound, clearSelection, fetchRandomCountry]);

  // Skip current round
  const skipRound = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    setIsCorrect(false);
    
    setTimeout(() => {
      nextRound();
    }, 2000);
  }, [answered, nextRound]);

  // Restart game
  const restartGame = useCallback(() => {
    setScore(0);
    setCurrentRound(1);
    setGameOver(false);
    setAnswered(false);
    setIsCorrect(null);
    clearSelection();
    fetchRandomCountry();
  }, [clearSelection, fetchRandomCountry]);

  // Score display calculation
  const scoreDisplay = useMemo(() => {
    const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
    let message = "Keep practicing!";
    let emoji = "📚";
    
    if (percentage >= 90) { message = "Geography Master!"; emoji = "🏆"; }
    else if (percentage >= 70) { message = "Excellent work!"; emoji = "🌟"; }
    else if (percentage >= 50) { message = "Good job!"; emoji = "👍"; }
    else if (percentage >= 30) { message = "Not bad!"; emoji = "📈"; }
    
    return { percentage, message, emoji };
  }, [score]);

  const renderExitButton = () => {
    if (!onExit) {
      return null;
    }

    return (
      <GestureButton
        onClick={onExit}
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
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        padding: "25px", 
        color: "white", 
        textAlign: "center",
        background: "rgba(0, 20, 40, 0.95)",
        borderRadius: "16px",
        border: "2px solid rgba(0, 212, 255, 0.3)",
        backdropFilter: "blur(15px)",
        minWidth: "320px",
        position: 'relative'
      }}>
        {renderExitButton()}
        <div style={{ fontSize: "18px", marginBottom: "15px", fontFamily: "'Orbitron', sans-serif" }}>
          Loading flag...
        </div>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "4px solid #00d4ff", 
          borderTop: "4px solid transparent", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite",
          margin: "0 auto"
        }} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: "25px", 
        color: "white", 
        textAlign: "center",
        background: "rgba(0, 20, 40, 0.95)",
        borderRadius: "16px",
        border: "2px solid rgba(255, 100, 100, 0.3)",
        position: 'relative'
      }}>
        {renderExitButton()}
        <h3 style={{ color: "#ff6b6b", marginBottom: "10px" }}>Error</h3>
        <p>{error}</p>
        <GestureButton 
          onClick={fetchRandomCountry}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #00d4ff, #0080ff)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "'Orbitron', sans-serif",
            marginTop: "15px"
          }}
        >
          Try Again
        </GestureButton>
      </div>
    );
  }

  // Game over state
  if (gameOver) {
    return (
      <div style={{ 
        padding: "30px", 
        color: "white", 
        textAlign: "center",
        background: "rgba(0, 20, 40, 0.95)",
        borderRadius: "16px",
        border: "2px solid rgba(0, 212, 255, 0.4)",
        backdropFilter: "blur(15px)",
        minWidth: "320px",
        position: 'relative'
      }}>
        {renderExitButton()}
        <h2 style={{ 
          fontFamily: "'Orbitron', sans-serif",
          color: "#00d4ff",
          fontSize: "28px",
          marginBottom: "20px",
          textShadow: "0 0 15px rgba(0, 212, 255, 0.6)"
        }}>
          🏁 Game Over!
        </h2>
        
        <div style={{ 
          fontSize: "48px", 
          margin: "20px 0",
          fontWeight: "bold",
          fontFamily: "'Orbitron', sans-serif"
        }}>
          {scoreDisplay.emoji}
        </div>
        
        <div style={{ 
          fontSize: "32px", 
          fontWeight: "bold",
          fontFamily: "'Orbitron', sans-serif",
          color: "#00d4ff",
          marginBottom: "10px"
        }}>
          {score} / {TOTAL_ROUNDS}
        </div>
        
        <div style={{ 
          fontSize: "18px", 
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: "5px"
        }}>
          {scoreDisplay.percentage}%
        </div>
        
        <div style={{ 
          fontSize: "20px", 
          color: "#00ff88",
          fontFamily: "'Orbitron', sans-serif",
          marginBottom: "25px"
        }}>
          {scoreDisplay.message}
        </div>
        
        <GestureButton
          onClick={restartGame}
          style={{
            padding: "14px 32px",
            background: "linear-gradient(135deg, #00d4ff, #0080ff)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            fontFamily: "'Orbitron', sans-serif",
            boxShadow: "0 4px 20px rgba(0, 212, 255, 0.4)",
            transition: "all 0.3s ease"
          }}
        >
          🔄 Play Again
        </GestureButton>
      </div>
    );
  }

  // No country data
  if (!currentCountry) {
    return (
      <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
        <p>No country data available.</p>
        <GestureButton onClick={fetchRandomCountry} style={{
          padding: "10px 20px",
          background: "#00d4ff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Retry
        </GestureButton>
      </div>
    );
  }

  // Main game UI
  return (
    <div style={{
      padding: "25px",
      background: "rgba(0, 20, 40, 0.95)",
      borderRadius: "16px",
      border: "2px solid rgba(0, 212, 255, 0.3)",
      backdropFilter: "blur(15px)",
      color: "white",
      minWidth: "320px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      position: 'relative'
    }}>
      {renderExitButton()}
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "15px",
        borderBottom: "1px solid rgba(0, 212, 255, 0.2)"
      }}>
        <div style={{ 
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "14px",
          color: "rgba(255, 255, 255, 0.7)"
        }}>
          Round {currentRound} / {TOTAL_ROUNDS}
        </div>
        <div style={{ 
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#00d4ff"
        }}>
          Score: {score}
        </div>
      </div>

      {/* Title */}
      <h2 style={{ 
        fontFamily: "'Orbitron', sans-serif",
        color: "#00d4ff",
        fontSize: "22px",
        marginBottom: "20px",
        textAlign: "center",
        textShadow: "0 0 10px rgba(0, 212, 255, 0.4)"
      }}>
        🏳️ Guess the Country
      </h2>

      {/* Flag Image */}
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
          src={currentCountry.flagUrl}
          alt="Country Flag"
          loading="eager"
          decoding="async"
          onLoad={() => {
            loadedFlagsRef.current.add(currentCountry.flagUrl);
            setFlagLoading(false);
          }}
          onError={(e) => {
            e.target.src = `https://flagcdn.com/w320/${currentCountry.code}.png`;
            loadedFlagsRef.current.add(e.target.src);
            setFlagLoading(false);
          }}
          style={{
            maxWidth: "280px",
            maxHeight: "160px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.2)",
            border: "3px solid rgba(255, 255, 255, 0.2)",
            opacity: flagLoading ? 0 : 1,
            transition: "opacity 0.3s ease"
          }}
        />
      </div>

      {/* Instruction */}
      {!answered && (
        <p style={{ 
          textAlign: "center", 
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px",
          fontFamily: "'Orbitron', sans-serif",
          marginBottom: "20px"
        }}>
          🌍 Click the country on the globe!
        </p>
      )}

      {/* Feedback */}
      {answered && (
        <div style={{
          textAlign: "center",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "15px",
          background: isCorrect 
            ? "rgba(0, 255, 100, 0.15)" 
            : "rgba(255, 80, 80, 0.15)",
          border: `2px solid ${isCorrect ? "rgba(0, 255, 100, 0.4)" : "rgba(255, 80, 80, 0.4)"}`,
        }}>
          <div style={{ 
            fontSize: "28px", 
            marginBottom: "8px" 
          }}>
            {isCorrect ? "✅" : "❌"}
          </div>
          <div style={{ 
            fontSize: "18px",
            fontWeight: "bold",
            fontFamily: "'Orbitron', sans-serif",
            color: isCorrect ? "#00ff64" : "#ff6464"
          }}>
            {isCorrect ? "Correct!" : "Wrong!"}
          </div>
          {!isCorrect && (
            <div style={{ 
              marginTop: "10px",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.9)"
            }}>
              The answer was: <strong style={{ color: "#00d4ff" }}>{currentCountry.name}</strong>
            </div>
          )}
          <div style={{ 
            marginTop: "10px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.6)"
          }}>
            Next round in 2 seconds...
          </div>
        </div>
      )}

      {/* Skip Button */}
      {!answered && (
        <div style={{ textAlign: "center" }}>
          <GestureButton
            onClick={skipRound}
            style={{
              padding: "10px 24px",
              background: "rgba(100, 100, 100, 0.3)",
              color: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "'Orbitron', sans-serif",
              transition: "all 0.3s ease"
            }}
          >
            Skip →
          </GestureButton>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{
        marginTop: "20px",
        height: "6px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "3px",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${(currentRound / TOTAL_ROUNDS) * 100}%`,
          background: "linear-gradient(90deg, #00d4ff, #00ff88)",
          borderRadius: "3px",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
};

export default FlagGuessGame;
