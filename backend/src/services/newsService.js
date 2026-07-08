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
    console.warn(`[NewsService] Error fetching news for ${cleanTicker}: ${error.message}. Degrading gracefully with empty news array.`);
    return [];
  }
}

/**
 * Fetches headlines for orchestrator compatibility.
 */
export async function getNews(ticker) {
  const items = await getCompanyNews(ticker);
  // The orchestrator promptTemplate expects a plain array of headline strings!
  // Let's check: buildReportPrompt does:
  // sentiment.label
  // peers.map(p => `${p.symbol}: price $${p.price}...`)
  // Wait, does orchestrator expect getNews to return an array of strings or objects?
  // Let's check orchestrator.js:
  // sentiment = news.length > 0 ? await getSentiment(news) : ...
  // and sentimentService.js:
  // newsItems.forEach(item => { const title = (item.title || '').toLowerCase(); ... })
  // So it expects an array of objects containing a `title` property!
  // Our getCompanyNews returns: [{ title, pubDate }, ...] which fits perfectly!
  return items;
}
