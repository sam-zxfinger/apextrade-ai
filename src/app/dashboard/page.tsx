'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import WatchlistPanel from '@/components/WatchlistPanel';
import SignalFeed from '@/components/SignalFeed';
import PortfolioPanel from '@/components/PortfolioPanel';
import RiskMeter from '@/components/RiskMeter';
import { 
  Signal, Portfolio, RiskSettings, MarketRegime, Ticker, AutomationLevel, AccountMode
} from '@/lib/types';
import { 
  generateWatchlist, generateMarketRegime, generateSignals, 
  generatePortfolio, DEFAULT_RISK_SETTINGS 
} from '@/lib/mockData';
import { validateSignals } from '@/lib/riskEngine';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [watchlist, setWatchlist] = useState<Ticker[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>('BTCUSDT');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [regime, setRegime] = useState<MarketRegime | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(DEFAULT_RISK_SETTINGS);

  const [toasts, setToasts] = useState<{ id: string; msg: string; type: string }[]>([]);

  useEffect(() => {
    // Initial data load
    const tkrs = generateWatchlist();
    setWatchlist(tkrs);
    setRegime(generateMarketRegime(tkrs));
    const port = generatePortfolio();
    setPortfolio(port);
    
    // Generate initial candidates
    const rawSignals = generateSignals(tkrs, port.equity, riskSettings.riskPerTradePct);
    const { approved } = validateSignals(rawSignals, port, riskSettings);
    setSignals(approved);
    
    setMounted(true);
    
    // Live update simulation
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(t => ({
        ...t,
        price: t.price * (1 + (Math.random() - 0.5) * 0.002),
        rsi14: Math.max(0, Math.min(100, t.rsi14 + (Math.random() - 0.5) * 2))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const showToast = (msg: string, type: 'signal' | 'entry' | 'exit' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleApprove = (signal: Signal) => {
    showToast(`Order placed for ${signal.symbol} (${signal.side.toUpperCase()})`, 'entry');
    setSignals(prev => prev.filter(s => s.id !== signal.id));
    
    // Add to portfolio
    if (portfolio) {
      setPortfolio({
        ...portfolio,
        openPositions: [
          {
            id: Math.random().toString(36).substr(2, 9),
            symbol: signal.symbol,
            exchange: signal.exchange,
            side: signal.side,
            entryPrice: signal.entry,
            currentPrice: signal.entry,
            qty: signal.qty,
            stopLoss: signal.stop,
            takeProfit1: signal.targets[0]?.price || 0,
            takeProfit2: signal.targets[1]?.price || 0,
            openedAt: new Date().toISOString(),
            strategy: signal.strategy,
            unrealizedPnL: 0,
            unrealizedPnLPct: 0,
            status: 'open',
            trailingStopActive: false,
            riskAmount: signal.riskAmount
          },
          ...portfolio.openPositions
        ]
      });
    }
  };

  const handleReject = (signal: Signal) => {
    setSignals(prev => prev.filter(s => s.id !== signal.id));
  };

  const handleClosePosition = (id: string) => {
    if (!portfolio) return;
    const pos = portfolio.openPositions.find(p => p.id === id);
    if (pos) {
      showToast(`Closed ${pos.symbol} position`, 'exit');
      setPortfolio({
        ...portfolio,
        openPositions: portfolio.openPositions.filter(p => p.id !== id)
      });
    }
  };

  if (!mounted || !portfolio || !regime) return null;

  return (
    <div className="dashboard-layout">
      {/* Top Bar */}
      <TopBar
        regime={regime}
        riskSettings={riskSettings}
        portfolio={portfolio}
        onKillSwitch={() => {
          setRiskSettings(s => ({ ...s, killSwitchActive: !s.killSwitchActive }));
          showToast(riskSettings.killSwitchActive ? 'Trading Resumed' : 'EMERGENCY KILL SWITCH ACTIVATED', riskSettings.killSwitchActive ? 'info' : 'error');
        }}
        onModeChange={(mode) => setRiskSettings(s => ({ ...s, accountMode: mode }))}
        onLevelChange={(lvl) => setRiskSettings(s => ({ ...s, automationLevel: lvl }))}
        onOverlay={() => {}}
        pendingCount={signals.length}
      />

      {/* Left Panel - Watchlist */}
      <div className="left-panel">
        <WatchlistPanel 
          tickers={watchlist} 
          selected={selectedTicker} 
          onSelect={setSelectedTicker} 
        />
      </div>

      {/* Center Panel - Signals */}
      <div className="center-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Live Trading Signals
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              AI-ranked setups matching your risk profile.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            const rawSignals = generateSignals(watchlist, portfolio.equity, riskSettings.riskPerTradePct);
            const { approved } = validateSignals(rawSignals, portfolio, riskSettings);
            setSignals(approved);
            showToast('Scanning markets for new setups...', 'info');
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.36 5.36"/>
            </svg>
            Rescan Markets
          </button>
        </div>

        <SignalFeed
          signals={signals}
          automationLevel={riskSettings.automationLevel}
          accountMode={riskSettings.accountMode}
          onApprove={handleApprove}
          onReject={handleReject}
          onExpand={() => {}}
        />
      </div>

      {/* Right Panel - Portfolio */}
      <div className="right-panel">
        <PortfolioPanel 
          portfolio={portfolio} 
          onClosePosition={handleClosePosition} 
        />
      </div>

      {/* Bottom Bar - Risk Meter */}
      <div className="bottombar">
        <RiskMeter portfolio={portfolio} settings={riskSettings} />
      </div>

      {/* Toasts */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
