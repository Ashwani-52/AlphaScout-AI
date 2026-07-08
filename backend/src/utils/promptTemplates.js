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
  "verdict": "One of: Strong Buy, Buy, Hold, Sell, Strong Sell — plus a 1-sentence justification",
  "dialScore": <a number from -100 to 100>,
  "dialReasoning": "1 sentence explaining what pulled the score up or down"
}

=== HOW TO SET dialScore ===
dialScore represents how close this asset is to flipping from Hold into a clear
Buy or Sell signal, on a scale from -100 (strong sell) to +100 (strong buy), with
0 being a perfectly neutral Hold.

Score it using this rubric — weigh each factor roughly by these proportions:
- Technical/price momentum (~35% weight): strong uptrend and volume → push positive;
  downtrend or weakening momentum → push negative.
- Peer standing (~30% weight): outperforming peers on growth/valuation → push positive;
  lagging peers or overvalued vs. them → push negative.
- News sentiment (~35% weight): sustained positive coverage → push positive;
  negative coverage or controversy → push negative.

Rules:
- Do NOT default to 0 out of caution — commit to a real number based on the evidence given.
- If evidence is genuinely mixed or thin, keep it within ±20 of 0 (Hold territory).
- If most factors clearly agree in one direction, score beyond ±50.
- Never output a score more extreme than the evidence supports — this number will
  be shown directly to users on a visual gauge, so it must be defensible from the
  data below, not from general knowledge about this company.

=== REAL DATA ===
Ticker: ${ticker}
Company: ${stockData.name}
Current price: $${stockData.price} (${stockData.changePercent}% change)
Fundamentals: P/E ${stockData.fundamentals?.peRatio ?? 'N/A'}, EPS ${stockData.fundamentals?.eps ?? 'N/A'}, Market Cap ${stockData.fundamentals?.marketCap ?? 'N/A'}
News sentiment: ${sentiment.label} (confidence ${sentiment.score})
Peer comparison: ${peerSummary}
`;
}
