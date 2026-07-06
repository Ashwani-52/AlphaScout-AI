import PriceChart from './PriceChart';
import ComparisonTable from './ComparisonTable';

function verdictClass(verdict) {
  if (!verdict) return 'neutral';
  const v = verdict.toLowerCase();
  if (v.includes('buy')) return 'good';
  if (v.includes('sell')) return 'bad';
  return 'neutral';
}

function sentimentLabel(sentiment) {
  if (!sentiment) return null;
  const label = sentiment.label?.toLowerCase();
  const cls = label === 'positive' || label === 'bullish' ? 'good'
    : label === 'negative' || label === 'bearish' ? 'bad'
    : 'neutral';
  return { text: sentiment.label, cls };
}

export default function Briefing({ result }) {
  if (!result) return null;
  const sentiment = sentimentLabel(result.sentiment);

  return (
    <div className="briefing w-full max-w-2xl mx-auto bg-white/80 border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 backdrop-blur-md text-left transition-all duration-500 animate-fade-in space-y-6">
      <div className="briefing-header flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
        <div>
          <h2 className="briefing-title text-2xl font-bold text-slate-900">{result.companyName}</h2>
          <span className="briefing-ticker text-xs font-mono font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded mt-1.5 inline-block">{result.ticker}</span>
        </div>
        <span className={`verdict-badge px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-white ${verdictClass(result.verdict)}`}>
          {result.verdict || 'Verdict Pending'}
        </span>
      </div>

      <section className="briefing-section space-y-2">
        <span className="section-label text-xs font-bold tracking-wider uppercase text-blue-600">Company Overview</span>
        <p className="text-slate-600 leading-relaxed text-sm font-medium">{result.overview}</p>
      </section>

      <section className="briefing-section space-y-2">
        <span className="section-label text-xs font-bold tracking-wider uppercase text-blue-600">Price Chart — Last 3 Months</span>
        <PriceChart data={result.historicalPrices} />
      </section>

      <div className="briefing-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="briefing-section space-y-2">
          <span className="section-label text-xs font-bold tracking-wider uppercase text-blue-600">Technical Signal</span>
          <p className="text-slate-600 leading-relaxed text-sm font-medium">{result.technicalSignal}</p>
        </section>

        <section className="briefing-section space-y-2">
          <span className="section-label flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-600">
            News Sentiment
            {sentiment && <span className={`inline-dot w-2 h-2 rounded-full inline-block ${sentiment.cls}`} />}
          </span>
          <p className="text-slate-600 leading-relaxed text-sm font-medium capitalize">{sentiment ? sentiment.text : 'No sentiment data'}</p>
        </section>
      </div>

      <section className="briefing-section space-y-2">
        <span className="section-label text-xs font-bold tracking-wider uppercase text-blue-600">Peer Standing & Market Stats</span>
        <p className="text-slate-600 leading-relaxed text-sm font-medium mb-3">{result.peerStanding}</p>
        <ComparisonTable peers={result.peers} available={result.peersAvailable} />
      </section>

      <section className="briefing-section space-y-2">
        <span className="section-label text-xs font-bold tracking-wider uppercase text-blue-600">Risks to Consider</span>
        <p className="text-slate-600 leading-relaxed text-sm font-medium">{result.risks}</p>
      </section>
    </div>
  );
}
