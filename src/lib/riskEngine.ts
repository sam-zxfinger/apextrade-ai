// ============================================================
// ApexTrade AI — Risk Engine
// Position sizing, portfolio validation, risk checks
// ============================================================

import { Signal, Portfolio, RiskSettings, RejectedSignal, Side } from './types';

export interface RiskCheckResult {
  passed: boolean;
  reason?: string;
}

export interface SizingResult {
  qty: number;
  riskAmount: number;
  riskPct: number;
  stopDistPct: number;
}

// ─── Fixed-Fractional Position Sizing ────────────────────
export function calcPositionSize(
  equity: number,
  entry: number,
  stop: number,
  riskPct: number
): SizingResult {
  const riskAmount = equity * (riskPct / 100);
  const stopDist = Math.abs(entry - stop);
  const qty = stopDist > 0 ? riskAmount / stopDist : 0;
  const stopDistPct = (stopDist / entry) * 100;
  return {
    qty: parseFloat(qty.toFixed(6)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    riskPct,
    stopDistPct: parseFloat(stopDistPct.toFixed(2)),
  };
}

// ─── Portfolio Risk Checks ────────────────────────────────
export function checkPortfolioRisk(
  candidate: Signal,
  portfolio: Portfolio,
  settings: RiskSettings
): RiskCheckResult {
  // Kill switch
  if (settings.killSwitchActive) {
    return { passed: false, reason: 'Kill switch active — all trading paused.' };
  }

  // Daily loss limit
  const dailyLossLimit = portfolio.equity * (settings.maxDailyLossPct / 100);
  if (portfolio.dailyPnL <= -dailyLossLimit) {
    return {
      passed: false,
      reason: `Daily loss limit reached (${settings.maxDailyLossPct}% of equity).`,
    };
  }

  // Max concurrent positions
  if (portfolio.openPositions.length >= settings.maxConcurrentPositions) {
    return {
      passed: false,
      reason: `Max concurrent positions (${settings.maxConcurrentPositions}) reached.`,
    };
  }

  // Duplicate position check
  const duplicate = portfolio.openPositions.find(
    p => p.symbol === candidate.symbol && p.side === candidate.side
  );
  if (duplicate) {
    return {
      passed: false,
      reason: `Already have an open ${candidate.side} position in ${candidate.symbol}.`,
    };
  }

  // Available margin check
  const tradeValue = candidate.entry * candidate.qty;
  const requiredMargin = tradeValue / settings.maxLeverage;
  if (requiredMargin > portfolio.availableMargin) {
    return {
      passed: false,
      reason: `Insufficient margin. Need ₹${requiredMargin.toFixed(2)}, have ₹${portfolio.availableMargin.toFixed(2)}.`,
    };
  }

  // Risk-reward validation
  if (candidate.targets.length > 0) {
    const tp1 = candidate.targets[0];
    const stopDist = Math.abs(candidate.entry - candidate.stop);
    const tp1Dist = Math.abs(tp1.price - candidate.entry);
    const rr = tp1Dist / (stopDist || 1);
    if (rr < 1.8) {
      return {
        passed: false,
        reason: `Risk:Reward ratio ${rr.toFixed(2)} is below minimum 1.8.`,
      };
    }
  }

  // Confidence threshold
  if (candidate.confidence < 65) {
    return { passed: false, reason: `Signal confidence ${candidate.confidence} below threshold (65).` };
  }

  return { passed: true };
}

// ─── Validate All Candidates ──────────────────────────────
export function validateSignals(
  candidates: Signal[],
  portfolio: Portfolio,
  settings: RiskSettings
): { approved: Signal[]; rejected: RejectedSignal[] } {
  const approved: Signal[] = [];
  const rejected: RejectedSignal[] = [];

  for (const signal of candidates) {
    const result = checkPortfolioRisk(signal, portfolio, settings);
    if (result.passed) {
      // ATR high volatility: halve position size
      const adjusted = { ...signal };
      if (signal.warnings.includes('high_volatility')) {
        adjusted.qty = parseFloat((signal.qty / 2).toFixed(6));
        adjusted.riskAmount = parseFloat((signal.riskAmount / 2).toFixed(2));
      }
      approved.push(adjusted);
    } else {
      rejected.push({
        symbol: signal.symbol,
        exchange: signal.exchange,
        reason: result.reason || 'Failed risk check.',
      });
    }
  }

  return { approved, rejected };
}

// ─── Trailing Stop Calculator ─────────────────────────────
export function calcTrailingStop(
  currentPrice: number,
  entryPrice: number,
  currentStop: number,
  side: Side,
  atr: number,
  atrMultiplier = 1.5
): number {
  const newStop = side === 'long'
    ? currentPrice - atr * atrMultiplier
    : currentPrice + atr * atrMultiplier;

  if (side === 'long') {
    return newStop > currentStop ? newStop : currentStop;
  } else {
    return newStop < currentStop ? newStop : currentStop;
  }
}

// ─── Expected Value Calculator ────────────────────────────
export function calcExpectedValue(
  winRate: number, // 0–1
  avgWin: number,
  avgLoss: number
): number {
  return winRate * avgWin - (1 - winRate) * avgLoss;
}

// ─── Risk Exposure Summary ────────────────────────────────
export function calcRiskExposure(portfolio: Portfolio): {
  totalRisk: number;
  totalRiskPct: number;
  maxSingleRisk: number;
  isOverExposed: boolean;
} {
  const totalRisk = portfolio.openPositions.reduce((s, p) => s + p.riskAmount, 0);
  const totalRiskPct = (totalRisk / portfolio.equity) * 100;
  const maxSingleRisk = Math.max(...portfolio.openPositions.map(p => p.riskAmount), 0);
  return {
    totalRisk: parseFloat(totalRisk.toFixed(2)),
    totalRiskPct: parseFloat(totalRiskPct.toFixed(2)),
    maxSingleRisk: parseFloat(maxSingleRisk.toFixed(2)),
    isOverExposed: totalRiskPct > 5,
  };
}
