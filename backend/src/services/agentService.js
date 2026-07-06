import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { getStockMetrics, getMarketNews } from './dataService.js';

/**
 * Gathers financial and news data for a ticker and generates a structured investment report.
 * @param {string} ticker - The stock ticker symbol.
 * @returns {Promise<string>} The generated markdown investment report.
 */
export async function generateInvestmentReport(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('A valid string ticker symbol must be provided.');
  }

  const cleanTicker = ticker.trim().toUpperCase();

  // 1. Gather data concurrently
  const [metrics, news] = await Promise.all([
    getStockMetrics(cleanTicker),
    getMarketNews(cleanTicker)
  ]);

  // 2. Verify Hugging Face token is defined
  const apiKey = process.env.HUGGINGFACEHUB_API_TOKEN;
  if (!apiKey) {
    throw new Error('Hugging Face API Token (HUGGINGFACEHUB_API_TOKEN) is not defined in environment variables.');
  }

  // 3. Initialize Hugging Face Inference model via LangChain
  const model = new HuggingFaceInference({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    apiKey: apiKey,
    temperature: 0.1,
    maxTokens: 800
  });

  // 4. Formulate the analyst prompt with strict boundaries
  const prompt = `You are a strict Wall Street Analyst. Analyze the following financial metrics and recent news headlines for ${cleanTicker}.
Based ONLY on the provided data, synthesize a concise investment report in markdown format.

### Financial Metrics for ${cleanTicker}:
- Current Price: $${metrics.regularMarketPrice ?? 'N/A'}
- Trailing P/E: ${metrics.trailingPE ?? 'N/A'}
- Market Cap: $${metrics.marketCap ? (metrics.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
- 52-Week High: $${metrics.fiftyTwoWeekHigh ?? 'N/A'}
- 52-Week Low: $${metrics.fiftyTwoWeekLow ?? 'N/A'}

### Recent News Headlines:
${news.map((title, i) => `${i + 1}. "${title}"`).join('\n') || 'No headlines available'}

### Required Output Format:
Your response must strictly match this structure:

# Investment Analysis Report: ${cleanTicker}

**VERDICT: [BUY / HOLD / PASS]**

## Executive Summary
Provide a concise 2-3 sentence overview justifying your verdict based *only* on the P/E valuation, pricing near 52-week boundaries, and recent news sentiment.

## Growth Catalysts
- [Catalyst 1 derived directly from the news or metrics above]
- [Catalyst 2 derived directly from the news or metrics above]

## Core Risks
- [Risk 1 derived directly from the news or metrics above]
- [Risk 2 derived directly from the news or metrics above]

Do not hallucinate facts. If there is no data to support a point, say so. Do not write introductory chatter.

Begin report:`;

  // 5. Invoke the model and return the text output
  try {
    const reportText = await model.invoke(prompt);
    return reportText;
  } catch (error) {
    console.error(`[AgentService] Error generating report for ${cleanTicker}:`, error);
    throw new Error(`LLM generation failed for '${cleanTicker}': ${error.message}`);
  }
}
