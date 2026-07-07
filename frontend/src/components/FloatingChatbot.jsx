import { useState, useEffect, useRef } from 'react';

export default function FloatingChatbot({ currentTicker = "the market" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'agent', 
      text: `Welcome to AlphaScout Core Terminal. I am your active co-pilot. Ask me anything about ${currentTicker} or general investing logic!` 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll inside chat drawer when text updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Contextual starter prompt chips for beginners
  const starterPrompts = [
    `Is ${currentTicker} safe for a beginner?`,
    `Explain the biggest risk factor for ${currentTicker}`,
    `What does its P/E ratio mean?`
  ];

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Append user query message block
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate real-time streaming model response engine turnaround
    setTimeout(() => {
      let agentReply = `I've analyzed the telemetry layers for ${currentTicker}. Structurally, the technical support levels are consolidating. Balance sheet variables remain steady, but keep a close eye on the macro risk matrix highlighted on your right panel before allocating capital.`;
      
      if (textToSend.toLowerCase().includes('p/e')) {
        agentReply = `The Price-to-Earnings (P/E) ratio shows what investors are willing to pay today for every $1 of earnings. A high P/E implies expectations of massive future growth, but leaves less margin for error if earnings disappoint.`;
      } else if (textToSend.toLowerCase().includes('risk')) {
        agentReply = `The primary threat vector right now is systemic valuation pressure. If inflation tracking indexes shift, institutional algorithms may rotate out of premium tech positions into defensive assets.`;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'agent', text: agentReply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="chatbot-wrapper-node">
      {/* FLOATING ACTION TRIGGER */}
      <button 
        className={`chatbot-trigger-fab ${isOpen ? 'active-flyout' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Investment Copilot"
      >
        {isOpen ? (
          <span className="close-icon-cross">✕</span>
        ) : (
          <div className="fab-core-layout">
            <span className="ai-spark-pulse">⚡</span>
            <span className="fab-label-txt">Scout Copilot</span>
          </div>
        )}
      </button>

      {/* INTERACTIVE CHAT CONSOLE DRAWER */}
      {isOpen && (
        <div className="chatbot-terminal-window">
          <div className="chatbot-terminal-header">
            <div className="header-identity-meta">
              <div className="active-green-status-dot" />
              <div>
                <h4>Scout Copilot v1.2</h4>
                <p>System Context: <span className="ticker-accent-highlight">{currentTicker}</span></p>
              </div>
            </div>
            <span className="terminal-pill-badge">Agent Ready</span>
          </div>

          {/* CHAT LOG STREAM AREA */}
          <div className="chatbot-messages-log">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row alignment-${msg.sender}`}>
                <div className={`chat-bubble surface-${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-bubble-row alignment-agent">
                <div className="chat-bubble surface-agent computational-loading-pulse">
                  <span>Scouting market matrices...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="chatbot-starter-chips-panel">
            {starterPrompts.map((prompt, index) => (
              <button 
                key={index} 
                className="starter-chip-action" 
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <form 
            className="chatbot-input-form-tray" 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
          >
            <input 
              type="text" 
              placeholder={`Ask about ${currentTicker} macro signals...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="send-action-btn" disabled={!inputValue.trim()}>
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
