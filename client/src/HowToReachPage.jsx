import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
 
const HowToReachPage = () => {
  const { name } = useParams();
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
    <div style={{ padding: 32, maxWidth: 800, margin: 'auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1>{site.name}</h1>
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
