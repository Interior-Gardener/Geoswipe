import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GestureButton from './GestureButton';

const TOTAL_QUESTIONS = 10;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HeritageQuiz = ({ monumentName: propMonumentName, onClose, initialMode }) => {
  const { name: paramMonumentName } = useParams();
  const navigate = useNavigate();
  const monumentName = propMonumentName || paramMonumentName;

  // Main state
  const [mode, setMode] = useState(initialMode || null);
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [quizOver, setQuizOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizAvailable, setQuizAvailable] = useState(true);
  const [availableMonuments, setAvailableMonuments] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [hintsUsed, setHintsUsed] = useState([]);
  const [showHint, setShowHint] = useState(false);

  // Fetch available monuments list
  useEffect(() => {
    const fetchAvailableMonuments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quiz/available-monuments`);
        const data = await res.json();
        setAvailableMonuments(data);
      } catch (err) {
        console.error('Error fetching available monuments:', err);
      }
    };
    fetchAvailableMonuments();
  }, []);

  // Fetch all questions for the quiz session (no repetition)
  const fetchQuizSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const quizMode = mode === 'monument' ? 'monument' : 'all-india';
      const params = new URLSearchParams({
        difficulty,
        count: TOTAL_QUESTIONS.toString()
      });

      if (mode === 'monument' && monumentName) {
        params.append('monument', monumentName);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/quiz/session/${quizMode}?${params}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.available || data.questions.length === 0) {
        setQuizAvailable(false);
        setLoading(false);
        return;
      }

      setQuestions(data.questions);
      setQuizAvailable(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [mode, difficulty, monumentName]);

  // Start quiz when difficulty is selected
  useEffect(() => {
    if (mode && difficulty) {
      fetchQuizSession();
    }
  }, [mode, difficulty, fetchQuizSession]);

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (answered) return;

    setSelectedOption(optionIndex);
    setAnswered(true);

    // Check if correct
    if (optionIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  // Handle skip question
  const handleSkip = () => {
    if (answered) return;
    setSkippedQuestions((prev) => [...prev, currentQuestionIndex]);
    handleNext();
  };

  // Handle 50:50 hint
  const handleHint = () => {
    if (answered || showHint || hintsUsed.includes(currentQuestionIndex)) return;
    setHintsUsed((prev) => [...prev, currentQuestionIndex]);
    setShowHint(true);
  };

  // Get eliminated options for 50:50 hint
  const getEliminatedOptions = () => {
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const options = [0, 1, 2, 3];
    const incorrect = options.filter((idx) => idx !== correctAnswer);

    // Randomly eliminate 2 incorrect options
    const shuffled = incorrect.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      setQuizOver(true);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setAnswered(false);
    setShowHint(false);
  };

  // Restart quiz
  const handleRestart = () => {
    setDifficulty(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setQuizOver(false);
    setSkippedQuestions([]);
    setHintsUsed([]);
    setShowHint(false);
  };

  // Close quiz
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/heritage');
    }
  };

  // Mode selection screen
  if (!mode) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(15px)'
          }}
        >
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '32px',
              color: '#fff',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '1')}
            onMouseLeave={(e) => (e.target.style.opacity = '0.7')}
          >
            &times;
          </button>

          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#ffd700',
              marginBottom: '15px',
              fontSize: '32px',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
            }}
          >
            🏛️ Heritage Quiz
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '35px',
              textAlign: 'center',
              fontSize: '16px'
            }}
          >
            Choose your quiz mode
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {monumentName && (
              <GestureButton
                onClick={() => setMode('monument')}
                style={{
                  padding: '20px',
                  background:
                    'linear-gradient(135deg, rgba(255, 140, 0, 0.2), rgba(255, 69, 0, 0.3))',
                  color: '#ffa500',
                  border: '2px solid rgba(255, 140, 0, 0.4)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'left'
                }}
              >
                <div>📍 Quiz for {monumentName}</div>
                <div
                  style={{
                    fontSize: '14px',
                    opacity: 0.8,
                    marginTop: '5px',
                    fontWeight: 'normal'
                  }}
                >
                  Test your knowledge about this specific monument
                </div>
              </GestureButton>
            )}

            <GestureButton
              onClick={() => setMode('all-india')}
              style={{
                padding: '20px',
                background:
                  'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(30, 144, 255, 0.3))',
                color: '#87ceeb',
                border: '2px solid rgba(65, 105, 225, 0.4)',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'left'
              }}
            >
              <div>🇮🇳 All India Heritage Quiz</div>
              <div
                style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginTop: '5px',
                  fontWeight: 'normal'
                }}
              >
                Questions from all heritage sites across India
              </div>
            </GestureButton>

            <button
              onClick={handleClose}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(0, 212, 255, 0.3)',
            backdropFilter: 'blur(15px)'
          }}
        >
          <button
            onClick={() => setMode(null)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>

          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#00d4ff',
              marginBottom: '10px',
              fontSize: '28px',
              textAlign: 'center',
              textShadow: '0 0 15px rgba(0, 212, 255, 0.5)'
            }}
          >
            🎯 Select Difficulty
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '30px',
              textAlign: 'center',
              fontSize: '14px'
            }}
          >
            {mode === 'monument' ? `Quiz for ${monumentName}` : 'All India Heritage Quiz'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <GestureButton
              onClick={() => setDifficulty('easy')}
              style={{
                padding: '18px 24px',
                background:
                  'linear-gradient(135deg, rgba(0, 255, 128, 0.2), rgba(0, 128, 64, 0.3))',
                color: '#00ff80',
                border: '2px solid rgba(0, 255, 128, 0.4)',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              🟢 Easy
            </GestureButton>

            <GestureButton
              onClick={() => setDifficulty('medium')}
              style={{
                padding: '18px 24px',
                background:
                  'linear-gradient(135deg, rgba(255, 170, 0, 0.2), rgba(255, 140, 0, 0.3))',
                color: '#ffaa00',
                border: '2px solid rgba(255, 170, 0, 0.4)',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              🟡 Medium
            </GestureButton>

            <GestureButton
              onClick={() => setDifficulty('hard')}
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(220, 38, 38, 0.3))',
                color: '#ff4444',
                border: '2px solid rgba(255, 68, 68, 0.4)',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              🔴 Hard
            </GestureButton>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            🏛️
          </div>
          <div
            style={{
              color: '#ffd700',
              fontSize: '24px',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            Loading Quiz...
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '50px 40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 68, 68, 0.5)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h2
            style={{
              color: '#ff4444',
              marginBottom: '15px',
              fontSize: '28px',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            Oops! Something went wrong
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              marginBottom: '10px'
            }}
          >
            {error}
          </p>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              marginBottom: '30px'
            }}
          >
            Please try again or select a different difficulty.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setError(null);
                setDifficulty(null);
              }}
              style={{
                padding: '14px 24px',
                background: 'rgba(65, 105, 225, 0.3)',
                color: '#87ceeb',
                border: '2px solid rgba(65, 105, 225, 0.5)',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: '14px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Coming soon screen (quiz not available)
  if (!quizAvailable) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}
        >
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#ffd700',
              marginBottom: '15px',
              fontSize: '28px',
              textAlign: 'center'
            }}
          >
            🏗️ Quiz Coming Soon
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '30px',
              textAlign: 'center',
              fontSize: '16px'
            }}
          >
            Quiz for "<strong>{monumentName}</strong>" at {difficulty} difficulty will be available
            soon!
          </p>

          {availableMonuments.length > 0 && (
            <>
              <h3
                style={{
                  color: '#87ceeb',
                  fontSize: '18px',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}
              >
                Meanwhile, try quizzes for:
              </h3>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginBottom: '25px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '15px'
                }}
              >
                {availableMonuments.map((monument, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: '#fff',
                      padding: '8px 12px',
                      borderBottom:
                        idx < availableMonuments.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                  >
                    ✓ {monument}
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <GestureButton
              onClick={() => {
                setMode('all-india');
                setDifficulty(null);
              }}
              style={{
                padding: '14px 24px',
                background:
                  'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 144, 255, 0.4))',
                color: '#87ceeb',
                border: '2px solid rgba(65, 105, 225, 0.5)',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Try All-India Quiz
            </GestureButton>

            <button
              onClick={handleClose}
              style={{
                padding: '14px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Back to Heritage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz over - Results screen
  if (quizOver) {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    let message = 'Good effort!';
    let emoji = '👍';

    if (percentage >= 90) {
      message = 'Outstanding! 🌟';
      emoji = '🏆';
    } else if (percentage >= 70) {
      message = 'Excellent! 🎉';
      emoji = '⭐';
    } else if (percentage >= 50) {
      message = 'Great job! 👏';
      emoji = '✨';
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
            borderRadius: '20px',
            padding: '50px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>{emoji}</div>

          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#ffd700',
              marginBottom: '15px',
              fontSize: '36px'
            }}
          >
            Quiz Complete!
          </h2>

          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: percentage >= 70 ? '#00ff80' : percentage >= 50 ? '#ffaa00' : '#ff4444',
              marginBottom: '15px',
              textShadow: `0 0 30px ${
                percentage >= 70
                  ? 'rgba(0, 255, 128, 0.5)'
                  : percentage >= 50
                  ? 'rgba(255, 170, 0, 0.5)'
                  : 'rgba(255, 68, 68, 0.5)'
              }`
            }}
          >
            {percentage}%
          </div>

          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '10px'
            }}
          >
            {message}
          </p>

          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '30px'
            }}
          >
            You scored {score} out of {TOTAL_QUESTIONS}
          </p>

          {skippedQuestions.length > 0 && (
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '25px'
              }}
            >
              Skipped: {skippedQuestions.length} question{skippedQuestions.length > 1 ? 's' : ''}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <GestureButton
              onClick={handleRestart}
              style={{
                padding: '16px 28px',
                background:
                  'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 144, 255, 0.4))',
                color: '#87ceeb',
                border: '2px solid rgba(65, 105, 225, 0.5)',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              🔄 Try Again
            </GestureButton>

            <button
              onClick={handleClose}
              style={{
                padding: '16px 28px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '18px',
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
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz screen
  const currentQuestion = questions[currentQuestionIndex];
  
  // Safety check - if no current question, show loading or error
  if (!currentQuestion) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏛️</div>
          <div style={{ color: '#ffd700', fontSize: '24px', marginBottom: '20px' }}>
            Loading Question...
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const eliminatedOptions = showHint ? getEliminatedOptions() : [];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(27, 38, 59, 0.95))',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '700px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}
        >
          <div>
            <div
              style={{
                color: '#ffd700',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif"
              }}
            >
              {mode === 'monument' ? `📍 ${monumentName}` : '🇮🇳 All India'} • {difficulty.toUpperCase()}
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '18px',
                marginTop: '5px',
                fontWeight: 'bold'
              }}
            >
              Question {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
            </div>
          </div>
          <div
            style={{
              color: '#00ff80',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            Score: {score}
          </div>
        </div>

        {/* Monument name for All-India quiz */}
        {mode === 'all-india' && currentQuestion && (
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
            padding: '25px',
            marginBottom: '25px',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h3
            style={{
              color: '#fff',
              fontSize: '20px',
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
            marginBottom: '25px'
          }}
        >
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isEliminated = eliminatedOptions.includes(idx);

            let bgColor = 'rgba(255, 255, 255, 0.05)';
            let borderColor = 'rgba(255, 255, 255, 0.2)';
            let textColor = '#fff';

            if (answered) {
              if (isCorrect) {
                bgColor = 'rgba(0, 255, 128, 0.2)';
                borderColor = 'rgba(0, 255, 128, 0.5)';
                textColor = '#00ff80';
              } else if (isSelected) {
                bgColor = 'rgba(255, 68, 68, 0.2)';
                borderColor = 'rgba(255, 68, 68, 0.5)';
                textColor = '#ff4444';
              }
            } else if (isEliminated) {
              bgColor = 'rgba(0, 0, 0, 0.5)';
              borderColor = 'rgba(255, 255, 255, 0.1)';
              textColor = 'rgba(255, 255, 255, 0.3)';
            }

            return (
              <GestureButton
                key={idx}
                onClick={() => !isEliminated && handleAnswerSelect(idx)}
                disabled={answered || isEliminated}
                style={{
                  padding: '18px 20px',
                  background: bgColor,
                  color: textColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '10px',
                  fontSize: '16px',
                  textAlign: 'left',
                  cursor: answered || isEliminated ? 'default' : 'pointer',
                  opacity: isEliminated ? 0.3 : 1,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontWeight: 'bold',
                      opacity: 0.7,
                      minWidth: '25px'
                    }}
                  >
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>{option}</span>
                </div>
                {answered && isCorrect && (
                  <span style={{ position: 'absolute', right: '15px', fontSize: '20px' }}>✓</span>
                )}
                {answered && isSelected && !isCorrect && (
                  <span style={{ position: 'absolute', right: '15px', fontSize: '20px' }}>✗</span>
                )}
              </GestureButton>
            );
          })}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            {!answered && !hintsUsed.includes(currentQuestionIndex) && (
              <button
                onClick={handleHint}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 165, 0, 0.2)',
                  color: '#ffa500',
                  border: '1px solid rgba(255, 165, 0, 0.4)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 165, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 165, 0, 0.2)';
                }}
              >
                💡 50:50 Hint
              </button>
            )}

            {!answered && (
              <button
                onClick={handleSkip}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                ⏭️ Skip
              </button>
            )}
          </div>

          {answered && (
            <GestureButton
              onClick={handleNext}
              style={{
                padding: '14px 30px',
                background:
                  'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 144, 255, 0.4))',
                color: '#87ceeb',
                border: '2px solid rgba(65, 105, 225, 0.5)',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {currentQuestionIndex + 1 >= TOTAL_QUESTIONS ? 'See Results →' : 'Next Question →'}
            </GestureButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeritageQuiz;
