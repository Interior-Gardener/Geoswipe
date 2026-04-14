import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeritageCard from './HeritageCard';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';

const StoryBookDemo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();

  const currentSelection = extractMonumentFromRouteState(location.state) || selectedMonument;

  const handleOpenStory = (site) => {
    const state = buildHeritageRouteState(
      normalizeMonumentSelection(site) || currentSelection
    );

    if (state) {
      navigate(`/heritage-storybook/${site.name.toLowerCase().replace(/\s+/g, '-')}`, { state });
      return;
    }

    navigate(`/heritage-storybook/${site.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const navigateBackToHeritage = () => {
    const state = buildHeritageRouteState(currentSelection);
    if (state) {
      navigate('/heritage', { state });
      return;
    }
    navigate('/heritage');
  };

  // Sample heritage sites data
  const heritageSites = [
    {
      name: 'Shaniwar Wada',
      category: 'Historic Fort',
      year: '1732',
      description: 'Historic fort palace of the Peshwas, built in 1732. It was the seat of the Peshwa rulers of the Maratha Empire until 1818.'
    },
    {
      name: 'Raigad Fort',
      category: 'Historic Fort', 
      year: '1656',
      description: 'A hill fort situated in the Raigad district of Maharashtra. It was the capital of the Maratha Empire under Chhatrapati Shivaji Maharaj.'
    },
    {
      name: 'Janjira Fort',
      category: 'Historic Fort',
      year: '15th century',
      description: 'An island fort located in the Arabian Sea off the coast of Murud. It is one of the strongest marine forts in India.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '40px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '32px',
          color: '#333',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          📖 Heritage Story Book Demo
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '40px',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          Experience heritage sites through immersive storytelling. Click on any site below to open its story book.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {heritageSites.map((site, index) => (
            <HeritageCard
              key={index}
              site={site}
              onCardClick={handleOpenStory}
              buttonText="📖 Read Story"
              buttonColor="#d4af37"
            />
          ))}
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ color: '#333', marginBottom: '15px' }}>📚 How to Use:</h4>
          <ol style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Click on any heritage site card above</li>
            <li>The story book will open in fullscreen mode</li>
            <li>Navigate through chapters using Previous/Next buttons</li>
            <li>Press ESC or click the X button to close</li>
            <li>Use "Read Again" to restart the story</li>
          </ol>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <button
            onClick={navigateBackToHeritage}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            ← Back to Heritage Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryBookDemo;
