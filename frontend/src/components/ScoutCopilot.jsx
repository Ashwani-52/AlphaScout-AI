import { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const SUGGESTED_QUESTIONS = (ticker) => [
  `Is ${ticker} safe for a beginner?`,
  `Explain the biggest risk factor for ${ticker}`,
  `What does its P/E ratio mean?`,
];

export default function ScoutCopilot({ ticker, reportReady }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Welcome to AlphaScout Core Terminal. I'm your active co-pilot. Ask me anything about ${ticker} or general investing logic!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: 'user', text: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          question,
          // send prior turns so the model has conversational context
          history: nextMessages.slice(-7, -1),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Copilot request failed');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.message || "I couldn't process that just now — try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  return (
    <div className="copilot-panel">
      <div className="copilot-header">
        <div>
          <div className="copilot-title-row">
            <span className="copilot-dot" />
            <span className="copilot-title">Scout Copilot v1.2</span>
          </div>
          <span className="copilot-context">
            System Context: <strong>{ticker}</strong>
          </span>
        </div>
        <span className="copilot-status-pill">
          {reportReady ? 'Agent Ready' : 'Waiting for Report'}
        </span>
      </div>

      <div className="copilot-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`copilot-bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="copilot-bubble assistant copilot-typing">
            <span /><span /><span />
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="copilot-suggestions">
          {SUGGESTED_QUESTIONS(ticker).map((q) => (
            <button key={q} className="copilot-chip" onClick={() => sendMessage(q)} disabled={loading}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="copilot-input-row">
        <input
          className="copilot-input"
          placeholder={`Ask about ${ticker} macro signals...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!reportReady}
        />
        <button
          className="copilot-send-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          →
        </button>
      </div>
    </div>
  );
}
