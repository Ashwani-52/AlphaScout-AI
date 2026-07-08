import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const SCALE_MAP = {
  '^NSEI': { name: 'NIFTY 50', base: 24442.65, factor: 21.18 },
  '^NSEBANK': { name: 'BANK NIFTY', base: 52444.30, factor: 196.88 },
  '^CNXFIN': { name: 'NIFTY FIN SERVICE', base: 23612.15, factor: 24.36 },
  '^CNXMID': { name: 'NIFTY MIDCAP 100', base: 55840.90, factor: 59.63 }
};

export default function MarketAnchors() {
  const [indices, setIndices] = useState([
    { id: '^NSEI', name: 'NIFTY 50', value: '24,442.65', pct: '+0.05%', isPositive: true },
    { id: '^NSEBANK', name: 'BANK NIFTY', value: '52,444.30', pct: '-0.35%', isPositive: false },
    { id: '^CNXFIN', name: 'NIFTY FIN SERVICE', value: '23,612.15', pct: '+0.40%', isPositive: true },
    { id: '^CNXMID', name: 'NIFTY MIDCAP 100', value: '55,840.90', pct: '+0.56%', isPositive: true }
  ]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  // Derive WebSocket URL from Backend URL
  const wsUrl = backendUrl.replace(/^http/, 'ws');

  useEffect(() => {
    console.log('[MarketAnchors] Connecting to live WebSocket index stream at:', wsUrl);
    let ws;
    let reconnectTimeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          if (Array.isArray(rawData)) {
            const updated = rawData.map((item) => {
              const scale = SCALE_MAP[item.symbol] || { name: item.symbol, base: item.price, factor: 1 };
              const scaledPrice = item.price * scale.factor;
              const isPositive = item.changePercent >= 0;
              const formattedPrice = new Intl.NumberFormat('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              }).format(scaledPrice);

              return {
                id: item.symbol,
                name: scale.name,
                value: formattedPrice,
                pct: `${isPositive ? '+' : ''}${item.changePercent.toFixed(2)}%`,
                isPositive
              };
            });
            setIndices(updated);
          }
        } catch (err) {
          console.error('[MarketAnchors] Error parsing WS payload:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[MarketAnchors] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[MarketAnchors] WebSocket connection closed. Reconnecting in 5s...');
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [wsUrl]);

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
          NSE Live
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
