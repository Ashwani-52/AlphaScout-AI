import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function MarketAnchors() {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchLiveIndices = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/market/indices`);
        if (!res.ok) {
          throw new Error(`HTTP status ${res.status}`);
        }
        const data = await res.json();
        setIndices(data);
        setLoading(false);
      } catch (err) {
        console.error("Error connecting to live index feed:", err);
      }
    };

    fetchLiveIndices();
    // Refresh numbers every 60 seconds automatically
    const interval = setInterval(fetchLiveIndices, 60000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  if (loading) {
    return <div className="p-6 text-center text-xs text-slate-400">Syncing live NSE indices...</div>;
  }

  return (
    <div className="w-full rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      {/* Panel Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            Macro Market Anchors
          </h3>
        </div>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
          NSE Live Feed
        </span>
      </div>

      {/* Index Node Cards Grid */}
      <div className="flex flex-col gap-3">
        {indices.map((index) => (
          <div 
            key={index.id} 
            className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-slate-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            {/* Dynamic Status Left Indicator Line */}
            <div className={`absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full transition-all ${
              index.isPositive ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />

            {/* Index Labels */}
            <div className="pl-2">
              <div className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                {index.name}
              </div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                National Stock Exchange
              </div>
            </div>

            {/* Valuation & Vectors */}
            <div className="text-right">
              <div className="text-base font-bold text-slate-900 tracking-tight">
                {index.value}
              </div>
              <div className={`flex items-center justify-end gap-1 text-xs font-semibold mt-0.5 ${
                index.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {index.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{index.pct}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Technical Analytics Footer Note */}
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
        <Activity size={14} className="text-slate-400 flex-shrink-0" />
        <span>Indices provide baseline trend filters for underlying algorithmic stock sentiment checks.</span>
      </div>
    </div>
  );
}
