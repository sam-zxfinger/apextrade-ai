'use client';

import { Signal, AutomationLevel } from '@/lib/types';

interface SignalCardProps {
  signal: Signal;
  automationLevel: AutomationLevel;
  onApprove: (signal: Signal) => void;
  onReject: (signal: Signal) => void;
  onExpand: (signal: Signal) => void;
  accountMode: 'demo' | 'real';
}

const STRATEGY_LABEL: Record<string, string> = {
  breakout: 'Breakout', pullback: 'Pullback', reversal: 'Reversal',
  continuation: 'Continuation', swing_entry: 'Swing Entry', momentum: 'Momentum', mean_reversion: 'Mean Rev.',
};
const WARNING_LABEL: Record<string, string> = {
  stale_data: '⚠ Stale Data', high_volatility: '🔥 High Vol', event_risk: '📰 Event Risk',
  low_liquidity: '💧 Low Liq', earnings_ahead: '📊 Earnings', news_risk: '📰 News Risk',
};

function ConfidenceRing({ value, size = 60 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? 'var(--success)' : value >= 65 ? 'var(--cyan)' : 'var(--warning)';
  return (
    <div className="confidence-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.07)" strokeWidth="5" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={color}
          strokeWidth="5" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="ring-value" style={{ fontSize: size < 55 ? '0.6875rem' : '0.8125rem', color }}>
        <span style={{ fontWeight: 800 }}>{value}</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  const color = pct > 75 ? 'var(--success)' : pct > 45 ? 'var(--cyan)' : 'var(--warning)';
  return (
    <div className="score-item">
      <span className="score-label">{label}</span>
      <div className="score-bar">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <span className="score-val">{value.toFixed(0)}</span>
    </div>
  );
}

export default function SignalCard({
  signal, automationLevel, onApprove, onReject, onExpand, accountMode,
}: SignalCardProps) {
  const isLong = signal.side === 'long';
  const rr = signal.targets[0]
    ? (Math.abs(signal.targets[0].price - signal.entry) / Math.abs(signal.entry - signal.stop)).toFixed(2)
    : '—';

  const canExecute = automationLevel >= 2;
  const isAutoMode = automationLevel >= 4;

  return (
    <div
      className={`signal-card ${isLong ? 'long-card' : 'short-card'}`}
      onClick={() => onExpand(signal)}
      style={{ animationDelay: `${(signal.rank - 1) * 0.07}s`, opacity: 0 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Confidence ring */}
        <ConfidenceRing value={signal.confidence} size={58} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            {/* Rank */}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
              color: 'var(--text-muted)'
            }}>#{signal.rank}</span>
            {/* Symbol */}
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{signal.symbol}</span>
            {/* Side */}
            <span className={`badge ${isLong ? 'badge-long' : 'badge-short'}`}>
              {isLong ? '▲ LONG' : '▼ SHORT'}
            </span>
            {/* Strategy */}
            <span className="badge badge-cyan">{STRATEGY_LABEL[signal.strategy] ?? signal.strategy}</span>
            {/* Exchange */}
            <span className="badge badge-gray">{signal.exchange}</span>
            {/* Time horizon */}
            <span className="badge badge-violet">{signal.timeHorizon}</span>
          </div>

          {/* Entry / Stop / Target row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Entry', val: signal.entry, color: 'var(--text-primary)' },
              { label: 'Stop', val: signal.stop, color: 'var(--danger)' },
              { label: 'TP1', val: signal.targets[0]?.price, color: 'var(--success)' },
              { label: 'TP2', val: signal.targets[1]?.price, color: 'var(--success)' },
            ].map(({ label, val, color }) => val != null && (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color }}>
                  {val.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            ))}
            {/* R:R */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>R:R</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--cyan)' }}>
                1:{rr}
              </span>
            </div>
            {/* Qty */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {signal.qty}
              </span>
            </div>
            {/* Risk $ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--warning)' }}>
                ₹{signal.riskAmount.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
        <ScoreBar label="Trend (EMA50/200)" value={signal.scores.trendAlignment} max={25} />
        <ScoreBar label="Momentum (RSI/MACD)" value={signal.scores.momentum} max={20} />
        <ScoreBar label="Volume / VWAP" value={signal.scores.volumeVwap} max={15} />
        <ScoreBar label="Risk:Reward ≥1.8" value={signal.scores.riskReward} max={20} />
        <ScoreBar label="ATR Volatility" value={signal.scores.volatilityFit} max={10} />
        <ScoreBar label="Multi-Timeframe" value={signal.scores.multiTimeframe} max={10} />
      </div>

      {/* Rationale */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
        {signal.rationale}
      </p>

      {/* Invalidation */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 8 }}>
        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Invalidation: </span>
        {signal.invalidation}
      </p>

      {/* Warnings */}
      {signal.warnings.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {signal.warnings.map(w => (
            <span key={w} className="badge badge-warning">{WARNING_LABEL[w] ?? w}</span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }} onClick={e => e.stopPropagation()}>
        {canExecute && (
          <>
            <button
              className="btn btn-success btn-sm"
              style={{ flex: 1 }}
              onClick={() => onApprove(signal)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {isAutoMode ? 'Execute' : 'Approve'}
              {accountMode === 'demo' && <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(Demo)</span>}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ flex: 1 }}
              onClick={() => onReject(signal)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Skip
            </button>
          </>
        )}
        {!canExecute && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Set Level ≥2 to act on signals
          </span>
        )}
        <button className="btn btn-ghost btn-sm btn-icon" style={{ marginLeft: 'auto' }} onClick={() => onExpand(signal)} title="Details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
