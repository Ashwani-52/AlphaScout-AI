import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { getStockData, getRealMarketMovers, getRealSectorTrending, getLiveQuote } from './src/services/stockService.js';
import { getCompanyNews } from './src/services/newsService.js';
import { runResearchAgent } from './src/agent/orchestrator.js';
import chatRoute, { cacheReportForChat } from './src/routes/chat.js';
import sectorsRoute from './src/routes/sectors.js';

// Bypass SSL verification globally in development to prevent corporate SSL inspection/Zscaler proxies from breaking fetches
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('🛡️ [Server] Development environment detected: SSL verification checks disabled globally.');
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'https://alpha-scout-ai.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use('/api/chat', chatRoute);
app.use('/api/market/sectors', sectorsRoute);

// Root health check route
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'AlphaScout AI Node Backend is Live'
  });
});

// Test endpoint for stock data and news extraction
app.get('/api/test/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required.' });
  }

  try {
    const [stockData, news] = await Promise.all([
      getStockData(ticker),
      getCompanyNews(ticker)
    ]);

    res.json({
      ticker: ticker.toUpperCase(),
      stockData,
      news
    });
  } catch (error) {
    console.error(`[Server] Error fetching data for ticker ${ticker}:`, error);
    res.status(500).json({
      error: error.message || 'An error occurred while fetching data.'
    });
  }
});

// AI analysis endpoint returning a server-sent event stream
app.get('/api/analyze', async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker query parameter is required.' });
  }

  // SSE Headers setup to keep connection alive
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendUpdate = (type, payload) => {
    res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
  };

  try {
    const resultPayload = await runResearchAgent(ticker, (stepMessage) => {
      sendUpdate('step', { message: stepMessage });
    });

    cacheReportForChat(ticker, resultPayload);

    sendUpdate('result', { report: resultPayload });

  } catch (error) {
    console.error(`[Server] Analysis failed for ${ticker}:`, error);
    sendUpdate('error', { message: error.message || 'Inference gateway dropped connection during execution loop.' });
  } finally {
    res.end();
  }
});

// Live Stock Quote Proxy Route using Yahoo Finance (aligned with Top Movers)
app.get('/api/live-ticker/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = await getLiveQuote(symbol);
    
    if (!data || data.price === undefined || data.price === null) {
      return res.status(404).json({ error: `No active market data found for symbol: ${symbol}` });
    }

    res.json({
      symbol: symbol,
      price: data.price,
      changePercent: data.changePercent
    });
  } catch (error) {
    console.error(`[Yahoo Finance Proxy] Fetch failure for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: "Failed to fetch live stock quote." });
  }
});

// Real-time Top Movers Endpoint
app.get('/api/market/movers', async (req, res) => {
  try {
    const data = await getRealMarketMovers();
    res.json(data);
  } catch (error) {
    console.error('[Server] Movers fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch movers data' });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 AlphaScout Node Backend listening on port ${PORT}`);
});
