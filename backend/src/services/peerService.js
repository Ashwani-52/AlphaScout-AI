import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const MODULE_OPTS = {
  fetchOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive'
    }
  }
};

/**
 * Finds peer/competitor tickers dynamically using Yahoo Finance's
 * "recommendationsBySymbol" endpoint (free, no API key).
 * Then pulls a quick quote snapshot for each peer so we can compare
 * price, market cap, and P/E side by side.
 */
export async function getPeerComparison(ticker, limit = 4) {
  try {
    const recs = await yahooFinance.recommendationsBySymbol(ticker, {}, MODULE_OPTS);
    const peerSymbols = (recs?.recommendedSymbols || [])
      .slice(0, limit)
      .map((r) => r.symbol);

    if (peerSymbols.length === 0) {
      return { available: false, peers: [] };
    }

    const peerQuotes = await Promise.all(
      peerSymbols.map(async (symbol) => {
        try {
          const q = await yahooFinance.quote(symbol, {}, MODULE_OPTS);
          return {
            symbol,
            name: q.shortName || symbol,
            price: q.regularMarketPrice ?? null,
            changePercent: q.regularMarketChangePercent ?? null,
            marketCap: q.marketCap ?? null,
            peRatio: q.trailingPE ?? null,
          };
        } catch {
          // Skip peers that fail to resolve — don't fail the whole comparison
          return null;
        }
      })
    );

    return {
      available: true,
      peers: peerQuotes.filter(Boolean),
    };
  } catch (err) {
    // Yahoo sometimes has no recommendations for smaller/foreign tickers.
    // Fail gracefully rather than breaking the whole report.
    return { available: false, peers: [], reason: 'No peer data available for this ticker.' };
  }
}
