import { useState } from 'react';
import ScoutCopilot from './ScoutCopilot';

export default function FloatingChatbot({ currentTicker = "the market" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chatbot-wrapper-node">
      {/* 🔘 FLOATING ACTION TRIGGER */}
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

      {/* 💬 INTERACTIVE CHAT CONSOLE DRAWER */}
      {isOpen && (
        <div className="chatbot-terminal-window">
          <ScoutCopilot ticker={currentTicker} reportReady={true} />
        </div>
      )}
    </div>
  );
}
