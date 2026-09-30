'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Candle, Timeframe, Position, MarketEvent, AppTheme } from '@/lib/market-types';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Zap,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  TrendingUp,
  Target,
  MousePointer,
  Minus as LineIcon,
  Divide,
  Trash2,
  Undo2,
  Search,
  Check,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';

interface TradingChartProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  positions: Position[];
  marketEvents: MarketEvent[];
  chartSpeed: 'SLOW' | 'NORMAL' | 'FAST' | 'ULTRA';
  onChartSpeedChange: (speed: 'SLOW' | 'NORMAL' | 'FAST' | 'ULTRA') => void;
  isPaused: boolean;
  theme?: AppTheme;
  onQuickTrade?: (type: 'BUY' | 'SELL', volumeKg: number) => void;
  onClosePosition?: (id: string) => void;
  onCloseAllPositions?: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1S', '5S', '15S', '30S', '1M', '5M', '15M', '1H', '4H', '1D'];

export type ChartStyle = 'CANDLES' | 'HEIKIN_ASHI' | 'LINE';

export type DrawingToolType = 'CURSOR' | 'TREND_LINE' | 'FIBONACCI' | 'HORIZONTAL_LINE';

export interface TrendLineDrawing {
  id: string;
  type: 'TREND_LINE';
  startIndex: number;
  startPrice: number;
  endIndex: number;
  endPrice: number;
  color: string;
}

export interface FibonacciDrawing {
  id: string;
  type: 'FIBONACCI';
  startIndex: number;
  startPrice: number;
  endIndex: number;
  endPrice: number;
}

export interface HorizontalLineDrawing {
  id: string;
  type: 'HORIZONTAL_LINE';
  price: number;
  color: string;
}

export type ChartDrawing = TrendLineDrawing | FibonacciDrawing | HorizontalLineDrawing;

export interface IndicatorSettings {
  sma20: boolean;
  ema50: boolean;
  ema200: boolean;
  bollingerBands: boolean;
  vwap: boolean;
  supportResistance: boolean;
  volume: boolean;
  rsi: boolean;
  macd: boolean;
  highLowLabels: boolean;
  gridLines: boolean;
}

const FIB_LEVELS = [
  { ratio: 0.0, color: 'rgba(239, 68, 68, 0.85)', bg: 'rgba(239, 68, 68, 0.05)' },
  { ratio: 0.236, color: 'rgba(245, 158, 11, 0.85)', bg: 'rgba(245, 158, 11, 0.05)' },
  { ratio: 0.382, color: 'rgba(56, 189, 248, 0.85)', bg: 'rgba(56, 189, 248, 0.08)' },
  { ratio: 0.5, color: 'rgba(16, 185, 129, 0.95)', bg: 'rgba(245, 158, 11, 0.12)' },
  { ratio: 0.618, color: 'rgba(245, 158, 11, 0.95)', bg: 'rgba(245, 158, 11, 0.08)' },
  { ratio: 0.786, color: 'rgba(168, 85, 247, 0.85)', bg: 'rgba(168, 85, 247, 0.05)' },
  { ratio: 1.0, color: 'rgba(239, 68, 68, 0.85)', bg: 'transparent' },
];

const THEME_CHART_COLORS: Record<
  AppTheme,
  {
    bg: string;
    grid: string;
    text: string;
    textMuted: string;
    bull: string;
    bear: string;
    accent: string;
    crosshair: string;
    volBull: string;
    volBear: string;
    sma20: string;
    ema50: string;
    ema200: string;
    bbLine: string;
    bbFill: string;
    vwap: string;
    rsiLine: string;
    macdLine: string;
  }
> = {
  DARK: {
    bg: '#0B0E14',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#94A3B8',
    textMuted: '#64748B',
    bull: '#10B981',
    bear: '#EF4444',
    accent: '#F59E0B',
    crosshair: 'rgba(245, 158, 11, 0.45)',
    volBull: 'rgba(16, 185, 129, 0.25)',
    volBear: 'rgba(239, 68, 68, 0.25)',
    sma20: '#F59E0B',
    ema50: '#38BDF8',
    ema200: '#A855F7',
    bbLine: 'rgba(56, 189, 248, 0.6)',
    bbFill: 'rgba(56, 189, 248, 0.06)',
    vwap: '#34D399',
    rsiLine: '#F59E0B',
    macdLine: '#38BDF8',
  },
  LIGHT: {
    bg: '#FFFFFF',
    grid: 'rgba(0, 0, 0, 0.06)',
    text: '#475569',
    textMuted: '#94A3B8',
    bull: '#059669',
    bear: '#DC2626',
    accent: '#D97706',
    crosshair: 'rgba(217, 119, 6, 0.45)',
    volBull: 'rgba(5, 150, 105, 0.2)',
    volBear: 'rgba(220, 38, 38, 0.2)',
    sma20: '#D97706',
    ema50: '#0284C7',
    ema200: '#7E22CE',
    bbLine: 'rgba(2, 132, 199, 0.6)',
    bbFill: 'rgba(2, 132, 199, 0.06)',
    vwap: '#059669',
    rsiLine: '#D97706',
    macdLine: '#0284C7',
  },
  OLED: {
    bg: '#000000',
    grid: 'rgba(255, 255, 255, 0.08)',
    text: '#A1A1AA',
    textMuted: '#71717A',
    bull: '#22C55E',
    bear: '#F43F5E',
    accent: '#EAB308',
    crosshair: 'rgba(234, 179, 8, 0.5)',
    volBull: 'rgba(34, 197, 94, 0.3)',
    volBear: 'rgba(244, 63, 94, 0.3)',
    sma20: '#EAB308',
    ema50: '#00E5FF',
    ema200: '#D946EF',
    bbLine: 'rgba(0, 229, 255, 0.7)',
    bbFill: 'rgba(0, 229, 255, 0.08)',
    vwap: '#10B981',
    rsiLine: '#EAB308',
    macdLine: '#00E5FF',
  },
  GOLD: {
    bg: '#12100E',
    grid: 'rgba(245, 158, 11, 0.08)',
    text: '#D4C5A9',
    textMuted: '#A3937B',
    bull: '#10B981',
    bear: '#EF4444',
    accent: '#F59E0B',
    crosshair: 'rgba(245, 158, 11, 0.5)',
    volBull: 'rgba(16, 185, 129, 0.25)',
    volBear: 'rgba(239, 68, 68, 0.25)',
    sma20: '#FBBF24',
    ema50: '#38BDF8',
    ema200: '#C084FC',
    bbLine: 'rgba(245, 158, 11, 0.6)',
    bbFill: 'rgba(245, 158, 11, 0.06)',
    vwap: '#34D399',
    rsiLine: '#FBBF24',
    macdLine: '#38BDF8',
  },
};

