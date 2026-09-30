import {
  MarketEngineConfig,
  LiveMarketMetrics,
  Candle,
  Timeframe,
  MarketRegimeType,
  MarketSessionType,
  RangeParam,
  MarketEvent,
} from './market-types';

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1S': 1,
  '5S': 5,
  '15S': 15,
  '30S': 30,
  '1M': 60,
  '5M': 300,
  '15M': 900,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
};

// Default Regime Matrix Configurations
export const DEFAULT_REGIME_CONFIGS: Record<MarketRegimeType, import('./market-types').RegimeConfig> = {
  CALM: {
    minDurationSec: 30,
    maxDurationSec: 90,
    minVolatility: 0.15,
    maxVolatility: 0.35,
    minSpeed: 15,
    maxSpeed: 30,
    trendStrength: 20,
    reversalProbability: 15,
    minSpread: 8,
    maxSpread: 12,
  },
  NORMAL: {
    minDurationSec: 45,
    maxDurationSec: 120,
    minVolatility: 0.30,
    maxVolatility: 0.55,
    minSpeed: 30,
    maxSpeed: 55,
    trendStrength: 45,
    reversalProbability: 20,
    minSpread: 10,
    maxSpread: 18,
  },
  TREND: {
    minDurationSec: 60,
    maxDurationSec: 180,
    minVolatility: 0.40,
    maxVolatility: 0.70,
    minSpeed: 45,
    maxSpeed: 75,
    trendStrength: 75,
    reversalProbability: 10,
    minSpread: 12,
    maxSpread: 22,
  },
  CHOPPY: {
    minDurationSec: 20,
    maxDurationSec: 60,
    minVolatility: 0.45,
    maxVolatility: 0.75,
    minSpeed: 40,
    maxSpeed: 65,
    trendStrength: 15,
    reversalProbability: 55,
    minSpread: 14,
    maxSpread: 24,
  },
  BREAKOUT: {
    minDurationSec: 15,
    maxDurationSec: 45,
    minVolatility: 0.60,
    maxVolatility: 0.88,
    minSpeed: 65,
    maxSpeed: 90,
    trendStrength: 85,
    reversalProbability: 8,
    minSpread: 16,
    maxSpread: 28,
  },
  HIGH_VOLATILITY: {
    minDurationSec: 25,
    maxDurationSec: 75,
    minVolatility: 0.70,
    maxVolatility: 0.95,
    minSpeed: 60,
    maxSpeed: 95,
    trendStrength: 60,
    reversalProbability: 35,
    minSpread: 18,
    maxSpread: 32,
  },
  EXTREME: {
    minDurationSec: 10,
    maxDurationSec: 30,
    minVolatility: 0.85,
    maxVolatility: 1.0,
    minSpeed: 80,
    maxSpeed: 100,
    trendStrength: 90,
    reversalProbability: 40,
    minSpread: 20,
    maxSpread: 38,
  },
};

export const DEFAULT_ENGINE_CONFIG: MarketEngineConfig = {
  basePrice: 21500, // 21,500 UZS/kg
  minPrice: 12000,
  maxPrice: 38000,
  initialPrice: 21500,
  priceStep: 1,
  pricePrecision: 0,

  spread: { min: 10, max: 20 },
  normalSpread: { min: 10, max: 18 },
  highVolSpread: { min: 16, max: 25 },
  lowLiquiditySpread: { min: 14, max: 22 },
  spreadVariationSpeed: 45,
  spreadSmoothing: 0.85,
  spreadRandomness: 30,

  volatility: { min: 0.20, max: 0.80 },
  volatilityChangeSpeed: 40,
  volatilityPersistence: 75, // Volatility clustering
  volatilityRandomness: 35,

  aggressiveness: { min: 30, max: 70 }, // 0 - 100 scale

  marketSpeed: { min: 20, max: 70 }, // 20 - 70 dynamic range
  chartAnimationSpeed: 'NORMAL',

  tickMovement: { min: 1, max: 15 }, // 1 - 15 UZS

  trendBias: { min: 35, max: 65 }, // 35 - 65%
  activeBiasDirection: 'BULLISH',

  trendStrength: { min: 30, max: 75 },

  reversalProbability: { min: 5, max: 25 },

  pullbackStrength: { min: 15, max: 40 },
  pullbackFrequency: 35,
  pullbackDurationTicks: 12,

  breakoutProbability: { min: 10, max: 30 },
  breakoutStrength: 2.2,
  breakoutDurationTicks: 18,
  fakeBreakoutProbability: 20,

  spikeProbability: { min: 1, max: 5 },
  spikeStrength: 2.5,
  spikeDurationTicks: 3,
  spikeRecoverySpeed: 0.65,
  spikeCooldownTicks: 45,

  regime: 'NORMAL',
  autoRegimeCycle: true,
  regimeConfigs: DEFAULT_REGIME_CONFIGS,

  weights: {
    baseTrend: 0.22,
    momentum: 0.18,
    meanReversion: 0.15,
    marketNoise: 0.12,
    volatility: 0.16,
    pullback: 0.08,
    breakout: 0.06,
    regimeEffect: 0.15,
    eventEffect: 0.10,
  },

  randomness: { min: 10, max: 40 },

  session: 'ACTIVE_SESSION',
  sessionDurationMin: 45,

  isPaused: false,
  safeMode: false,
};

