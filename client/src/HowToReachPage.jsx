import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useHeritageSelection } from './context/HeritageSelectionContext';
import {
  buildHeritageRouteState,
  extractMonumentFromRouteState,
  normalizeMonumentSelection
} from './utils/heritageNavigationState';
 
const HowToReachPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMonument } = useHeritageSelection();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const derivedSiteSelection = site
    ? normalizeMonumentSelection({
        name: site.name,
        category: site.category,
        year: site.year,
        location: site.location,
        coordinates: site.location?.coordinates
      })
    : null;
  const currentSelection =
    derivedSiteSelection ||
    extractMonumentFromRouteState(location.state) ||
    selectedMonument;

  const navigateBackToHeritage = () => {
    const state = buildHeritageRouteState(currentSelection);
    if (state) {
      navigate('/heritage', { state });
      return;
    }
    navigate('/heritage');
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/heritage/${encodeURIComponent(name)}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setSite(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load site information.');
        setLoading(false);
      });
  }, [name]);

  if (loading) return <div style={{padding: 32}}>Loading...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>{error}</div>;
  if (!site) return <div style={{padding: 32}}>No data found.</div>;

  return (
    <div style={{ 
      padding: '40px 32px', 
      maxWidth: '900px', 
      margin: 'auto', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 25s ease-in-out infinite reverse'
        }}></div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000, 
        display: 'flex', 
        gap: '10px' 
      }}>
        {/* Back Button */}
        <button 
          onClick={navigateBackToHeritage}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          ← Back
        </button>

        {/* Home Button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          🏠 Home
        </button>
      </div>

      {/* Main Content Container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        marginTop: '60px'
      }}>
        <h1 style={{ 
          fontSize: '42px',
          fontWeight: '800',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(0,0,0,0.1)',
          lineHeight: '1.2'
        }}>{site.name}</h1>
        
        <h3 style={{ 
          color: 'rgba(255, 255, 255, 0.85)', 
          fontSize: '16px',
          fontWeight: '500',
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '8px 16px',
          borderRadius: '20px',
          display: 'inline-block',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>{site.category} &middot; {site.year}</h3>
        
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
          margin: '30px 0',
          borderRadius: '2px'
        }}></div>
        
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '32px'
          }}>🗺️</span>
          How to Reach
        </h2>
        
        <p style={{ 
          fontSize: '18px', 
          lineHeight: '1.8',
          marginBottom: '40px',
          color: 'rgba(255, 255, 255, 0.95)',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>{site.howToReach?.full || 'No travel information available.'}</p>
        <p style={{ 
          fontSize: '18px', 
          lineHeight: '1.8',
          marginBottom: '40px',
          color: 'rgba(255, 255, 255, 0.95)',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>{site.howToReach?.full || 'No travel information available.'}</p>
        
        {/* By Air */}
        {site.howToReach?.byAir && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>✈️</span>
              By Air
            </h3>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(135, 206, 250, 0.15) 0%, rgba(30, 144, 255, 0.15) 100%)', 
              padding: '24px', 
              borderRadius: '16px',
              border: '1px solid rgba(135, 206, 250, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}>
              {site.howToReach.byAir.nearestAirport && (
                <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                  <strong style={{ color: '#fff', fontSize: '17px' }}>Nearest Airport:</strong> {site.howToReach.byAir.nearestAirport}
                </p>
              )}
              {site.howToReach.byAir.distance && (
                <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                  <strong style={{ color: '#fff', fontSize: '17px' }}>Distance:</strong> {site.howToReach.byAir.distance}
                </p>
              )}
              {site.howToReach.byAir.description && (
                <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: '1.7' }}>
                  {site.howToReach.byAir.description}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* By Rail */}
        {site.howToReach?.byRail && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>🚂</span>
              By Train
            </h3>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.15) 0%, rgba(34, 139, 34, 0.15) 100%)', 
              padding: '24px', 
              borderRadius: '16px',
              border: '1px solid rgba(144, 238, 144, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}>
              {site.howToReach.byRail.nearestStation && (
                <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                  <strong style={{ color: '#fff', fontSize: '17px' }}>Nearest Railway Station:</strong> {site.howToReach.byRail.nearestStation}
                </p>
              )}
              {site.howToReach.byRail.distance && (
                <p style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px' }}>
                  <strong style={{ color: '#fff', fontSize: '17px' }}>Distance:</strong> {site.howToReach.byRail.distance}
                </p>
              )}
              {site.howToReach.byRail.description && (
                <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: '1.7' }}>
                  {site.howToReach.byRail.description}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* By Road */}
        {site.howToReach?.byRoad && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>🚗</span>
              By Road
            </h3>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255, 179, 102, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%)', 
              padding: '24px', 
              borderRadius: '16px',
              border: '1px solid rgba(255, 179, 102, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              {site.howToReach.byRoad.fromMajorCities && site.howToReach.byRoad.fromMajorCities.length > 0 && (
                <>
                  <h4 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#fff', 
                    marginBottom: '20px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>From Major Cities</h4>
                  {site.howToReach.byRoad.fromMajorCities.map((route, index) => (
                    <div key={index} style={{ 
                      marginBottom: '20px', 
                      padding: '20px', 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <p style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#fff', 
                        marginBottom: '12px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>From {route.city}</p>
                      {route.distance && (
                        <p style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '15px' }}>
                          <strong style={{ color: '#fff' }}>Distance:</strong> {route.distance}
                        </p>
                      )}
                      {route.duration && (
                        <p style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.95)', fontSize: '15px' }}>
                          <strong style={{ color: '#fff' }}>Duration:</strong> {route.duration}
                        </p>
                      )}
                      {route.route && (
                        <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', lineHeight: '1.6' }}>
                          <strong style={{ color: '#fff' }}>Route:</strong> {route.route}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
              {site.howToReach.byRoad.localTransport && (
                <>
                  <h4 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#fff', 
                    marginBottom: '12px',
                    marginTop: site.howToReach.byRoad.fromMajorCities?.length > 0 ? '24px' : '0',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>Local Transport</h4>
                  <p style={{ 
                    marginBottom: 0, 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '15px', 
                    lineHeight: '1.7',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>{site.howToReach.byRoad.localTransport}</p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Location Information */}
        {site.location && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)', 
            padding: '28px', 
            borderRadius: '16px', 
            marginTop: '32px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: '28px' }}>📍</span>
              Location
            </h3>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.95)', 
              marginBottom: '16px',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              {site.location.city && `${site.location.city}, `}
              {site.location.state && `${site.location.state}, `}
              {site.location.country}
            </p>
            {site.location.coordinates && (
              <p style={{ 
                fontSize: '16px', 
                color: 'rgba(255, 255, 255, 0.85)', 
                marginBottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <strong style={{ color: '#fff' }}>Coordinates:</strong> {site.location.coordinates[1]}, {site.location.coordinates[0]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}} />
    </div>
  );
};

export default HowToReachPage;
