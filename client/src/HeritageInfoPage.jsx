import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const HeritageInfoPage = () => {
  const { name } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/heritage/${encodeURIComponent(name)}`)
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
      <h2>About</h2>
      <p style={{ fontSize: 18 }}>{site.info?.full || 'No detailed information available.'}</p>
      {/* Add images, gallery, etc. as needed */}
    </div>
  );
};

export default HeritageInfoPage;
