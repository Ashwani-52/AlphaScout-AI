export function buildReportPrompt({ ticker, stockData, sentiment, peers }) {
  const peerSummary = peers && peers.length > 0
    ? peers.map(p => `${p.symbol}: price $${p.price}, P/E ${p.peRatio ?? 'N/A'}, market cap ${p.marketCap ?? 'N/A'}`).join('; ')
    : 'No peer data available.';

  return `You are a financial research analyst. Using ONLY the real data provided below,
write a structured investment briefing. Do not invent any numbers — only reason about
the ones given. Respond with ONLY valid JSON, no markdown, no preamble, matching this
exact shape:

{
  "overview": "2-3 sentences on what the company does and its current market position",
  "technicalSignal": "1-2 sentences interpreting the price trend and momentum",
  "peerStanding": "1-2 sentences on how this company compares to its peers below",
  "risks": "1-2 sentences on the key risks an investor should weigh",
  "verdict": "One of: Strong Buy, Buy, Hold, Sell, Strong Sell — plus a 1-sentence justification"
}

=== REAL DATA ===
Ticker: ${ticker}
Company: ${stockData.name}
Current price: $${stockData.price} (${stockData.changePercent}% change)
Fundamentals: P/E ${stockData.fundamentals?.peRatio ?? 'N/A'}, EPS ${stockData.fundamentals?.eps ?? 'N/A'}, Market Cap ${stockData.fundamentals?.marketCap ?? 'N/A'}
News sentiment: ${sentiment.label} (confidence ${sentiment.score})
Peer comparison: ${peerSummary}
`;
}
