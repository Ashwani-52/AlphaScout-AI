const getCompanyDomain = (symbol) => {
  const clean = symbol.toUpperCase();
  const map = {
    'SPY': 'spglobal.com',
    'QQQ': 'invesco.com',
    'NVDA': 'nvidia.com',
    'MSFT': 'microsoft.com',
    'BTC': 'bitcoin.org',
    'AAPL': 'apple.com',
    'AMZN': 'amazon.com',
    'META': 'meta.com',
    'GOOG': 'google.com',
    'TSLA': 'tesla.com',
    'NFLX': 'netflix.com',
    'AMD': 'amd.com'
  };
  return map[clean] || `${clean.toLowerCase()}.com`;
};

function formatMarketCap(cap) {
  if (!cap) return 'N/A';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap}`;
}

export default function ComparisonTable({ peers, available }) {
  if (!available || !peers || peers.length === 0) {
    return (
      <p className="chart-empty">No peer companies found for this ticker.</p>
    );
  }

  return (
    <div className="comparison-table-wrapper text-left">
      <table className="comparison-table w-full border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">Ticker</th>
            <th className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">Price</th>
            <th className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">24h</th>
            <th className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">P/E</th>
            <th className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider text-left">Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {peers.map((p) => (
            <tr key={p.symbol} className="border-t border-slate-100 hover:bg-slate-50/40 transition-colors">
              <td className="px-4 py-3">
                <div className="company-profile-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                  <div className="brand-avatar-container" style={{ width: '28px', height: '28px', borderRadius: '6px', minWidth: '28px', padding: '2px', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${getCompanyDomain(p.symbol)}&sz=64`} 
                      alt={p.name}
                      onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop&q=60`; }}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <span className="peer-symbol font-semibold text-slate-800 block" style={{ display: 'block' }}>{p.symbol}</span>
                    <span className="peer-name text-xs text-slate-400 block" style={{ display: 'block' }}>{p.name}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-700">{p.price != null ? `$${p.price.toFixed(2)}` : 'N/A'}</td>
              <td className={`px-4 py-3 font-medium ${p.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {p.changePercent != null ? `${p.changePercent >= 0 ? '+' : ''}${p.changePercent.toFixed(2)}%` : 'N/A'}
              </td>
              <td className="px-4 py-3 text-slate-700">{p.peRatio != null ? p.peRatio.toFixed(1) : 'N/A'}</td>
              <td className="px-4 py-3 text-slate-700">{formatMarketCap(p.marketCap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
