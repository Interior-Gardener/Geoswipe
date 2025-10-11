import React from 'react';

const HeritageCard = ({ 
  site, //required
  onCardClick, 
  buttonText = "📖 Read Story",
  buttonColor = "#d4af37",
  showCategory = true,
  showYear = true,
  customIcon = null,
  cardStyle = {},
  buttonStyle = {}
}) => {
  // Default icon based on category if no custom icon provided
  const getDefaultIcon = (category) => {
    const iconMap = {
      'Historic Fort': '🏰',
      'Temple': '🛕',
      'Cave': '🕳️',
      'Museum': '🏛️',
      'Palace': '🏰',
      'Market': '🏪',
      'default': '🏛️'
    };
    return iconMap[category] || iconMap.default;
  };

  const icon = customIcon || getDefaultIcon(site.category);

  const defaultCardStyle = {
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    ...cardStyle
  };

  const defaultButtonStyle = {
    padding: '10px 20px',
    backgroundColor: buttonColor,
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    ...buttonStyle
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(site);
    }
  };

  const handleCardHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.borderColor = buttonColor;
      e.target.style.transform = 'translateY(-5px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    } else {
      e.target.style.borderColor = '#e0e0e0';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }
  };

  const handleButtonHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    } else {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <div
      style={defaultCardStyle}
      onClick={handleCardClick}
      onMouseEnter={(e) => handleCardHover(e, true)}
      onMouseLeave={(e) => handleCardHover(e, false)}
    >
      {/* Icon */}
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '15px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      }}>
        {icon}
      </div>

      {/* Site Name */}
      <h3 style={{ 
        fontSize: '20px', 
        color: '#333', 
        marginBottom: '10px',
        fontWeight: '600',
        lineHeight: '1.3'
      }}>
        {site.name}
      </h3>

      {/* Category and Year */}
      <p style={{ 
        fontSize: '14px', 
        color: '#666', 
        marginBottom: '15px',
        lineHeight: '1.4'
      }}>
        {showCategory && site.category}
        {showCategory && showYear && site.year && ' • '}
        {showYear && site.year}
      </p>

      {/* Description (if provided) */}
      {site.description && (
        <p style={{
          fontSize: '13px',
          color: '#888',
          marginBottom: '15px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {site.description}
        </p>
      )}

      {/* Action Button */}
      <button
        style={defaultButtonStyle}
        onMouseEnter={(e) => handleButtonHover(e, true)}
        onMouseLeave={(e) => handleButtonHover(e, false)}
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click when button is clicked
          handleCardClick();
        }}
      >
        {buttonText}
      </button>

      {/* Additional Info (if provided) */}
      {site.additionalInfo && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          {site.additionalInfo}
        </div>
      )}
    </div>
  );
};

export default HeritageCard;
