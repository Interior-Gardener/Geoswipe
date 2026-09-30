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
        className="gs-game-panel"
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

      {/* Gesture instructions - bottom-left, clear of the camera preview */}
      <div className="gs-game-help" aria-label="How to play">
        <div className="gs-game-help__title">🎮 How to Play</div>
        <div className="gs-game-help__steps">
          1️⃣ Look at the flag<br/>
          2️⃣ Find the country on globe<br/>
          3️⃣ Click to select (or use gestures)
        </div>
        <span className="gs-game-help__hint">
          <span>✋ Open palm: Move cursor</span>
          <span>👌 OK sign: Click</span>
        </span>
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
