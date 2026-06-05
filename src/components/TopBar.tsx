'use client';

import { Signal, RiskSettings, Portfolio, MarketRegime } from '@/lib/types';

interface TopBarProps {
  regime: MarketRegime;
  riskSettings: RiskSettings;
  portfolio: Portfolio;
  onKillSwitch: () => void;
  onModeChange: (mode: 'demo' | 'real') => void;
  onLevelChange: (level: 0 | 1 | 2 | 3 | 4) => void;
  onOverlay: () => void;
  pendingCount: number;
}

const LEVELS = [
  { value: 0, label: 'L0', title: 'Analysis Only' },
  { value: 1, label: 'L1', title: 'Alerts' },
  { value: 2, label: 'L2', title: 'Recommend' },
  { value: 3, label: 'L3', title: 'Confirm' },
  { value: 4, label: 'L4', title: 'Auto-Trade' },
] as const;

export default function TopBar({
  regime, riskSettings, portfolio, onKillSwitch,
  onModeChange, onLevelChange, onOverlay, pendingCount,
}: TopBarProps) {
  const pnlPositive = portfolio.dailyPnL >= 0;

  const regimeClass = regime.overall === 'risk_on'
    ? 'regime-risk-on' : regime.overall === 'risk_off'
    ? 'regime-risk-off' : 'regime-neutral';

  const regimeLabel = regime.overall === 'risk_on'
    ? '▲ Risk On' : regime.overall === 'risk_off'
    ? '▼ Risk Off' : '◆ Neutral';

  return (
    <div className="topbar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#000'
        }}>A</div>
        <span style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>
          ApexTrade <span style={{ color: 'var(--cyan)' }}>AI</span>
        </span>
      </div>

      {/* Live Dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="live-dot" />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LIVE</span>
      </div>

      {/* Regime Badge */}
      <div className={`regime-banner ${regimeClass}`}>{regimeLabel}</div>

      {/* Market Summary */}
      <div style={{
        flex: 1, fontSize: '0.8125rem', color: 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        padding: '0 12px'
      }}>
        {regime.summary}
      </div>

      {/* Daily PnL */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, marginRight: 12 }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily P&L</span>
        <span
          className={`text-mono ${pnlPositive ? 'pos' : 'neg'}`}
          style={{ fontSize: '0.875rem', fontWeight: 700 }}
        >
          {pnlPositive ? '+' : ''}{portfolio.dailyPnL.toFixed(2)}
          <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>
            ({pnlPositive ? '+' : ''}{portfolio.dailyPnLPct.toFixed(2)}%)
          </span>
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

      {/* Automation Level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {LEVELS.map((l) => (
          <button
            key={l.value}
            className={`level-pill ${riskSettings.automationLevel === l.value ? 'active' : ''}`}
            onClick={() => onLevelChange(l.value as 0|1|2|3|4)}
            title={l.title}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

      {/* Demo / Real toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          className={`level-pill ${riskSettings.accountMode === 'demo' ? 'active' : ''}`}
          onClick={() => onModeChange('demo')}
          style={{ background: riskSettings.accountMode === 'demo' ? 'rgba(245,158,11,0.12)' : undefined, color: riskSettings.accountMode === 'demo' ? 'var(--warning)' : undefined, borderColor: riskSettings.accountMode === 'demo' ? 'rgba(245,158,11,0.3)' : undefined }}
        >DEMO</button>
        <button
          className={`level-pill ${riskSettings.accountMode === 'real' ? 'active' : ''}`}
          onClick={() => onModeChange('real')}
        >REAL</button>
      </div>

      {/* Pending signals badge */}
      {pendingCount > 0 && (
        <div style={{
          background: 'var(--cyan-dim)', border: '1px solid var(--border-accent)',
          borderRadius: 99, padding: '2px 8px',
          fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 700
        }}>
          {pendingCount} signal{pendingCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Overlay Mode */}
      <button className="btn btn-ghost btn-sm" onClick={onOverlay} title="Open overlay widget">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6"/>
        </svg>
        Overlay
      </button>

      {/* Kill Switch */}
      <button
        className={`btn btn-sm ${riskSettings.killSwitchActive ? 'btn-kill' : 'btn-ghost'}`}
        onClick={onKillSwitch}
        title="Emergency kill switch — stop all trading"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {riskSettings.killSwitchActive ? 'KILLED' : 'Kill Switch'}
      </button>
    </div>
  );
}