// PRESETS (Section 24)
export const MARKET_PRESETS: Record<string, Partial<MarketEngineConfig>> = {
  PEACEFUL_MARKET: {
    spread: { min: 8, max: 12 },
    volatility: { min: 0.10, max: 0.30 },
    marketSpeed: { min: 15, max: 35 },
    aggressiveness: { min: 10, max: 25 },
    tickMovement: { min: 1, max: 6 },
    trendStrength: { min: 15, max: 40 },
    reversalProbability: { min: 10, max: 20 },
    regime: 'CALM',
    session: 'CALM_SESSION',
  },
  NORMAL_MARKET: {
    spread: { min: 10, max: 20 },
    volatility: { min: 0.25, max: 0.60 },
    marketSpeed: { min: 30, max: 55 },
    aggressiveness: { min: 30, max: 55 },
    tickMovement: { min: 1, max: 12 },
    trendStrength: { min: 30, max: 65 },
    reversalProbability: { min: 10, max: 25 },
    regime: 'NORMAL',
    session: 'ACTIVE_SESSION',
  },
  ACTIVE_MARKET: {
    spread: { min: 12, max: 25 },
    volatility: { min: 0.40, max: 0.75 },
    marketSpeed: { min: 50, max: 75 },
    aggressiveness: { min: 55, max: 75 },
    tickMovement: { min: 2, max: 18 },
    trendStrength: { min: 45, max: 80 },
    reversalProbability: { min: 8, max: 22 },
    regime: 'TREND',
    session: 'ACTIVE_SESSION',
  },
  AGGRESSIVE_MARKET: {
    spread: { min: 15, max: 30 },
    volatility: { min: 0.65, max: 0.90 },
    marketSpeed: { min: 70, max: 90 },
    aggressiveness: { min: 75, max: 95 },
    tickMovement: { min: 3, max: 25 },
    trendStrength: { min: 60, max: 90 },
    reversalProbability: { min: 5, max: 30 },
    regime: 'HIGH_VOLATILITY',
    session: 'VOLATILITY_SESSION',
  },
  CHAOTIC_MARKET: {
    spread: { min: 18, max: 35 },
    volatility: { min: 0.80, max: 1.0 },
    marketSpeed: { min: 75, max: 100 },
    aggressiveness: { min: 85, max: 100 },
    tickMovement: { min: 5, max: 35 },
    trendStrength: { min: 40, max: 95 },
    reversalProbability: { min: 20, max: 50 },
    regime: 'EXTREME',
    session: 'EVENT_SESSION',
  },
};

/**
 * Universal Clamp for Invariant Enforcement (Section 15: Dynamic Range Engine)
 * A <= value <= B guaranteed at all times.
 */
export function clampToRange(val: number, range: RangeParam): number {
  const min = Math.min(range.min, range.max);
  const max = Math.max(range.min, range.max);
  return Math.max(min, Math.min(max, val));
}

/**
 * Exponential Moving Average / Inertia Smoother (Section 16: Smooth Transition System)
 */
export function smoothTransition(current: number, target: number, smoothingFactor = 0.85): number {
  return current * smoothingFactor + target * (1 - smoothingFactor);
}

/**
 * Market Engine Class
 * Simulates procedural, non-random commodity price action for "OQ OLTIN / UZS"
 */
export class OqOltinMarketEngine {
  public config: MarketEngineConfig;
  public metrics: LiveMarketMetrics;

