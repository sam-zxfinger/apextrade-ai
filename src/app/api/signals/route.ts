import { NextResponse } from 'next/server';
import { generateWatchlist, generateSignals } from '@/lib/mockData';
import { DEFAULT_RISK_SETTINGS } from '@/lib/types';

export async function GET() {
  const tkrs = generateWatchlist();
  // Assume a default equity of 10000 and 1% risk for the mock endpoint
  const rawSignals = generateSignals(tkrs, 10000, DEFAULT_RISK_SETTINGS.riskPerTradePct);
  
  // In a real app, we would run `validateSignals` through the risk engine
  // and only return approved signals.

  return NextResponse.json({
    summary: "Mock AI market analysis. Bullish trend expected.",
    signals: rawSignals,
    rejected: [],
    portfolioNote: "Equity: $10,000; Open positions: 2; PnL: +1.2%",
    disclaimer: "Not financial advice. Markets carry risk."
  });
}
