import React from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";

const ExplorePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 🌍 Earth Visualization */}
      <EarthThreeJS />

      {/* 🚀 Start Quiz Button */}
      <button
        onClick={() => navigate("/quiz")}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          padding: "12px 24px",
          fontSize: "18px",
          fontWeight: "bold",
          background: "linear-gradient(135deg, #00d4ff, #0080ff)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        Start Quiz
      </button>
    </div>
  );
};

export default ExplorePage;
