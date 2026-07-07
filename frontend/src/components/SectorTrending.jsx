import React from 'react';

const SECTOR_DATA = [
  { name: 'Technology & Semiconductors', gainers: 42, losers: 12, change: '+6.32%', positive: true },
  { name: 'Financial Infrastructure', gainers: 28, losers: 19, change: '+2.20%', positive: true },
  { name: 'Energy Systems', gainers: 11, losers: 34, change: '-2.70%', positive: false },
  { name: 'Consumer Discretionary', gainers: 8, losers: 41, change: '-3.34%', positive: false }
];

export default function SectorTrending() {
  return (
    <div className="dashboard-card">
      <span className="section-label">Macro Segments</span>
      <h3 className="section-title-main" style={{ marginBottom: '20px' }}>Sectors Trending Today</h3>

      <div className="sectors-stack">
        {SECTOR_DATA.map((sector, index) => {
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
        })}
      </div>
    </div>
  );
}
