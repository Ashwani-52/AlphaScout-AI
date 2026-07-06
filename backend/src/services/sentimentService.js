/**
 * Analyzes the sentiment of a collection of news headlines.
 * Returns a score between 0 and 1, and a label (positive, negative, neutral).
 */
export async function getSentiment(newsItems) {
  if (!newsItems || newsItems.length === 0) {
    return { label: 'neutral', score: 0, reason: 'No recent news found for this ticker.' };
  }

  const positiveWords = ['up', 'bullish', 'growth', 'gain', 'high', 'positive', 'beat', 'surge', 'rise', 'strong', 'profit', 'success', 'expand', 'growth'];
  const negativeWords = ['down', 'bearish', 'loss', 'low', 'negative', 'caution', 'drop', 'decline', 'fall', 'weak', 'risk', 'fail', 'plunge', 'warn'];

  let positiveCount = 0;
  let negativeCount = 0;

  newsItems.forEach(item => {
    const title = (item.title || '').toLowerCase();
    positiveWords.forEach(word => {
      if (title.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (title.includes(word)) negativeCount++;
    });
  });

  const total = positiveCount + negativeCount;
  let score = 0;
  let label = 'neutral';

  if (total > 0) {
    score = Number(((positiveCount - negativeCount) / total).toFixed(2));
    if (score > 0.15) {
      label = 'positive';
    } else if (score < -0.15) {
      label = 'negative';
    }
  }

  return {
    label,
    score: Math.abs(score),
    reason: `Analyzed ${newsItems.length} news headlines. Positive matches: ${positiveCount}, Negative matches: ${negativeCount}.`
  };
}
