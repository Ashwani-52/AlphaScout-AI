import PriceChart from './PriceChart';
import ComparisonTable from './ComparisonTable';

// Determines clear visual signals for retail users
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

export default function Briefing({ result }) {
  if (!result) return null;
  const signal = getActionSignal(result.verdict);

  return (
    <div className="dashboard-container">
      
      {/* 🟢🔴 TRAFFIC LIGHT BINARY ACTION BANNER */}
      <div className={`action-banner ${signal.cls}`}>
        <div className="action-banner-meta">
          <span className="action-tag">System Directive</span>
          <h2 className="action-title">{signal.text}</h2>
          <p className="action-desc">{result.verdict ? `${result.verdict}. ${signal.desc}` : signal.desc}</p>
        </div>
        <div className="action-badge-box">
          <span className="action-label">EXECUTION SIGNAL</span>
          <div className="action-button-simulation">{signal.action}</div>
        </div>
      </div>

      {/* TWO-COLUMN DASHBOARD GRID */}
      <div className="dashboard-grid-layout">
        
        {/* LEFT PRIMARY PANEL: VISUAL TELEMETRY (65% Width) */}
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
        </div>

        {/* RIGHT SIDEBAR PANEL: CONTEXTUAL INTELLIGENCE (35% Width) */}
        <div className="dashboard-sidebar-column">
          <section className="dashboard-card asset-identity-card">
            <span className="ticker-badge-pill">{result.ticker}</span>
            <h3 className="asset-profile-name">{result.companyName}</h3>
            <span className="section-label">Company Profile</span>
            <p className="sidebar-narrative">{result.overview}</p>
          </section>

          <section className="dashboard-card">
            <span className="section-label">Technical Volatility Log</span>
            <p className="sidebar-narrative">{result.technicalSignal}</p>
          </section>

          <section className="dashboard-card">
            <span className="section-label">Macro Risk Registry</span>
            <p className="sidebar-narrative">{result.risks}</p>
          </section>
          
          <section className="dashboard-card">
            <div className="card-header-row">
              <span className="section-label">Algorithmic News Sentiment</span>
              <span className={`sentiment-dot-indicator ${result.sentiment?.label?.toLowerCase() || 'neutral'}`} />
            </div>
            <div className="sentiment-highlight-box">
              {result.sentiment?.label || 'NEUTRAL FEED'}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
