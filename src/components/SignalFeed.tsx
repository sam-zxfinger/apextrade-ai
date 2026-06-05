'use client';

import { Signal, AutomationLevel } from '@/lib/types';
import SignalCard from './SignalCard';
import { useState } from 'react';

interface SignalFeedProps {
  signals: Signal[];
  automationLevel: AutomationLevel;
  accountMode: 'demo' | 'real';
  onApprove: (signal: Signal) => void;
  onReject: (signal: Signal) => void;
  onExpand: (signal: Signal) => void;
}

export default function SignalFeed({
  signals, automationLevel, accountMode, onApprove, onReject, onExpand
}: SignalFeedProps) {
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [filterSide, setFilterSide] = useState<'all' | 'long' | 'short'>('all');

  const filtered = signals.filter(s => {
    if (filterStrategy !== 'all' && s.strategy !== filterStrategy) return false;
    if (filterSide !== 'all' && s.side !== filterSide) return false;
    return true;
  });

  const strategies = Array.from(new Set(signals.map(s => s.strategy)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select
          className="input"
          style={{ width: 140, padding: '6px 10px' }}
          value={filterStrategy}
          onChange={e => setFilterStrategy(e.target.value)}
        >
          <option value="all">All Strategies</option>
          {strategies.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="input"
          style={{ width: 120, padding: '6px 10px' }}
          value={filterSide}
          onChange={e => setFilterSide(e.target.value as any)}
        >
          <option value="all">All Sides</option>
          <option value="long">Long Only</option>
          <option value="short">Short Only</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} signal{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Signal List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: 'var(--text-muted)',
            border: '1px dashed var(--border)', borderRadius: 12
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            No signals match your filters.
          </div>
        ) : (
          filtered.map(signal => (
            <SignalCard
              key={signal.id}
              signal={signal}
              automationLevel={automationLevel}
              accountMode={accountMode}
              onApprove={onApprove}
              onReject={onReject}
              onExpand={onExpand}
            />
          ))
        )}
      </div>
    </div>
  );
}
