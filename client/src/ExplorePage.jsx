import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import EarthThreeJS from "./EarthThreeJS";
import GestureButton from "./GestureButton";
import GameSelectionModal from "./components/GameSelectionModal";
import "./styles/explore.css";

// Primary call-to-action for Explore mode. Previously pinned with hardcoded
// pixel offsets, which collided with the globe's own controls on small screens.
const GamesButton = memo(({ onClick }) => (
  <div className="explore-cta">
    <GestureButton className="explore-cta__btn" onClick={onClick}>
      <span className="explore-cta__icon" aria-hidden="true">🎮</span>
      <span className="explore-cta__label">Start Games</span>
    </GestureButton>
  </div>
));

GamesButton.displayName = 'GamesButton';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [, setSelectedCountry] = useState(null);
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
    <div className="explore-page">
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
