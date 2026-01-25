import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import GestureButton from "./GestureButton";

// Memoized button component to prevent unnecessary re-renders
const QuizButton = memo(({ onClick }) => (
  <GestureButton
    onClick={onClick}
    style={{
      position: "absolute",
      bottom: "100px",
      left: "140px",
      padding: "18px 30px",
      fontSize: "20px",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #00d4ff, #0080ff)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 1000,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseOver={(e) => {
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
    }}
    onMouseOut={(e) => {
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    }}
  >
    Start Quiz
  </GestureButton>
));

QuizButton.displayName = 'QuizButton';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Memoize callback to prevent EarthThreeJS re-renders
  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country);
  }, []);

  // Memoize navigation callback
  const handleQuizNavigation = useCallback(() => {
    navigate("/quiz");
  }, [navigate]);

  // Memoize back to home callback
  const handleBackToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 🌍 Earth Visualization */}
      <EarthThreeJS 
        setSelectedCountry={handleCountrySelect}
        onBackToHome={handleBackToHome}
      />
      
      {/* 🚀 Start Quiz Button */}
      <QuizButton onClick={handleQuizNavigation} />
    </div>
  );
};

export default ExplorePage;
