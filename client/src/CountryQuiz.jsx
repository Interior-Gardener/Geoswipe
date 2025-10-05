import React, { useEffect, useState, useCallback, useMemo } from "react";

const TOTAL_QUESTIONS = 25;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CountryQuiz = ({ selectedCountry, clearSelection }) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizOver, setQuizOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${API_BASE_URL}/api/country-question`, {
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
  }, []);

  // Load first question
  useEffect(() => {
    fetchQuestion();
  }, []);

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

  // Memoized score display
  const scoreDisplay = useMemo(() => {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    let message = "Good effort!";
    if (percentage >= 80) message = "Excellent! 🌟";
    else if (percentage >= 60) message = "Great job! 👏";
    else if (percentage >= 40) message = "Not bad! 👍";
    
    return { percentage, message };
  }, [score]);

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
      <button 
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
      </button>
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
        <button
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
        </button>
      </div>
    );
  }

  if (!question) return (
    <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
      <p>No question available.</p>
      <button onClick={fetchQuestion} style={{
        padding: "10px 20px",
        background: "#00d4ff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}>
        Retry
      </button>
    </div>
  );

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(0,20,40,0.85)",
        borderRadius: "12px",
        color: "white",
        maxWidth: "500px",
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
        <button
          onClick={nextQuestion}
          style={{
            padding: "10px 18px",
            marginRight: "10px",
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
        </button>
        <span style={{ fontSize: "18px", marginLeft: "10px" }}>
          Score: {score}
        </span>
      </div>
    </div>
  );
};

export default CountryQuiz;
