import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { getStockData } from './src/services/stockService.js';
import { getCompanyNews } from './src/services/newsService.js';
import { runResearchAgent } from './src/agent/orchestrator.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'https://alpha-scout-ai.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

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

    sendUpdate('result', { report: resultPayload });

  } catch (error) {
    console.error(`[Server] Analysis failed for ${ticker}:`, error);
    sendUpdate('error', { message: error.message || 'Inference gateway dropped connection during execution loop.' });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AlphaScout Node Backend listening on port ${PORT}`);
});
