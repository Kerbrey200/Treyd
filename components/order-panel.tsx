'use client';

import React, { useState } from 'react';
import { LiveMarketMetrics, AppTheme } from '@/lib/market-types';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import {
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Zap,
  Check,
  Lock,
} from 'lucide-react';

interface OrderPanelProps {
  metrics: LiveMarketMetrics;
  balanceUZS: number;
  theme?: AppTheme;
  isAuthenticated?: boolean;
  onOpenAuthModal?: (role?: 'TRADER' | 'ADMIN') => void;
  onOpenPosition: (order: {
    type: 'BUY' | 'SELL';
    volumeKg: number;
    stopLoss?: number;
    takeProfit?: number;
    price: number;
  }) => void;
}

const VOLUME_PRESETS = [50, 100, 250, 500, 1000, 2500];

export const OrderPanel: React.FC<OrderPanelProps> = ({
  metrics,
  balanceUZS,
  theme = 'DARK',
  isAuthenticated = false,
  onOpenAuthModal,
  onOpenPosition,
}) => {
  const [volumeKg, setVolumeKg] = useState<number>(100);
  const [slOffset, setSlOffset] = useState<number | null>(null);
  const [tpOffset, setTpOffset] = useState<number | null>(null);
  const [oneClickMode, setOneClickMode] = useState<boolean>(true);
  const [pendingConfirm, setPendingConfirm] = useState<'BUY' | 'SELL' | null>(null);

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  const askPrice = metrics.askPrice;
  const bidPrice = metrics.bidPrice;

  const marginRequiredUZS = Math.round(volumeKg * askPrice * 0.05);
  const spreadCostUZS = Math.round(metrics.currentSpread * volumeKg);

  const handleExecute = (type: 'BUY' | 'SELL') => {
    // Strictly block trade execution if user is not authenticated
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal('TRADER');
      return;
    }

    if (!oneClickMode && pendingConfirm !== type) {
      setPendingConfirm(type);
      return;
    }

    setPendingConfirm(null);
    const execPrice = type === 'BUY' ? askPrice : bidPrice;
    const sl = slOffset ? (type === 'BUY' ? execPrice - slOffset : execPrice + slOffset) : undefined;
    const tp = tpOffset ? (type === 'BUY' ? execPrice + tpOffset : execPrice - tpOffset) : undefined;

    onOpenPosition({
      type,
      volumeKg,
      price: execPrice,
      stopLoss: sl,
      takeProfit: tp,
    });
  };

  const handleStepVolume = (delta: number) => {
    setVolumeKg((prev) => Math.max(10, prev + delta));
  };

  const handleMultiplyVolume = (factor: number) => {
    setVolumeKg((prev) => Math.max(10, Math.round(prev * factor)));
  };

  return (
    <div
      className={`flex flex-col h-full border-l p-3.5 text-xs select-none overflow-y-auto transition-colors duration-200 ${themeClasses.surfaceBg} ${themeClasses.border} ${themeClasses.textMain}`}
    >
      {/* Header with Spred and One-Click Fast Switch */}
      <div className={`flex items-center justify-between pb-2.5 border-b ${themeClasses.border}`}>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <h3 className={`font-semibold tracking-wide text-xs ${themeClasses.textMain}`}>Tezkor Savdo</h3>
        </div>

        <button
          onClick={() => {
            setOneClickMode(!oneClickMode);
            setPendingConfirm(null);
          }}
          title={oneClickMode ? '1-Click rejimi faol (tasdiqlashsiz darhol ochadi)' : 'Tasdiqlash rejimi faol'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
            oneClickMode
              ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30'
              : `${themeClasses.cardSubtleBg} ${themeClasses.textMuted}`
          }`}
        >
          {oneClickMode ? '1-CLICK TEZKOR' : 'TASDIQLASH'}
        </button>
      </div>

      {/* DUAL SIMULTANEOUS BUY & SELL BUTTONS */}
      <div className="my-3 space-y-2">
        {pendingConfirm ? (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 rounded space-y-2">
            <span className="text-amber-400 font-medium block text-center text-xs">
              {pendingConfirm} {volumeKg} kg @{' '}
              {formatUZS(pendingConfirm === 'BUY' ? askPrice : bidPrice)} UZS?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPendingConfirm(null)}
                className={`py-1.5 rounded text-xs font-semibold ${themeClasses.cardSubtleBg} ${themeClasses.textMuted}`}
              >
                Bekor
              </button>
              <button
                onClick={() => handleExecute(pendingConfirm)}
                className="py-1.5 rounded bg-amber-500 text-black hover:bg-amber-400 text-xs font-bold"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* BUY BUTTON */}
            <button
              onClick={() => handleExecute('BUY')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-md group text-white"
            >
              <div className="flex items-center gap-1 font-bold text-xs">
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY (Olish)</span>
              </div>
              <span className="font-mono text-xs font-extrabold tabular-nums mt-0.5 text-emerald-100">
                {formatUZS(askPrice)} UZS
              </span>
              <span className="text-[10px] text-emerald-200/80 font-mono mt-0.5">
                {volumeKg} kg
              </span>
            </button>

            {/* SELL BUTTON */}
            <button
              onClick={() => handleExecute('SELL')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all shadow-md group text-white"
            >
              <div className="flex items-center gap-1 font-bold text-xs">
                <ArrowDownRight className="w-4 h-4" />
                <span>SELL (Sotish)</span>
              </div>
              <span className="font-mono text-xs font-extrabold tabular-nums mt-0.5 text-rose-100">
                {formatUZS(bidPrice)} UZS
              </span>
              <span className="text-[10px] text-rose-200/80 font-mono mt-0.5">
                {volumeKg} kg
              </span>
            </button>
          </div>
        )}

        {/* Warning / Prompt banner if user is not authenticated */}
        {!isAuthenticated && (
          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal('TRADER')}
            className="w-full mt-2.5 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 transition-all text-amber-300 font-mono text-xs flex items-center justify-between shadow-xs cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-left">Savdo ochish uchun kiring</span>
            </div>
            <span className="font-bold underline text-[10px] text-amber-400">Kirish →</span>
          </button>
        )}
      </div>

      {/* COMPACT VOLUME STEPPER & MULTIPLIERS */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className={themeClasses.textMuted}>Bitim Hajmi (kg):</span>
          <span className="font-mono font-bold text-amber-500">{volumeKg} kg ({volumeKg / 1000} tonna)</span>
        </div>

        {/* Stepper with - / + buttons and custom input */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStepVolume(-50)}
            className={`p-2 rounded border transition-colors ${themeClasses.cardSubtleBg} ${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.textMain}`}
            title="-50 kg"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="number"
            min="10"
            step="10"
            value={volumeKg}
            onChange={(e) => setVolumeKg(Math.max(10, Number(e.target.value) || 10))}
            className={`flex-1 text-center font-mono font-bold py-1.5 rounded border text-sm transition-colors ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
          />

          <button
            onClick={() => handleStepVolume(50)}
            className={`p-2 rounded border transition-colors ${themeClasses.cardSubtleBg} ${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.textMain}`}
            title="+50 kg"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleMultiplyVolume(0.5)}
            className={`px-1.5 py-1.5 rounded border font-mono text-[10px] transition-colors ${themeClasses.cardSubtleBg} ${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.textMain}`}
            title="Hajmni yarmiga kamaytirish"
          >
            /2
          </button>
          <button
            onClick={() => handleMultiplyVolume(2)}
            className={`px-1.5 py-1.5 rounded border font-mono text-[10px] transition-colors ${themeClasses.cardSubtleBg} ${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.textMain}`}
            title="Hajmni 2 barobar oshirish"
          >
            x2
          </button>
        </div>

        {/* Quick volume preset chips */}
        <div className="grid grid-cols-6 gap-1 pt-0.5">
          {VOLUME_PRESETS.map((v) => (
            <button
              key={v}
              onClick={() => setVolumeKg(v)}
              className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                volumeKg === v
                  ? 'border-amber-500 bg-amber-500/20 text-amber-500 font-bold'
                  : `${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.cardSubtleBg}`
              }`}
            >
              {v >= 1000 ? `${v / 1000}t` : `${v}`}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK SL & TP PRESETS (1-Click Attach) */}
      <div className={`my-2.5 space-y-2 p-2.5 rounded-lg border text-[11px] ${themeClasses.cardBg} ${themeClasses.border}`}>
        {/* Stop Loss Selector */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className={themeClasses.textMuted}>Stop Loss (Zarar chekovi):</span>
            <span className="font-mono text-rose-500">
              {slOffset ? `-${slOffset} UZS` : 'O‘chiq'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
            {[null, 150, 300, 500].map((val) => (
              <button
                key={val === null ? 'none' : val}
                onClick={() => setSlOffset(val)}
                className={`py-1 rounded border transition-colors ${
                  slOffset === val
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400 font-bold'
                    : `${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.cardSubtleBg}`
                }`}
              >
                {val === null ? 'Yo‘q' : `-${val}`}
              </button>
            ))}
          </div>
        </div>

        {/* Take Profit Selector */}
        <div className={`space-y-1 pt-1.5 border-t ${themeClasses.border}`}>
          <div className="flex justify-between items-center">
            <span className={themeClasses.textMuted}>Take Profit (Foyda chekovi):</span>
            <span className="font-mono text-emerald-500">
              {tpOffset ? `+${tpOffset} UZS` : 'O‘chiq'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
            {[null, 250, 500, 1000].map((val) => (
              <button
                key={val === null ? 'none' : val}
                onClick={() => setTpOffset(val)}
                className={`py-1 rounded border transition-colors ${
                  tpOffset === val
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold'
                    : `${themeClasses.border} ${themeClasses.textMuted} hover:${themeClasses.cardSubtleBg}`
                }`}
              >
                {val === null ? 'Yo‘q' : `+${val}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COMPACT SUMMARY METRICS */}
      <div className={`mt-auto space-y-1.5 pt-2 border-t font-mono text-[11px] ${themeClasses.border} ${themeClasses.textMuted}`}>
        <div className="flex justify-between">
          <span>Kerakli Marja (5%):</span>
          <span className={`font-medium tabular-nums ${themeClasses.textMain}`}>{formatUZS(marginRequiredUZS)} UZS</span>
        </div>
        <div className="flex justify-between">
          <span>Spred Xarajati:</span>
          <span className="text-amber-500 font-medium tabular-nums">~{formatUZS(spreadCostUZS)} UZS</span>
        </div>
        <div className="flex justify-between">
          <span>Erkin Mablag‘:</span>
          <span className={`tabular-nums ${themeClasses.textMain}`}>{formatUZS(balanceUZS)} UZS</span>
        </div>
      </div>
    </div>
  );
};
