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
        className="gs-game-panel"
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

      {/* Gesture instructions - bottom-left, clear of the camera preview. This was
          pinned bottom-right at z-index 1000, directly over the preview. */}
      <div className="gs-game-help" aria-label="Gesture controls">
        <div className="gs-game-help__title">🎮 Gesture Controls</div>
        <div className="gs-game-help__steps">
          🌍 Click countries to answer
        </div>
        <span className="gs-game-help__hint">
          <span>✋ Open palm: Move cursor</span>
          <span>👌 OK sign: Click buttons</span>
        </span>
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
