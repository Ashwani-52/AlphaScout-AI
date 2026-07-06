import Parser from 'rss-parser';

const parser = new Parser();

/**
 * Fetches company stock news from Google News RSS feed.
 * @param {string} ticker - The stock ticker symbol (e.g., 'AAPL', 'MSFT').
 * @returns {Promise<Array<Object>>} Top 5 news headlines with publication dates.
 */
export async function getCompanyNews(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('A valid string ticker symbol must be provided.');
  }

  const cleanTicker = ticker.trim().toUpperCase();
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanTicker)}+stock&hl=en-US&gl=US&ceid=US:en`;

  try {
    const feed = await parser.parseURL(feedUrl);
    
    if (!feed || !feed.items) {
      return [];
    }

    // Extract, clean, and return the top 5 titles and pubDates
    return feed.items.slice(0, 5).map((item) => ({
      title: item.title,
      pubDate: item.pubDate
    }));
  } catch (error) {
    console.error(`[NewsService] Error fetching news for ${cleanTicker}:`, error);
    throw new Error(`Google News RSS failed for '${cleanTicker}': ${error.message}`);
  }
}
