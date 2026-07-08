import React, { useState, useEffect } from 'react';

export default function SentimentDial({ initialScore = 0, initialReasoning = '', verdict = 'Hold' }) {
  const [score, setScore] = useState(initialScore);
  const [isHovered, setIsHovered] = useState(false);
  const [isManual, setIsManual] = useState(false);

  // Sync with initialScore when it changes
  useEffect(() => {
    setScore(initialScore);
    setIsManual(false);
  }, [initialScore]);

  // Determine dynamic zone label and color theme based on score value
  const getZoneDetails = (val) => {
    if (val >= 60) return { label: 'Strong Buy', cls: 'zone-strong-buy', color: '#10b981' };
    if (val >= 20) return { label: 'Buy', cls: 'zone-buy', color: '#22c55e' };
    if (val > -20) return { label: 'Neutral Hold', cls: 'zone-hold', color: '#f59e0b' };
    if (val > -60) return { label: 'Sell', cls: 'zone-sell', color: '#ef4444' };
    return { label: 'Strong Sell', cls: 'zone-strong-sell', color: '#b91c1c' };
  };

  const zone = getZoneDetails(score);

  // Map score [-100, 100] to angle [-90, 90] degrees
  const angle = ((score + 100) / 200) * 180 - 90;

  return (
    <div 
      className="dashboard-card sentiment-dial-card" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        margin: '0 0 24px 0', 
        padding: '28px 36px',
        boxSizing: 'border-box'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="dial-layout-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: GAUGE ARC */}
        <div className="gauge-visual-container" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <svg width="220" height="130" viewBox="0 0 220 130" style={{ overflow: 'visible' }}>
            {/* Background Arc Track */}
            <path 
              d="M 20 110 A 90 90 0 0 1 200 110" 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="14" 
              strokeLinecap="round"
            />
            {/* Color Zone Indications (Mini Arcs) */}
            {/* Sell Zone (Red) */}
            <path 
              d="M 20 110 A 90 90 0 0 1 70 50" 
              fill="none" 
              stroke="#f87171" 
              strokeWidth="14" 
              strokeLinecap="square"
            />
            {/* Hold Zone (Amber) */}
            <path 
              d="M 70 50 A 90 90 0 0 1 150 50" 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth="14" 
              strokeLinecap="square"
            />
            {/* Buy Zone (Green) */}
            <path 
              d="M 150 50 A 90 90 0 0 1 200 110" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="14" 
              strokeLinecap="square"
            />

            {/* Needle Pivot Pin */}
            <circle cx="110" cy="110" r="10" fill="#0f172a" />
            <circle cx="110" cy="110" r="4" fill="#ffffff" />

            {/* Rotating Pointer Needle */}
            <line 
              x1="110" 
              y1="110" 
              x2="110" 
              y2="20" 
              stroke="#0f172a" 
              strokeWidth="4" 
              strokeLinecap="round"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '110px 110px',
                transition: isHovered || isManual ? 'none' : 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            />
          </svg>

          {/* Numeric Value Label under Needle */}
          <div style={{ marginTop: '-15px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{score > 0 ? `+${score}` : score}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Sentiment Score</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DIRECTIVE METADATA */}
        <div className="dial-meta-column" style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
          <div>
            <span className="section-label" style={{ display: 'inline-block', marginBottom: '4px' }}>System Directive</span>
            <h2 className="action-title" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0', color: zone.color }}>
              {zone.label.toUpperCase()} DIRECTIVE
            </h2>
            <p className="action-desc" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              {isManual 
                ? `Exploring hypothetical score adjustments. Verdict resolves to ${zone.label}.` 
                : (initialReasoning || `Algorithmic indicators point to a consensus verdict of ${verdict}.`)}
            </p>
          </div>

          {/* Interactive Range Slider Controls */}
          <div className="slider-control-box" style={{ width: '100%', background: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>BEAR CASE (-100)</span>
              <span>NEUTRAL (0)</span>
              <span>BULL CASE (+100)</span>
            </div>
            <input 
              type="range" 
              min="-100" 
              max="100" 
              value={score} 
              onChange={(e) => {
                setScore(parseInt(e.target.value));
                setIsManual(true);
              }}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: zone.color
              }}
            />
            {isManual && (
              <button 
                onClick={() => {
                  setScore(initialScore);
                  setIsManual(false);
                }}
                style={{
                  marginTop: '10px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
              >
                Reset to AI Signal
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
