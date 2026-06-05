'use client';

import { Portfolio, RiskSettings } from '@/lib/types';

interface RiskMeterProps {
  portfolio: Portfolio;
  settings: RiskSettings;
}

function GaugeArc({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const pct = Math.min(1, value / max);
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;
  const range = endAngle - startAngle;
  const angle = startAngle + range * pct;

  const polarToCart = (ang: number) => ({
    x: cx + r * Math.cos(ang),
    y: cy + r * Math.sin(ang),
  });

  const trackStart = polarToCart(startAngle);
  const trackEnd = polarToCart(endAngle);
  const fillEnd = polarToCart(angle);

  const trackD = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${range > Math.PI ? 1 : 0} 1 ${trackEnd.x} ${trackEnd.y}`;
  const fillD = pct > 0
    ? `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${range * pct > Math.PI ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`
    : '';

  return (
    <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
      <path d={trackD} stroke="rgba(255,255,255,0.07)" strokeWidth="5" fill="none" strokeLinecap="round" />
      {fillD && (
        <path d={fillD} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'all 0.6s ease' }} />
      )}
    </svg>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  pct?: number;
  maxPct?: number;
  warn?: boolean;
}

function StatItem({ label, value, sub, color = 'var(--text-primary)', pct, maxPct = 100, warn }: StatItemProps) {
  return (
    <div style={{
      background: warn ? 'rgba(239,68,68,0.06)' : 'rgba(0,0,0,0.2)',
      border: `1px solid ${warn ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
      borderRadius: 8, padding: '8px 10px', flex: 1, minWidth: 100
    }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      {pct !== undefined && (
        <div className="progress-track" style={{ marginTop: 5 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, (pct / maxPct) * 100)}%`,
              background: pct / maxPct > 0.8 ? 'var(--danger)' : pct / maxPct > 0.5 ? 'var(--warning)' : 'var(--success)'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function RiskMeter({ portfolio, settings }: RiskMeterProps) {
  const dailyLossLimit = portfolio.equity * (settings.maxDailyLossPct / 100);
  const dailyLossUsed = Math.max(0, -portfolio.dailyPnL);
  const dailyLossPct = (dailyLossUsed / dailyLossLimit) * 100;

  const positionCount = portfolio.openPositions.length;
  const maxPositions = settings.maxConcurrentPositions;

  const totalRisk = portfolio.openPositions.reduce((s, p) => s + p.riskAmount, 0);
  const totalRiskPct = (totalRisk / portfolio.equity) * 100;
  const maxRiskPct = settings.riskPerTradePct * maxPositions;

  const isLossWarn = dailyLossPct > 70;
  const isPosWarn = positionCount >= maxPositions;
  const isRiskWarn = totalRiskPct > maxRiskPct * 0.8;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%', flex: 1 }}>
      {/* Daily Loss Gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative' }}>
          <GaugeArc
            value={dailyLossUsed}
            max={dailyLossLimit}
            color={dailyLossPct > 70 ? 'var(--danger)' : dailyLossPct > 40 ? 'var(--warning)' : 'var(--success)'}
            size={60}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: dailyLossPct > 70 ? 'var(--danger)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}>
            {dailyLossPct.toFixed(0)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Loss</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: isLossWarn ? 'var(--danger)' : 'var(--text-primary)' }}>
            ₹{dailyLossUsed.toFixed(0)} / ₹{dailyLossLimit.toFixed(0)}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--border)' }} />

      {/* Exposure stats */}
      <div style={{ display: 'flex', gap: 8 }}>
        <StatItem
          label="Positions"
          value={`${positionCount}/${maxPositions}`}
          pct={positionCount} maxPct={maxPositions}
          warn={isPosWarn}
          color={isPosWarn ? 'var(--warning)' : 'var(--text-primary)'}
        />
        <StatItem
          label="Risk Exposure"
          value={`${totalRiskPct.toFixed(1)}%`}
          sub={`₹${totalRisk.toFixed(0)} at risk`}
          pct={totalRiskPct} maxPct={maxRiskPct}
          warn={isRiskWarn}
          color={isRiskWarn ? 'var(--warning)' : 'var(--text-primary)'}
        />
        <StatItem
          label="Avail. Margin"
          value={`₹${portfolio.availableMargin.toFixed(0)}`}
          sub={`of ₹${(portfolio.availableMargin + portfolio.usedMargin).toFixed(0)}`}
          color="var(--cyan)"
        />
        <StatItem
          label="Style"
          value={settings.tradingStyle.toUpperCase()}
          sub={`Level ${settings.automationLevel}`}
          color="var(--violet)"
        />
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--border)' }} />

      {/* Risk rule indicators */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { label: 'Max 1% Risk', ok: settings.riskPerTradePct <= 1 },
          { label: 'Stop Set', ok: portfolio.openPositions.every(p => p.stopLoss > 0) },
          { label: 'No Overleverage', ok: true },
          { label: 'Kill Switch', ok: !settings.killSwitchActive, invert: true },
        ].map(({ label, ok, invert }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.6875rem', color: (invert ? !ok : ok) ? 'var(--success)' : 'var(--danger)',
            background: (invert ? !ok : ok) ? 'var(--success-dim)' : 'var(--danger-dim)',
            border: `1px solid ${(invert ? !ok : ok) ? 'var(--border-success)' : 'var(--border-danger)'}`,
            borderRadius: 99, padding: '2px 8px', fontWeight: 600
          }}>
            <span>{(invert ? !ok : ok) ? '✓' : '✗'}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--text-disabled)', textAlign: 'right' }}>
        Not financial advice.<br />Markets carry risk.
      </div>
    </div>
  );
}
