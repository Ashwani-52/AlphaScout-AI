import React, { useState, useEffect } from 'react';
import { AnimatedGridPattern } from './components/ui/animated-grid-pattern';
import { cn } from './lib/utils';
import Briefing from './components/Briefing';
import FloatingChatbot from './components/FloatingChatbot';

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [shakeLoginButton, setShakeLoginButton] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Google Login Custom Profile Form State
  const [loginView, setLoginView] = useState('list'); // 'list' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  
  // Search History State
  const [searchHistory, setSearchHistory] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`alphascout_history_${user.email}`);
    return saved ? JSON.parse(saved) : [];
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

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

  const handleSignIn = () => {
    setLoginView('list');
    setCustomName('');
    setCustomEmail('');
    setShowLoginModal(true);
  };

  const completeSignIn = (selectedUser) => {
    localStorage.setItem('alphascout_user', JSON.stringify(selectedUser));
    setUser(selectedUser);
    setShowLoginModal(false);
    setShowLoginPrompt(false);
  };

  const handleCustomSignInSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    // Simulate Google account profile creation
    const simulatedProfile = {
      name: customName.trim(),
      email: customEmail.trim(),
      photoURL: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80`
    };
    completeSignIn(simulatedProfile);
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
            <button 
              onClick={handleSignIn} 
              className={`flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${shakeLoginButton ? 'animate-shake' : ''}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign In with Google
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport Content Chassis */}
      <main className={`content-chassis ${hasSearched ? '' : 'landing-chassis'}`}>
        {!hasSearched ? (
          /* INITIAL LANDING PAGE VIEW */
          <div className="flex flex-col items-center text-center">
            
            {showLoginPrompt && (
              <div className="w-full max-w-xl p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl text-xs font-semibold mb-4 flex items-center justify-between animate-fade-in shadow-sm animate-shake">
                <span>🔒 Authentication required. Please sign in using the Google button in the header.</span>
                <button 
                  onClick={() => setShowLoginPrompt(false)}
                  className="text-blue-500 hover:text-blue-700 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
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

      {/* 🔐 GOOGLE SIGN IN POPUP OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100000] animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl text-center relative animate-modal-pop">
            
            {/* Close button */}
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Back button (Only in Custom Account Form view) */}
            {loginView === 'custom' && (
              <button 
                onClick={() => setLoginView('list')}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm"
              >
                ← Back
              </button>
            )}

            {/* Google Logo */}
            <div className="flex justify-center mb-6">
              <svg className="w-10 h-10" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>

            {loginView === 'list' ? (
              <>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Sign in with Google</h2>
                <p className="text-xs text-slate-400 mb-6">Choose an account to continue to AlphaScout AI</p>

                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Ashwani Kumar', email: 'ashwanikumar@gmail.com', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80' },
                    { name: 'Demo Investor', email: 'investor.demo@alphascout.ai', photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80' }
                  ].map((profile, i) => (
                    <div 
                      key={i}
                      onClick={() => completeSignIn(profile)}
                      className="flex items-center gap-3 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 p-3 rounded-2xl cursor-pointer text-left transition-all duration-200"
                    >
                      <img src={profile.photoURL} alt={profile.name} className="w-10 h-10 rounded-full border border-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{profile.name}</span>
                        <span className="text-xs text-slate-400">{profile.email}</span>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => setLoginView('custom')}
                    className="mt-2 flex items-center justify-center gap-2 border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 p-3 rounded-2xl cursor-pointer text-xs font-bold text-slate-500 hover:text-blue-600 transition-all duration-200 w-full"
                  >
                    👤 Use another account
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleCustomSignInSubmit} className="text-left">
                <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Use another account</h2>
                <p className="text-xs text-slate-400 mb-6 text-center">Sign in using a custom developer identity</p>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center cursor-pointer"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
