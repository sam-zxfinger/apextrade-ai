'use client';

import { Portfolio, Position } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioPanelProps {
  portfolio: Portfolio;
  onClosePosition: (id: string) => void;
}

function PnLBadge({ value, pct }: { value: number; pct: number }) {
  const pos = value >= 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700,
        color: pos ? 'var(--success)' : 'var(--danger)'
      }}>
        {pos ? '+' : ''}{value.toFixed(2)}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        color: pos ? 'var(--success)' : 'var(--danger)', opacity: 0.8
      }}>
        {pos ? '+' : ''}{pct.toFixed(2)}%
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
        borderRadius: 8, padding: '8px 12px', fontSize: '0.8125rem'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 700 }}>
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioPanel({ portfolio, onClosePosition }: PortfolioPanelProps) {
  const dailyPos = portfolio.dailyPnL >= 0;
  const totalPos = portfolio.totalPnL >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Portfolio
        </span>
      </div>

      {/* Equity + stats */}
      <div style={{ padding: '14px', borderBottom: '1px solid var(--border)' }}>
        {/* Total equity */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Equity</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan)', marginTop: 2 }}>
            ₹{portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Daily P&L', val: portfolio.dailyPnL, pct: portfolio.dailyPnLPct },
            { label: 'Weekly P&L', val: portfolio.weeklyPnL, pct: (portfolio.weeklyPnL / portfolio.equity) * 100 },
            { label: 'Total P&L', val: portfolio.totalPnL, pct: (portfolio.totalPnL / portfolio.equity) * 100 },
            { label: 'Max Drawdown', val: -portfolio.maxDrawdown, pct: -portfolio.maxDrawdown, isDrawdown: true },
          ].map(({ label, val, pct, isDrawdown }) => (
            <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700,
                color: isDrawdown ? 'var(--danger)' : val >= 0 ? 'var(--success)' : 'var(--danger)'
              }}>
                {!isDrawdown && val >= 0 ? '+' : ''}{isDrawdown ? `${pct.toFixed(2)}%` : `₹${val.toFixed(2)}`}
              </div>
              {!isDrawdown && (
                <div style={{ fontSize: '0.6875rem', color: val >= 0 ? 'var(--success)' : 'var(--danger)', opacity: 0.8 }}>
                  {val >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Win rate + margin */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 4 }}>Win Rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>
                {portfolio.winRate}%
              </span>
              <div style={{ flex: 1 }}>
                <div className="progress-track">
                  <div className="progress-fill progress-success" style={{ width: `${portfolio.winRate}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 4 }}>Margin Used</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--warning)' }}>
                {((portfolio.usedMargin / (portfolio.usedMargin + portfolio.availableMargin)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equity Curve */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Equity Curve (30d)</div>
        <div style={{ height: 100 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolio.equityCurve} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="value"
                stroke="var(--cyan)" strokeWidth={2}
                fill="url(#equityGrad)"
                dot={false} activeDot={{ r: 4, fill: 'var(--cyan)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Open Positions */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Open Positions ({portfolio.openPositions.length})
          </span>
        </div>

        {portfolio.openPositions.length === 0 && (
          <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No open positions
          </div>
        )}

        {portfolio.openPositions.map((pos) => {
          const pnlPos = pos.unrealizedPnL >= 0;
          const progressToTP = Math.min(100, Math.max(0,
            ((pos.currentPrice - pos.entryPrice) / (pos.takeProfit1 - pos.entryPrice)) * 100
          ));
          return (
            <div key={pos.id} className="position-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{pos.symbol}</span>
                    <span className={`badge ${pos.side === 'long' ? 'badge-long' : 'badge-short'}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                      {pos.side === 'long' ? '▲' : '▼'} {pos.side.toUpperCase()}
                    </span>
                    {pos.trailingStopActive && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '1px 5px', borderRadius: 99, border: '1px solid var(--border-accent)', fontWeight: 600 }}>
                        TRAIL
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Entry: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {pos.entryPrice.toFixed(2)}
                    </span>
                    {' · '}Qty: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{pos.qty}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    SL: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>{pos.stopLoss.toFixed(2)}</span>
                    {' · '}TP1: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{pos.takeProfit1.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <PnLBadge value={pos.unrealizedPnL} pct={pos.unrealizedPnLPct} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    Now: {pos.currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Progress to TP bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                  <span>Progress to TP1</span>
                  <span>{progressToTP.toFixed(0)}%</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${pnlPos ? 'progress-success' : 'progress-danger'}`}
                    style={{ width: `${Math.abs(progressToTP)}%` }} />
                </div>
              </div>

              {/* Close button */}
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', fontSize: '0.75rem', padding: '4px 0' }}
                onClick={() => onClosePosition(pos.id)}
              >
                Close Position
              </button>
            </div>
          );
        })}
      </div>

      {/* Trade History preview */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Recent Trades ({portfolio.closedTrades.length})
        </div>
        {portfolio.closedTrades.slice(0, 4).map(trade => (
          <div key={trade.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{trade.symbol}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                {trade.exitReason.replace('_', ' ')}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700,
              color: trade.realizedPnL >= 0 ? 'var(--success)' : 'var(--danger)'
            }}>
              {trade.realizedPnL >= 0 ? '+' : ''}₹{trade.realizedPnL.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