  // Internal state machines for procedural realism
  private currentRawPrice: number;
  private currentRawSpread: number;
  private currentRawVolatility: number;
  private currentRawSpeed: number;
  private currentRawAggressiveness: number;
  private currentRawTrendStrength: number;
  private currentRawTrendBias: number;
  private currentRawRandomness: number;

  // State flags for structure
  private momentumHistory: number[] = [];
  private priceHistoryShort: number[] = [];
  private inPullback = false;
  private pullbackRemainingTicks = 0;
  private pullbackDirection: 1 | -1 = 1;

  private inBreakout = false;
  private breakoutRemainingTicks = 0;
  private breakoutDirection: 1 | -1 = 1;

  private spikeCooldown = 0;
  private currentSpikeRecoveryDelta = 0;

  private activeEvents: MarketEvent[] = [];
  private regimeTicksRemaining = 120;
  private totalTicks = 0;

  // Multi-timeframe bar buffers
  private candlesByTimeframe: Map<Timeframe, Candle[]> = new Map();
  private currentBuildingCandles: Map<Timeframe, Candle> = new Map();

  constructor(initialConfig: MarketEngineConfig = DEFAULT_ENGINE_CONFIG) {
    this.config = { ...initialConfig };
    this.currentRawPrice = initialConfig.initialPrice;
    this.currentRawSpread = (initialConfig.spread.min + initialConfig.spread.max) / 2;
    this.currentRawVolatility = (initialConfig.volatility.min + initialConfig.volatility.max) / 2;
    this.currentRawSpeed = (initialConfig.marketSpeed.min + initialConfig.marketSpeed.max) / 2;
    this.currentRawAggressiveness = (initialConfig.aggressiveness.min + initialConfig.aggressiveness.max) / 2;
    this.currentRawTrendStrength = (initialConfig.trendStrength.min + initialConfig.trendStrength.max) / 2;
    this.currentRawTrendBias = (initialConfig.trendBias.min + initialConfig.trendBias.max) / 2;
    this.currentRawRandomness = (initialConfig.randomness.min + initialConfig.randomness.max) / 2;

    const initialSpread = clampToRange(this.currentRawSpread, this.config.spread);
    const halfSpread = initialSpread / 2;

    this.metrics = {
      currentPrice: this.currentRawPrice,
      bidPrice: Math.round(this.currentRawPrice - halfSpread),
      askPrice: Math.round(this.currentRawPrice + halfSpread),
      currentSpread: Math.round(initialSpread * 10) / 10,
      currentVolatility: Math.round(this.currentRawVolatility * 100) / 100,
      currentSpeed: Math.round(this.currentRawSpeed),
      currentAggressiveness: Math.round(this.currentRawAggressiveness),
      currentTrendStrength: Math.round(this.currentRawTrendStrength),
      currentTrendBias: Math.round(this.currentRawTrendBias),
      currentMomentum: 0,
      currentRegime: this.config.regime,
      currentSession: this.config.session,
      currentLiquidity: 88,
      priceChange24h: 180,
      priceChange24hPct: 0.84,
      high24h: 21850,
      low24h: 21200,
      volume24h: 142850,
      ticksGenerated: 0,
      lastTickTime: Date.now(),
      lastDirection: 'FLAT',
    };

    // Initialize historical candles for all timeframes
    this.initHistory();
  }

