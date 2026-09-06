import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import CountryQuiz from "./CountryQuiz";
import GestureButton from "./GestureButton";
import { usePanelFullscreen } from "./hooks/usePanelFullscreen";

const QuizPage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const quizPanelRef = useRef(null);
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(quizPanelRef);

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
        ref={quizPanelRef}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: isExpanded ? "min(760px, 96vw)" : "auto",
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
      {/* Game controls - one wrapping toolbar instead of pixel-pinned buttons */}
      <div className="gs-game-toolbar">
        <GestureButton className="gs-game-btn" onClick={() => navigate(-1)}>
          <span aria-hidden="true">←</span> Back
        </GestureButton>

        <GestureButton className="gs-game-btn" onClick={togglePanelFullscreen}>
          <span aria-hidden="true">{isExpanded ? '⤡' : '⛶'}</span>
          {isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
        </GestureButton>
      </div>

    </div>
  );
};

export default QuizPage;
