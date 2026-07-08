import express from 'express';
import { getLiveQuote } from '../services/stockService.js';

const router = express.Router();

const SECTORS_CONFIG = [
  {
    name: "Furniture",
    tickers: ["WSM", "RH", "CENTURYPLY.NS"]
  },
  {
    name: "Rubber Products",
    tickers: ["GT", "MRF.NS", "APOLLOTYRE.NS"]
  },
  {
    name: "Batteries",
    tickers: ["ENR", "AMARAJABAT.NS", "EXIDEIND.NS"]
  },
  {
    name: "Oil",
    tickers: ["XOM", "ONGC.NS", "BPCL.NS"]
  },
  {
    name: "Aviation",
    tickers: ["DAL", "INDIGO.NS", "AAL"]
  },
  {
    name: "Waste Management",
    tickers: ["WM", "RSG", "ANTONY.NS"]
  }
];

// Simple in-memory cache
let sectorsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

router.get('/', async (req, res) => {
  const now = Date.now();
  if (sectorsCache && (now - lastCacheTime < CACHE_DURATION)) {
    console.log('[Sectors Route] Serving sector trends from in-memory cache.');
    return res.json(sectorsCache);
  }

  try {
    console.log('[Sectors Route] Cache expired or empty. Querying live stock quotes for sectors...');
    
    const results = await Promise.all(
      SECTORS_CONFIG.map(async (sector) => {
        const quotes = await Promise.all(
          sector.tickers.map(async (ticker) => {
            try {
              // getLiveQuote resolves the ticker and uses User-Agent headers or fallbacks safely
              const quote = await getLiveQuote(ticker);
              return quote.changePercent || 0;
            } catch (err) {
              console.error(`[Sectors Route] Failed to get live quote for ${ticker}:`, err.message);
              return 0;
            }
          })
        );

        let sumChange = 0;
        let advancing = 0;
        let declining = 0;

        quotes.forEach((change) => {
          sumChange += change;
          if (change > 0) {
            advancing++;
          } else {
            declining++;
          }
        });

        const avgChange = parseFloat((sumChange / sector.tickers.length).toFixed(2));

        return {
          sectorName: sector.name,
          avgChange,
          advancing,
          declining
        };
      })
    );

    sectorsCache = results;
    lastCacheTime = now;
    res.json(results);
  } catch (error) {
    console.error('[Sectors Route] Error calculating sector averages:', error);
    res.status(500).json({ error: 'Failed to compile sector averages' });
  }
});

export default router;