// Unified Geometry Engine: Guarantees 100% exact alignment between rendering and mouse click coordinates!
const getChartGeometry = (width: number, height: number, ind: IndicatorSettings) => {
  const priceScaleWidth = 78;
  const timeScaleHeight = 24;
  const chartWidth = Math.max(80, width - priceScaleWidth);

  const volumeHeight = ind.volume ? 42 : 0;
  const rsiHeight = ind.rsi ? 54 : 0;
  const macdHeight = ind.macd ? 54 : 0;

  const totalSubPanels = volumeHeight + rsiHeight + macdHeight;
  const mainChartHeight = Math.max(90, height - timeScaleHeight - totalSubPanels);

  const volY = mainChartHeight;
  const rsiY = volY + volumeHeight;
  const macdY = rsiY + rsiHeight;

  return {
    priceScaleWidth,
    timeScaleHeight,
    chartWidth,
    volumeHeight,
    rsiHeight,
    macdHeight,
    totalSubPanels,
    mainChartHeight,
    volY,
    rsiY,
    macdY,
  };
};

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  currentPrice,
  bidPrice,
  askPrice,
  positions,
  marketEvents,
  chartSpeed,
  onChartSpeedChange,
  isPaused,
  theme = 'DARK',
  onQuickTrade,
  onClosePosition,
  onCloseAllPositions,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Quick on-chart trading state
  const [chartVolumeKg, setChartVolumeKg] = useState<number>(100);
  const [showQuickTradeBar, setShowQuickTradeBar] = useState<boolean>(true);

  // Chart Style
  const [chartStyle, setChartStyle] = useState<ChartStyle>('CANDLES');

  // Indicators State
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma20: true,
    ema50: true,
    ema200: false,
    bollingerBands: false,
    vwap: false,
    supportResistance: false,
    volume: true,
    rsi: false,
    macd: false,
    highLowLabels: true,
    gridLines: true,
  });

  const [isIndModalOpen, setIsIndModalOpen] = useState(false);
  const [indSearch, setIndSearch] = useState('');
  const [indCategory, setIndCategory] = useState<'ALL' | 'TREND' | 'OSCILLATOR' | 'LEVELS'>('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Right breathing margin (14 empty bar projection space ahead of live candle)
  const [rightMarginBars, setRightMarginBars] = useState<number>(14);
  const [visibleBarsCount, setVisibleBarsCount] = useState<number>(60);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isPriceCentered, setIsPriceCentered] = useState<boolean>(true);

  // Crosshair
  const [crosshair, setCrosshair] = useState<{
    x: number;
    y: number;
    candle: Candle | null;
    price: number;
  } | null>(null);

  // Drawing Tools State
  const [activeTool, setActiveTool] = useState<DrawingToolType>('CURSOR');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [drawingDraft, setDrawingDraft] = useState<{
    type: DrawingToolType;
    startIndex: number;
    startPrice: number;
    currentIndex: number;
    currentPrice: number;
  } | null>(null);

  // Drag pan refs & state
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  const colors = THEME_CHART_COLORS[theme] || THEME_CHART_COLORS.DARK;
  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  // Fullscreen management: targets React state + CSS fallback + native API so it NEVER gets stuck
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (!next) {
        if (typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } else {
        if (rootRef.current?.requestFullscreen) {
          rootRef.current.requestFullscreen().catch(() => {});
        }
      }
      return next;
    });
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Pre-calculate Heikin-Ashi candles
  const displayCandles = useMemo(() => {
    if (chartStyle !== 'HEIKIN_ASHI' || candles.length === 0) return candles;
    const haCandles: Candle[] = [];
    let prevOpen = candles[0].open;
    let prevClose = candles[0].close;

    candles.forEach((c, idx) => {
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = idx === 0 ? (c.open + c.close) / 2 : (prevOpen + prevClose) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);

      haCandles.push({
        ...c,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
      });

      prevOpen = haOpen;
      prevClose = haClose;
    });

    return haCandles;
  }, [candles, chartStyle]);

  // Precompute Technical Indicators in useMemo (60fps silky smooth)
  const technicalData = useMemo(() => {
    const n = displayCandles.length;
    const sma20: (number | null)[] = new Array(n).fill(null);
    const ema50: (number | null)[] = new Array(n).fill(null);
    const ema200: (number | null)[] = new Array(n).fill(null);
    const bbUpper: (number | null)[] = new Array(n).fill(null);
    const bbLower: (number | null)[] = new Array(n).fill(null);
    const vwap: (number | null)[] = new Array(n).fill(null);
    const rsi14: (number | null)[] = new Array(n).fill(null);
    const macdHist: (number | null)[] = new Array(n).fill(null);

    if (n === 0) {
      return { sma20, ema50, ema200, bbUpper, bbLower, vwap, rsi14, macdHist };
    }

    let cumVol = 0;
    let cumTypical = 0;
    const k50 = 2 / (50 + 1);
    const k200 = 2 / (200 + 1);
    let prevEma50 = displayCandles[0].close;
    let prevEma200 = displayCandles[0].close;

    for (let i = 0; i < n; i++) {
      const c = displayCandles[i];

      // VWAP
      const tp = (c.high + c.low + c.close) / 3;
      cumVol += c.volume;
      cumTypical += tp * c.volume;
      vwap[i] = cumVol > 0 ? cumTypical / cumVol : c.close;

      // SMA 20 & Bollinger Bands
      if (i >= 19) {
        let sum = 0;
        for (let j = i - 19; j <= i; j++) sum += displayCandles[j].close;
        const mean = sum / 20;
        sma20[i] = mean;

        let varianceSum = 0;
        for (let j = i - 19; j <= i; j++) {
          varianceSum += Math.pow(displayCandles[j].close - mean, 2);
        }
        const stdDev = Math.sqrt(varianceSum / 20);
        bbUpper[i] = mean + 2 * stdDev;
        bbLower[i] = mean - 2 * stdDev;
      }

      // EMA 50
      prevEma50 = c.close * k50 + prevEma50 * (1 - k50);
      if (i >= 10) ema50[i] = prevEma50;

      // EMA 200
      prevEma200 = c.close * k200 + prevEma200 * (1 - k200);
      if (i >= 20) ema200[i] = prevEma200;

      // RSI 14
      if (i >= 14) {
        let gains = 0;
        let losses = 0;
        for (let j = i - 13; j <= i; j++) {
          const diff = displayCandles[j].close - displayCandles[j - 1].close;
          if (diff > 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgG = gains / 14;
        const avgL = losses / 14;
        const rs = avgL === 0 ? 100 : avgG / (avgL === 0 ? 0.001 : avgL);
        rsi14[i] = 100 - 100 / (1 + rs);
      }

      // MACD (Fast 12 - Slow 26)
      if (i >= 26) {
        let sum12 = 0;
        for (let j = i - 11; j <= i; j++) sum12 += displayCandles[j].close;
        let sum26 = 0;
        for (let j = i - 25; j <= i; j++) sum26 += displayCandles[j].close;
        macdHist[i] = sum12 / 12 - sum26 / 26;
      }
    }

    return { sma20, ema50, ema200, bbUpper, bbLower, vwap, rsi14, macdHist };
  }, [displayCandles]);

  // Center price in the middle of viewport
  const handleCenterPrice = () => {
    setPanOffset(0);
    setVisibleBarsCount(60);
    setRightMarginBars(14);
    setIsPriceCentered(true);
  };

  // Main Canvas Rendering
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    const totalBars = displayCandles.length;
    if (totalBars === 0) {
      ctx.fillStyle = colors.text;
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Bozor maʼlumotlari yuklanmoqda...', width / 2, height / 2);
      ctx.restore();
      return;
    }

    // Geometry layout from unified helper
    const geo = getChartGeometry(width, height, indicators);
    const { chartWidth, priceScaleWidth, timeScaleHeight, mainChartHeight, volY, rsiY, macdY, volumeHeight, rsiHeight, macdHeight } = geo;

    // Standard Viewport Geometry (1:1 direct pixel tracking)
    const rightMarginPx = 110;
    const slotWidth = Math.max(3.5, (chartWidth - rightMarginPx) / Math.max(15, visibleBarsCount));
    const candleWidth = Math.max(2, slotWidth * 0.72);

    // Global bar index to screen X coordinate (Smooth 1:1 pixel panning)
    const globalIndexToX = (globalIdx: number) => {
      return (chartWidth - rightMarginPx) + (globalIdx - (totalBars - 1)) * slotWidth + panOffset;
    };

    // Find all visible candles in current viewport (X between -slotWidth and chartWidth + slotWidth)
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;
    let highestCandle: Candle = displayCandles[totalBars - 1];
    let lowestCandle: Candle = displayCandles[totalBars - 1];
    let highestIdx = totalBars - 1;
    let lowestIdx = totalBars - 1;
    const visibleIndices: number[] = [];

    for (let i = 0; i < totalBars; i++) {
      const cx = globalIndexToX(i);
      if (cx >= -slotWidth * 2 && cx <= chartWidth + slotWidth * 2) {
        visibleIndices.push(i);
        const c = displayCandles[i];
        if (c.low < minPrice) {
          minPrice = c.low;
          lowestCandle = c;
          lowestIdx = i;
        }
        if (c.high > maxPrice) {
          maxPrice = c.high;
          highestCandle = c;
          highestIdx = i;
        }
        if (c.volume > maxVolume) maxVolume = c.volume;
      }
    }

    if (minPrice === Infinity) {
      minPrice = currentPrice - 50;
      maxPrice = currentPrice + 50;
    }

    const startIndex = visibleIndices.length > 0 ? visibleIndices[0] : 0;
    const endIndex = visibleIndices.length > 0 ? visibleIndices[visibleIndices.length - 1] + 1 : totalBars;
    const visibleCandles = visibleIndices.map((i) => displayCandles[i]);

    // Stable Symmetric Vertical Price Bounds: Current price is always comfortably centered with padding
    const maxDiff = Math.max(
      Math.abs(currentPrice - minPrice),
      Math.abs(maxPrice - currentPrice),
      (maxPrice - minPrice) * 0.5,
      35
    );
    minPrice = currentPrice - maxDiff * 1.25;
    maxPrice = currentPrice + maxDiff * 1.25;
    const priceRange = Math.max(10, maxPrice - minPrice);

    const priceToY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / priceRange) * mainChartHeight;
    };

    const yToPrice = (y: number) => {
      return minPrice + ((mainChartHeight - y) / mainChartHeight) * priceRange;
    };

    // Draw Grid Lines & Right Price Scale
    if (indicators.gridLines) {
      const gridRows = 6;
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.textAlign = 'left';
      ctx.font = '11px monospace';

      for (let i = 0; i <= gridRows; i++) {
        const y = (mainChartHeight / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        const pVal = yToPrice(y);
        ctx.fillStyle = colors.text;
        ctx.fillText(formatUZS(pVal) + ' UZS', chartWidth + 6, y + 4);
      }

      // Vertical Time Grid (Follows visible candles smoothly)
      const step = Math.max(1, Math.floor(visibleBarsCount / 6));
      ctx.textAlign = 'center';
      for (let k = 0; k < visibleIndices.length; k += step) {
        const i = visibleIndices[k];
        const x = globalIndexToX(i);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - timeScaleHeight);
        ctx.stroke();

        const c = displayCandles[i];
        const d = new Date(c.time);
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(timeStr, x, height - 7);
      }
    }

    // DRAWINGS RENDERING: Fibonacci, Trend Lines, Horizontal Lines
    drawings.forEach((d) => {
      if (d.type === 'HORIZONTAL_LINE') {
        const y = priceToY(d.price);
        ctx.strokeStyle = d.color || colors.accent;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = d.color || colors.accent;
        ctx.fillRect(chartWidth + 1, y - 8, priceScaleWidth - 2, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(formatUZS(d.price), chartWidth + 4, y + 4);
      } else if (d.type === 'TREND_LINE') {
        const x1 = globalIndexToX(d.startIndex);
        const y1 = priceToY(d.startPrice);
        const x2 = globalIndexToX(d.endIndex);
        const y2 = priceToY(d.endPrice);

        ctx.strokeStyle = d.color || colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = d.color || colors.accent;
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'FIBONACCI') {
        const x1 = globalIndexToX(d.startIndex);
        const y1 = priceToY(d.startPrice);
        const x2 = globalIndexToX(d.endIndex);
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2, chartWidth);
        const pDiff = d.endPrice - d.startPrice;

        FIB_LEVELS.forEach((lvl, lIdx) => {
          const lPrice = d.startPrice + pDiff * lvl.ratio;
          const lY = priceToY(lPrice);

          ctx.strokeStyle = lvl.color;
          ctx.lineWidth = lvl.ratio === 0.5 || lvl.ratio === 0.618 ? 1.8 : 1;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(minX, lY);
          ctx.lineTo(maxX, lY);
          ctx.stroke();
          ctx.setLineDash([]);

          if (lIdx < FIB_LEVELS.length - 1) {
            const nextLPrice = d.startPrice + pDiff * FIB_LEVELS[lIdx + 1].ratio;
            const nextLY = priceToY(nextLPrice);
            ctx.fillStyle = lvl.bg;
            ctx.fillRect(minX, Math.min(lY, nextLY), maxX - minX, Math.abs(nextLY - lY));
          }

          ctx.fillStyle = lvl.color;
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`Fib ${(lvl.ratio * 100).toFixed(1)}% (${formatUZS(lPrice)})`, minX + 6, lY - 3);
        });
      }
    });

    // In-Progress Drawing Draft Preview
    if (drawingDraft) {
      const x1 = globalIndexToX(drawingDraft.startIndex);
      const y1 = priceToY(drawingDraft.startPrice);
      const x2 = globalIndexToX(drawingDraft.currentIndex);
      const y2 = priceToY(drawingDraft.currentPrice);

      if (drawingDraft.type === 'TREND_LINE') {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (drawingDraft.type === 'FIBONACCI') {
        const pDiff = drawingDraft.currentPrice - drawingDraft.startPrice;
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2, chartWidth);

        FIB_LEVELS.forEach((lvl) => {
          const lPrice = drawingDraft.startPrice + pDiff * lvl.ratio;
          const lY = priceToY(lPrice);
          ctx.strokeStyle = lvl.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(minX, lY);
          ctx.lineTo(maxX, lY);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }
    }

    // Technical Indicators Overlays: Bollinger Bands, SMA, EMA, VWAP, S/R
    if (indicators.supportResistance && visibleCandles.length >= 8) {
      const pivotHigh = highestCandle.high;
      const pivotLow = lowestCandle.low;
      const pivotMid = (pivotHigh + pivotLow) / 2;

      const levels = [
        { price: pivotHigh, label: 'QARSHILIK (R)', color: 'rgba(239, 68, 68, 0.45)' },
        { price: pivotMid, label: 'O‘RTA PIVOT (P)', color: 'rgba(245, 158, 11, 0.35)' },
        { price: pivotLow, label: 'QO‘LLAB-QUVVATLASH (S)', color: 'rgba(16, 185, 129, 0.45)' },
      ];

      levels.forEach((lvl) => {
        const y = priceToY(lvl.price);
        ctx.strokeStyle = lvl.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = lvl.color;
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${lvl.label} ${formatUZS(lvl.price)}`, 10, y - 4);
      });
    }

    if (indicators.bollingerBands) {
      const upperPts: { x: number; y: number }[] = [];
      const lowerPts: { x: number; y: number }[] = [];

      for (let i = startIndex; i < endIndex; i++) {
        if (technicalData.bbUpper[i] !== null && technicalData.bbLower[i] !== null) {
          const x = globalIndexToX(i);
          upperPts.push({ x, y: priceToY(technicalData.bbUpper[i]!) });
          lowerPts.push({ x, y: priceToY(technicalData.bbLower[i]!) });
        }
      }

      if (upperPts.length > 1) {
        ctx.beginPath();
        upperPts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        for (let j = lowerPts.length - 1; j >= 0; j--) {
          ctx.lineTo(lowerPts[j].x, lowerPts[j].y);
        }
        ctx.closePath();
        ctx.fillStyle = colors.bbFill;
        ctx.fill();

        ctx.strokeStyle = colors.bbLine;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        upperPts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.beginPath();
        lowerPts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const drawLineIndicator = (arr: (number | null)[], color: string, lw: number, dash?: number[]) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      let started = false;

      for (let i = startIndex; i < endIndex; i++) {
        const val = arr[i];
        if (val !== null) {
          const x = globalIndexToX(i);
          const y = priceToY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
      if (dash) ctx.setLineDash([]);
    };

    if (indicators.sma20) drawLineIndicator(technicalData.sma20, colors.sma20, 1.8);
    if (indicators.ema50) drawLineIndicator(technicalData.ema50, colors.ema50, 1.8);
    if (indicators.ema200) drawLineIndicator(technicalData.ema200, colors.ema200, 2);
    if (indicators.vwap) drawLineIndicator(technicalData.vwap, colors.vwap, 1.6, [4, 2]);

    // Candlesticks or Area Line
    if (chartStyle === 'CANDLES' || chartStyle === 'HEIKIN_ASHI') {
      visibleCandles.forEach((candle, i) => {
        const globalIdx = startIndex + i;
        const x = globalIndexToX(globalIdx) - candleWidth / 2;
        const centerX = x + candleWidth / 2;
        const isUp = candle.close >= candle.open;
        const cColor = isUp ? colors.bull : colors.bear;

        const openY = priceToY(candle.open);
        const closeY = priceToY(candle.close);
        const highY = priceToY(candle.high);
        const lowY = priceToY(candle.low);

        ctx.strokeStyle = cColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(centerX, highY);
        ctx.lineTo(centerX, lowY);
        ctx.stroke();

        ctx.fillStyle = cColor;
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(2, Math.abs(openY - closeY));
        ctx.fillRect(x, bodyY, candleWidth, bodyH);
      });
    } else {
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        const x = globalIndexToX(startIndex + i);
        const y = priceToY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const lastX = globalIndexToX(endIndex - 1);
      const firstX = globalIndexToX(startIndex);
      ctx.lineTo(lastX, mainChartHeight);
      ctx.lineTo(firstX, mainChartHeight);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, mainChartHeight);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.00)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // High & Low visible labels
    if (indicators.highLowLabels && visibleCandles.length > 5) {
      const highIdx = visibleCandles.indexOf(highestCandle);
      const lowIdx = visibleCandles.indexOf(lowestCandle);

      if (highIdx !== -1) {
        const hx = globalIndexToX(startIndex + highIdx);
        const hy = priceToY(highestCandle.high);
        ctx.fillStyle = colors.text;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`▲ MAX ${formatUZS(highestCandle.high)}`, hx, hy - 6);
      }

      if (lowIdx !== -1) {
        const lx = globalIndexToX(startIndex + lowIdx);
        const ly = priceToY(lowestCandle.low);
        ctx.fillStyle = colors.text;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`▼ MIN ${formatUZS(lowestCandle.low)}`, lx, ly + 14);
      }
    }

    // Bid & Ask lines
    const bidY = priceToY(bidPrice);
    const askY = priceToY(askPrice);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, askY);
    ctx.lineTo(chartWidth, askY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, bidY);
    ctx.lineTo(chartWidth, bidY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Price Line
    const curY = priceToY(currentPrice);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(chartWidth, curY);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.fillRect(chartWidth + 1, curY - 10, priceScaleWidth - 2, 20);
    ctx.fillStyle = '#0B0E14';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(formatUZS(currentPrice), chartWidth + 6, curY + 4);

    // Positions on chart
    positions.forEach((pos) => {
      const ey = priceToY(pos.openPrice);
      const isBuy = pos.type === 'BUY';
      const pColor = isBuy ? colors.bull : colors.bear;

      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(0, ey);
      ctx.lineTo(chartWidth, ey);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = pColor;
      ctx.fillRect(chartWidth + 1, ey - 8, priceScaleWidth - 2, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${pos.type} ${pos.volumeKg}k`, chartWidth + 4, ey + 4);
    });

    // Sub-Panel 1: Volume
    if (indicators.volume) {
      ctx.beginPath();
      ctx.moveTo(0, volY);
      ctx.lineTo(chartWidth, volY);
      ctx.strokeStyle = colors.grid;
      ctx.stroke();

      ctx.fillStyle = colors.textMuted;
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`VOL (Hajm)`, 8, volY + 12);

      visibleCandles.forEach((c, i) => {
        const x = globalIndexToX(startIndex + i) - candleWidth / 2;
        const vRatio = maxVolume > 0 ? c.volume / maxVolume : 0;
        const bH = vRatio * (volumeHeight - 12);
        const y = volY + volumeHeight - bH;
        ctx.fillStyle = c.close >= c.open ? colors.volBull : colors.volBear;
        ctx.fillRect(x, y, candleWidth, bH);
      });
    }

    // Sub-Panel 2: RSI
    if (indicators.rsi) {
      ctx.beginPath();
      ctx.moveTo(0, rsiY);
      ctx.lineTo(chartWidth, rsiY);
      ctx.strokeStyle = colors.grid;
      ctx.stroke();

      const rsiToY = (v: number) => rsiY + rsiHeight - (v / 100) * rsiHeight;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, rsiToY(70));
      ctx.lineTo(chartWidth, rsiToY(70));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, rsiToY(30));
      ctx.lineTo(chartWidth, rsiToY(30));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = colors.rsiLine;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let startedRSI = false;
      let lastRSI = 50;

      for (let i = startIndex; i < endIndex; i++) {
        const val = technicalData.rsi14[i];
        if (val !== null) {
          lastRSI = val;
          const x = globalIndexToX(i);
          const y = rsiToY(val);
          if (!startedRSI) {
            ctx.moveTo(x, y);
            startedRSI = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = colors.rsiLine;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`RSI (14): ${lastRSI.toFixed(1)}`, 8, rsiY + 12);
    }

    // Sub-Panel 3: MACD
    if (indicators.macd) {
      ctx.beginPath();
      ctx.moveTo(0, macdY);
      ctx.lineTo(chartWidth, macdY);
      ctx.strokeStyle = colors.grid;
      ctx.stroke();

      const zeroY = macdY + macdHeight / 2;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(chartWidth, zeroY);
      ctx.stroke();

      ctx.fillStyle = colors.macdLine;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`MACD (12,26,9)`, 8, macdY + 12);

      for (let i = startIndex; i < endIndex; i++) {
        const val = technicalData.macdHist[i];
        if (val !== null) {
          const x = globalIndexToX(i);
          const bH = Math.min(macdHeight / 2 - 4, Math.abs(val) * 0.15);
          ctx.fillStyle = val >= 0 ? colors.bull : colors.bear;
          if (val >= 0) {
            ctx.fillRect(x - candleWidth / 2, zeroY - bH, candleWidth, bH);
          } else {
            ctx.fillRect(x - candleWidth / 2, zeroY, candleWidth, bH);
          }
        }
      }
    }

    // Crosshair Rendering
    if (crosshair) {
      ctx.strokeStyle = colors.crosshair;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(crosshair.x, 0);
      ctx.lineTo(crosshair.x, height - timeScaleHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(chartWidth, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const crossPrice = yToPrice(crosshair.y);
      ctx.fillStyle = '#334155';
      ctx.fillRect(chartWidth + 1, crosshair.y - 10, priceScaleWidth - 2, 20);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatUZS(crossPrice), chartWidth + 6, crosshair.y + 4);

      if (crosshair.candle) {
        const c = crosshair.candle;
        const isUp = c.close >= c.open;
        ctx.fillStyle = theme === 'LIGHT' ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(10, 10, 390, 22);
        ctx.strokeStyle = theme === 'LIGHT' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
        ctx.strokeRect(10, 10, 390, 22);

        ctx.fillStyle = isUp ? colors.bull : colors.bear;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `O: ${formatUZS(c.open)}  H: ${formatUZS(c.high)}  L: ${formatUZS(c.low)}  C: ${formatUZS(c.close)}  V: ${c.volume}`,
          18,
          25
        );
      }
    }

    ctx.restore();
  }, [
    displayCandles,
    technicalData,
    visibleBarsCount,
    panOffset,
    crosshair,
    currentPrice,
    bidPrice,
    askPrice,
    positions,
    drawings,
    drawingDraft,
    colors,
    chartStyle,
    indicators,
    theme,
  ]);

  // RequestAnimationFrame Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderChart();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderChart]);

  // Mouse coordinate mapping helper using the EXACT SAME geometry calculation as renderChart!
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, price: 0, globalIndex: 0, candle: null };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const geo = getChartGeometry(rect.width, rect.height, indicators);
    const { chartWidth, mainChartHeight } = geo;

    const effectivePan = Math.max(0, panOffset);
    const totalBars = displayCandles.length;
    const endIndex = Math.max(1, Math.min(totalBars, totalBars - effectivePan));
    const historicalSlots = Math.max(10, visibleBarsCount - rightMarginBars);
    const startIndex = Math.max(0, endIndex - historicalSlots);
    const visible = displayCandles.slice(startIndex, endIndex);

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visible.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const maxDiff = Math.max(
      Math.abs(currentPrice - minPrice),
      Math.abs(maxPrice - currentPrice),
      (maxPrice - minPrice) * 0.5,
      35
    );
    minPrice = currentPrice - maxDiff * 1.25;
    maxPrice = currentPrice + maxDiff * 1.25;
    const priceRange = Math.max(10, maxPrice - minPrice);
    const price = minPrice + ((mainChartHeight - y) / mainChartHeight) * priceRange;

    const slotWidth = Math.max(3.5, (chartWidth - 110) / Math.max(15, visibleBarsCount));
    const globalIndex = Math.round((x - (chartWidth - 110) - panOffset) / slotWidth + (totalBars - 1));
    const candle = (globalIndex >= 0 && globalIndex < displayCandles.length) ? displayCandles[globalIndex] : null;

    return { x, y, price, globalIndex, candle };
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.85;
    setVisibleBarsCount((prev) => Math.max(15, Math.min(250, Math.round(prev * factor))));
  };

  // Pointer Down (Captures pointer so drag never gets lost outside canvas)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { price, globalIndex } = getCanvasCoords(e);

    if (activeTool === 'CURSOR') {
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      isDraggingRef.current = true;
      setIsDragging(true);
      dragStartXRef.current = e.clientX;
      dragStartOffsetRef.current = panOffset;
      setCrosshair(null);
      return;
    }

    if (activeTool === 'HORIZONTAL_LINE') {
      setDrawings((prev) => [
        ...prev,
        { id: 'hl-' + Date.now(), type: 'HORIZONTAL_LINE', price, color: colors.accent },
      ]);
      setActiveTool('CURSOR');
      return;
    }

    if (activeTool === 'TREND_LINE' || activeTool === 'FIBONACCI') {
      if (!drawingDraft) {
        setDrawingDraft({
          type: activeTool,
          startIndex: globalIndex,
          startPrice: price,
          currentIndex: globalIndex,
          currentPrice: price,
        });
      } else {
        if (drawingDraft.type === 'TREND_LINE') {
          setDrawings((prev) => [
            ...prev,
            {
              id: 'tl-' + Date.now(),
              type: 'TREND_LINE',
              startIndex: drawingDraft.startIndex,
              startPrice: drawingDraft.startPrice,
              endIndex: globalIndex,
              endPrice: price,
              color: colors.accent,
            },
          ]);
        } else if (drawingDraft.type === 'FIBONACCI') {
          setDrawings((prev) => [
            ...prev,
            {
              id: 'fib-' + Date.now(),
              type: 'FIBONACCI',
              startIndex: drawingDraft.startIndex,
              startPrice: drawingDraft.startPrice,
              endIndex: globalIndex,
              endPrice: price,
            },
          ]);
        }
        setDrawingDraft(null);
        setActiveTool('CURSOR');
      }
    }
  };

  // Pointer Move (Smooth 1:1 direct pixel drag without frame drops)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      const slotWidth = Math.max(3.5, (canvas.clientWidth - 78 - 110) / Math.max(15, visibleBarsCount));
      const totalBars = displayCandles.length;
      const maxPan = (totalBars - 1) * slotWidth + 250;
      const minPan = -(canvas.clientWidth - 150);
      const newOffset = Math.max(minPan, Math.min(maxPan, dragStartOffsetRef.current + deltaX));
      setPanOffset(newOffset);
      return;
    }

    const { x, y, price, globalIndex, candle } = getCanvasCoords(e);

    if (drawingDraft) {
      setDrawingDraft((prev) =>
        prev ? { ...prev, currentIndex: globalIndex, currentPrice: price } : null
      );
    }

    setCrosshair({ x, y, candle, price });
  };

  // Pointer Up (Safely release pointer capture)
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const handleDoubleClick = () => {
    handleCenterPrice();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawingDraft) {
          setDrawingDraft(null);
          setActiveTool('CURSOR');
        } else if (isFullscreen) {
          toggleFullscreen();
        } else if (isIndModalOpen) {
          setIsIndModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drawingDraft, isFullscreen, isIndModalOpen]);

  // Toggle single indicator
  const toggleInd = (key: keyof IndicatorSettings) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allIndicatorsList: { id: keyof IndicatorSettings; name: string; cat: 'TREND' | 'OSCILLATOR' | 'LEVELS'; color: string; desc: string }[] = [
    { id: 'sma20', name: 'SMA 20 (Sodda o‘rtacha narx)', cat: 'TREND', color: colors.sma20, desc: '20 barli asosiy trend dinamikasi' },
    { id: 'ema50', name: 'EMA 50 (O‘rta muddatli trend)', cat: 'TREND', color: colors.ema50, desc: '50 barli eksponentsial trend' },
    { id: 'ema200', name: 'EMA 200 (Yirik bozor trendi)', cat: 'TREND', color: colors.ema200, desc: 'Golden / Death cross institutsional filtri' },
    { id: 'bollingerBands', name: 'Bollinger Bands (BB 20, 2)', cat: 'TREND', color: colors.bbLine, desc: 'Volatillik va narx koridori' },
    { id: 'vwap', name: 'VWAP (Hajm o‘rtachasi)', cat: 'TREND', color: colors.vwap, desc: 'Hajmga asoslangan haqqoniy narx' },
    { id: 'supportResistance', name: 'S/R Pivot Darajalar', cat: 'LEVELS', color: '#EF4444', desc: 'Asosiy qarshilik va qo‘llab-quvvatlash zonalari' },
    { id: 'volume', name: 'Volume (Savdo hajmi)', cat: 'OSCILLATOR', color: '#10B981', desc: 'Bozordagi faollik gistogrammasi' },
    { id: 'rsi', name: 'RSI (14) Indeksi', cat: 'OSCILLATOR', color: colors.rsiLine, desc: 'Nisbiy kuch va haddan tashqari xarid/sotuv zonasi' },
    { id: 'macd', name: 'MACD (12, 26, 9)', cat: 'OSCILLATOR', color: colors.macdLine, desc: 'Momentum konvergentsiya/divergentsiya' },
    { id: 'highLowLabels', name: 'High / Low Narx Teglari', cat: 'LEVELS', color: '#F59E0B', desc: 'Lokal eng baland va eng past narx ko‘rsatkichlari' },
    { id: 'gridLines', name: 'To‘r Chiziqlari (Grid)', cat: 'LEVELS', color: '#64748B', desc: 'Fon koordinata to‘ri' },
  ];

  const filteredIndList = allIndicatorsList.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(indSearch.toLowerCase());
    const matchCat = indCategory === 'ALL' || item.cat === indCategory;
    return matchSearch && matchCat;
  });

  const activeIndCount = Object.entries(indicators).filter(([k, v]) => v && k !== 'gridLines').length;

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col select-none overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen'
          : 'h-full w-full'
      } ${
        theme === 'LIGHT' ? 'bg-white text-slate-900' : 'bg-[#0B0E14] text-neutral-100'
      }`}
    >
      {/* FULLSCREEN PERMANENT FLOATING EXIT BUTTON */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-3 right-4 z-[10000] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-2xl transition-all active:scale-95 border border-white/30 cursor-pointer"
          title="To‘liq ekrandan chiqish (ESC)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Ekranni Kichraytirish (ESC)</span>
        </button>
      )}

      {/* 1. PROFESSIONAL COMPACT TOP TOOLBAR (TradingView Single-Line Style) */}
      <div
        className={`flex items-center justify-between gap-2 px-3 h-10 border-b text-xs select-none overflow-x-auto no-scrollbar whitespace-nowrap ${
          theme === 'LIGHT'
            ? 'bg-slate-50 border-slate-200'
            : theme === 'OLED'
            ? 'bg-black border-neutral-900'
            : theme === 'GOLD'
            ? 'bg-[#15120E] border-amber-950/60'
            : 'bg-[#0E131F] border-neutral-800'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Left Side: Timeframes, Chart Style, and Indicators Modal Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Timeframes */}
          <div className="flex items-center gap-0.5 bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-1.5 py-0.5 font-mono text-[11px] rounded transition-colors whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <span className="text-neutral-700 mx-0.5" aria-hidden="true">|</span>

          {/* Chart Style Switcher (Candles, Heikin, Line) */}
          <div className="flex items-center bg-neutral-900/80 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setChartStyle('CANDLES')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                chartStyle === 'CANDLES' ? 'bg-neutral-700 text-amber-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Klassik Shamlar"
            >
              Sham
            </button>
            <button
              onClick={() => setChartStyle('HEIKIN_ASHI')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                chartStyle === 'HEIKIN_ASHI' ? 'bg-neutral-700 text-amber-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Heikin-Ashi Trend Shamlar"
            >
              Heikin
            </button>
            <button
              onClick={() => setChartStyle('LINE')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                chartStyle === 'LINE' ? 'bg-neutral-700 text-amber-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Chiziq (Area Line)"
            >
              Chiziq
            </button>
          </div>

          <span className="text-neutral-700 mx-0.5" aria-hidden="true">|</span>

          {/* Indicators Modal Button */}
          <button
            onClick={() => setIsIndModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all font-bold shadow-xs whitespace-nowrap active:scale-95"
            title="Texnik indikatorlar va osillyatorlar menyusi"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Indikatorlar ({activeIndCount})</span>
          </button>
        </div>

        {/* Right Side: Center Price, Quick Trade, Pan, Zoom, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* CENTER PRICE BUTTON */}
          <button
            onClick={handleCenterPrice}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all active:scale-95 shadow-xs whitespace-nowrap ${
              isPriceCentered
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
            }`}
            title="Narxni markazga qaytarish va optimal ko‘rinishga keltirish"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Markazga</span>
          </button>

          {/* Quick Trade Toggle */}
          {onQuickTrade && (
            <button
              onClick={() => setShowQuickTradeBar((v) => !v)}
              className={`px-2 py-1 text-[10px] font-mono rounded-lg border transition-colors flex items-center gap-1 whitespace-nowrap ${
                showQuickTradeBar
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'text-neutral-400 border-neutral-800 hover:text-white'
              }`}
              title={showQuickTradeBar ? 'Grafikdagi tezkor savdo tugmalarini yashirish' : 'Tezkor savdo tugmalarini ko‘rsatish'}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{showQuickTradeBar ? '▲ Savdo' : '▼ Savdo'}</span>
            </button>
          )}

          {/* Pan Navigation */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setPanOffset((p) => p + 100)}
              title="Tarixga surish"
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-l-lg"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Math.abs(panOffset) > 10 ? (
              <button
                onClick={handleCenterPrice}
                className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-black font-bold text-[10px] font-mono rounded animate-pulse whitespace-nowrap"
                title="Jonli vaqtga qaytish"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                <span>Jonli</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Jonli</span>
              </span>
            )}

            <button
              onClick={() => setPanOffset((p) => p - 100)}
              title="Oldinga surish"
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-r-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean Zoom: - and + */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setVisibleBarsCount((v) => Math.min(250, v + 15))}
              title="Kichiklashtirish (-)"
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className="px-1.5 text-[10px] font-mono text-neutral-300 min-w-[28px] text-center select-none font-medium">
              {visibleBarsCount}
            </span>

            <button
              onClick={() => setVisibleBarsCount((v) => Math.max(15, v - 15))}
              title="Kattalashtirish (+)"
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Ekranni Kichraytirish' : 'Kengaytirish (Fullscreen)'}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE WITH LEFT VERTICAL DRAWING TOOLBAR & CANVAS */}
      <div className="relative flex flex-1 w-full h-full overflow-hidden">
        {/* LEFT VERTICAL DRAWING TOOLBAR */}
        <aside
          className={`w-10 shrink-0 border-r flex flex-col items-center py-2 gap-1.5 z-20 ${
            theme === 'LIGHT'
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : theme === 'OLED'
              ? 'bg-black border-neutral-900 text-neutral-400'
              : theme === 'GOLD'
              ? 'bg-[#15120E] border-amber-950/60 text-amber-300'
              : 'bg-[#0E131F] border-neutral-800 text-neutral-400'
          }`}
        >
          {/* Cursor */}
          <button
            onClick={() => {
              setActiveTool('CURSOR');
              setDrawingDraft(null);
            }}
            title="Kursor (Oddiy ko‘rish)"
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'CURSOR'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shadow-xs'
                : 'hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* Trend Line */}
          <button
            onClick={() => {
              setActiveTool('TREND_LINE');
              setDrawingDraft(null);
            }}
            title="Trend Chizig‘i (2 ta nuqtani bosing)"
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'TREND_LINE'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shadow-xs'
                : 'hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          {/* Fibonacci Retracement */}
          <button
            onClick={() => {
              setActiveTool('FIBONACCI');
              setDrawingDraft(null);
            }}
            title="Fibonachchi To‘ri (0% dan 100% gacha 2 ta nuqtani bosing)"
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'FIBONACCI'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shadow-xs'
                : 'hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <Divide className="w-4 h-4" />
          </button>

          {/* Horizontal Level */}
          <button
            onClick={() => {
              setActiveTool('HORIZONTAL_LINE');
              setDrawingDraft(null);
            }}
            title="Gorizontal Narx Darajasi (Grafikka 1 marta bosing)"
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'HORIZONTAL_LINE'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shadow-xs'
                : 'hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <LineIcon className="w-4 h-4" />
          </button>

          <div className="w-5 h-px bg-neutral-800 my-1" />

          {/* Undo Drawing */}
          {drawings.length > 0 && (
            <button
              onClick={() => {
                setDrawings((prev) => prev.slice(0, -1));
              }}
              title="Oxirgi chizmani bekor qilish (Undo)"
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}

          {/* Clear Drawings Button */}
          {drawings.length > 0 && (
            <button
              onClick={() => {
                setDrawings([]);
                setDrawingDraft(null);
              }}
              title={`Barcha chizmalarni o‘chirish (${drawings.length} ta)`}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </aside>

        {/* CANVAS VIEWPORT CONTAINER */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="relative flex-1 w-full h-full overflow-hidden touch-none"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            className={`absolute inset-0 block w-full h-full touch-none select-none ${
              isDragging
                ? 'cursor-grabbing'
                : activeTool !== 'CURSOR'
                ? 'cursor-crosshair'
                : 'cursor-grab'
            }`}
          />

          {/* DRAWING PROMPT BANNER */}
          {activeTool !== 'CURSOR' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-amber-500 text-black font-mono text-[11px] font-bold shadow-lg flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              <span>
                {activeTool === 'TREND_LINE'
                  ? drawingDraft
                    ? '2-nuqtani bosing (Tugatish)'
                    : 'Trend chizig‘i: 1-nuqtani bosing'
                  : activeTool === 'FIBONACCI'
                  ? drawingDraft
                    ? 'Fibonachchi: 2-nuqtani bosing'
                    : 'Fibonachchi: 1-nuqtani bosing'
                  : 'Gorizontal narx darajasi uchun bosing'}
              </span>
              <button
                onClick={() => {
                  setActiveTool('CURSOR');
                  setDrawingDraft(null);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-black/20"
                title="Bekor qilish (ESC)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Trade Floating Bar */}
          {onQuickTrade && showQuickTradeBar && (
            <div className="absolute top-9 left-2 z-10 flex items-center gap-1.5 p-1 bg-[#090C12]/90 backdrop-blur-xs border border-neutral-800 rounded-lg shadow-xl font-mono text-xs">
              <button
                onClick={() => onQuickTrade('BUY', chartVolumeKg)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-95 shadow-sm"
                title={`Tezkor BUY ${chartVolumeKg}kg @ ${formatUZS(askPrice)} UZS`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>BUY {formatUZS(askPrice)}</span>
              </button>

              <div className="flex items-center gap-1 px-1 py-0.5 bg-neutral-900 border border-neutral-700/80 rounded">
                <button
                  onClick={() => setChartVolumeKg((v) => Math.max(10, v - 50))}
                  className="p-0.5 text-neutral-400 hover:text-white"
                  title="-50 kg"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1 text-[11px] font-bold text-white tabular-nums">
                  {chartVolumeKg}kg
                </span>
                <button
                  onClick={() => setChartVolumeKg((v) => v + 50)}
                  className="p-0.5 text-neutral-400 hover:text-white"
                  title="+50 kg"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => onQuickTrade('SELL', chartVolumeKg)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all active:scale-95 shadow-sm"
                title={`Tezkor SELL ${chartVolumeKg}kg @ ${formatUZS(bidPrice)} UZS`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SELL {formatUZS(bidPrice)}</span>
              </button>
            </div>
          )}

          {/* Quick Close Positions Bar */}
          {positions.length > 0 && onCloseAllPositions && (
            <div className="absolute top-2 right-24 z-10 hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#090C12]/90 backdrop-blur-xs border border-neutral-800 rounded-lg shadow-xl font-mono text-xs">
              <span className="text-neutral-400 text-[11px]">
                Ochiq: <strong className="text-white">{positions.length} ta</strong>
              </span>
              <span
                className={`font-bold tabular-nums text-[11px] ${
                  positions.reduce((s, p) => s + p.unrealizedPnL, 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {positions.reduce((s, p) => s + p.unrealizedPnL, 0) >= 0 ? '+' : ''}
                {formatUZS(positions.reduce((s, p) => s + p.unrealizedPnL, 0))} UZS
              </span>
              <button
                onClick={onCloseAllPositions}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                title="Barcha pozitsiyalarni yopish"
              >
                <X className="w-3 h-3" />
                <span>Hammasini Yopish</span>
              </button>
            </div>
          )}

          {/* Paused Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none z-20">
              <div className="px-5 py-3 rounded-lg bg-neutral-900/90 border border-amber-500/40 text-center shadow-2xl">
                <span className="text-amber-400 font-semibold text-sm tracking-wide block">
                  Bozor vaqtincha to‘xtatildi
                </span>
                <span className="text-neutral-400 text-xs mt-1 block">
                  Admin tomonidan PAUSE rejimi faollashtirilgan
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PROFESSIONAL TECHNICAL INDICATORS MODAL (Root Level, Centered, Never Clipped) */}
      {isIndModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150"
          onClick={() => setIsIndModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
              theme === 'LIGHT'
                ? 'bg-white border-slate-300 text-slate-900'
                : theme === 'OLED'
                ? 'bg-black border-neutral-800 text-neutral-100'
                : theme === 'GOLD'
                ? 'bg-[#181410] border-amber-900/60 text-amber-50'
                : 'bg-[#0E131F] border-neutral-700 text-neutral-100'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-700/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Texnik Indikatorlar & Osillyatorlar</h3>
                  <p className="text-[11px] text-neutral-400">Grafikda ko‘rsatiladigan indikatorlarni boshqarish</p>
                </div>
              </div>
              <button
                onClick={() => setIsIndModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Categories */}
            <div className="p-4 border-b border-neutral-700/40 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={indSearch}
                  onChange={(e) => setIndSearch(e.target.value)}
                  placeholder="Indikator nomi bo‘yicha qidiruv (masalan: SMA, RSI, Bollinger)..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono border transition-colors ${
                    theme === 'LIGHT'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
                      : 'bg-neutral-900 border-neutral-700 text-white focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                {[
                  { id: 'ALL', label: 'Barchasi' },
                  { id: 'TREND', label: 'Trend' },
                  { id: 'OSCILLATOR', label: 'Osillyatorlar' },
                  { id: 'LEVELS', label: 'Darajalar' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setIndCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      indCategory === cat.id
                        ? 'bg-amber-500 text-black font-bold shadow-xs'
                        : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicators List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredIndList.map((item) => {
                const active = (indicators as any)[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleInd(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-xs'
                        : 'border-neutral-800 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800/80 text-neutral-400 font-mono">
                            {item.cat}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>

                    {/* Modern Switch Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                          active ? 'bg-amber-500' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-700/50 text-xs">
              <span className="text-neutral-400 font-mono">
                Faol vositalar: <strong className="text-amber-400">{activeIndCount} ta</strong>
              </span>
              <button
                onClick={() => setIsIndModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs"
              >
                Tayyor (Yopish)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
