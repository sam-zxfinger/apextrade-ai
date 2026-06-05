// ============================================================
// ApexTrade AI — Core TypeScript Types
// ============================================================

export type Side = 'long' | 'short';
export type TimeHorizon = 'minutes' | 'hours' | 'days' | 'weeks';
export type TradingStyle = 'scalp' | 'intraday' | 'swing' | 'positional';
export type AutomationLevel = 0 | 1 | 2 | 3 | 4;
export type AccountMode = 'demo' | 'real';
export type TradeStatus = 'pending' | 'open' | 'closed' | 'cancelled' | 'rejected';
export type SignalStrategy =
  | 'breakout'
  | 'pullback'
  | 'reversal'
  | 'continuation'
  | 'swing_entry'
  | 'momentum'
  | 'mean_reversion';

export type WarningTag =
  | 'stale_data'
  | 'high_volatility'
  | 'event_risk'
  | 'low_liquidity'
  | 'earnings_ahead'
  | 'news_risk';

export type Exchange =
  | 'Binance'
  | 'CoinDCX'
  | 'Zerodha'
  | 'Groww'
  | 'Upstox'
  | 'Angel One'
  | 'Dhan'
  | 'Delta Exchange'
  | 'Interactive Brokers'
  | 'MetaTrader4'
  | 'MetaTrader5'
  | 'TradingView'
  | 'NSE'
  | 'BSE'
  | 'CRYPTO';

// ─── Signal ───────────────────────────────────────────────
export interface SignalTarget {
  price: number;
  rMultiple: number;
}

export interface Signal {
  id: string;
  rank: number;
  symbol: string;
  exchange: Exchange;
  side: Side;
  strategy: SignalStrategy;
  entry: number;
  stop: number;
  targets: SignalTarget[];
  qty: number;
  riskAmount: number;
  confidence: number; // 0–100
  rationale: string;
  invalidation: string;
  timeHorizon: TimeHorizon;
  warnings: WarningTag[];
  // Scoring breakdown
  scores: {
    trendAlignment: number;     // 0–25
    momentum: number;           // 0–20
    volumeVwap: number;         // 0–15
    riskReward: number;         // 0–20
    volatilityFit: number;      // 0–10
    multiTimeframe: number;     // 0–10
    total: number;              // 0–100
  };
  timestamp: string; // ISO
}

export interface RejectedSignal {
  symbol: string;
  exchange: Exchange;
  reason: string;
}

export interface SignalEngineOutput {
  summary: string;
  signals: Signal[];
  rejected: RejectedSignal[];
  portfolioNote: string;
  disclaimer: string;
  generatedAt: string;
}

// ─── Market Data ─────────────────────────────────────────
export interface OHLCV {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker {
  symbol: string;
  exchange: Exchange;
  price: number;
  change: number;      // absolute
  changePct: number;   // percentage
  high24h: number;
  low24h: number;
  volume24h: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  macdLine: number;
  macdSignal: number;
  atr14: number;
  vwap: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  lastUpdated: string;
}

export interface MarketRegime {
  overall: 'risk_on' | 'risk_off' | 'neutral';
  volatility: 'low' | 'normal' | 'high' | 'extreme';
  breadth: number; // % of watchlist above EMA50
  summary: string;
}

// ─── Portfolio ────────────────────────────────────────────
export interface Position {
  id: string;
  symbol: string;
  exchange: Exchange;
  side: Side;
  entryPrice: number;
  currentPrice: number;
  qty: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  openedAt: string;
  strategy: SignalStrategy;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  status: 'open' | 'closing';
  trailingStopActive: boolean;
  riskAmount: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  exchange: Exchange;
  side: Side;
  entryPrice: number;
  exitPrice: number;
  qty: number;
  realizedPnL: number;
  realizedPnLPct: number;
  openedAt: string;
  closedAt: string;
  strategy: SignalStrategy;
  exitReason: 'take_profit' | 'stop_loss' | 'manual' | 'trailing_stop' | 'time_exit';
  rMultiple: number;
}

export interface Portfolio {
  equity: number;
  availableMargin: number;
  usedMargin: number;
  openPositions: Position[];
  dailyPnL: number;
  dailyPnLPct: number;
  weeklyPnL: number;
  totalPnL: number;
  winRate: number;
  maxDrawdown: number;
  closedTrades: ClosedTrade[];
  equityCurve: { time: string; value: number }[];
}

// ─── Risk Settings ────────────────────────────────────────
export interface RiskSettings {
  riskPerTradePct: number;       // e.g., 1.0 = 1%
  maxDailyLossPct: number;       // e.g., 3.0 = 3%
  maxConcurrentPositions: number;
  maxLeverage: number;
  tradingStyle: TradingStyle;
  automationLevel: AutomationLevel;
  accountMode: AccountMode;
  killSwitchActive: boolean;
  pauseOnLossStreak: number;     // pause after N consecutive losses
}

// ─── Broker Config ────────────────────────────────────────
export interface BrokerConfig {
  id: string;
  name: Exchange;
  enabled: boolean;
  apiKey: string;        // masked in UI
  apiSecret: string;     // masked in UI
  connected: boolean;
  lastChecked: string;
  permissions: string[];
}

// ─── Notifications ────────────────────────────────────────
export type NotificationType = 'signal' | 'entry' | 'exit' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  symbol?: string;
}

// ─── App State ────────────────────────────────────────────
export interface AppState {
  portfolio: Portfolio;
  signals: Signal[];
  rejected: RejectedSignal[];
  watchlist: Ticker[];
  marketRegime: MarketRegime;
  riskSettings: RiskSettings;
  brokers: BrokerConfig[];
  notifications: Notification[];
  isOverlayMode: boolean;
  pendingTradeApproval: Signal | null;
}
