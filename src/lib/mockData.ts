// ============================================================
// ApexTrade AI — Mock Data Engine
// Generates realistic market data for demo mode
// ============================================================

import {
  Signal, Ticker, Portfolio, Position, ClosedTrade, MarketRegime,
  OHLCV, Exchange, Side, SignalStrategy, TradingStyle, RiskSettings
} from './types';

// ─── Helpers ──────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

const rand = (min: number, max: number, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── Seed prices (realistic) ──────────────────────────────
export const SEED_PRICES: Record<string, { price: number; exchange: Exchange; decimals: number }> = {
  BTCUSDT:   { price: 68420,     exchange: 'Binance',   decimals: 2 },
  ETHUSDT:   { price: 3820,      exchange: 'Binance',   decimals: 2 },
  SOLUSDT:   { price: 168.4,     exchange: 'Binance',   decimals: 2 },
  BNBUSDT:   { price: 608.2,     exchange: 'Binance',   decimals: 2 },
  ADAUSDT:   { price: 0.4612,    exchange: 'CoinDCX',   decimals: 4 },
  XRPUSDT:   { price: 0.5832,    exchange: 'CoinDCX',   decimals: 4 },
  NIFTY50:   { price: 24380,     exchange: 'Zerodha',   decimals: 2 },
  BANKNIFTY: { price: 52140,     exchange: 'Zerodha',   decimals: 2 },
  RELIANCE:  { price: 2987,      exchange: 'Groww',     decimals: 2 },
  TCS:       { price: 4120,      exchange: 'Groww',     decimals: 2 },
  INFY:      { price: 1863,      exchange: 'Upstox',    decimals: 2 },
  HDFCBANK:  { price: 1742,      exchange: 'Upstox',    decimals: 2 },
  SBIN:      { price: 834,       exchange: 'Angel One', decimals: 2 },
  LTFH:      { price: 167,       exchange: 'Dhan',      decimals: 2 },
  AAPL:      { price: 175.5,     exchange: 'TradingView', decimals: 2 },
  TSLA:      { price: 180.2,     exchange: 'TradingView', decimals: 2 },
};

// ─── OHLCV Generator ──────────────────────────────────────
export function generateOHLCV(symbol: string, bars = 200): OHLCV[] {
  const seed = SEED_PRICES[symbol] || { price: 1000, decimals: 2 };
  let price = seed.price * (1 + rand(-0.05, 0.05, 4));
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1h candles
  const result: OHLCV[] = [];

  for (let i = bars; i >= 0; i--) {
    const change = price * rand(-0.015, 0.018, 4);
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + rand(0, 0.008, 4));
    const low = Math.min(open, close) * (1 - rand(0, 0.008, 4));
    const volume = seed.price * rand(50, 500, 0);
    result.push({
      time: now - i * interval,
      open: parseFloat(open.toFixed(seed.decimals)),
      high: parseFloat(high.toFixed(seed.decimals)),
      low: parseFloat(low.toFixed(seed.decimals)),
      close: parseFloat(close.toFixed(seed.decimals)),
      volume,
    });
    price = close;
  }
  return result;
}

// ─── EMA Calculator ───────────────────────────────────────
function ema(values: number[], period: number): number {
  const k = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = values[i] * k + result * (1 - k);
  }
  return result;
}

// ─── RSI Calculator ───────────────────────────────────────
function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rs = gains / (losses || 0.0001);
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

// ─── ATR Calculator ───────────────────────────────────────
function atr(candles: OHLCV[], period = 14): number {
  const trs = candles.slice(-period - 1).map((c, i, arr) => {
    if (i === 0) return c.high - c.low;
    const prev = arr[i - 1];
    return Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close));
  });
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

