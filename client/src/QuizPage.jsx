import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import CountryQuiz from "./CountryQuiz";
import GestureButton from "./GestureButton";

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

      {/* 📝 Gesture Instructions for Quiz Mode */}
      <div
        style={{
          position: "absolute",
          bottom: "130px",
          right: "20px",
          zIndex: 1000,
          background: "rgba(0, 20, 40, 0.9)",
          padding: "12px 16px",
          borderRadius: "8px",
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: "12px",
          fontFamily: "'Orbitron', sans-serif",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          maxWidth: "250px",
        }}
      >
        <div style={{ fontWeight: "bold", color: "#00d4ff", marginBottom: "8px" }}>
          🎮 Gesture Controls
        </div>
        <div style={{ lineHeight: "1.4" }}>
          ✋ Open palm: Move cursor<br/>
          👌 OK sign: Click buttons<br/>
          🌍 Click countries to answer
        </div>
      </div>

      {/* 🔙 Back Button */}
      <GestureButton
        onClick={() => navigate(-1)} // Go back to previous page
        style={{
          position: "absolute",
          bottom: "70px",
          left: "90px",
          zIndex: 1000,
          background: "linear-gradient(135deg, rgba(0, 40, 80, 0.9), rgba(0, 20, 40, 0.9))",
          color: "#00d4ff",
          border: "2px solid rgba(0, 212, 255, 0.4)",
          padding: "18px 26px",
          borderRadius: "12px",
          fontSize: "20px",
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
      </GestureButton>
    </div>
  );
};

export default QuizPage;
