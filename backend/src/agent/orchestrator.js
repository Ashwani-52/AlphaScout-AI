import { getStockData, getHistoricalPrices, resolveTicker } from '../services/stockService.js';
import { getNews } from '../services/newsService.js';
import { getSentiment } from '../services/sentimentService.js';
import { getPeerComparison } from '../services/peerService.js';
import { generateReport } from '../services/llmService.js';

/**
 * Orchestrates the full financial research process.
 * Runs fetches concurrently and streams step callbacks.
 */
export async function runResearchAgent(ticker, onStep = () => {}) {
  const resolvedTicker = await resolveTicker(ticker);

  onStep(`Searching global database for ticker symbol: ${resolvedTicker}...`);

  // Parallel data gathering
  const stockDataPromise = getStockData(resolvedTicker);
  const newsPromise = getNews(resolvedTicker);
  const historicalPricesPromise = getHistoricalPrices(resolvedTicker, '3mo');
  const peerDataPromise = getPeerComparison(resolvedTicker);

  const [stockData, news, historicalPrices, peerData] = await Promise.all([
    stockDataPromise,
    newsPromise,
    historicalPricesPromise,
    peerDataPromise,
  ]);

  if (!stockData) {
    throw new Error(`No data found for ticker "${resolvedTicker}". Check the symbol and try again.`);
  }

  onStep(`Scanning regulatory filings, recent 10-K logs, and financial news...`);
  // Artificially wait slightly to allow UX animation pacing
  await new Promise((r) => setTimeout(r, 600));

  onStep(`Extracting market sentiment indices and institutional flows...`);
  const sentiment = news.length > 0
    ? await getSentiment(news)
    : { label: 'neutral', score: 0, reason: 'No recent news found for this ticker.' };
  await new Promise((r) => setTimeout(r, 600));

  onStep(`Feeding aggregated parameters into Hugging Face model clusters...`);
  const report = await generateReport({
    ticker: resolvedTicker,
    stockData,
    sentiment,
    peers: peerData.peers,
  });

  onStep(`Finalizing investment report brief...`);
  await new Promise((r) => setTimeout(r, 400));

  // Assemble and return the complete payload
  return {
    ticker: resolvedTicker,
    companyName: stockData.name,
    priceSummary: {
      current: stockData.price,
      changePercent: stockData.changePercent,
    },
    fundamentals: stockData.fundamentals,
    historicalPrices,
    sentiment,
    news: news || [],
    peers: peerData.available ? peerData.peers : [],
    peersAvailable: peerData.available,
    overview: report.overview,
    technicalSignal: report.technicalSignal,
    peerStanding: report.peerStanding,
    risks: report.risks,
    verdict: report.verdict,
    dialScore: report.dialScore ?? 0,
    dialReasoning: report.dialReasoning ?? '',
  };
}
