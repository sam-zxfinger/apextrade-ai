'use client';

import { Signal, RiskSettings, Portfolio } from '@/lib/types';
import { calcPositionSize } from '@/lib/riskEngine';
import { useState } from 'react';

interface TradeExecutionModalProps {
  signal: Signal;
  settings: RiskSettings;
  portfolio: Portfolio;
  onConfirm: (signal: Signal) => void;
  onCancel: () => void;
}

export default function TradeExecutionModal({ signal, settings, portfolio, onConfirm, onCancel }: TradeExecutionModalProps) {
  const [loading, setLoading] = useState(false);
  const isLong = signal.side === 'long';

  const handleExecute = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onConfirm(signal);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isLong ? 'var(--success)' : 'var(--danger)' }} />
            Execute Order: {signal.symbol}
          </h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onCancel}>✕</button>
        </div>

        {/* Trade Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Action</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: isLong ? 'var(--success)' : 'var(--danger)' }}>
              {isLong ? 'BUY' : 'SELL'} {signal.qty}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              @ {signal.entry.toLocaleString()}
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Risk / Reward</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--cyan)' }}>
              ₹{signal.riskAmount.toFixed(0)} <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>at risk</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--success)', marginTop: 4 }}>
              Target: +₹{(signal.riskAmount * (signal.targets[0]?.rMultiple || 2)).toFixed(0)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 2 }}>Stop Loss</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--danger)', fontWeight: 700 }}>
              {signal.stop.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 2 }}>Take Profit (1)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--success)', fontWeight: 700 }}>
              {signal.targets[0]?.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {settings.accountMode === 'real' && (
          <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--border-danger)', padding: 12, borderRadius: 8, marginBottom: 24, fontSize: '0.8125rem', color: 'var(--danger)', display: 'flex', gap: 8 }}>
            <span>⚠</span>
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>Real Money Mode Active</strong>
              This order will be placed directly to {signal.exchange} via API.
            </div>
          </div>
        )}
        {settings.accountMode === 'demo' && (
          <div style={{ background: 'var(--warning-dim)', border: '1px solid rgba(245,158,11,0.3)', padding: 12, borderRadius: 8, marginBottom: 24, fontSize: '0.8125rem', color: 'var(--warning)', display: 'flex', gap: 8 }}>
            <span>ℹ</span>
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>Demo Mode</strong>
              This order will be paper-traded on the local simulator.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button 
            className={`btn ${isLong ? 'btn-success' : 'btn-danger'}`} 
            style={{ flex: 2, justifyContent: 'center' }} 
            onClick={handleExecute}
            disabled={loading}
          >
            {loading ? 'Executing...' : `Confirm ${isLong ? 'Buy' : 'Sell'} Order`}
          </button>
        </div>

      </div>
    </div>
  );
}
