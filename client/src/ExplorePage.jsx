import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import GestureButton from "./GestureButton";
import GameSelectionModal from "./components/GameSelectionModal";

// Memoized button component to prevent unnecessary re-renders
const GamesButton = memo(({ onClick }) => (
  <GestureButton
    onClick={onClick}
    style={{
      position: "absolute",
      bottom: "100px",
      left: "140px",
      padding: "18px 35px",
      fontSize: "20px",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #00d4ff, #9b59b6)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(0, 212, 255, 0.4)",
      zIndex: 1000,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
      e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 212, 255, 0.5)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 212, 255, 0.4)";
    }}
  >
    <span style={{ fontSize: "24px" }}>🎮</span>
    Start Games
  </GestureButton>
));

GamesButton.displayName = 'GamesButton';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  // Memoize callback to prevent EarthThreeJS re-renders
  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country);
  }, []);

  // Open game selection modal
  const handleOpenGames = useCallback(() => {
    setIsGameModalOpen(true);
  }, []);

  // Close game selection modal
  const handleCloseGames = useCallback(() => {
    setIsGameModalOpen(false);
  }, []);

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
      
      {/* 🎮 Start Games Button */}
      <GamesButton onClick={handleOpenGames} />

      {/* 🎯 Game Selection Modal */}
      <GameSelectionModal 
        isOpen={isGameModalOpen} 
        onClose={handleCloseGames} 
      />
    </div>
  );
};

export default ExplorePage;
