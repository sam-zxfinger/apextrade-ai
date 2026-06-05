'use client';

import { useState, useEffect } from 'react';
import { Signal, Ticker, Portfolio } from '@/lib/types';
import { generateWatchlist, generateSignals, generatePortfolio } from '@/lib/mockData';

export default function OverlayPage() {
  const [mounted, setMounted] = useState(false);
  const [watchlist, setWatchlist] = useState<Ticker[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    document.body.style.background = 'transparent'; // For overlay apps like Electron
    
    const tkrs = generateWatchlist();
    setWatchlist(tkrs);
    const port = generatePortfolio();
    setPortfolio(port);
    setSignals(generateSignals(tkrs, port.equity, 1));
    setMounted(true);
  }, []);

  if (!mounted || !portfolio) return null;

  return (
    <div className="overlay-window" style={{ 
      display: 'flex', flexDirection: 'column', 
      border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', 
      overflow: 'hidden', height: '100vh', width: '100vw',
      boxShadow: 'var(--shadow-glow)'
    }}>
      {/* Top Drag Handle / Header */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', WebkitAppRegion: 'drag' } as any}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="live-dot" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>ApexTrade <span style={{color:'var(--cyan)'}}>AI</span></span>
        </div>
        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: portfolio.dailyPnL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {portfolio.dailyPnL >= 0 ? '+' : ''}₹{portfolio.dailyPnL.toFixed(0)}
        </div>
      </div>

      {/* Mini Watchlist */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Live Signals</div>
        {signals.slice(0, 3).map(s => (
          <div key={s.id} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: '8px', marginBottom: 6, border: `1px solid ${s.side === 'long' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{s.symbol}</span>
              <span style={{ fontSize: '0.6875rem', color: s.side === 'long' ? 'var(--success)' : 'var(--danger)', fontWeight: 800 }}>{s.side.toUpperCase()} @ {s.entry}</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Score: <span style={{color: 'var(--cyan)'}}>{s.confidence}</span> / Target: {s.targets[0]?.price}</div>
          </div>
        ))}

        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>Open Positions ({portfolio.openPositions.length})</div>
        {portfolio.openPositions.slice(0, 3).map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.symbol}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: p.unrealizedPnL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {p.unrealizedPnL >= 0 ? '+' : ''}₹{p.unrealizedPnL.toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div style={{ padding: '8px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.6875rem', padding: '4px' }}>Dashboard</button>
        <button className="btn btn-kill" style={{ flex: 1, fontSize: '0.6875rem', padding: '4px' }}>KILL ALL</button>
      </div>
    </div>
  );
}
