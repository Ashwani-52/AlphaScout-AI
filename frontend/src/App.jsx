import React, { useState, useEffect } from 'react';
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern';
import { cn } from './lib/utils';
import Briefing from './components/Briefing';
import FloatingChatbot from './components/FloatingChatbot';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]); 
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('alphascout_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [shakeLoginButton, setShakeLoginButton] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Search History State
  const [searchHistory, setSearchHistory] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`alphascout_history_${user.email}`);
    return saved ? JSON.parse(saved) : [];
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://alphascout-backend.onrender.com';

  // Sync search history when user signs in or out
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`alphascout_history_${user.email}`);
      setSearchHistory(saved ? JSON.parse(saved) : []);
    } else {
      setSearchHistory([]);
    }
  }, [user]);

  // Click outside profile dropdown to close it
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowDropdown(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const triggerLoginWarning = () => {
    setShowLoginPrompt(true);
    setShakeLoginButton(true);
    setTimeout(() => {
      setShakeLoginButton(false);
    }, 500);
  };

  const handleInputInteraction = (e) => {
    if (!user) {
      e.target.blur(); // Dismiss focus
      triggerLoginWarning();
    }
  };

  const triggerAnalysis = (e, targetTicker = null) => {
    if (e) e.preventDefault();

    // Intercept if unauthenticated
    if (!user) {
      triggerLoginWarning();
      return;
    }

    const activeTicker = targetTicker || ticker;
    if (!activeTicker.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);
    setSteps([]); 

    // Open Real-time Server-Sent Events Connection
    const eventSource = new EventSource(`${backendUrl}/api/analyze?ticker=${activeTicker.toUpperCase()}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'step') {
        setSteps((prevSteps) => [...prevSteps, data.message]);
      } 
      else if (data.type === 'result') {
        setAnalysis(data.report);
        setLoading(false);

        // Append to local search history trail
        const cleanTicker = activeTicker.trim().toUpperCase();
        setSearchHistory((prev) => {
          const filtered = prev.filter(t => t !== cleanTicker);
          const nextHistory = [cleanTicker, ...filtered].slice(0, 5);
          localStorage.setItem(`alphascout_history_${user.email}`, JSON.stringify(nextHistory));
          return nextHistory;
        });

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

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        photoURL: decoded.picture
      };
      localStorage.setItem('alphascout_user', JSON.stringify(googleUser));
      setUser(googleUser);
      setShowLoginPrompt(false);
      setError('');
    } catch (err) {
      console.error('Failed to parse Google OAuth credential:', err);
      setError('Authentication failed. Could not read user profile.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('alphascout_user');
    setUser(null);
    setAnalysis(null);
    setSteps([]);
    setTicker('');
  };

  const hasSearched = !!analysis;

  return (
    /* Dynamic Template String dynamically toggles class names based on state */
    <div className={`app-canvas-container ${hasSearched ? 'has-searched' : 'landing-grid-view'}`}>
      
      {/* Premium Light-Mode Animated Grid Background - ONLY rendered on Landing Hero View */}
      {!hasSearched && (
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
      )}

      {/* Header Container Layout */}
      <header className="w-full max-w-[1560px] mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div 
            onClick={() => { setAnalysis(null); setSteps([]); setTicker(''); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 animate-pulse"></div>
            <span className="font-semibold text-lg text-slate-800">AlphaScout AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-200/60 font-medium">
            Agentic Stream Ready
          </div>
          
          {user ? (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="flex items-center gap-3 relative cursor-pointer select-none"
            >
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
              <img 
                src={user.photoURL} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
              />
              
              {/* Dropdown Menu - explicit click state triggers layout inclusion */}
              {showDropdown && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-lg z-50 p-1 animate-modal-pop"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignOut();
                      setShowDropdown(false);
                    }} 
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`google-auth-header-button ${shakeLoginButton ? 'animate-shake' : ''}`}>
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => setError('Google Authentication gate failed to process request.')}
                prompt="select_account"
                useOneTap={false}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Viewport Content Chassis */}
      <main className={`content-chassis ${hasSearched ? '' : 'landing-chassis'}`}>
        {!hasSearched ? (
          /* INITIAL LANDING PAGE VIEW */
          <div className="flex flex-col items-center text-center">
            
            {showLoginPrompt && (
              <div className="w-full max-w-xl p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-3xl text-sm font-semibold mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <span>🔒 Authentication required. Sign in with Google to query:</span>
                </div>
                <div className="flex items-center gap-2">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={() => setError('Google Authentication gate failed to process request.')}
                    prompt="select_account"
                    useOneTap={false}
                  />
                  <button 
                    onClick={() => setShowLoginPrompt(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold ml-2 cursor-pointer text-base p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 mb-6 leading-tight">
              Your next-level <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                investment research
              </span> engine.
            </h1>

            <form onSubmit={triggerAnalysis} className="w-full max-w-xl flex flex-col sm:flex-row gap-4 items-center justify-between mb-2 bg-white p-2.5 rounded-[38px] border border-slate-200 shadow-md">
              <input 
                type="text" 
                placeholder="Enter Stock Ticker (e.g. WIPRO.NS)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onClick={handleInputInteraction}
                onFocus={handleInputInteraction}
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

            {/* Search History Trail Block */}
            {user && searchHistory.length > 0 && (
              <div className="w-full max-w-xl text-left mt-3 px-2 flex flex-wrap items-center gap-2 animate-fade-in">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Searches:</span>
                {searchHistory.map((hist, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setTicker(hist);
                      triggerAnalysis(null, hist);
                    }}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-all duration-200 font-medium cursor-pointer"
                  >
                    {hist}
                  </button>
                ))}
              </div>
            )}

            {/* Live Thought Process Steps Display */}
            <div className="w-full text-left max-w-xl space-y-4 mt-8 mb-8">
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
          </div>
        ) : (
          /* ACTIVE WHITE DASHBOARD VIEW */
          <div className="dashboard-grid-fadein">
            <div className="flex justify-between items-center mb-6">
              <button 
                className="back-debug-btn" 
                onClick={() => { setAnalysis(null); setSteps([]); setTicker(''); }}
                style={{ margin: 0 }}
              >
                ← Search Another Asset
              </button>
            </div>
            
            <Briefing result={analysis} />
          </div>
        )}
      </main>

      {/* Floating chatbot rendered outside any transformed container to keep it fixed in one place */}
      {analysis && <FloatingChatbot currentTicker={analysis.ticker || "the market"} />}
    </div>
  );
}
