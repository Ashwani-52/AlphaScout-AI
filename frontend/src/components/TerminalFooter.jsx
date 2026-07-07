import React from 'react';

export default function TerminalFooter() {
  return (
    <footer className="terminal-footer-container">
      <div className="footer-max-bound">
        <div className="footer-brand-column">
          <div className="footer-logo-row">
            <div className="brand-node-neon"></div>
            <h2>AlphaScout AI</h2>
          </div>
          <p className="footer-corporate-address">
            AlphaScout Deep Tech Cluster, Block E<br />
            Financial District, Tech Hub — 560103
          </p>
          <div className="social-vector-array">
            <a href="#X" className="vector-icon-link">𝕏</a>
            <a href="#GitHub" className="vector-icon-link">🔏</a>
            <a href="#LinkedIn" className="vector-icon-link">💼</a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-nav-group">
            <h4>Terminal Engine</h4>
            <a href="#about">About Core</a>
            <a href="#pricing">Pricing Models</a>
            <a href="#blog">Signals Blog</a>
            <a href="#careers">Careers</a>
          </div>
          <div className="footer-nav-group">
            <h4>Intelligence Tools</h4>
            <a href="#stocks">Live Equities</a>
            <a href="#options">Derivatives Log</a>
            <a href="#algo">Algorithmic Trade</a>
            <a href="#watchlist">Core Watchlist</a>
          </div>
          <div className="footer-nav-group">
            <h4>Security Clearing</h4>
            <a href="#trust">System Trust & Safety</a>
            <a href="#disclaimer">Regulatory Briefings</a>
            <a href="#terms">Terms of Access</a>
          </div>
        </div>
      </div>
      
      <div className="footer-copyright-bar">
        <p>© 2016 - 2026 AlphaScout Systems Inc. All sovereign rights reserved.</p>
        <p className="terminal-version-stamp">System Version: v1.2.4-Stable</p>
      </div>
    </footer>
  );
}
