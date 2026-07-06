import React, { useState } from 'react';
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern';
import { cn } from './lib/utils';

export default function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Fallback to 5001 to prevent macOS port 5000 AirPlay Receiver conflicts
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const triggerAnalysis = async (e) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase() })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve intelligence report. Verify stock ticker.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred connection to data layers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-x-hidden font-sans text-slate-900 flex flex-col justify-between">
      
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
        style={{
          position: 'absolute',
          zIndex: 0
        }}
      />

      {/* Main Top Navigation Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 opacity-80 animate-pulse"></div>
          <span className="font-semibold text-lg tracking-tight text-slate-800">AlphaScout AI</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm text-slate-500 font-medium">
          <a href="#" className="text-slate-900 transition-colors">Home</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Product</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Case studies</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
        </nav>
        <div className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-200/60 font-medium tracking-wide">
          Production Engine Live
        </div>
      </header>

      {/* Synthio Epic Hero Core Display Module */}
      <main className="w-full max-w-4xl mx-auto px-6 pt-12 pb-24 z-10 flex-1 flex flex-col justify-center items-center text-center">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 max-w-3xl leading-[1.1] mb-6">
          Your next-level <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500">
            investment research
          </span> engine.
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl max-w-xl mb-12 font-light">
          AI-powered analytical workflows built to scan equity metrics, compile sentiment feeds, and execute deterministic verdicts faster.
        </p>

        {/* Optimized Input Bar with Next-Gen Interactive Action Engine */}
        <form onSubmit={triggerAnalysis} className="w-full max-w-xl flex flex-col sm:flex-row gap-4 items-center justify-between mb-10 bg-white p-2.5 rounded-[38px] border border-slate-200 shadow-md">
          <input 
            type="text" 
            placeholder="Enter Stock Ticker (e.g. AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={loading}
            className="w-full px-6 py-3 bg-transparent text-slate-800 font-semibold text-base outline-none placeholder:text-slate-400"
          />
          
          {/* Modernized Interactive Glow Action Engine */}
          <div className="btn-wrapper w-full sm:w-auto shrink-0">
            <button 
              type="submit" 
              disabled={loading} 
              className={`btn ${loading ? 'is-loading' : ''}`}
            >
              {/* Dynamic Sparkle Vector Core */}
              <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>

              <div className="txt-wrapper">
                {/* Default Display Matrix */}
                <div className="txt-1">
                  {["A", "N", "A", "L", "Y", "Z", "E"].map((char, index) => (
                    <span key={index} className="btn-letter">{char}</span>
                  ))}
                </div>
                
                {/* Active Engine Processing Matrix */}
                <div className="txt-2">
                  {["A", "N", "A", "L", "Y", "Z", "I", "N", "G"].map((char, index) => (
                    <span key={index} className="btn-letter">{char}</span>
                  ))}
                </div>
              </div>
            </button>
          </div>
        </form>

        {/* Dynamic State Layout Rendering Gate */}
        <div className="w-full transition-all duration-500">
          
          {/* Active Jet Speed Loader Screen Container */}
          {loading && (
            <div className="loader-container bg-white/40 border border-slate-200/40 rounded-3xl backdrop-blur-sm shadow-inner p-8">
              <div className="loader">
                <span><span></span><span></span><span></span><span></span></span>
                <div className="base">
                  <span></span>
                  <div className="face"></div>
                </div>
              </div>
              <div className="longfazers">
                <span></span><span></span><span></span><span></span>
              </div>
              <p className="absolute bottom-6 text-slate-400 text-xs tracking-widest font-semibold uppercase animate-pulse">
                Sourcing Financial Intelligence Layers...
              </p>
            </div>
          )}

          {/* Graceful Fallback Error Output Box */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200/60 text-rose-600 rounded-2xl text-sm font-medium shadow-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Complete Live Investment Intelligence Dashboard Return Block */}
          {analysis && (
            <div className="w-full text-left bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 animate-fade-in space-y-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{ticker.toUpperCase()} Analysis Run</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">COMPILING SOURCE REPOSITORIES NATIVE VERIFICATION</p>
                </div>
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold tracking-widest">
                  MISTRAL-7B ENGINE
                </div>
              </div>

              {/* Dynamic Analysis Report Text Display Output Panel */}
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
                {typeof analysis === 'string' ? (
                  <p className="whitespace-pre-line font-medium text-slate-800">{analysis}</p>
                ) : analysis.report ? (
                  <p className="whitespace-pre-line font-medium text-slate-800">{analysis.report}</p>
                ) : (
                  <pre className="text-xs bg-slate-100 p-4 rounded-xl overflow-x-auto">{JSON.stringify(analysis, null, 2)}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Decorative Liquid Glass Bottom Colorful Grid Block Strip */}
      <footer className="w-full max-w-7xl mx-auto px-6 pb-6 pt-12 relative z-0">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 max-w-3xl mx-auto opacity-80 mix-blend-multiply">
          <div className="h-12 bg-blue-200/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
          <div className="h-12 bg-blue-300/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner sm:block hidden"></div>
          <div className="h-12 bg-indigo-200/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
          <div className="h-12 bg-indigo-300/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
          <div className="h-12 bg-purple-200/50 rounded-xl backdrop-blur-md border border-white/50 shadow-inner"></div>
          <div className="h-12 bg-purple-300/60 rounded-xl backdrop-blur-md border border-white/60 shadow-lg"></div>
          <div className="h-12 bg-purple-400/50 rounded-xl backdrop-blur-md border border-white/50 shadow-lg"></div>
          <div className="h-12 bg-fuchsia-300/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
          <div className="h-12 bg-fuchsia-200/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
          <div className="h-12 bg-pink-200/30 rounded-xl backdrop-blur-md border border-white/30 shadow-inner sm:block hidden"></div>
          <div className="h-12 bg-orange-200/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
          <div className="h-12 bg-amber-100/40 rounded-xl backdrop-blur-md border border-white/40 shadow-inner"></div>
        </div>
      </footer>
    </div>
  );
}
