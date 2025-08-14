//this component fetches questions and displayes it 

import React, { useEffect, useState } from "react";

const QuizDisplay = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/country-question")
      .then(res => res.json())
      .then(data => {
        console.log("API returned:", data); // check in browser console
        setQuestion(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching question:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading question...</p>;
  if (!question) return <p>No question available.</p>;

  return (
    <div className="quiz-display">
      <h2>{question.question}</h2>
      <ul>
        {question.options.map((opt, index) => (
          <li key={index}>{opt}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuizDisplay;