  /**
   * Pre-generate historical bars so the chart opens immediately with rich, natural data
   */
  private initHistory() {
    const timeframes: Timeframe[] = ['1S', '5S', '15S', '30S', '1M', '5M', '15M', '1H', '4H', '1D'];
    const now = Date.now();
    const barsCount = 600;

    timeframes.forEach((tf) => {
      const sec = TIMEFRAME_SECONDS[tf];
      const candles: Candle[] = [];
      let lastClose = this.config.initialPrice - 180;
      let waveBias = 0;

      for (let i = barsCount; i > 0; i--) {
        const barTime = now - (i * sec * 1000);
        const open = lastClose;

        // Realistic multi-wave cycle (trends, consolidate, swing)
        if (i % 30 === 0) {
          waveBias = (Math.random() - 0.49) * 14;
        }
        const meanRev = (this.config.initialPrice - open) * 0.015;
        const noise = (Math.random() - 0.5) * (12 + Math.sqrt(sec) * 1.8);
        const delta = waveBias + meanRev + noise;

        let close = Math.round(open + delta);
        close = Math.max(this.config.minPrice + 80, Math.min(this.config.maxPrice - 80, close));

        const wick = Math.max(3, Math.random() * (10 + Math.sqrt(sec) * 1.5));
        const high = Math.round(Math.max(open, close) + wick * Math.random());
        const low = Math.round(Math.min(open, close) - wick * Math.random());
        const volume = Math.round(800 + Math.random() * 3200 * Math.sqrt(sec));

        candles.push({
          time: barTime,
          open,
          high,
          low,
          close,
          volume,
          isComplete: true,
        });

        lastClose = close;
      }

      this.candlesByTimeframe.set(tf, candles);

      // Current live candle
      const currentCandle: Candle = {
        time: Math.floor(now / (sec * 1000)) * (sec * 1000),
        open: lastClose,
        high: lastClose,
        low: lastClose,
        close: lastClose,
        volume: 0,
        isComplete: false,
      };
      this.currentBuildingCandles.set(tf, currentCandle);
    });

    this.currentRawPrice = this.candlesByTimeframe.get('1S')?.slice(-1)[0]?.close || this.config.initialPrice;
  }

  /**
   * Universal Range Validation (Section 23: Range Validation)
   */
  public static validateRange(param: RangeParam, paramName: string): { isValid: boolean; error?: string } {
    if (param.min > param.max) {
      return {
        isValid: false,
        error: `${paramName}: Minimum (${param.min}) cannot be greater than Maximum (${param.max})!`,
      };
    }
    return { isValid: true };
  }

  /**
   * Apply safely updated configuration with instant dynamic invariant checks
   */
  public updateConfig(newConfig: Partial<MarketEngineConfig>) {
    // Audit check on all ranges
    if (newConfig.spread && !OqOltinMarketEngine.validateRange(newConfig.spread, 'Spread').isValid) return;
    if (newConfig.volatility && !OqOltinMarketEngine.validateRange(newConfig.volatility, 'Volatility').isValid) return;
    if (newConfig.aggressiveness && !OqOltinMarketEngine.validateRange(newConfig.aggressiveness, 'Aggressiveness').isValid) return;
    if (newConfig.marketSpeed && !OqOltinMarketEngine.validateRange(newConfig.marketSpeed, 'Market Speed').isValid) return;
    if (newConfig.tickMovement && !OqOltinMarketEngine.validateRange(newConfig.tickMovement, 'Tick Movement').isValid) return;
    if (newConfig.trendBias && !OqOltinMarketEngine.validateRange(newConfig.trendBias, 'Trend Bias').isValid) return;
    if (newConfig.trendStrength && !OqOltinMarketEngine.validateRange(newConfig.trendStrength, 'Trend Strength').isValid) return;
    if (newConfig.reversalProbability && !OqOltinMarketEngine.validateRange(newConfig.reversalProbability, 'Reversal Prob').isValid) return;

    this.config = { ...this.config, ...newConfig };

    // Immediately clamp active internal dynamics to newly bounded ranges
    this.currentRawSpread = clampToRange(this.currentRawSpread, this.config.spread);
    this.currentRawVolatility = clampToRange(this.currentRawVolatility, this.config.volatility);
    this.currentRawSpeed = clampToRange(this.currentRawSpeed, this.config.marketSpeed);
    this.currentRawAggressiveness = clampToRange(this.currentRawAggressiveness, this.config.aggressiveness);
    this.currentRawTrendStrength = clampToRange(this.currentRawTrendStrength, this.config.trendStrength);
    this.currentRawTrendBias = clampToRange(this.currentRawTrendBias, this.config.trendBias);
  }

