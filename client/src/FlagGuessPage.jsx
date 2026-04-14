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

      <GestureButton
        onClick={togglePanelFullscreen}
        style={{
          position: "absolute",
          bottom: "70px",
          left: "260px",
          zIndex: 1000,
          background: "linear-gradient(135deg, rgba(80, 120, 220, 0.9), rgba(60, 90, 190, 0.9))",
          color: "#f0f7ff",
          border: "2px solid rgba(190, 220, 255, 0.55)",
          padding: "18px 20px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          fontFamily: "'Orbitron', sans-serif",
          cursor: "pointer",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>{isExpanded ? "🡼" : "⛶"}</span>
        {isExpanded ? "Exit Fullscreen" : "Fullscreen"}
      </GestureButton>

      {/* 🔙 Back Button */}
      <GestureButton
        onClick={() => navigate(-1)}
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

export default FlagGuessPage;
