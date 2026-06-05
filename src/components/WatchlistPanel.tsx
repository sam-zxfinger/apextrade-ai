'use client';

import { useState } from 'react';
import { Ticker } from '@/lib/types';

interface WatchlistPanelProps {
  tickers: Ticker[];
  selected: string;
  onSelect: (symbol: string) => void;
}

const TREND_ICON: Record<string, string> = {
  bullish: '▲', bearish: '▼', sideways: '◆',
};
const TREND_COLOR: Record<string, string> = {
  bullish: 'var(--success)', bearish: 'var(--danger)', sideways: 'var(--warning)',
};

function TinySparkline({ pct }: { pct: number }) {
  const positive = pct >= 0;
  const w = 48; const h = 24;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const x = (i / 7) * w;
    const noise = (Math.random() - 0.5) * 0.4;
    const progress = i / 7;
    const yBase = positive
      ? h - progress * (h * 0.5) - noise * h * 0.15
      : progress * (h * 0.5) + h * 0.1 + noise * h * 0.15;
    return `${x.toFixed(1)},${yBase.toFixed(1)}`;
  });
  const pathD = `M${pts.join(' L')}`;
  const color = positive ? 'var(--success)' : 'var(--danger)';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WatchlistPanel({ tickers, selected, onSelect }: WatchlistPanelProps) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'changePct' | 'rsi14'>('changePct');

  const filtered = tickers
    .filter(t => t.symbol.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'changePct') return Math.abs(b.changePct) - Math.abs(a.changePct);
      return Math.abs(b.rsi14 - 50) - Math.abs(a.rsi14 - 50); // most extreme RSI first
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Watchlist
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tickers.length} symbols</span>
        </div>
        <input
          className="input"
          style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          placeholder="Search symbol..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {/* Sort pills */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {(['changePct', 'rsi14', 'symbol'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                fontSize: '0.6875rem', padding: '2px 7px', borderRadius: 99,
                background: sortBy === s ? 'var(--cyan-dim)' : 'transparent',
                border: `1px solid ${sortBy === s ? 'var(--border-accent)' : 'var(--border)'}`,
                color: sortBy === s ? 'var(--cyan)' : 'var(--text-muted)',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              {s === 'changePct' ? 'Δ%' : s === 'rsi14' ? 'RSI' : 'A-Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Ticker rows */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.map(ticker => {
          const isPos = ticker.changePct >= 0;
          const isSelected = ticker.symbol === selected;
          return (
            <div
              key={ticker.symbol}
              className={`watchlist-row ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(ticker.symbol)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Symbol + exchange */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{ticker.symbol}</span>
                  <span style={{
                    fontSize: '0.625rem', padding: '1px 5px', borderRadius: 3,
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}>{ticker.exchange}</span>
                  <span style={{ fontSize: '0.75rem', color: TREND_COLOR[ticker.trend], marginLeft: 'auto' }}>
                    {TREND_ICON[ticker.trend]}
                  </span>
                </div>
                {/* Price + change */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600 }}>
                    {ticker.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: isPos ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {isPos ? '+' : ''}{ticker.changePct.toFixed(2)}%
                  </span>
                </div>
                {/* Indicators */}
                <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    RSI <span style={{
                      color: ticker.rsi14 > 70 ? 'var(--danger)' : ticker.rsi14 < 30 ? 'var(--success)' : 'var(--text-secondary)',
                      fontWeight: 600
                    }}>{ticker.rsi14}</span>
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    ATR <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {ticker.atr14.toFixed(ticker.price > 1000 ? 0 : 3)}
                    </span>
                  </span>
                </div>
              </div>
              {/* Sparkline */}
              <TinySparkline pct={ticker.changePct} />
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.6875rem', color: 'var(--text-muted)',
        display: 'flex', justifyContent: 'space-between'
      }}>
        <span>Updated {new Date().toLocaleTimeString()}</span>
        <span style={{ color: 'var(--cyan)', cursor: 'pointer' }}>+ Add symbol</span>
      </div>
    </div>
  );
}