  /**
   * Add a visual market event
   */
  public triggerEvent(event: Omit<MarketEvent, 'id' | 'timestamp'>): MarketEvent {
    const fullEvent: MarketEvent = {
      ...event,
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    this.activeEvents.push(fullEvent);
    return fullEvent;
  }

  /**
   * Main Market Engine Tick Step (called on tick interval)
   * Implements:
   * - Procedural Price Generation (Section 19)
   * - Universal Dynamic Range Clamp (Section 15)
   * - Smooth Transitions (Section 16)
   * - Volatility Clustering (Section 17)
   * - Market Memory (Section 18)
   */
  public stepTick(): {
    newPrice: number;
    delta: number;
    bid: number;
    ask: number;
    spread: number;
    timestamp: number;
    volume: number;
  } {
    if (this.config.isPaused) {
      return {
        newPrice: this.metrics.currentPrice,
        delta: 0,
        bid: this.metrics.bidPrice,
        ask: this.metrics.askPrice,
        spread: this.metrics.currentSpread,
        timestamp: Date.now(),
        volume: 0,
      };
    }

    const now = Date.now();
    this.totalTicks++;

    // 1. Regime Auto Transition (Section 14)
    if (this.config.autoRegimeCycle) {
      this.regimeTicksRemaining--;
      if (this.regimeTicksRemaining <= 0) {
        this.transitionRegime();
      }
    }

    // 2. Dynamic Target Calculation for Parameters (Smooth Transitions - Section 16)
    const targetSpread = this.computeTargetSpread();
    const targetVolatility = this.computeTargetVolatility();
    const targetSpeed = this.computeTargetSpeed();
    const targetAggressiveness = this.computeTargetAggressiveness();
    const targetTrendStrength = this.computeTargetTrendStrength();
    const targetTrendBias = this.computeTargetTrendBias();

    // Smooth inertia interpolation
    const smoothing = this.config.spreadSmoothing;
    this.currentRawSpread = smoothTransition(this.currentRawSpread, targetSpread, smoothing);
    this.currentRawVolatility = smoothTransition(this.currentRawVolatility, targetVolatility, 0.88);
    this.currentRawSpeed = smoothTransition(this.currentRawSpeed, targetSpeed, 0.90);
    this.currentRawAggressiveness = smoothTransition(this.currentRawAggressiveness, targetAggressiveness, 0.85);
    this.currentRawTrendStrength = smoothTransition(this.currentRawTrendStrength, targetTrendStrength, 0.92);
    this.currentRawTrendBias = smoothTransition(this.currentRawTrendBias, targetTrendBias, 0.90);

    // CRITICAL: Guaranteed Clamp to Admin Configured Ranges (Section 15: Universal Clamp)
    const activeSpread = clampToRange(this.currentRawSpread, this.config.spread);
    const activeVolatility = clampToRange(this.currentRawVolatility, this.config.volatility);
    const activeSpeed = clampToRange(this.currentRawSpeed, this.config.marketSpeed);
    const activeAggressiveness = clampToRange(this.currentRawAggressiveness, this.config.aggressiveness);
    const activeTrendStrength = clampToRange(this.currentRawTrendStrength, this.config.trendStrength);
    const activeTrendBias = clampToRange(this.currentRawTrendBias, this.config.trendBias);

    // 3. Procedural Price Component Breakdown (Section 19: Price Generation)
    const w = this.config.weights;

    // A. Base Trend component (-1 to +1 normalized)
    // 50 is neutral, >50 bullish, <50 bearish
    let biasSign = 0;
    if (this.config.activeBiasDirection === 'BULLISH') {
      biasSign = (activeTrendBias - 40) / 30; // ~0.1 to 1.0
    } else if (this.config.activeBiasDirection === 'BEARISH') {
      biasSign = -(60 - activeTrendBias) / 30; // ~-0.1 to -1.0
    } else {
      biasSign = (activeTrendBias - 50) / 25;
    }
    const baseTrendComponent = biasSign * (activeTrendStrength / 100);

    // B. Momentum component (moving average slope)
    let momentumComponent = 0;
    if (this.momentumHistory.length > 5) {
      const avgMomentum = this.momentumHistory.reduce((a, b) => a + b, 0) / this.momentumHistory.length;
      momentumComponent = Math.tanh(avgMomentum / 5);
    }

    // C. Mean Reversion & Market Memory (Section 18)
    let meanReversionComponent = 0;
    if (this.priceHistoryShort.length > 20) {
      const sma = this.priceHistoryShort.reduce((a, b) => a + b, 0) / this.priceHistoryShort.length;
      const stretch = (this.currentRawPrice - sma) / sma;
      // Overstretched price pulls back
      meanReversionComponent = -Math.tanh(stretch * 25);
    }

    // D. Pullback State Machine (Section 11)
    let pullbackComponent = 0;
    if (this.inPullback) {
      pullbackComponent = this.pullbackDirection * ((this.config.pullbackStrength.min + this.config.pullbackStrength.max) / 200);
      this.pullbackRemainingTicks--;
      if (this.pullbackRemainingTicks <= 0) {
        this.inPullback = false;
      }
    } else {
      // Trigger pullback chance based on trend extension
      const pRoll = Math.random() * 100;
      if (pRoll < this.config.pullbackFrequency * 0.08) {
        this.inPullback = true;
        this.pullbackRemainingTicks = this.config.pullbackDurationTicks;
        this.pullbackDirection = baseTrendComponent >= 0 ? -1 : 1;
      }
    }

    // E. Breakout State Machine (Section 12)
    let breakoutComponent = 0;
    if (this.inBreakout) {
      breakoutComponent = this.breakoutDirection * this.config.breakoutStrength;
      this.breakoutRemainingTicks--;
      if (this.breakoutRemainingTicks <= 0) {
        this.inBreakout = false;
      }
    } else {
      const breakoutRoll = Math.random() * 100;
      const brkProb = (this.config.breakoutProbability.min + this.config.breakoutProbability.max) / 2;
      if (breakoutRoll < brkProb * 0.05) {
        this.inBreakout = true;
        this.breakoutRemainingTicks = this.config.breakoutDurationTicks;
        this.breakoutDirection = Math.random() > 0.45 ? (biasSign >= 0 ? 1 : -1) : -1;
      }
    }

    // F. Spike Handling (Section 13)
    let spikeComponent = 0;
    if (this.spikeCooldown > 0) {
      this.spikeCooldown--;
      spikeComponent = this.currentSpikeRecoveryDelta;
      this.currentSpikeRecoveryDelta *= (1 - this.config.spikeRecoverySpeed * 0.3);
    } else {
      const spikeRoll = Math.random() * 100;
      const spikeProb = (this.config.spikeProbability.min + this.config.spikeProbability.max) / 2;
      if (spikeRoll < spikeProb * 0.03) {
        const spikeDir = Math.random() > 0.5 ? 1 : -1;
        const spikeMagnitude = (this.config.tickMovement.max * this.config.spikeStrength);
        spikeComponent = spikeDir * spikeMagnitude;
        this.spikeCooldown = this.config.spikeCooldownTicks;
        this.currentSpikeRecoveryDelta = -spikeComponent * 0.4;
      }
    }

    // G. Active Event Impact
    let eventComponent = 0;
    this.activeEvents = this.activeEvents.filter((ev) => now - ev.timestamp < ev.durationSec * 1000);
    this.activeEvents.forEach((ev) => {
      const intensityScale = ev.intensity / 3;
      if (ev.impact === 'BULLISH') eventComponent += intensityScale * 0.8;
      if (ev.impact === 'BEARISH') eventComponent -= intensityScale * 0.8;
      if (ev.impact === 'VOLATILITY') eventComponent += (Math.random() - 0.5) * intensityScale * 1.5;
    });

    // H. Market Noise & Stochastic Randomness (Section 20)
    // Box-Muller Gaussian Noise
    const u1 = Math.max(1e-6, Math.random());
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const noiseComponent = gaussian * (this.currentRawRandomness / 30);

    // Sum weighted procedural components
    const aggregateSignal =
      (w.baseTrend * baseTrendComponent) +
      (w.momentum * momentumComponent) +
      (w.meanReversion * meanReversionComponent) +
      (w.pullback * pullbackComponent) +
      (w.breakout * breakoutComponent) +
      (w.marketNoise * noiseComponent) +
      (w.eventEffect * eventComponent);

    // Scale signal by Aggressiveness (0 - 100) and Volatility (0 - 1.0)
    const aggressivenessFactor = 0.3 + (activeAggressiveness / 100) * 1.4;
    const volatilityFactor = 0.5 + activeVolatility * 1.8;

    let computedDelta = aggregateSignal * aggressivenessFactor * volatilityFactor * 5;
    if (spikeComponent !== 0) {
      computedDelta += spikeComponent;
    }

    // Tick Movement Range Clamp (Section 7)
    const sign = computedDelta >= 0 ? 1 : -1;
    let absDelta = Math.abs(computedDelta);

    // Strictly clamp tick movement into [minTickMovement, maxTickMovement]
    const clampedTickMovement = clampToRange(absDelta, this.config.tickMovement);
    const finalDelta = sign * clampedTickMovement;

    // Apply Price precision & steps (Section 1: Base & Step)
    const step = this.config.priceStep || 1;
    const roundedDelta = Math.round(finalDelta / step) * step;

    // Compute new price with strict Min/Max price boundaries
    let tentativePrice = this.currentRawPrice + roundedDelta;
    if (tentativePrice < this.config.minPrice) {
      tentativePrice = this.config.minPrice;
    } else if (tentativePrice > this.config.maxPrice) {
      tentativePrice = this.config.maxPrice;
    }

    this.currentRawPrice = tentativePrice;

    // Maintain memory history
    this.priceHistoryShort.push(this.currentRawPrice);
    if (this.priceHistoryShort.length > 100) this.priceHistoryShort.shift();

    this.momentumHistory.push(roundedDelta);
    if (this.momentumHistory.length > 20) this.momentumHistory.shift();

    // Volume generation proportional to tick delta & aggressiveness
    const baseVolume = 100 + Math.round(activeAggressiveness * 15 + Math.abs(roundedDelta) * 45);

    // Update Bid/Ask with strict Clamp
    const halfSpread = activeSpread / 2;
    const bid = Math.round(this.currentRawPrice - halfSpread);
    const ask = Math.round(this.currentRawPrice + halfSpread);

    // Aggregate into multi-timeframe candles (Section 26 & 27: Natural OHLC Candle Formation)
    this.updateCandles(this.currentRawPrice, baseVolume, now);

    // Update Live Metrics (Section 22: Professional Live Monitor)
    const initialPrice = this.config.initialPrice;
    const diff24h = this.currentRawPrice - initialPrice;
    const diff24hPct = initialPrice > 0 ? (diff24h / initialPrice) * 100 : 0;

    this.metrics = {
      currentPrice: this.currentRawPrice,
      bidPrice: bid,
      askPrice: ask,
      currentSpread: Math.round(activeSpread * 10) / 10,
      currentVolatility: Math.round(activeVolatility * 100) / 100,
      currentSpeed: Math.round(activeSpeed),
      currentAggressiveness: Math.round(activeAggressiveness),
      currentTrendStrength: Math.round(activeTrendStrength),
      currentTrendBias: Math.round(activeTrendBias),
      currentMomentum: Math.round(momentumComponent * 100) / 100,
      currentRegime: this.config.regime,
      currentSession: this.config.session,
      currentLiquidity: Math.round(Math.max(20, Math.min(99, 100 - (activeSpread * 1.5)))),
      priceChange24h: roundedDelta,
      priceChange24hPct: Math.round(diff24hPct * 100) / 100,
      high24h: Math.max(this.metrics.high24h, this.currentRawPrice),
      low24h: Math.min(this.metrics.low24h, this.currentRawPrice),
      volume24h: this.metrics.volume24h + baseVolume,
      ticksGenerated: this.totalTicks,
      lastTickTime: now,
      lastDirection: roundedDelta > 0 ? 'UP' : roundedDelta < 0 ? 'DOWN' : 'FLAT',
    };

    return {
      newPrice: this.currentRawPrice,
      delta: roundedDelta,
      bid,
      ask,
      spread: activeSpread,
      timestamp: now,
      volume: baseVolume,
    };
  }

  /**
   * Section 26 & 27 & 28: Candle formation and dynamic aggregation across all timeframes
   */
  private updateCandles(price: number, volume: number, now: number) {
    const timeframes: Timeframe[] = ['1S', '5S', '15S', '30S', '1M', '5M', '15M', '1H', '4H', '1D'];

    timeframes.forEach((tf) => {
      const intervalMs = TIMEFRAME_SECONDS[tf] * 1000;
      const barSlot = Math.floor(now / intervalMs) * intervalMs;
      const candles = this.candlesByTimeframe.get(tf) || [];
      let current = this.currentBuildingCandles.get(tf);

      if (!current || current.time !== barSlot) {
        // Close previous candle if it existed
        if (current) {
          current.isComplete = true;
          // Invariant Check: High >= max(Open, Close) and Low <= min(Open, Close)
          current.high = Math.max(current.high, current.open, current.close);
          current.low = Math.min(current.low, current.open, current.close);
          candles.push({ ...current });
          if (candles.length > 2500) candles.shift();
        }

        // Start new live bar
        const openPrice = current ? current.close : price;
        current = {
          time: barSlot,
          open: openPrice,
          high: Math.max(openPrice, price),
          low: Math.min(openPrice, price),
          close: price,
          volume,
          isComplete: false,
        };
      } else {
        // Update live forming candle tick by tick
        current.high = Math.max(current.high, price);
        current.low = Math.min(current.low, price);
        current.close = price;
        current.volume += volume;
      }

      this.currentBuildingCandles.set(tf, current);
      this.candlesByTimeframe.set(tf, candles);
    });
  }

  /**
   * Retrieve candles for a given timeframe, including the live developing bar
   */
  public getCandles(tf: Timeframe): Candle[] {
    const historical = this.candlesByTimeframe.get(tf) || [];
    const active = this.currentBuildingCandles.get(tf);
    if (!active) return historical;
    return [...historical, active];
  }

  /**
   * Transition regime organically or by admin
   */
  public setRegime(regime: MarketRegimeType) {
    this.config.regime = regime;
    const rConfig = this.config.regimeConfigs[regime] || DEFAULT_REGIME_CONFIGS[regime];
    this.regimeTicksRemaining = Math.round(
      (rConfig.minDurationSec + Math.random() * (rConfig.maxDurationSec - rConfig.minDurationSec)) * 2
    );
  }

  private transitionRegime() {
    const regimes: MarketRegimeType[] = ['CALM', 'NORMAL', 'TREND', 'CHOPPY', 'BREAKOUT', 'HIGH_VOLATILITY'];
    const currentIdx = regimes.indexOf(this.config.regime);
    let nextIdx = (currentIdx + 1) % regimes.length;
    if (Math.random() > 0.4) {
      // Natural probabilistic jump to adjacent regime
      nextIdx = (currentIdx + (Math.random() > 0.5 ? 1 : -1) + regimes.length) % regimes.length;
    }
    this.setRegime(regimes[nextIdx]);
  }

  // --- Dynamic Target Math Helpers ---
  private computeTargetSpread(): number {
    const rConfig = this.config.regimeConfigs[this.config.regime] || DEFAULT_REGIME_CONFIGS[this.config.regime];
    const base = (this.config.spread.min + this.config.spread.max) / 2;
    // Volatility drives spread wider
    const volEffect = this.currentRawVolatility * 4;
    const noise = (Math.random() - 0.5) * (this.config.spreadRandomness / 20);
    const target = base + volEffect + noise;
    return clampToRange(target, this.config.spread);
  }

  private computeTargetVolatility(): number {
    const rConfig = this.config.regimeConfigs[this.config.regime] || DEFAULT_REGIME_CONFIGS[this.config.regime];
    const rMin = Math.max(this.config.volatility.min, rConfig.minVolatility);
    const rMax = Math.min(this.config.volatility.max, rConfig.maxVolatility);
    const mid = (rMin + rMax) / 2;
    // Volatility clustering (persistence - Section 17)
    const persist = this.config.volatilityPersistence / 100;
    const randomKick = (Math.random() - 0.5) * (this.config.volatilityRandomness / 100);
    const target = (this.currentRawVolatility * persist) + (mid * (1 - persist)) + randomKick;
    return clampToRange(target, this.config.volatility);
  }

  private computeTargetSpeed(): number {
    const base = (this.config.marketSpeed.min + this.config.marketSpeed.max) / 2;
    const rConfig = this.config.regimeConfigs[this.config.regime] || DEFAULT_REGIME_CONFIGS[this.config.regime];
    const target = base + (rConfig.minSpeed - 20) * 0.3 + (Math.random() - 0.5) * 8;
    return clampToRange(target, this.config.marketSpeed);
  }

  private computeTargetAggressiveness(): number {
    const base = (this.config.aggressiveness.min + this.config.aggressiveness.max) / 2;
    const target = base + (this.currentRawVolatility - 0.5) * 20 + (Math.random() - 0.5) * 6;
    return clampToRange(target, this.config.aggressiveness);
  }

  private computeTargetTrendStrength(): number {
    const base = (this.config.trendStrength.min + this.config.trendStrength.max) / 2;
    const target = base + (Math.random() - 0.48) * 12;
    return clampToRange(target, this.config.trendStrength);
  }

  private computeTargetTrendBias(): number {
    const base = (this.config.trendBias.min + this.config.trendBias.max) / 2;
    const target = base + (Math.random() - 0.5) * 6;
    return clampToRange(target, this.config.trendBias);
  }
}
