import React, { useEffect, useState, useCallback, useMemo } from "react";
import GestureButton from "./GestureButton";

const TOTAL_QUESTIONS = 25;
import { API_BASE_URL } from './utils/apiConfig';

const CountryQuiz = ({ selectedCountry, clearSelection }) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizOver, setQuizOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState(null); // null means not selected yet
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Build URL with difficulty parameter if selected
      const url = difficulty 
        ? `${API_BASE_URL}/api/country-question?difficulty=${difficulty}`
        : `${API_BASE_URL}/api/country-question`;
      
      const res = await fetch(url, {
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
      
      setQuestion(data);
    } catch (err) {
      console.error("Error fetching question:", err);
      setError(err.message);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  // Load first question only after difficulty is selected
  useEffect(() => {
    if (difficulty) {
      fetchQuestion();
    }
  }, [difficulty, fetchQuestion]);

  // Whenever user selects a country on the globe
  useEffect(() => {
    if (!selectedCountry || !question || answered) return;

    setAnswered(true); // lock this question

    if (selectedCountry === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  }, [selectedCountry, question, answered]);

  // Memoized next question function
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      setQuizOver(true);
      return;
    }
    clearSelection();   
    setCurrentQuestionIndex((prev) => prev + 1);
    setAnswered(false);
    fetchQuestion();
  }, [currentQuestionIndex, clearSelection, fetchQuestion]);

  // Handle difficulty selection
  const handleDifficultySelect = useCallback((selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setShowDifficultySelector(false);
    setLoading(true);
  }, []);

  // Memoized score display
  const scoreDisplay = useMemo(() => {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    let message = "Good effort!";
    if (percentage >= 80) message = "Excellent! 🌟";
    else if (percentage >= 60) message = "Great job! 👏";
    else if (percentage >= 40) message = "Not bad! 👍";
    
    return { percentage, message };
  }, [score]);

  // Show difficulty selector before quiz starts
  if (showDifficultySelector && !difficulty) {
    return (
      <div style={{ 
        padding: "25px", 
        color: "white", 
        textAlign: "center",
        background: "rgba(0, 20, 40, 0.95)",
        borderRadius: "16px",
        border: "2px solid rgba(0, 212, 255, 0.3)",
        backdropFilter: "blur(15px)",
        maxWidth: "400px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
      }}>
        <h2 style={{ 
          fontFamily: "'Orbitron', sans-serif",
          color: "#00d4ff",
          marginBottom: "10px",
          fontSize: "24px",
          textShadow: "0 0 10px rgba(0, 212, 255, 0.5)"
        }}>
          🎯 Select Difficulty
        </h2>
        <p style={{ 
          marginBottom: "25px", 
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px",
          fontFamily: "'Orbitron', sans-serif"
        }}>
          Choose your challenge level
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <GestureButton
            onClick={() => handleDifficultySelect('easy')}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, rgba(0, 255, 128, 0.2), rgba(0, 128, 64, 0.3))",
              color: "#00ff80",
              border: "2px solid rgba(0, 255, 128, 0.4)",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              fontFamily: "'Orbitron', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              textShadow: "0 0 8px rgba(0, 255, 128, 0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 128, 64, 0.4))";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(0, 255, 128, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(0, 255, 128, 0.2), rgba(0, 128, 64, 0.3))";
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
            }}
          >
            🟢 Easy
          </GestureButton>
          
          <GestureButton
            onClick={() => handleDifficultySelect('medium')}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 128, 0, 0.3))",
              color: "#ffa500",
              border: "2px solid rgba(255, 165, 0, 0.4)",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              fontFamily: "'Orbitron', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              textShadow: "0 0 8px rgba(255, 165, 0, 0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(255, 165, 0, 0.3), rgba(255, 128, 0, 0.4))";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 165, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 128, 0, 0.3))";
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
            }}
          >
            🟡 Medium
          </GestureButton>
          
          <GestureButton
            onClick={() => handleDifficultySelect('hard')}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, rgba(255, 50, 50, 0.2), rgba(200, 0, 0, 0.3))",
              color: "#ff5050",
              border: "2px solid rgba(255, 50, 50, 0.4)",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              fontFamily: "'Orbitron', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              textShadow: "0 0 8px rgba(255, 50, 50, 0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(255, 50, 50, 0.3), rgba(200, 0, 0, 0.4))";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 50, 50, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, rgba(255, 50, 50, 0.2), rgba(200, 0, 0, 0.3))";
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
            }}
          >
            🔴 Hard
          </GestureButton>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
      <div style={{ fontSize: "18px", marginBottom: "10px" }}>Loading question...</div>
      <div style={{ 
        width: "30px", 
        height: "30px", 
        border: "3px solid #00d4ff", 
        borderTop: "3px solid transparent", 
        borderRadius: "50%", 
        animation: "spin 1s linear infinite",
        margin: "0 auto"
      }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
      <h3 style={{ color: "#ff6b6b" }}>Error Loading Question</h3>
      <p>{error}</p>
      <GestureButton 
        onClick={fetchQuestion}
        style={{
          padding: "10px 20px",
          background: "#00d4ff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "10px"
        }}
      >
        Try Again
      </GestureButton>
    </div>
  );

  if (quizOver) {
    return (
      <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
        <h2>Quiz Finished 🎉</h2>
        <div style={{ fontSize: "24px", margin: "20px 0" }}>
          {score} / {TOTAL_QUESTIONS}
        </div>
        <div style={{ fontSize: "18px", color: "#00d4ff" }}>
          {scoreDisplay.percentage}% - {scoreDisplay.message}
        </div>
        <GestureButton
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            marginTop: "20px",
            background: "linear-gradient(135deg, #00d4ff, #0080ff)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Play Again
        </GestureButton>
      </div>
    );
  }

  if (!question) return (
    <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
      <p>No question available.</p>
      <GestureButton onClick={fetchQuestion} style={{
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

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(0,20,40,0.85)",
        borderRadius: "12px",
        color: "white",
        maxWidth: "400px",
      }}
    >
      <h3>
        Question {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
      </h3>
      <h2>{question.question}</h2>

      {/* Show options but unclickable */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {question.options.map((opt, index) => {
          let style = {
            padding: "8px",
            marginBottom: "6px",
            borderRadius: "6px",
            background: "#003366",
            color: "white",
          };

          if (answered) {
            if (opt === question.correctAnswer && selectedCountry === opt) {
              style = { ...style, background: "lime", color: "black" }; // ✅ correct chosen
            } else if (selectedCountry === opt) {
              style = { ...style, background: "red", color: "white" }; // ❌ wrong chosen
            } else if (opt === question.correctAnswer) {
              style = { ...style, background: "lime", color: "black" }; // highlight correct
            }
          }

          return (
            <li key={index} style={style}>
              {opt}
            </li>
          );
        })}
      </ul>

      {answered && (
        <p>
          {selectedCountry === question.correctAnswer
            ? "✅ Correct!"
            : `❌ Wrong! Correct answer: ${question.correctAnswer}`}
        </p>
      )}

      <div style={{ marginTop: "16px" }}>
        <GestureButton
          onClick={nextQuestion}
          style={{
            padding: "10px 18px",
            marginRight: "10px",
            marginLeft: "250px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            background: "linear-gradient(135deg, #00d4ff, #0080ff)",
            color: "white",
          }}
        >
          {answered ? "Next" : "Skip"}
        </GestureButton>
        <span style={{ fontSize: "18px", marginLeft: "3px" }}>
          Score: {score}
        </span>
      </div>
    </div>
  );
};

export default CountryQuiz;
