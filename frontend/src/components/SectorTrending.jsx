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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '50%' }}></div>
                  <div style={{ height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '50px' }}></div>
                </div>
                <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '9999px', width: '100%' }}></div>
              </div>
            ))}
          </div>
        ) : sectors.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data feed offline. Check connections.</p>
        ) : (
          sectors.map((sector, index) => {
            const total = sector.advancing + sector.declining;
            const gainerWidth = total > 0 ? (sector.advancing / total) * 100 : 50;
            const positive = sector.avgChange >= 0;

            return (
              <div key={index} className="sector-metric-row">
                <div className="sector-meta-description">
                  <span className="sector-name-label">{sector.sectorName}</span>
                  <span className={`sector-delta-badge ${positive ? 'text-lime' : 'text-ruby'}`}>
                    {positive ? '+' : ''}{sector.avgChange}%
                  </span>
                </div>
                
                {/* Dual-spectrum Distribution Bar */}
                <div className="distribution-track-bar">
                  <div className="track-fill-gainer" style={{ width: `${gainerWidth}%` }}>
                    <span className="count-indicator-tag">{sector.advancing}</span>
                  </div>
                  <div className="track-fill-loser" style={{ width: `${100 - gainerWidth}%` }}>
                    <span className="count-indicator-tag text-right-tag">{sector.declining}</span>
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
