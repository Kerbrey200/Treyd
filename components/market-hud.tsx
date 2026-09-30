'use client';

import React from 'react';
import { LiveMarketMetrics, AppTheme } from '@/lib/market-types';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketHudProps {
  metrics: LiveMarketMetrics;
  isPaused: boolean;
  theme?: AppTheme;
}

export const MarketHud: React.FC<MarketHudProps> = ({ metrics, isPaused, theme = 'DARK' }) => {
  const isUp = metrics.priceChange24hPct >= 0;
  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 border-b text-xs select-none overflow-x-auto no-scrollbar whitespace-nowrap transition-colors duration-200 ${themeClasses.surfaceBg} ${themeClasses.border}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Symbol, Main Price, Change and Single Compact Spread Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-sm tracking-tight font-mono ${themeClasses.textMain}`}>
            OQ OLTIN / UZS
          </span>
          <span className="text-[10px] text-amber-500 font-mono font-semibold border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">
            PAXTA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-base font-bold tabular-nums transition-colors duration-200 ${
              metrics.lastDirection === 'UP'
                ? 'text-emerald-500'
                : metrics.lastDirection === 'DOWN'
                ? 'text-rose-500'
                : themeClasses.textMain
            }`}
          >
            {formatUZS(metrics.currentPrice)} UZS
          </span>

          <span
            className={`flex items-center gap-0.5 font-mono text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${
              isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}
          >
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? '+' : ''}
            {metrics.priceChange24hPct.toFixed(2)}%
          </span>

          {/* Compact Single Spread Chip */}
          <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono">
            <span className="text-neutral-400 text-[10px] uppercase tracking-wide">Spred:</span>
            <span className="text-amber-400 font-bold tabular-nums">{metrics.currentSpread} UZS</span>
          </div>
        </div>
      </div>

      {/* Right Side: Live Market Status Chip */}
      <div className="flex items-center shrink-0">
        {isPaused ? (
          <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 animate-pulse text-[11px] font-mono">
            PAUZA
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Jonli Bozor</span>
          </span>
        )}
      </div>
    </div>
  );
};
