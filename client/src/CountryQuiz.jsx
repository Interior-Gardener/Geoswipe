import React, { useEffect, useState } from "react";

const TOTAL_QUESTIONS = 25;

const CountryQuiz = ({ selectedCountry, clearSelection }) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizOver, setQuizOver] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Fetch a new question from backend
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/country-question");
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

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

  // Next question (skip or after answering)
  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      setQuizOver(true);
      return;
    }
    clearSelection();   
    setCurrentQuestionIndex((prev) => prev + 1);
    setAnswered(false);
    fetchQuestion();
  };

  if (loading) return <p>Loading question...</p>;

  if (quizOver) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        <h2>Quiz Finished 🎉</h2>
        <p>Your score: {score} / {TOTAL_QUESTIONS}</p>
      </div>
    );
  }

  if (!question) return <p>No question available.</p>;

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
