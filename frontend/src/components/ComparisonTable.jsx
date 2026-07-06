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
                <span className="peer-symbol font-semibold text-slate-800 block">{p.symbol}</span>
                <span className="peer-name text-xs text-slate-400 block">{p.name}</span>
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
