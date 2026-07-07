import React from 'react';

const MOVERS_DATA = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', domain: 'nvidia.com', price: '$124.59', change: '+2.70%', positive: true, volume: '48,102,941' },
  { ticker: 'AAPL', name: 'Apple Inc.', domain: 'apple.com', price: '$312.82', change: '+1.36%', positive: true, volume: '31,442,095' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', domain: 'tesla.com', price: '$415.34', change: '+5.56%', positive: true, volume: '22,891,404' },
  { ticker: 'BTC', name: 'Bitcoin Proxy', domain: 'bitcoin.org', price: '$61,337.85', change: '-1.44%', positive: false, volume: '14,024,115' }
];

export default function TopMovers() {
  return (
    <div className="dashboard-card">
      <div className="movers-header-row">
        <div>
          <span className="section-label">Market Velocity</span>
          <h3 className="section-title-main">Top Movers Today</h3>
        </div>
        <div className="filter-pill-group">
          <button className="pill-btn active">Gainers</button>
          <button className="pill-btn">Losers</button>
        </div>
      </div>

      <div className="movers-table-wrapper">
        <table className="glass-data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th className="text-right">Market Price</th>
              <th className="text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {MOVERS_DATA.map((stock) => (
              <tr key={stock.ticker} className="table-hover-row">
                <td>
                  <div className="company-profile-cell">
                    {/* Clearbit Dynamic API for Real-time Logo Fetching */}
                    <div className="brand-avatar-container">
                      <img 
                        src={`https://logo.clearbit.com/${stock.domain}`} 
                        alt={stock.name}
                        onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop&q=60`; }} // Fallback geometric abstract tile
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
      </div>
    </div>
  );
}
