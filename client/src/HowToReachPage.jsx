import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
 
const HowToReachPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/heritage/${encodeURIComponent(name)}`)
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
    <div style={{ padding: 32, maxWidth: 800, margin: 'auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)', color: 'white', position: 'relative' }}>
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
          onClick={() => navigate('/heritage')}
          style={{
            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
          }}
        >
          ← Back
        </button>

        {/* Home Button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
          }}
        >
          🏠 Home
        </button>
      </div>

      <h1 style={{ marginTop: '60px' }}>{site.name}</h1>
      <h3 style={{ color: '#888' }}>{site.category} &middot; {site.year}</h3>
      <hr style={{ margin: '24px 0' }} />
      
      <h2>How to Reach</h2>
      <p style={{ fontSize: 18, marginBottom: 20 }}>{site.howToReach?.full || 'No travel information available.'}</p>
      
      {/* By Air */}
      {site.howToReach?.byAir && (
        <div style={{ marginBottom: 30 }}>
          <h3>✈️ By Air</h3>
          <div style={{ background: '#f0f8ff', padding: 15, borderRadius: 8 }}>
            {site.howToReach.byAir.nearestAirport && (
              <p><strong>Nearest Airport:</strong> {site.howToReach.byAir.nearestAirport}</p>
            )}
            {site.howToReach.byAir.distance && (
              <p><strong>Distance:</strong> {site.howToReach.byAir.distance}</p>
            )}
            {site.howToReach.byAir.description && (
              <p>{site.howToReach.byAir.description}</p>
            )}
          </div>
        </div>
      )}
      
      {/* By Rail */}
      {site.howToReach?.byRail && (
        <div style={{ marginBottom: 30 }}>
          <h3>🚂 By Train</h3>
          <div style={{ background: '#f0fff0', padding: 15, borderRadius: 8 }}>
            {site.howToReach.byRail.nearestStation && (
              <p><strong>Nearest Railway Station:</strong> {site.howToReach.byRail.nearestStation}</p>
            )}
            {site.howToReach.byRail.distance && (
              <p><strong>Distance:</strong> {site.howToReach.byRail.distance}</p>
            )}
            {site.howToReach.byRail.description && (
              <p>{site.howToReach.byRail.description}</p>
            )}
          </div>
        </div>
      )}
      
      {/* By Road */}
      {site.howToReach?.byRoad && (
        <div style={{ marginBottom: 30 }}>
          <h3>🚗 By Road</h3>
          <div style={{ background: '#fff8f0', padding: 15, borderRadius: 8 }}>
            {site.howToReach.byRoad.fromMajorCities && site.howToReach.byRoad.fromMajorCities.length > 0 && (
              <>
                <h4>From Major Cities:</h4>
                {site.howToReach.byRoad.fromMajorCities.map((route, index) => (
                  <div key={index} style={{ marginBottom: 15, padding: 10, background: '#fff', borderRadius: 5 }}>
                    <p><strong>From {route.city}:</strong></p>
                    {route.distance && <p><strong>Distance:</strong> {route.distance}</p>}
                    {route.duration && <p><strong>Duration:</strong> {route.duration}</p>}
                    {route.route && <p><strong>Route:</strong> {route.route}</p>}
                  </div>
                ))}
              </>
            )}
            {site.howToReach.byRoad.localTransport && (
              <>
                <h4>Local Transport:</h4>
                <p>{site.howToReach.byRoad.localTransport}</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Location Information */}
      {site.location && (
        <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginTop: 20 }}>
          <h3>📍 Location</h3>
          <p>
            {site.location.city && `${site.location.city}, `}
            {site.location.state && `${site.location.state}, `}
            {site.location.country}
          </p>
          {site.location.coordinates && (
            <p>
              <strong>Coordinates:</strong> {site.location.coordinates[1]}, {site.location.coordinates[0]}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HowToReachPage;
