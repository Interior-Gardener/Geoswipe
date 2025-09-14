import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import CountryQuiz from "./CountryQuiz";

const QuizPage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div style={{ display: "flex" }}>
      {/* Pass setter to Earth so it can update - hide instructions and controls for quiz */}
      <EarthThreeJS 
        setSelectedCountry={setSelectedCountry} 
        hideInstructions={true} 
        hideControls={true} 
      />
      

      {/* 📋 QuizDisplay overlay */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,         // 👈 ensures it's above Earth
          background: "rgba(0, 20, 40, 0.8)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
        }}
      >
        <CountryQuiz selectedCountry={selectedCountry}  clearSelection={() => setSelectedCountry(null)}/>
      </div>

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)} // Go back to previous page
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          zIndex: 1000,
          background: "linear-gradient(135deg, rgba(0, 40, 80, 0.9), rgba(0, 20, 40, 0.9))",
          color: "#00d4ff",
          border: "2px solid rgba(0, 212, 255, 0.4)",
          padding: "12px 20px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          fontFamily: "'Orbitron', sans-serif",
          cursor: "pointer",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 255, 0.2)",
          textShadow: "0 0 8px rgba(0, 212, 255, 0.6)",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 40, 80, 0.9))";
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 212, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "linear-gradient(135deg, rgba(0, 40, 80, 0.9), rgba(0, 20, 40, 0.9))";
          e.target.style.transform = "translateY(0px)";
          e.target.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 255, 0.2)";
        }}
      >
        <span style={{ fontSize: "18px" }}>⬅️</span>
        Back
      </button>
    </div>
  );
};

export default QuizPage;
