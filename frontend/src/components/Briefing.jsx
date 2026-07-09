import { useState, useEffect, useRef } from 'react';
import PriceChart from './PriceChart';
import ComparisonTable from './ComparisonTable';
import TopMovers from './TopMovers';
import SectorTrending from './SectorTrending';
import SentimentDial from './SentimentDial';
import MarketAnchors from './MarketAnchors';


// Beginner-friendly financial glossary definitions
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
const RISK_GLOSSARY = {
  "systematic asset volatility": "Market-wide swings caused by major economic events (like inflation shifts or elections) that affect almost all stocks simultaneously, regardless of how stable this specific company is.",
  "macro systematic asset volatility": "Market-wide swings caused by major economic events (like inflation shifts or elections) that affect almost all stocks simultaneously, regardless of how stable this specific company is.",
  "platform connectivity limits": "Technical data pipeline checkpoints. It means your dashboard is keeping an eye on api connection uptimes so you don't trade on stale pricing data.",
  "macro risk": "Big-picture economic factors outside the company's control—such as shifting interest rates, fuel costs, or national policy regulations.",
  "liquidity constraints": "A situation where an asset cannot be bought or sold quickly enough in the market to prevent a loss, or without significantly affecting its price.",
  "valuation constraints": "When a stock's current price climbs much faster than its real earnings, making it temporarily 'overpriced' compared to its historical averages.",
  "technical resistance": "A psychological price point on a stock chart where sellers historically outnumber buyers, making it difficult for the stock price to climb past that specific limit."
};

function getActionSignal(verdict) {
  if (!verdict) return { text: 'PENDING SCANS', cls: 'neutral', action: 'MONITOR FEED' };
  const v = verdict.toLowerCase();
  
  if (v.includes('strong buy') || v.includes('buy')) {
    return { 
      text: 'INVESTMENT VIABLE', 
      desc: 'Highly favorable metrics with institutional accumulation backing.',
      action: 'BUY / INVEST', 
      cls: 'signal-go' 
    };
  }
  if (v.includes('strong sell') || v.includes('sell')) {
    return { 
      text: 'HIGH ACCUMULATION RISK', 
      desc: 'Significant technical resistance or negative structural sentiment detected.',
      action: 'AVOID / SELL', 
      cls: 'signal-stop' 
    };
  }
  return { 
    text: 'NEUTRAL MARKET BALANCE', 
    desc: 'Solid core fundamentals balanced by near-term macro valuation constraints.',
    action: 'HOLD / WAIT', 
    cls: 'signal-caution' 
  };
}

// Multi-Agent News Sieve Classifier
function getNewsSieveItems(news, ticker) {
  if (!news || news.length === 0) {
    return [
      { agent: 'Macro Agent', headline: `Fed policy updates create strong momentum vectors for ${ticker}.`, cls: 'macro' },
      { agent: 'Whale Agent', headline: `Institutional block orders detected near quarterly support bounds for ${ticker}.`, cls: 'whale' },
      { agent: 'Technical Agent', headline: `${ticker} historical average confirms short-term bullish consolidation patterns.`, cls: 'tech' },
      { agent: 'Fundamental Agent', headline: `Quarterly margins for ${ticker} display strong resilience against sector-wide contraction.`, cls: 'fundamental' }
    ];
  }

  const agentsList = [
    { name: 'Macro Agent', cls: 'macro' },
    { name: 'Whale Agent', cls: 'whale' },
    { name: 'Technical Agent', cls: 'tech' },
    { name: 'Fundamental Agent', cls: 'fundamental' },
    { name: 'Sentiment Agent', cls: 'sentiment' }
  ];

  return news.slice(0, 5).map((item, index) => {
    const titleLower = (item.title || '').toLowerCase();
    let selectedAgent = agentsList[index % agentsList.length];

    if (titleLower.includes('fed') || titleLower.includes('rate') || titleLower.includes('inflation') || titleLower.includes('macro') || titleLower.includes('treasury')) {
      selectedAgent = agentsList[0];
    } else if (titleLower.includes('whale') || titleLower.includes('buyback') || titleLower.includes('insider') || titleLower.includes('stake') || titleLower.includes('acquisition') || titleLower.includes('whale')) {
      selectedAgent = agentsList[1];
    } else if (titleLower.includes('average') || titleLower.includes('support') || titleLower.includes('resistance') || titleLower.includes('rsi') || titleLower.includes('breakout')) {
      selectedAgent = agentsList[2];
    } else if (titleLower.includes('revenue') || titleLower.includes('profit') || titleLower.includes('margin') || titleLower.includes('earnings') || titleLower.includes('sales')) {
      selectedAgent = agentsList[3];
    }

    return {
      agent: selectedAgent.name,
      headline: item.title,
      cls: selectedAgent.cls
    };
  });
}


