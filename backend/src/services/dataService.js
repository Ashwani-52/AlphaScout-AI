import { resolveTicker } from './stockService.js';
import YahooFinance from 'yahoo-finance2';
import Parser from 'rss-parser';

const yahooFinance = new YahooFinance();
const parser = new Parser();

/**
 * Fetches core stock metrics from Yahoo Finance.
 * @param {string} ticker - The stock ticker symbol.
 * @returns {Promise<Object>} Stock metrics.
 */
export async function getStockMetrics(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('A valid string ticker symbol must be provided.');
  }

  const resolvedTicker = await resolveTicker(ticker);

  try {
    const result = await yahooFinance.quote(resolvedTicker);
    
    if (!result) {
      throw new Error(`No quote data returned for symbol: ${resolvedTicker}`);
    }

    return {
      regularMarketPrice: result.regularMarketPrice,
      trailingPE: result.trailingPE,
      marketCap: result.marketCap,
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow
    };
  } catch (error) {
    console.error(`[DataService] Error in getStockMetrics for ${resolvedTicker}:`, error);
    throw new Error(`Yahoo Finance failed for '${resolvedTicker}': ${error.message}`);
  }
}

/**
 * Fetches top 3 headlines from Google News RSS feed.
 * @param {string} ticker - The stock ticker symbol.
 * @returns {Promise<Array<string>>} List of headline titles.
 */
export async function getMarketNews(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('A valid string ticker symbol must be provided.');
  }

  const resolvedTicker = await resolveTicker(ticker);
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(resolvedTicker)}+stock&hl=en-US&gl=US&ceid=US:en`;

  try {
    const feed = await parser.parseURL(feedUrl);
    
    if (!feed || !feed.items) {
      return [];
    }

    // Extract top 3 headline titles
    return feed.items.slice(0, 3).map((item) => item.title);
  } catch (error) {
    console.warn(`[DataService] Error in getMarketNews for ${resolvedTicker}: ${error.message}. Degrading gracefully with empty news array.`);
    return [];
  }
}
