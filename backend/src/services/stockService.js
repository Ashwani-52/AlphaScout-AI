import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

/**
 * Fetches real market data for a given stock ticker from Yahoo Finance.
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
      regularMarketPrice: result.regularMarketPrice,
      trailingPE: result.trailingPE,
      marketCap: result.marketCap,
      regularMarketVolume: result.regularMarketVolume,
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow
    };
  } catch (error) {
    console.error(`[StockService] Error fetching data for ticker ${cleanTicker}:`, error);
    throw new Error(`Yahoo Finance failed for '${cleanTicker}': ${error.message}`);
  }
}