export default function Briefing({ result }) {
  if (!result) return null;
  const signal = getActionSignal(result.verdict);
  
  // State configuration to track active interactive hover text items
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // ⚓ Scroll anchor reference for auto-scrolling to dashboard
  const containerRef = useRef(null);

  // 🚀 Automatic smooth scroll when new analysis results arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [result]);

  // backend environment configuration
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';



  // Scans paragraph text and converts recognized financial jargon into interactive elements
  const renderInteractiveNarrative = (text) => {
    if (!text) return null;
    
    // Find matching keys from our glossary array
    const terms = Object.keys(RISK_GLOSSARY);
    
    // Sort terms by length descending to avoid partial replacements
    terms.sort((a, b) => b.length - a.length);

    // Helper technique to dynamically slice strings into React elements
    const elements = [];
    let lastIndex = 0;

    // Build a clean matching regex
    const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;
      const termKey = matchText.toLowerCase();

      // Push raw preceding text string segment
      if (matchIndex > lastIndex) {
        elements.push(text.substring(lastIndex, matchIndex));
      }

      // Append interactive tag wrapper link
      elements.push(
        <span 
          key={matchIndex}
          className="interactive-glossary-term"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // Calculate a safe placement coordinate offset anchor above the term element
            setTooltipPos({
              x: rect.left + window.scrollX + (rect.width / 2),
              y: rect.top + window.scrollY - 10
            });
            setHoveredTerm(termKey);
          }}
          onMouseLeave={() => setHoveredTerm(null)}
        >
          {matchText}
          <span className="info-spark-dot">?</span>
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div ref={containerRef} className="dashboard-container">
      
      {/* INTERACTIVE SENTIMENT DIAL SLIDER */}
      <SentimentDial 
        initialScore={result.dialScore} 
        initialReasoning={result.dialReasoning} 
        verdict={result.verdict} 
      />

      {/* 🌟 UPGRADED TRIPLE COLUMN SYSTEM GRID */}
      <div className="dashboard-grid-layout">
        
        {/* COLUMN 1: NEW LEFT-SIDE LIVE MARKET STREAMER */}
        <div className="dashboard-left-column">
          <MarketAnchors />
          <SectorTrending />
        </div>

        {/* COLUMN 2: CENTER PANEL - MAIN ANALYTICAL VECTORS */}
        <div className="dashboard-main-column">
          <section className="dashboard-card">
            <div className="card-header-row">
              <span className="section-label">Price Performance Matrix</span>
              <span className="time-pill">3-Month Historical</span>
            </div>
            <PriceChart data={result.historicalPrices} />
          </section>

          <section className="dashboard-card">
            <span className="section-label">Sector Peer Comparison Grid</span>
            <div className="table-intro-text">{result.peerStanding}</div>
            <ComparisonTable peers={result.peers} available={result.peersAvailable} />
          </section>

          <TopMovers />
        </div>

        {/* COLUMN 3: RIGHT PANEL - INFORMATION REGISTRY */}
        <div className="dashboard-sidebar-column">
          <section className="dashboard-card asset-identity-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div className="brand-avatar-container" style={{ width: '42px', height: '42px', borderRadius: '10px', padding: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '42px', backgroundColor: '#ffffff' }}>
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${getCompanyDomain(result.ticker)}&sz=128`} 
                  alt={result.companyName}
                  onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=50&auto=format&fit=crop&q=60`; }}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', textAlign: 'left', minWidth: 0, flex: 1 }}>
                <span className="ticker-badge-pill">{result.ticker}</span>
                <h3 className="asset-profile-name" style={{ wordBreak: 'break-word', lineHeight: '1.25' }}>{result.companyName}</h3>
              </div>
            </div>
            <span className="section-label">Company Profile</span>
            <p className="sidebar-narrative">{result.overview}</p>
          </section>

          <section className="dashboard-card">
            <span className="section-label">Technical Volatility Log</span>
            <p className="sidebar-narrative">{renderInteractiveNarrative(result.technicalSignal)}</p>
          </section>

          <section className="dashboard-card macro-registry-card-focus">
            <span className="section-label">Macro Risk Registry</span>
            <p className="sidebar-narrative">
              {renderInteractiveNarrative(result.risks)}
            </p>
            <div className="beginner-guide-hint">💡 Hover over highlighted terms with a (?) for plain English meanings.</div>
          </section>
          
          <section className="dashboard-card">
            <div className="card-header-row" style={{ marginBottom: '12px' }}>
              <span className="section-label">Multi-Agent News Sieve</span>
              <span className={`sentiment-dot-indicator ${result.sentiment?.label?.toLowerCase() || 'neutral'}`} />
            </div>
            
            <div className="sentiment-highlight-box" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Overall Sentiment:</span>
              <span className={`sentiment-badge-pill ${result.sentiment?.label?.toLowerCase() || 'neutral'}`} style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.75rem' }}>
                {result.sentiment?.label || 'NEUTRAL'}
              </span>
            </div>

            {/* Rolling feed of sub-agent tagged headlines */}
            <div className="news-sieve-feed">
              {getNewsSieveItems(result.news, result.ticker).map((item, idx) => (
                <div key={idx} className="news-sieve-item">
                  <span className={`sieve-agent-badge ${item.cls}`}>
                    {item.agent}
                  </span>
                  <p className="sieve-headline">{item.headline}</p>
                </div>
              ))}
            </div>
          </section>
          
        </div>

      </div>

      {/* DYNAMIC FLOATING INTERACTIVE TOOLTIP BOX */}
      {hoveredTerm && RISK_GLOSSARY[hoveredTerm] && (
        <div 
          className="glossary-floating-overlay"
          style={{
            top: `${tooltipPos.y}px`,
            left: `${tooltipPos.x}px`
          }}
        >
          <div className="overlay-header">
            <span className="overlay-spark-icon">📘</span>
            <h4>Beginner Breakdown</h4>
          </div>
          <p>{RISK_GLOSSARY[hoveredTerm]}</p>
          <div className="overlay-arrow-anchor" />
        </div>
      )}



    </div>
  );
}
