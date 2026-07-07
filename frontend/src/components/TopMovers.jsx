import React, { useState, useEffect } from 'react';

export default function TopMovers() {
  const [movers, setMovers] = useState([]);
  const [filter, setFilter] = useState('gainers'); // 'gainers' | 'losers'
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/market/movers`);
        if (!response.ok) {
          throw new Error('Failed to fetch movers data');
        }
        const data = await response.json();
        setMovers(data);
      } catch (error) {
        console.error('[TopMovers] Error fetching live data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovers();
  }, []);

  // Filter and sort movers dynamically based on Gainers/Losers selection
  const sortedMovers = [...movers].sort((a, b) => {
    const changeA = parseFloat(a.change);
    const changeB = parseFloat(b.change);
    return filter === 'gainers' ? changeB - changeA : changeA - changeB;
  }).slice(0, 4); // Limit to top 4 display list items

  return (
    <div className="dashboard-card">
      <div className="movers-header-row">
        <div>
          <span className="section-label">Market Velocity</span>
          <h3 className="section-title-main">Top Movers Today</h3>
        </div>
        <div className="filter-pill-group">
          <button 
            className={`pill-btn ${filter === 'gainers' ? 'active' : ''}`}
            onClick={() => setFilter('gainers')}
          >
            Gainers
          </button>
          <button 
            className={`pill-btn ${filter === 'losers' ? 'active' : ''}`}
            onClick={() => setFilter('losers')}
          >
            Losers
          </button>
        </div>
      </div>

      <div className="movers-table-wrapper">
        {loading ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '20px 0' }}>Syncing market indices...</p>
        ) : sortedMovers.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '20px 0' }}>Data feed offline. Check connections.</p>
        ) : (
          <table className="glass-data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th className="text-right">Market Price</th>
                <th className="text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovers.map((stock) => (
                <tr key={stock.ticker} className="table-hover-row">
                  <td>
                    <div className="company-profile-cell">
                      <div className="brand-avatar-container">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${stock.domain}&sz=128`} 
                          alt={stock.name}
                          onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop&q=60`; }}
                        />
                      </div>
                      <div>
                        <div className="company-ticker-code">{stock.ticker}</div>
                        <div className="company-full-title">{stock.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="ticker-numeric-price">{stock.price}</div>
                    <div className={`ticker-delta-percentage ${stock.positive ? 'delta-up' : 'delta-down'}`}>
                      {stock.change}
                    </div>
                  </td>
                  <td className="text-right volume-dim-text">{stock.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
