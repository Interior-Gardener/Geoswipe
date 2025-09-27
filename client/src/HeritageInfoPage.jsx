import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const HeritageInfoPage = () => {
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
      
      {/* Basic Information */}
      <h2>About</h2>
      <p style={{ fontSize: 18, marginBottom: 20 }}>{site.info?.full || 'No detailed information available.'}</p>
      
      {/* History Section */}
      {site.info?.history && (
        <>
          <h3>History</h3>
          <p style={{ fontSize: 16, marginBottom: 20 }}>{site.info.history}</p>
        </>
      )}
      
      {/* Architecture Section */}
      {site.info?.architecture && (
        <>
          <h3>Architecture</h3>
          <p style={{ fontSize: 16, marginBottom: 20 }}>{site.info.architecture}</p>
        </>
      )}
      
      {/* Significance Section */}
      {site.info?.significance && (
        <>
          <h3>Significance</h3>
          <p style={{ fontSize: 16, marginBottom: 20 }}>{site.info.significance}</p>
        </>
      )}
      
      {/* Visiting Tips */}
      {site.info?.visitingTips && site.info.visitingTips.length > 0 && (
        <>
          <h3>Visiting Tips</h3>
          <ul style={{ fontSize: 16 }}>
            {site.info.visitingTips.map((tip, index) => (
              <li key={index} style={{ marginBottom: 8 }}>{tip}</li>
            ))}
          </ul>
        </>
      )}
      
      {/* Visitor Information */}
      {site.visitor_info && (
        <>
          <h3>Visitor Information</h3>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 20 }}>
            {site.visitor_info.timings && (
              <p><strong>Timings:</strong> {site.visitor_info.timings}</p>
            )}
            {site.visitor_info.entryFee && (
              <p><strong>Entry Fee:</strong> {site.visitor_info.entryFee}</p>
            )}
            {site.visitor_info.bestTimeToVisit && (
              <p><strong>Best Time to Visit:</strong> {site.visitor_info.bestTimeToVisit}</p>
            )}
            {site.visitor_info.duration && (
              <p><strong>Duration:</strong> {site.visitor_info.duration}</p>
            )}
          </div>
        </>
      )}
      
      {/* Location Information */}
      {site.location && (
        <>
          <h3>Location</h3>
          <p style={{ fontSize: 16 }}>
            {site.location.city && `${site.location.city}, `}
            {site.location.state && `${site.location.state}, `}
            {site.location.country}
          </p>
        </>
      )}
    </div>
  ); 
};

export default HeritageInfoPage;
