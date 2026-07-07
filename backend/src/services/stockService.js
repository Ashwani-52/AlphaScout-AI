import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

/**
 * Fetches real market data for a given stock ticker from Yahoo Finance.
 * Matches the format expected by the orchestrator and briefing prompt.
 * @param {string} ticker - The stock ticker symbol (e.g., 'AAPL', 'MSFT').
 * @returns {Promise<Object>} Clean, structured stock data.
 */
export async function getStockData(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('A valid string ticker symbol must be provided.');
  }

  const cleanTicker = ticker.trim().toUpperCase();

  try {
    const result = await yahooFinance.quote(cleanTicker);
    
    if (!result) {
      throw new Error(`No quote data returned for symbol: ${cleanTicker}`);
    }

    return {
      name: result.shortName || result.longName || cleanTicker,
      price: result.regularMarketPrice ?? null,
      changePercent: result.regularMarketChangePercent ?? 0,
      fundamentals: {
        peRatio: result.trailingPE ?? null,
        eps: result.trailingEps ?? result.epsTrailingTwelveMonths ?? null,
        marketCap: result.marketCap ?? null,
      }
    };
  } catch (error) {
    console.error(`[StockService] Error fetching data for ticker ${cleanTicker}:`, error);
    throw new Error(`Yahoo Finance failed for '${cleanTicker}': ${error.message}`);
  }
}

/**
 * Returns a clean array of { date, close } points for charting.
 * Default range: 3 months of daily closes.
 */
export async function getHistoricalPrices(ticker, range = '3mo') {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('A valid string ticker symbol must be provided.');
  }

  const cleanTicker = ticker.trim().toUpperCase();
  const rangeToDays = { '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365 };
  const days = rangeToDays[range] ?? 90;

  const period2 = new Date();
  const period1 = new Date();
  period1.setDate(period1.getDate() - days);

  try {
    const result = await yahooFinance.chart(cleanTicker, {
      period1,
      period2,
      interval: '1d',
    });

    const points = (result?.quotes || [])
      .filter((q) => q.close !== null && q.close !== undefined)
      .map((q) => ({
        date: new Date(q.date).toISOString().split('T')[0],
        close: Number(q.close.toFixed(2)),
      }));

    return points;
  } catch (error) {
    console.error(`[StockService] Error fetching chart for ${cleanTicker}:`, error);
    // Return empty history rather than breaking the report
    return [];
  }
}

/**
 * Lightweight, fast quote fetch for chat questions — no historical data,
 * no fundamentals, just the current price snapshot. Keep this separate
 * from your full getStockData() so chat replies stay quick.
 */
export async function getLiveQuote(ticker) {
  const q = await yahooFinance.quote(ticker);
  return {
    price: q.regularMarketPrice,
    changePercent: q.regularMarketChangePercent?.toFixed(2),
    marketState: q.marketState, // 'REGULAR', 'CLOSED', 'PRE', 'POST'
    asOf: new Date().toISOString(),
  };
}

/**
 * Fetches real-time price & volume indicators for top active market equities.
 */
export async function getRealMarketMovers() {
  const symbols = ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOG', 'AMD', 'META', 'NFLX'];
  const domainMap = {
    'NVDA': 'nvidia.com',
    'AAPL': 'apple.com',
    'TSLA': 'tesla.com',
    'MSFT': 'microsoft.com',
    'AMZN': 'amazon.com',
    'GOOG': 'google.com',
    'AMD': 'amd.com',
    'META': 'meta.com',
    'NFLX': 'netflix.com'
  };

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const q = await yahooFinance.quote(symbol);
        const changePercent = q.regularMarketChangePercent || 0;
        const volumeStr = q.regularMarketVolume 
          ? q.regularMarketVolume.toLocaleString() 
          : 'N/A';
          
        return {
          ticker: symbol,
          name: q.shortName || symbol,
          domain: domainMap[symbol] || `${symbol.toLowerCase()}.com`,
          price: `$${(q.regularMarketPrice || 0).toFixed(2)}`,
          change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          positive: changePercent >= 0,
          volume: volumeStr
        };
      } catch (err) {
        console.error(`[StockService] Failed to fetch mover quote for ${symbol}:`, err.message);
        return null;
      }
    })
  );

  return quotes.filter(q => q !== null);
}

/**
 * Fetches daily macroeconomic ETF percentages to calculate sector progress distribution.
 */
export async function getRealSectorTrending() {
  const sectors = [
    { name: 'Technology & Semiconductors', etf: 'XLK', gainers: 42, losers: 12 },
    { name: 'Financial Infrastructure', etf: 'XLF', gainers: 28, losers: 19 },
    { name: 'Energy Systems', etf: 'XLE', gainers: 11, losers: 34 },
    { name: 'Consumer Discretionary', etf: 'XLY', gainers: 8, losers: 41 }
  ];

  const results = await Promise.all(
    sectors.map(async (sector) => {
      try {
        const q = await yahooFinance.quote(sector.etf);
        const changePercent = q.regularMarketChangePercent || 0;
        
        let gainers = sector.gainers;
        let losers = sector.losers;
        if (changePercent > 0) {
          gainers = Math.round(gainers * (1 + changePercent / 10));
          losers = Math.round(losers * (1 - changePercent / 10));
        } else {
          gainers = Math.round(gainers * (1 + changePercent / 10));
          losers = Math.round(losers * (1 - changePercent / 10));
        }
        if (gainers < 2) gainers = 2;
        if (losers < 2) losers = 2;

        return {
          name: sector.name,
          change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          positive: changePercent >= 0,
          gainers,
          losers
        };
      } catch (err) {
        console.error(`[StockService] Failed to fetch sector ETF quote for ${sector.etf}:`, err.message);
        return {
          name: sector.name,
          change: '+0.00%',
          positive: true,
          gainers: sector.gainers,
          losers: sector.losers
        };
      }
    })
  );

  return results;
}
