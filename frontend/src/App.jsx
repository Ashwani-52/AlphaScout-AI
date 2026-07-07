import React, { useState } from 'react';
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern';
import { cn } from './lib/utils';
import Briefing from './components/Briefing';

export default function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]); 
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const triggerAnalysis = (e) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);
    setSteps([]); 

    // Open Real-time Server-Sent Events Connection
    const eventSource = new EventSource(`${backendUrl}/api/analyze?ticker=${ticker.toUpperCase()}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'step') {
        // Appending steps dynamically one by one
        setSteps((prevSteps) => [...prevSteps, data.message]);
      } 
      else if (data.type === 'result') {
        setAnalysis(data.report);
        setLoading(false);
        eventSource.close(); 
      } 
      else if (data.type === 'error') {
        setError(data.message);
        setLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setError('Connection to streaming pipeline severed. Verify backend is active.');
      setLoading(false);
      eventSource.close();
    };
  };

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-start overflow-x-hidden">
      
      {/* Premium Light-Mode Animated Grid Background */}
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.06}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-0 h-full w-full skew-y-6 stroke-slate-300/40 fill-slate-300/20",
        )}
        style={{
          position: 'absolute',
          zIndex: 0
        }}
      />

      <header className="w-full max-w-[1560px] mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 animate-pulse"></div>
          <span className="font-semibold text-lg text-slate-800">AlphaScout AI</span>
        </div>
        <div className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-200/60 font-medium">
          Agentic Stream Ready
        </div>
      </header>

      <main className="w-full mx-auto px-6 pt-12 pb-6 z-10 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 mb-6 leading-tight">
          Your next-level <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            investment research
          </span> engine.
        </h1>

        <form onSubmit={triggerAnalysis} className="w-full max-w-xl flex flex-col sm:flex-row gap-4 items-center justify-between mb-10 bg-white p-2.5 rounded-[38px] border border-slate-200 shadow-md">
          <input 
            type="text" 
            placeholder="Enter Stock Ticker (e.g. AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={loading}
            className="w-full px-6 py-3 bg-transparent text-slate-800 font-semibold text-base outline-none placeholder:text-slate-400"
          />
          
          <div className="btn-wrapper w-full sm:w-auto shrink-0">
            <button type="submit" disabled={loading} className={`btn ${loading ? 'is-loading' : ''} w-full sm:w-auto`}>
              <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <div className="txt-wrapper">
                <div className="txt-1">
                  {["A", "N", "A", "L", "Y", "Z", "E"].map((char, i) => <span key={i} className="btn-letter">{char}</span>)}
                </div>
                <div className="txt-2">
                  {["A", "N", "A", "L", "Y", "Z", "I", "N", "G"].map((char, i) => <span key={i} className="btn-letter">{char}</span>)}
                </div>
              </div>
            </button>
          </div>
        </form>

        {/* Live Thought Process Steps Display */}
        <div className="w-full text-left max-w-xl space-y-4 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3 bg-white/80 border border-slate-200/60 px-5 py-3.5 rounded-2xl shadow-sm animate-fade-in">
              {index === steps.length - 1 && loading ? (
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">✓</div>
              )}
              <p className="text-sm font-medium text-slate-700">{step}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="w-full max-w-xl p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Render the unified Price Chart, Competitor Comparison Table, and Report sections */}
        {analysis && <Briefing result={analysis} />}
      </main>

    </div>
  );
}
