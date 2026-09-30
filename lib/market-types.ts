export type AppTheme = 'DARK' | 'LIGHT' | 'OLED' | 'GOLD';

export type MarketRegimeType =
  | 'CALM'
  | 'NORMAL'
  | 'TREND'
  | 'CHOPPY'
  | 'BREAKOUT'
  | 'HIGH_VOLATILITY'
  | 'EXTREME';

export type MarketSessionType =
  | 'CALM_SESSION'
  | 'ACTIVE_SESSION'
  | 'VOLATILITY_SESSION'
  | 'EVENT_SESSION';

export type Timeframe =
  | '1S'
  | '5S'
  | '15S'
  | '30S'
  | '1M'
  | '5M'
  | '15M'
  | '1H'
  | '4H'
  | '1D';

export interface RangeParam {
  min: number;
  max: number;
}

export interface RegimeConfig {
  minDurationSec: number;
  maxDurationSec: number;
  minVolatility: number;
  maxVolatility: number;
  minSpeed: number;
  maxSpeed: number;
  trendStrength: number;
  reversalProbability: number;
  minSpread: number;
  maxSpread: number;
}

export interface MarketEngineConfig {
  // 1. Price
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  initialPrice: number;
  priceStep: number;
  pricePrecision: number;

  // 2. Spread Control — Range Mode
  spread: RangeParam; // e.g. min 10, max 20
  normalSpread: RangeParam;
  highVolSpread: RangeParam;
  lowLiquiditySpread: RangeParam;
  spreadVariationSpeed: number; // 0 - 100
  spreadSmoothing: number; // 0.1 - 0.95
  spreadRandomness: number; // 0 - 100

  // 3. Volatility Control — Range Mode
  volatility: RangeParam; // e.g. 0.20 - 0.80
  volatilityChangeSpeed: number; // 0 - 100
  volatilityPersistence: number; // 0 - 100 (GARCH clustering)
  volatilityRandomness: number; // 0 - 100

  // 4. Price Aggressiveness Control (0 - 100 scale)
  aggressiveness: RangeParam; // e.g. 30 - 70

  // 5 & 6. Speed Controls
  marketSpeed: RangeParam; // 20 - 70 ticks/sec rate
  chartAnimationSpeed: 'SLOW' | 'NORMAL' | 'FAST' | 'ULTRA';

  // 7. Tick Movement Range (UZS)
  tickMovement: RangeParam; // e.g. 1 - 15 UZS

  // 8. Movement Direction & Bias
  trendBias: RangeParam; // 35 - 65 % (50 = neutral, >50 = bullish, <50 = bearish)
  activeBiasDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';

  // 9. Trend Strength
  trendStrength: RangeParam; // 30 - 75

  // 10. Reversal Control
  reversalProbability: RangeParam; // e.g. 5% - 25%

  // 11. Pullback Control
  pullbackStrength: RangeParam; // 10 - 50%
  pullbackFrequency: number; // 0 - 100
  pullbackDurationTicks: number; // 5 - 30 ticks

  // 12. Breakout Control
  breakoutProbability: RangeParam; // 10% - 30%
  breakoutStrength: number; // 1.2 - 3.5x
  breakoutDurationTicks: number; // 10 - 40 ticks
  fakeBreakoutProbability: number; // 5% - 40%

  // 13. Spike Control
  spikeProbability: RangeParam; // 1% - 8%
  spikeStrength: number; // 1.5 - 5.0x
  spikeDurationTicks: number; // 1 - 5 ticks
  spikeRecoverySpeed: number; // 0.1 - 0.9
  spikeCooldownTicks: number; // 20 - 100 ticks

  // 14. Market Regimes
  regime: MarketRegimeType;
  autoRegimeCycle: boolean;
  regimeConfigs: Record<MarketRegimeType, RegimeConfig>;

  // 19. Procedural Weights
  weights: {
    baseTrend: number;
    momentum: number;
    meanReversion: number;
    marketNoise: number;
    volatility: number;
    pullback: number;
    breakout: number;
    regimeEffect: number;
    eventEffect: number;
  };

  // 20. Randomness Control
  randomness: RangeParam; // 10 - 40

  // 21. Session Behavior
  session: MarketSessionType;
  sessionDurationMin: number;

  // Emergency / Safety
  isPaused: boolean;
  safeMode: boolean;
}

export interface LiveMarketMetrics {
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  currentSpread: number;
  currentVolatility: number;
  currentSpeed: number;
  currentAggressiveness: number;
  currentTrendStrength: number;
  currentTrendBias: number;
  currentMomentum: number;
  currentRegime: MarketRegimeType;
  currentSession: MarketSessionType;
  currentLiquidity: number; // 0 - 100 %
  priceChange24h: number;
  priceChange24hPct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  ticksGenerated: number;
  lastTickTime: number;
  lastDirection: 'UP' | 'DOWN' | 'FLAT';
}

export interface Candle {
  time: number; // epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isComplete: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  currentPrice: number;
  volumeKg: number; // Cotton in Kilograms
  stopLoss?: number;
  takeProfit?: number;
  openedAt: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  marginUsed: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  closePrice: number;
  volumeKg: number;
  openedAt: number;
  closedAt: number;
  realizedPnL: number;
  realizedPnLPct: number;
  reason: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'MARGIN_CLOSE';
}

export interface MarketEvent {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  impact: 'BULLISH' | 'BEARISH' | 'VOLATILITY';
  intensity: number; // 1 - 5
  durationSec: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  parameter: string;
  oldValue: string;
  newValue: string;
  admin: string;
  reason: string;
}

export interface UserAccount {
  balanceUZS: number;
  equityUZS: number;
  marginUsedUZS: number;
  freeMarginUZS: number;
  marginLevelPct: number;
}

export interface RegisteredUser {
  id: string;
  fullName: string;
  username: string;
  password: string;
  balanceUZS: number;
  equityUZS: number;
  totalDepositedUZS: number;
  role: 'TRADER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: number;
  notes?: string;
}

export interface UserDepositTransaction {
  id: string;
  userId: string;
  username: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amountUZS: number;
  previousBalance: number;
  newBalance: number;
  timestamp: number;
  note: string;
  admin: string;
}
