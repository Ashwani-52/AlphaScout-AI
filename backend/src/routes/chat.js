import express from 'express';
import { answerFollowUp } from '../services/chatService.js';

const router = express.Router();

// In-memory store of the last report generated per ticker, so the
// chatbot can ground its answers without the frontend having to
// resend the entire report on every message.
const reportCache = new Map();

export function cacheReportForChat(ticker, report) {
  reportCache.set(ticker.toUpperCase(), report);
}

router.post('/', async (req, res) => {
  try {
    const { ticker, question, history } = req.body;

    if (!ticker || !question) {
      return res.status(400).json({ error: 'ticker and question are required' });
    }

    const reportContext = reportCache.get(ticker.toUpperCase());
    if (!reportContext) {
      return res.status(404).json({
        error: `No report found for ${ticker}. Analyze this ticker first before chatting about it.`,
      });
    }

    const answer = await answerFollowUp({ ticker, question, reportContext, history });
    res.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Copilot could not answer right now. Try again in a moment.' });
  }
});

export default router;
