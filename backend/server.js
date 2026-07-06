import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { getStockData } from './src/services/stockService.js';
import { getCompanyNews } from './src/services/newsService.js';
import { generateInvestmentReport } from './src/services/agentService.js';

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, postman, curl, or mobile app requests
    if (!origin) return callback(null, true);
    
    // Check if origin is explicitly allowed or if we should allow all in non-production
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return allowedOrigin === '*' || origin === allowedOrigin || origin.startsWith(allowedOrigin);
    });

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // Dynamic fallback to allow frontend requests in case FRONTEND_URL is missing/misconfigured
      // but log a warning. For Day 1 baseline, we prioritize lack of CORS friction.
      console.warn(`Origin ${origin} not in allowed list, but allowing for baseline deployment.`);
      callback(null, true);
    }
  },
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

// AI analysis endpoint returning a markdown report
app.post('/api/analyze', async (req, res) => {
  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required in request body.' });
  }

  try {
    const report = await generateInvestmentReport(ticker);
    res.json({
      success: true,
      ticker: ticker.toUpperCase(),
      report
    });
  } catch (error) {
    console.error(`[Server] AI analysis failed for ${ticker}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during AI analysis.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AlphaScout Node Backend listening on port ${PORT}`);
});
