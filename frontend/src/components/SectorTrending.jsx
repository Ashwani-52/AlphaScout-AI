import React, { useState, useEffect } from 'react';

export default function SectorTrending() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/market/sectors`);
        if (!response.ok) {
          throw new Error('Failed to fetch sectors data');
        }
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error('[SectorTrending] Error fetching live data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return (
    <div className="dashboard-card">
      <span className="section-label">Macro Segments</span>
      <h3 className="section-title-main" style={{ marginBottom: '20px' }}>Sectors Trending Today</h3>

      <div className="sectors-stack">
        {loading ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Syncing sector tracking ETFs...</p>
        ) : sectors.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data feed offline. Check connections.</p>
        ) : (
          sectors.map((sector, index) => {
            const total = sector.gainers + sector.losers;
            const gainerWidth = (sector.gainers / total) * 100;

            return (
              <div key={index} className="sector-metric-row">
                <div className="sector-meta-description">
                  <span className="sector-name-label">{sector.name}</span>
                  <span className={`sector-delta-badge ${sector.positive ? 'text-lime' : 'text-ruby'}`}>
                    {sector.change}
                  </span>
                </div>
                
                {/* Dual-spectrum Distribution Bar */}
                <div className="distribution-track-bar">
                  <div className="track-fill-gainer" style={{ width: `${gainerWidth}%` }}>
                    <span className="count-indicator-tag">{sector.gainers}</span>
                  </div>
                  <div className="track-fill-loser" style={{ width: `${100 - gainerWidth}%` }}>
                    <span className="count-indicator-tag text-right-tag">{sector.losers}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
