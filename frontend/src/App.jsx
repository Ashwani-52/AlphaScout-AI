import React, { useState, useEffect } from 'react';
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern';
import { cn } from './lib/utils';

export default function App() {
  const [status, setStatus] = useState('Connecting to Engine...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Falls back to 5001 to prevent conflict with macOS AirPlay port 5000
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    
    fetch(backendUrl)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.message || 'AlphaScout AI Node Backend is Live');
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('Connection error:', err);
        setStatus('Engine Offline - Check Connection Setup');
        setIsConnected(false);
      });
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 sm:p-6 md:p-10 transition-colors duration-300">
      
      {/* Premium Light-Mode Animated Grid Background */}
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.06}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-20%] h-[140%] skew-y-6 stroke-slate-300/40 fill-slate-300/20",
        )}
      />

      {/* Fully Responsive Glassmorphic Card Container */}
      <div className="z-10 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-md sm:p-8">
        
        {/* Header Section */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AlphaScout AI</h1>
            <p className="text-xs font-medium text-slate-500">Investment Research Dashboard</p>
          </div>
        </div>

        {/* Dynamic Engine Status Monitor Badge */}
        <div className="mt-6">
          <p className="text-xxs font-bold uppercase tracking-wider text-slate-400">System Status</p>
          <div className={cn(
            "mt-2 flex items-center space-x-2.5 rounded-xl border p-3.5 text-sm font-medium transition-all",
            isConnected 
              ? "border-emerald-100 bg-emerald-50/60 text-emerald-800" 
              : "border-amber-100 bg-amber-50/60 text-amber-800"
          )}>
            <span className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span className="truncate">{status}</span>
          </div>
        </div>

        {/* Feature Baseline Checklist */}
        <div className="mt-6 space-y-3.5">
          <div className="flex items-start space-x-3">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">✓</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">Node.js Engine</p>
              <p className="text-xxs text-slate-500">Express server running ES Modules architecture.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">✓</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">React Interface</p>
              <p className="text-xxs text-slate-500">Vite-scaffolded core layouts responsive for web and mobile viewports.</p>
            </div>
          </div>
        </div>

        {/* Card Footer Tag */}
        <div className="mt-6 border-t border-slate-100 pt-3 text-center">
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xxs font-medium text-slate-500">
            Day 1 Production Baseline Ready
          </span>
        </div>

      </div>
    </div>
  );
}
