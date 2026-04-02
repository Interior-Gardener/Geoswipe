import React, { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import GestureButton from '../GestureButton';

// Memoized game option card
const GameOption = memo(({ icon, title, description, onClick, color }) => (
  <GestureButton
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '25px 20px',
      background: `linear-gradient(135deg, ${color}22, ${color}11)`,
      border: `2px solid ${color}66`,
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '180px',
      position: 'relative',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
      e.currentTarget.style.boxShadow = `0 10px 30px ${color}44`;
      e.currentTarget.style.borderColor = color;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = `${color}66`;
    }}
  >
    <span style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</span>
    <h3 style={{ 
      color: 'white', 
      margin: '0 0 8px 0', 
      fontSize: '18px',
      fontWeight: 'bold'
    }}>
      {title}
    </h3>
    <p style={{ 
      color: 'rgba(255,255,255,0.7)', 
      margin: 0, 
      fontSize: '12px',
      textAlign: 'center',
      lineHeight: '1.4'
    }}>
      {description}
    </p>
  </GestureButton>
));

GameOption.displayName = 'GameOption';

const GameSelectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleQuiz = useCallback(() => {
    onClose();
    navigate('/quiz');
  }, [navigate, onClose]);

  const handleFlagGame = useCallback(() => {
    onClose();
    navigate('/flag-game');
  }, [navigate, onClose]);

  const handleMultiplayerQuiz = useCallback(() => {
    onClose();
    navigate('/multiplayer/quiz');
  }, [navigate, onClose]);

  const handleMultiplayerFlag = useCallback(() => {
    onClose();
    navigate('/multiplayer/flag-game');
  }, [navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '800px',
          width: '90%',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.1)',
          animation: 'slideUp 0.4s ease',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ 
            color: '#00d4ff', 
            fontSize: '32px', 
            margin: '0 0 10px 0',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
          }}>
            🎮 Select Game Mode
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            margin: 0,
            fontSize: '14px'
          }}>
            Use hand gestures or click to select • 👌 OK sign to click
          </p>
        </div>

        {/* Single Player Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '14px', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '15px',
            paddingLeft: '5px'
          }}>
            🎯 Single Player
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '20px' 
          }}>
            <GameOption
              icon="🌍"
              title="Geography Quiz"
              description="Test your knowledge of countries & capitals"
              onClick={handleQuiz}
              color="#00d4ff"
            />
            <GameOption
              icon="🏳️"
              title="Flag Challenge"
              description="Guess countries by their flags"
              onClick={handleFlagGame}
              color="#ff6b6b"
            />
          </div>
        </div>

        {/* Multiplayer Section */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '14px', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '15px',
            paddingLeft: '5px'
          }}>
            👥 Multiplayer
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '20px' 
          }}>
            <GameOption
              icon="🎯"
              title="Quiz Battle"
              description="Challenge a friend in real-time quiz"
              onClick={handleMultiplayerQuiz}
              color="#9b59b6"
            />
            <GameOption
              icon="🏳️"
              title="Flag Battle"
              description="Compete in flag guessing with friends"
              onClick={handleMultiplayerFlag}
              color="#f39c12"
            />
          </div>
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <GestureButton
            onClick={onClose}
            style={{
              padding: '12px 40px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            ✕ Close
          </GestureButton>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default memo(GameSelectionModal);