// ─── Ticker Generator ─────────────────────────────────────
export function generateTicker(symbol: string): Ticker {
  const seed = SEED_PRICES[symbol] || { price: 1000, exchange: 'NSE' as Exchange, decimals: 2 };
  const ohlcv = generateOHLCV(symbol, 200);
  const closes = ohlcv.map(c => c.close);
  const currentPrice = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];
  const change = currentPrice - prevClose;
  const changePct = (change / prevClose) * 100;

  const ema20 = ema(closes.slice(-20), 20);
  const ema50 = ema(closes.slice(-50), 50);
  const ema200 = ema(closes.slice(-200), 200);
  const rsi14 = rsi(closes);
  const atr14 = atr(ohlcv);
  const high24h = Math.max(...ohlcv.slice(-24).map(c => c.high));
  const low24h = Math.min(...ohlcv.slice(-24).map(c => c.low));
  const vwap = parseFloat((ohlcv.slice(-24).reduce((s, c) => s + (c.high + c.low + c.close) / 3, 0) / 24).toFixed(seed.decimals));

  const trend = currentPrice > ema50 && ema50 > ema200
    ? 'bullish'
    : currentPrice < ema50 && ema50 < ema200
      ? 'bearish'
      : 'sideways';

  return {
    symbol,
    exchange: seed.exchange,
    price: parseFloat(currentPrice.toFixed(seed.decimals)),
    change: parseFloat(change.toFixed(seed.decimals)),
    changePct: parseFloat(changePct.toFixed(2)),
    high24h: parseFloat(high24h.toFixed(seed.decimals)),
    low24h: parseFloat(low24h.toFixed(seed.decimals)),
    volume24h: parseFloat((seed.price * rand(500, 5000, 0)).toFixed(0)),
    ema20: parseFloat(ema20.toFixed(seed.decimals)),
    ema50: parseFloat(ema50.toFixed(seed.decimals)),
    ema200: parseFloat(ema200.toFixed(seed.decimals)),
    rsi14,
    macdLine: parseFloat((ema20 - ema50).toFixed(seed.decimals)),
    macdSignal: parseFloat(((ema20 - ema50) * 0.9).toFixed(seed.decimals)),
    atr14: parseFloat(atr14.toFixed(seed.decimals)),
    vwap,
    trend,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Generate All Tickers ─────────────────────────────────
export function generateWatchlist(): Ticker[] {
  return Object.keys(SEED_PRICES).map(generateTicker);
}

// ─── Signal Generator ─────────────────────────────────────
const STRATEGIES: SignalStrategy[] = ['breakout', 'pullback', 'reversal', 'continuation', 'swing_entry', 'momentum'];
const RATIONALES = [
  'Price broke above 20-day EMA with volume 2× average; RSI crossing 55 confirms momentum.',
  'Pullback to EMA50 support; MACD histogram turning positive; bullish engulfing on 4H.',
  'RSI divergence at support zone; price forming higher lows; VWAP reclaim imminent.',
  'Trend continuation after bull flag; ATR within normal range; EMA200 acting as base.',
  'Breakout above multi-week resistance with above-average volume; momentum building.',
  'Strong uptrend with RSI at 62; pullback to 20 EMA complete; volume picking up.',
];
const INVALIDATIONS = [
  'Daily close below EMA50 or RSI drops under 45.',
  'Price closes below the entry candle low or volume collapses.',
  'MACD bearish crossover or break of the key support level.',
  'Index breaks down; sector rotates out; RSI reaches overbought without breakout.',
  'Failure to hold VWAP after session open; wider market sell-off.',
];

export function generateSignals(tickers: Ticker[], equity: number, riskPct: number): Signal[] {
  const signals: Signal[] = [];
  const eligible = tickers.filter(t => t.trend !== 'sideways' || Math.random() > 0.5);

  for (const ticker of eligible.slice(0, 6)) {
    if (Math.random() < 0.3) continue; // skip some

    const side: Side = ticker.trend === 'bullish' ? 'long' : ticker.changePct < -1 ? 'short' : choice(['long', 'short']);
    const strategy = choice(STRATEGIES);
    const entry = ticker.price;
    const atrVal = ticker.atr14;
    const stopDist = atrVal * rand(1.2, 2.0);
    const stop = side === 'long' ? entry - stopDist : entry + stopDist;
    const tp1Dist = stopDist * rand(1.8, 2.5);
    const tp2Dist = stopDist * rand(2.5, 4.0);
    const tp1 = side === 'long' ? entry + tp1Dist : entry - tp1Dist;
    const tp2 = side === 'long' ? entry + tp2Dist : entry - tp2Dist;
    const riskAmount = equity * (riskPct / 100);
    const qty = parseFloat((riskAmount / Math.abs(entry - stop)).toFixed(4));

    // Scoring rubric
    const trendScore = (ticker.trend === 'bullish' && side === 'long') || (ticker.trend === 'bearish' && side === 'short')
      ? rand(18, 25) : rand(5, 15);
    const momentumScore = (ticker.rsi14 > 50 && side === 'long') || (ticker.rsi14 < 50 && side === 'short')
      ? rand(14, 20) : rand(5, 13);
    const volumeScore = rand(8, 15);
    const rrRatio = tp1Dist / stopDist;
    const rrScore = rrRatio >= 1.8 ? rand(16, 20) : rand(5, 14);
    const volScore = rand(6, 10);
    const mtfScore = rand(6, 10);
    const total = trendScore + momentumScore + volumeScore + rrScore + volScore + mtfScore;

    if (total < 65) continue; // rubric filter

    const warnings: Signal['warnings'] = [];
    if (ticker.atr14 > ticker.price * 0.04) warnings.push('high_volatility');
    if (Math.random() < 0.1) warnings.push('event_risk');

    signals.push({
      id: uid(),
      rank: 0, // set after sort
      symbol: ticker.symbol,
      exchange: ticker.exchange,
      side,
      strategy,
      entry: parseFloat(entry.toFixed(4)),
      stop: parseFloat(stop.toFixed(4)),
      targets: [
        { price: parseFloat(tp1.toFixed(4)), rMultiple: parseFloat((tp1Dist / stopDist).toFixed(2)) },
        { price: parseFloat(tp2.toFixed(4)), rMultiple: parseFloat((tp2Dist / stopDist).toFixed(2)) },
      ],
      qty,
      riskAmount: parseFloat(riskAmount.toFixed(2)),
      confidence: Math.min(100, Math.round(total)),
      rationale: choice(RATIONALES),
      invalidation: choice(INVALIDATIONS),
      timeHorizon: choice(['hours', 'hours', 'days', 'days', 'weeks']),
      warnings,
      scores: {
        trendAlignment: parseFloat(trendScore.toFixed(1)),
        momentum: parseFloat(momentumScore.toFixed(1)),
        volumeVwap: parseFloat(volumeScore.toFixed(1)),
        riskReward: parseFloat(rrScore.toFixed(1)),
        volatilityFit: parseFloat(volScore.toFixed(1)),
        multiTimeframe: parseFloat(mtfScore.toFixed(1)),
        total: parseFloat(total.toFixed(1)),
      },
      timestamp: new Date().toISOString(),
    });
  }

  return signals
    .sort((a, b) => b.confidence - a.confidence)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

// ─── Equity Curve ─────────────────────────────────────────
export function generateEquityCurve(startEquity = 10000, days = 30): { time: string; value: number }[] {
  let equity = startEquity;
  const curve = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const daily = equity * rand(-0.025, 0.035, 4);
    equity = Math.max(equity * 0.5, equity + daily);
    curve.push({ time: d.toISOString().split('T')[0], value: parseFloat(equity.toFixed(2)) });
  }
  return curve;
}

// ─── Portfolio Generator ──────────────────────────────────
export function generatePortfolio(startEquity = 10000): Portfolio {
  const tickers = generateWatchlist();
  const openCount = randInt(1, 3);
  const openPositions: Position[] = tickers.slice(0, openCount).map((t) => {
    const side: Side = t.trend === 'bullish' ? 'long' : 'short';
    const entry = t.price * (1 + rand(-0.02, 0.02, 4));
    const qty = rand(0.01, 2, 4);
    const unrealized = (t.price - entry) * qty * (side === 'long' ? 1 : -1);
    const atrVal = t.atr14;
    return {
      id: uid(),
      symbol: t.symbol,
      exchange: t.exchange,
      side,
      entryPrice: parseFloat(entry.toFixed(4)),
      currentPrice: t.price,
      qty,
      stopLoss: side === 'long' ? entry - atrVal * 1.5 : entry + atrVal * 1.5,
      takeProfit1: side === 'long' ? entry + atrVal * 2.5 : entry - atrVal * 2.5,
      takeProfit2: side === 'long' ? entry + atrVal * 4.0 : entry - atrVal * 4.0,
      openedAt: new Date(Date.now() - randInt(1, 48) * 3600000).toISOString(),
      strategy: choice(STRATEGIES),
      unrealizedPnL: parseFloat(unrealized.toFixed(2)),
      unrealizedPnLPct: parseFloat(((unrealized / (entry * qty)) * 100).toFixed(2)),
      status: 'open',
      trailingStopActive: Math.random() > 0.5,
      riskAmount: parseFloat((startEquity * 0.01).toFixed(2)),
    };
  });

  const closedTrades: ClosedTrade[] = Array.from({ length: 15 }, (_, i) => {
    const t = tickers[i % tickers.length];
    const side: Side = Math.random() > 0.5 ? 'long' : 'short';
    const entryPrice = t.price * (1 + rand(-0.05, 0.05, 4));
    const exitPrice = entryPrice * (1 + (Math.random() > 0.55 ? rand(0.01, 0.04) : rand(-0.03, -0.005)));
    const qty = rand(0.01, 2, 4);
    const pnl = (exitPrice - entryPrice) * qty * (side === 'long' ? 1 : -1);
    const stopDist = entryPrice * 0.015;
    return {
      id: uid(),
      symbol: t.symbol,
      exchange: t.exchange,
      side,
      entryPrice: parseFloat(entryPrice.toFixed(4)),
      exitPrice: parseFloat(exitPrice.toFixed(4)),
      qty,
      realizedPnL: parseFloat(pnl.toFixed(2)),
      realizedPnLPct: parseFloat(((pnl / (entryPrice * qty)) * 100).toFixed(2)),
      openedAt: new Date(Date.now() - randInt(1, 30) * 86400000).toISOString(),
      closedAt: new Date(Date.now() - randInt(1, 20) * 86400000).toISOString(),
      strategy: choice(STRATEGIES),
      exitReason: choice(['take_profit', 'stop_loss', 'trailing_stop', 'manual']),
      rMultiple: parseFloat((Math.abs(exitPrice - entryPrice) / stopDist).toFixed(2)),
    };
  });

  const dailyPnL = openPositions.reduce((s, p) => s + p.unrealizedPnL, 0) + rand(-200, 300);
  const totalPnL = closedTrades.reduce((s, t) => s + t.realizedPnL, 0) + dailyPnL;
  const wins = closedTrades.filter(t => t.realizedPnL > 0).length;

  return {
    equity: parseFloat((startEquity + totalPnL).toFixed(2)),
    availableMargin: parseFloat((startEquity * 0.6).toFixed(2)),
    usedMargin: parseFloat((startEquity * 0.1 * openCount).toFixed(2)),
    openPositions,
    dailyPnL: parseFloat(dailyPnL.toFixed(2)),
    dailyPnLPct: parseFloat(((dailyPnL / startEquity) * 100).toFixed(2)),
    weeklyPnL: parseFloat(rand(-500, 800).toFixed(2)),
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    winRate: parseFloat(((wins / closedTrades.length) * 100).toFixed(1)),
    maxDrawdown: parseFloat(rand(3, 12).toFixed(2)),
    closedTrades,
    equityCurve: generateEquityCurve(startEquity, 30),
  };
}

// ─── Market Regime ────────────────────────────────────────
export function generateMarketRegime(tickers: Ticker[]): MarketRegime {
  const bullish = tickers.filter(t => t.trend === 'bullish').length;
  const breadth = (bullish / tickers.length) * 100;
  const overall = breadth > 60 ? 'risk_on' : breadth < 40 ? 'risk_off' : 'neutral';
  const avgRsi = tickers.reduce((s, t) => s + t.rsi14, 0) / tickers.length;
  const volatility = avgRsi > 70 || avgRsi < 30 ? 'high' : 'normal';

  const summaries = {
    risk_on: 'Markets in risk-on mode. Broad uptrend with strong breadth. Monitor for extended RSI conditions.',
    risk_off: 'Risk-off conditions. Most assets below key EMAs. Defensive posture recommended.',
    neutral: 'Mixed signals. Sector rotation underway. Selective approach; focus on best setups.',
  };

  return { overall, volatility, breadth: parseFloat(breadth.toFixed(1)), summary: summaries[overall] };
}

// ─── Default Risk Settings ────────────────────────────────
export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  riskPerTradePct: 1.0,
  maxDailyLossPct: 3.0,
  maxConcurrentPositions: 5,
  maxLeverage: 3,
  tradingStyle: 'intraday',
  automationLevel: 2,
  accountMode: 'demo',
  killSwitchActive: false,
  pauseOnLossStreak: 3,
};
