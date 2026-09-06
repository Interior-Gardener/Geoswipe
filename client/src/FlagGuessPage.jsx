import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import FlagGuessGame from "./FlagGuessGame";
import GestureButton from "./GestureButton";
import { usePanelFullscreen } from "./hooks/usePanelFullscreen";

const FlagGuessPage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const gamePanelRef = useRef(null);
  const { isExpanded, togglePanelFullscreen } = usePanelFullscreen(gamePanelRef);

  return (
    <div style={{ display: "flex" }}>
      {/* 3D Globe - hide instructions and controls for game mode */}
      <EarthThreeJS 
        setSelectedCountry={setSelectedCountry} 
        hideInstructions={true} 
        hideControls={true} 
      />

      {/* 🏳️ Flag Guess Game Overlay */}
      <div
        ref={gamePanelRef}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: isExpanded ? "min(760px, 96vw)" : "auto",
          zIndex: 1000,
        }}
      >
        <FlagGuessGame 
          selectedCountry={selectedCountry} 
          clearSelection={() => setSelectedCountry(null)}
          onExit={() => navigate(-1)}
        />
      </div>

      {/* 📝 Gesture Instructions for Flag Game Mode */}
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
          🎮 How to Play
        </div>
        <div style={{ lineHeight: "1.5" }}>
          1️⃣ Look at the flag<br/>
          2️⃣ Find the country on globe<br/>
          3️⃣ Click to select (or use gestures)<br/>
          <br/>
          <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "11px" }}>
            ✋ Open palm: Move cursor<br/>
            👌 OK sign: Click
          </span>
        </div>
      </div>

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

export default FlagGuessPage;
