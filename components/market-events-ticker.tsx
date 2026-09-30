'use client';

import React from 'react';
import { MarketEvent, AppTheme } from '@/lib/market-types';
import { THEME_CLASSES } from '@/lib/theme-config';
import { Zap, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MarketEventsTickerProps {
  events: MarketEvent[];
  theme?: AppTheme;
  onDismiss?: (id: string) => void;
}

export const MarketEventsTicker: React.FC<MarketEventsTickerProps> = ({ events, theme = 'DARK', onDismiss }) => {
  if (events.length === 0) return null;

  const currentEvent = events[events.length - 1];
  const isBull = currentEvent.impact === 'BULLISH';
  const isBear = currentEvent.impact === 'BEARISH';
  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 border-b text-xs select-none animate-fadeIn transition-colors duration-200 ${
        theme === 'LIGHT'
          ? 'bg-amber-50/80 border-amber-200 text-slate-800'
          : theme === 'OLED'
          ? 'bg-[#0A0A0A] border-amber-500/30 text-white'
          : theme === 'GOLD'
          ? 'bg-[#1C160F] border-amber-500/30 text-amber-50'
          : 'bg-[#121A2B] border-amber-500/30 text-white'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono text-[11px] shrink-0">
          <Zap className="w-3.5 h-3.5 fill-amber-500" />
          <span>BOZOR VOQEASI:</span>
        </div>

        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className={`font-semibold truncate ${themeClasses.textMain}`}>{currentEvent.title}</span>
          <span className={`${themeClasses.textMuted} hidden md:inline truncate text-[11px]`}>
            — {currentEvent.description}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span
          className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isBull
              ? 'bg-emerald-500/20 text-emerald-500'
              : isBear
              ? 'bg-rose-500/20 text-rose-500'
              : 'bg-amber-500/20 text-amber-500'
          }`}
        >
          {isBull ? <ArrowUpRight className="w-3 h-3" /> : isBear ? <ArrowDownRight className="w-3 h-3" /> : null}
          {currentEvent.impact} (Kuch: {currentEvent.intensity}/5)
        </span>
      </div>
    </div>
  );
};
