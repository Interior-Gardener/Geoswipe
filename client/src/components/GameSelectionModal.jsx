import React, { useCallback, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import GestureButton from '../GestureButton';
import './GameSelectionModal.css';

const GAME_GROUPS = [
  {
    label: 'Single player',
    icon: '🎯',
    games: [
      {
        id: 'quiz',
        icon: '🌍',
        title: 'Geography Quiz',
        description: 'Test your knowledge of countries and capitals.',
        accent: 'cyan',
        route: '/quiz',
      },
      {
        id: 'flag',
        icon: '🏳️',
        title: 'Flag Challenge',
        description: 'Guess the country from its flag.',
        accent: 'rose',
        route: '/flag-game',
      },
    ],
  },
  {
    label: 'Multiplayer',
    icon: '👥',
    games: [
      {
        id: 'mp-quiz',
        icon: '⚔️',
        title: 'Quiz Battle',
        description: 'Challenge a friend in a real-time quiz.',
        accent: 'violet',
        route: '/multiplayer/quiz',
      },
      {
        id: 'mp-flag',
        icon: '🚩',
        title: 'Flag Battle',
        description: 'Race a friend to name the flag first.',
        accent: 'gold',
        route: '/multiplayer/flag-game',
      },
    ],
  },
];

const GameOption = memo(({ icon, title, description, accent, onClick }) => (
  <GestureButton className={`game-option game-option--${accent}`} onClick={onClick}>
    <span className="game-option__icon" aria-hidden="true">{icon}</span>
    <span className="game-option__title">{title}</span>
    <span className="game-option__desc">{description}</span>
    <span className="game-option__cta" aria-hidden="true">Play →</span>
  </GestureButton>
));

GameOption.displayName = 'GameOption';

const GameSelectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const go = useCallback(
    (route) => {
      onClose();
      navigate(route);
    },
    [navigate, onClose]
  );

  // Close on Escape, and stop the page behind from scrolling while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="gs-overlay game-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="gs-modal gs-modal--wide game-modal">
        <header className="gs-modal__header game-modal__header">
          <div>
            <p className="gs-overline game-modal__eyebrow">Choose your challenge</p>
            <h2 className="game-modal__title" id="game-modal-title">Select a game mode</h2>
            <p className="game-modal__hint">
              Click, or use hand gestures — <strong>👌 OK sign</strong> to select.
            </p>
          </div>
          <button
            type="button"
            className="gs-modal__close"
            onClick={onClose}
            aria-label="Close game selection"
          >
            ×
          </button>
        </header>

        <div className="gs-modal__body game-modal__body gs-scroll">
          {GAME_GROUPS.map((group) => (
            <section className="game-group" key={group.label}>
              <h3 className="game-group__label">
                <span aria-hidden="true">{group.icon}</span> {group.label}
              </h3>
              <div className="game-group__grid">
                {group.games.map((game) => (
                  <GameOption
                    key={game.id}
                    icon={game.icon}
                    title={game.title}
                    description={game.description}
                    accent={game.accent}
                    onClick={() => go(game.route)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="gs-modal__footer">
          <GestureButton className="gs-btn gs-btn--secondary" onClick={onClose}>
            Close
          </GestureButton>
        </footer>
      </div>
    </div>
  );
};

export default memo(GameSelectionModal);
