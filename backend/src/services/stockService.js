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
