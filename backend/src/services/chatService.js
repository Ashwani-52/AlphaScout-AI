import { queryLLM } from './llmService.js';
import { getLiveQuote } from './stockService.js';

const GREETING_RE = /^(hi|hello|hey|yo|sup|good\s(morning|afternoon|evening))[\s!.]*$/i;
const THANKS_RE = /^(thanks|thank you|thx|ty)[\s!.]*$/i;

/**
 * Answers a follow-up question about a ticker. Handles three cases:
 * 1. Small talk (greetings/thanks) — instant canned reply, no LLM call needed.
 * 2. Real-time data questions — fetches a FRESH live quote before answering,
 *    so price/volume questions reflect right now, not the report's snapshot.
 * 3. Everything else — grounded in the existing report, with live quote
 *    attached too so the model always has current numbers on hand.
 */
export async function answerFollowUp({ ticker, question, reportContext, history = [] }) {
  const trimmed = question.trim();

  // Fast path — no need to burn an LLM call on "hi"
  if (GREETING_RE.test(trimmed)) {
    return `Hey! I'm Scout Copilot — ask me anything about ${ticker}'s numbers, risks, or what the report means.`;
  }
  if (THANKS_RE.test(trimmed)) {
    return `Anytime! Let me know if anything else about ${ticker} is unclear.`;
  }

  // Scan for alternative ticker mentioned in the question (ignoring common words)
  const words = trimmed.match(/\b[A-Za-z]{3,5}\b/g) || [];
  const commonWords = new Set([
    'the', 'is', 'of', 'for', 'and', 'you', 'your', 'are', 'any', 'can', 'how', 
    'why', 'who', 'our', 'out', 'off', 'not', 'but', 'yes', 'now', 'get', 'has', 
    'did', 'does', 'make', 'just', 'same', 'will', 'was', 'its', 'all', 'him', 
    'her', 'them', 'they', 'his', 'their', 'into', 'with', 'from', 'this', 'that', 
    'these', 'those', 'than', 'then', 'also', 'very', 'here', 'there', 'when', 
    'been', 'have', 'had', 'done', 'some', 'many', 'much', 'each', 'both', 'only', 
    'such', 'like', 'what', 'sells', 'time', 'date', 'show', 'tell', 'news', 
    'price', 'stock', 'share', 'good', 'info', 'risks', 'about', 'trend', 'chart', 
    'close', 'high', 'value', 'helps', 'means', 'trade', 'asset', 'buyer', 
    'sell', 'today', 'more', 'would', 'could', 'should', 'which', 'asked'
  ]);

  let activeTicker = ticker.toUpperCase();
  let detectedTicker = null;
  for (const word of words) {
    const upperWord = word.toUpperCase();
    if (upperWord !== ticker.toUpperCase() && !commonWords.has(word.toLowerCase())) {
      detectedTicker = upperWord;
      break;
    }
  }

  let liveQuote = null;
  if (detectedTicker) {
    try {
      liveQuote = await getLiveQuote(detectedTicker);
      activeTicker = detectedTicker;
    } catch (err) {
      console.warn(`[ChatService] Failed to fetch live quote for alternative ticker ${detectedTicker}, falling back to primary ${ticker}`);
    }
  }

  // Fetch primary ticker live quote if alternative fetch didn't run or failed
  if (!liveQuote) {
    try {
      liveQuote = await getLiveQuote(ticker);
      activeTicker = ticker.toUpperCase();
    } catch {
      liveQuote = null; // fall back to report snapshot if this fails
    }
  }

  const contextBlock = `
Ticker: ${activeTicker}
Overview: ${activeTicker === ticker.toUpperCase() ? reportContext.overview : `Live profile query for ${activeTicker}.`}
Technical Signal: ${activeTicker === ticker.toUpperCase() ? reportContext.technicalSignal : `Technical indicators mapping for ${activeTicker}.`}
Peer Standing: ${activeTicker === ticker.toUpperCase() ? reportContext.peerStanding : `Sector standings for ${activeTicker}.`}
Risks: ${activeTicker === ticker.toUpperCase() ? reportContext.risks : `Macro risk vectors for ${activeTicker}.`}
Verdict: ${activeTicker === ticker.toUpperCase() ? reportContext.verdict : `Investment status for ${activeTicker}.`}

LIVE DATA (fetched right now, use this over any older number):
${liveQuote
  ? `Current price: $${liveQuote.price} | Change today: ${liveQuote.changePercent}% | Market state: ${liveQuote.marketState}`
  : `Live quote unavailable.`}
`.trim();

  const historyBlock = history
    .slice(-6)
    .map((h) => `${h.role === 'user' ? 'User' : 'Copilot'}: ${h.text}`)
    .join('\n');

  const prompt = `You are Scout Copilot, a friendly financial assistant embedded in an
investment research dashboard, currently focused on ${activeTicker}. You have access to
an existing research report AND a live price quote (both below).

Guidelines:
- Answer naturally and conversationally — vary your wording, don't repeat canned phrases.
- For price/data questions, use the LIVE DATA block, not older numbers.
- If the market state shows "CLOSED", say so and mention that's the last available price.
- For general investing concepts (e.g. "what does P/E mean"), explain simply.
- If asked about a different ticker or something totally outside this data, say
  you don't have that information rather than guessing.
- Keep answers to 2-4 sentences. Plain language.

=== REPORT + LIVE DATA FOR ${activeTicker} ===
${contextBlock}

=== CONVERSATION SO FAR ===
${historyBlock || '(none yet)'}

=== NEW QUESTION ===
${trimmed}

Answer:`;

  try {
    const response = await queryLLM(prompt);
    return response.trim();
  } catch (error) {
    console.warn(`[ChatService] LLM gateway failed (${error.message}). Using context-grounded fallback response engine.`);

    const qLower = trimmed.toLowerCase();
    const currentPriceStr = liveQuote 
      ? `$${liveQuote.price} (representing a change of ${liveQuote.changePercent}% today with market state being ${liveQuote.marketState})`
      : `$${reportContext.priceSummary?.current || 'N/A'} (from previous analysis snapshot)`;

    if (activeTicker !== ticker.toUpperCase()) {
      return `For ${activeTicker}: Based on real-time data, the current price is ${currentPriceStr}. I don't have the full cached report for ${activeTicker} (we are currently analyzing ${ticker}), but you can type ${activeTicker} in the search bar above to generate a full analysis report!`;
    }

    if (qLower.includes('price') || qLower.includes('close') || qLower.includes('value') || qLower.includes('cost') || qLower.includes('current') || qLower.includes('sell') || qLower.includes('buy')) {
      return `Based on live data, the current price for ${ticker} is ${currentPriceStr}. ${reportContext.technicalSignal}`;
    }
    if (qLower.includes('risk') || qLower.includes('danger') || qLower.includes('threat') || qLower.includes('weak') || qLower.includes('bad')) {
      return `For ${ticker}, the primary threat vectors identified in our analysis are: ${reportContext.risks}`;
    }
    if (qLower.includes('pe') || qLower.includes('p/e') || qLower.includes('ratio') || qLower.includes('valuation') || qLower.includes('worth')) {
      return `Analyzing ${ticker}'s valuation metrics: ${reportContext.peerStanding}`;
    }
    if (qLower.includes('verdict') || qLower.includes('conclusion') || qLower.includes('opinion') || qLower.includes('recommendation')) {
      return `The research engine's verdict for ${ticker} is: ${reportContext.verdict}. ${reportContext.overview}`;
    }
    if (qLower.includes('technical') || qLower.includes('chart') || qLower.includes('support') || qLower.includes('resistance') || qLower.includes('average')) {
      return `Technical signals report that: ${reportContext.technicalSignal}`;
    }

    // Generic descriptive fallback response grounding
    return `Regarding ${ticker}: the current price is ${currentPriceStr} with an overall investment verdict of ${reportContext.verdict}. Primary risks include: ${reportContext.risks}`;
  }
}
