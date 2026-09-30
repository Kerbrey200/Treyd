'use client';

import React, { useState } from 'react';
import {
  MarketEngineConfig,
  LiveMarketMetrics,
  AuditLogEntry,
  MarketRegimeType,
  MarketSessionType,
  RangeParam,
  AppTheme,
  RegisteredUser,
  UserDepositTransaction,
} from '@/lib/market-types';
import { MARKET_PRESETS } from '@/lib/market-engine';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import { UserManagement } from './user-management';
import {
  Sliders,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Flame,
  Zap,
  TrendingUp,
  History,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Users,
  LogOut,
} from 'lucide-react';

interface AdminMarketControlProps {
  config: MarketEngineConfig;
  metrics: LiveMarketMetrics;
  auditLogs: AuditLogEntry[];
  theme?: AppTheme;
  users: RegisteredUser[];
  activeUserId: string;
  transactions: UserDepositTransaction[];
  onAddUser: (user: Omit<RegisteredUser, 'id' | 'createdAt' | 'equityUZS' | 'totalDepositedUZS'>) => void;
  onDeposit: (userId: string, amount: number, note: string) => void;
  onWithdraw: (userId: string, amount: number, note: string) => void;
  onUpdatePassword: (userId: string, newPass: string) => void;
  onToggleStatus: (userId: string) => void;
  onSelectActiveUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAdminLogout: () => void;
  onUpdateConfig: (newConfig: Partial<MarketEngineConfig>, reason?: string) => void;
  onTriggerEvent: (event: {
    title: string;
    description: string;
    impact: 'BULLISH' | 'BEARISH' | 'VOLATILITY';
    intensity: number;
    durationSec: number;
  }) => void;
  onResetSimulation: () => void;
}

export const AdminMarketControl: React.FC<AdminMarketControlProps> = ({
  config,
  metrics,
  auditLogs,
  theme = 'DARK',
  users,
  activeUserId,
  transactions,
  onAddUser,
  onDeposit,
  onWithdraw,
  onUpdatePassword,
  onToggleStatus,
  onSelectActiveUser,
  onDeleteUser,
  onAdminLogout,
  onUpdateConfig,
  onTriggerEvent,
  onResetSimulation,
}) => {
  // Local staged config for form editing
  const [formConfig, setFormConfig] = useState<MarketEngineConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<
    'USERS' | 'CORE_RANGES' | 'REGIMES' | 'STRUCTURE' | 'PRESETS' | 'AUDIT'
  >('USERS');
  const [customEventTitle, setCustomEventTitle] = useState('');
  const [customEventImpact, setCustomEventImpact] = useState<'BULLISH' | 'BEARISH' | 'VOLATILITY'>('BULLISH');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Validate all min <= max constraints (Section 23: Range Validation)
  const validateRanges = (cfg: MarketEngineConfig): boolean => {
    const errors: Record<string, string> = {};

    if (cfg.minPrice > cfg.maxPrice) errors.price = 'Min Price cannot exceed Max Price';
    if (cfg.spread.min > cfg.spread.max) errors.spread = 'Min Spread cannot exceed Max Spread';
    if (cfg.volatility.min > cfg.volatility.max) errors.volatility = 'Min Volatility cannot exceed Max Volatility';
    if (cfg.aggressiveness.min > cfg.aggressiveness.max) errors.aggressiveness = 'Min Aggressiveness cannot exceed Max Aggressiveness';
    if (cfg.marketSpeed.min > cfg.marketSpeed.max) errors.marketSpeed = 'Min Market Speed cannot exceed Max Market Speed';
    if (cfg.tickMovement.min > cfg.tickMovement.max) errors.tickMovement = 'Min Tick Movement cannot exceed Max Tick Movement';
    if (cfg.trendBias.min > cfg.trendBias.max) errors.trendBias = 'Min Trend Bias cannot exceed Max Trend Bias';
    if (cfg.trendStrength.min > cfg.trendStrength.max) errors.trendStrength = 'Min Trend Strength cannot exceed Max Trend Strength';
    if (cfg.reversalProbability.min > cfg.reversalProbability.max) errors.reversalProbability = 'Min Reversal cannot exceed Max Reversal';
    if (cfg.pullbackStrength.min > cfg.pullbackStrength.max) errors.pullbackStrength = 'Min Pullback cannot exceed Max Pullback';
    if (cfg.breakoutProbability.min > cfg.breakoutProbability.max) errors.breakoutProbability = 'Min Breakout cannot exceed Max Breakout';
    if (cfg.spikeProbability.min > cfg.spikeProbability.max) errors.spikeProbability = 'Min Spike cannot exceed Max Spike';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyChanges = (reason = 'Admin parameter adjustment') => {
    if (!validateRanges(formConfig)) {
      return;
    }
    onUpdateConfig(formConfig, reason);
    setSaveSuccessMsg('Parametrlar muvaffaqiyatli saqlandi va bozor dvigateliga kiritildi!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleLoadPreset = (presetName: string) => {
    const preset = MARKET_PRESETS[presetName];
    if (!preset) return;
    const updated = { ...formConfig, ...preset };
    setFormConfig(updated);
    onUpdateConfig(preset, `Loaded preset: ${presetName}`);
    setSaveSuccessMsg(`Preset yuklandi: ${presetName}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSafeMode = () => {
    const safeUpdates: Partial<MarketEngineConfig> = {
      safeMode: true,
      spread: { min: 10, max: 20 },
      volatility: { min: 0.20, max: 0.50 },
      aggressiveness: { min: 20, max: 50 },
      marketSpeed: { min: 25, max: 50 },
      tickMovement: { min: 1, max: 8 },
    };
    setFormConfig((prev) => ({ ...prev, ...safeUpdates }));
    onUpdateConfig(safeUpdates, 'SAFE MODE Activated: Normalized bounds restored');
    setSaveSuccessMsg('XAVFSIZ REJIM (Safe Mode) faollashtirildi!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  return (
    <div className={`flex flex-col h-full text-xs overflow-hidden select-none transition-colors duration-200 ${themeClasses.surfaceBg} ${themeClasses.textMain}`}>
      {/* 22. PROFESSIONAL LIVE MONITOR (Header Bar) */}
      <div className={`p-3 border-b ${themeClasses.cardBg} ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide text-xs uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              Professional Bozor Jonli Telemetriyasi
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              (Current / Min — Max Invariant Monitor)
            </span>
          </div>

          {/* Emergency Controls (Section 40) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateConfig({ isPaused: !config.isPaused }, config.isPaused ? 'Resume Market' : 'Pause Market')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-semibold text-xs transition-colors ${
                config.isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {config.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {config.isPaused ? 'RESUME MARKET' : 'PAUSE MARKET'}
            </button>

            <button
              onClick={handleSafeMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              SAFE MODE
            </button>

            <button
              onClick={onResetSimulation}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-white font-mono text-[11px] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
          </div>
        </div>

        {/* Live Metrics Grid with Current / Min / Max (Section 22) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">NARX (UZS)</span>
            <span className="text-white font-bold text-sm tabular-nums">
              {formatUZS(metrics.currentPrice)}
            </span>
            <span className="text-neutral-500 text-[10px] block tabular-nums">
              {formatUZS(config.minPrice)} — {formatUZS(config.maxPrice)}
            </span>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">SPRED (UZS)</span>
            <span className="text-amber-400 font-bold text-sm tabular-nums">
              {metrics.currentSpread}
            </span>
            <span className="text-neutral-500 text-[10px] block tabular-nums">
              {config.spread.min} — {config.spread.max}
            </span>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">VOLATILLIK</span>
            <span className="text-neutral-200 font-bold text-sm tabular-nums">
              {metrics.currentVolatility.toFixed(2)}
            </span>
            <span className="text-neutral-500 text-[10px] block tabular-nums">
              {config.volatility.min.toFixed(2)} — {config.volatility.max.toFixed(2)}
            </span>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">HARAKAT TEZLIGI</span>
            <span className="text-neutral-200 font-bold text-sm tabular-nums">
              {metrics.currentSpeed}
            </span>
            <span className="text-neutral-500 text-[10px] block tabular-nums">
              {config.marketSpeed.min} — {config.marketSpeed.max}
            </span>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">AGRESSIYA (0-100)</span>
            <span className="text-rose-400 font-bold text-sm tabular-nums">
              {metrics.currentAggressiveness}
            </span>
            <span className="text-neutral-500 text-[10px] block tabular-nums">
              {config.aggressiveness.min} — {config.aggressiveness.max}
            </span>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">TREND KUCHI</span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">
              {metrics.currentTrendStrength}
            </span>
            <span className="text-neutral-500 text-[10px] block tabular-nums">
              {config.trendStrength.min} — {config.trendStrength.max}
            </span>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800">
            <span className="text-neutral-500 block text-[10px]">JORIY REJIM</span>
            <span className="text-white font-bold text-sm truncate block">
              {metrics.currentRegime}
            </span>
            <span className="text-neutral-500 text-[10px] block">
              Likvidlik: {metrics.currentLiquidity}%
            </span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0A0D14] border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'USERS'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Foydalanuvchilar & Depozit ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CORE_RANGES')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'CORE_RANGES' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Diapazonlar & Narx (Ranges)
          </button>
          <button
            onClick={() => setActiveTab('REGIMES')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'REGIMES' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rejimlar Matritsasi (Regimes)
          </button>
          <button
            onClick={() => setActiveTab('STRUCTURE')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'STRUCTURE' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Struktura & Og‘irliklar (Weights)
          </button>
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'PRESETS' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tayyor Presetlar
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'AUDIT' ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Audit Tarixi ({auditLogs.length})
          </button>
        </div>

        {/* Global Save Button & Admin Logout */}
        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveSuccessMsg}
            </span>
          )}
          <button
            onClick={() => handleApplyChanges()}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md cursor-pointer"
          >
            Bozorga Qo‘llash (Save)
          </button>

          {onAdminLogout && (
            <button
              onClick={onAdminLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono text-xs transition-colors cursor-pointer"
              title="Admin boshqaruvidan chiqish"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Error Banner */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="px-4 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-300 font-mono text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Xatolik: {Object.values(validationErrors).join(' | ')}</span>
        </div>
      )}

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 0: USER MANAGEMENT */}
        {activeTab === 'USERS' && (
          <UserManagement
            users={users}
            activeUserId={activeUserId}
            transactions={transactions}
            theme={theme}
            onAddUser={onAddUser}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
            onUpdatePassword={onUpdatePassword}
            onToggleStatus={onToggleStatus}
            onSelectActiveUser={onSelectActiveUser}
            onDeleteUser={onDeleteUser}
          />
        )}

        {/* TAB 1: CORE RANGES */}
        {activeTab === 'CORE_RANGES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. PRICE SECTION */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">1. Narx Chegaralari</span>
                <span className="text-[10px] text-neutral-500 font-mono">OQ OLTIN / UZS</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Boshlang‘ich Narx</label>
                  <input
                    type="number"
                    value={formConfig.initialPrice}
                    onChange={(e) => setFormConfig({ ...formConfig, initialPrice: Number(e.target.value) })}
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Narx Qadami (Step)</label>
                  <input
                    type="number"
                    value={formConfig.priceStep}
                    onChange={(e) => setFormConfig({ ...formConfig, priceStep: Number(e.target.value) })}
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Narx (UZS)</label>
                  <input
                    type="number"
                    value={formConfig.minPrice}
                    onChange={(e) => setFormConfig({ ...formConfig, minPrice: Number(e.target.value) })}
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Narx (UZS)</label>
                  <input
                    type="number"
                    value={formConfig.maxPrice}
                    onChange={(e) => setFormConfig({ ...formConfig, maxPrice: Number(e.target.value) })}
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. SPREAD CONTROL - RANGE MODE */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">2. Spred Boshqaruvi (Range)</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  Joriy: {metrics.currentSpread} UZS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Spred (UZS)</label>
                  <input
                    type="number"
                    value={formConfig.spread.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        spread: { ...formConfig.spread, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Spred (UZS)</label>
                  <input
                    type="number"
                    value={formConfig.spread.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        spread: { ...formConfig.spread, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Spred Siljishi (Smoothing):</span>
                  <span className="font-mono text-white">{formConfig.spreadSmoothing}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.98"
                  step="0.02"
                  value={formConfig.spreadSmoothing}
                  onChange={(e) => setFormConfig({ ...formConfig, spreadSmoothing: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* 3. VOLATILITY CONTROL - RANGE MODE */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">3. Volatillik (Range)</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Joriy: {metrics.currentVolatility}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Volatillik</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formConfig.volatility.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        volatility: { ...formConfig.volatility, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Volatillik</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formConfig.volatility.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        volatility: { ...formConfig.volatility, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Klasterlanish (Clustering / Persistence):</span>
                  <span className="font-mono text-white">{formConfig.volatilityPersistence}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={formConfig.volatilityPersistence}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, volatilityPersistence: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* 4. PRICE AGGRESSIVENESS CONTROL */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">4. Narx Agressivligi (0-100)</span>
                <span className="text-[10px] text-rose-400 font-mono">
                  Joriy: {metrics.currentAggressiveness}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Agressivlik</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formConfig.aggressiveness.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        aggressiveness: { ...formConfig.aggressiveness, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Agressivlik</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formConfig.aggressiveness.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        aggressiveness: { ...formConfig.aggressiveness, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 leading-relaxed">
                0: Sokin · 30: O‘rtacha · 60: Tezkor · 80: Juda Agressiv · 100: Giper Volatil
              </div>
            </div>

            {/* 5 & 6. SPEED RANGE */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">5 & 6. Bozor Harakat Tezligi</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Joriy: {metrics.currentSpeed}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Tezlik</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={formConfig.marketSpeed.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        marketSpeed: { ...formConfig.marketSpeed, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Tezlik</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={formConfig.marketSpeed.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        marketSpeed: { ...formConfig.marketSpeed, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400">
                <span>UI Animatsiya Tezligi:</span>
                <select
                  value={formConfig.chartAnimationSpeed}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      chartAnimationSpeed: e.target.value as 'SLOW' | 'NORMAL' | 'FAST' | 'ULTRA',
                    })
                  }
                  className="bg-[#080B10] border border-neutral-700 rounded px-2 py-0.5 text-white"
                >
                  <option value="SLOW">Slow</option>
                  <option value="NORMAL">Normal</option>
                  <option value="FAST">Fast</option>
                  <option value="ULTRA">Ultra</option>
                </select>
              </div>
            </div>

            {/* 7. TICK MOVEMENT RANGE */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">7. Tick Harakat Chegarasi</span>
                <span className="text-[10px] text-neutral-400 font-mono">UZS / tick</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Tick (UZS)</label>
                  <input
                    type="number"
                    min={1}
                    value={formConfig.tickMovement.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        tickMovement: { ...formConfig.tickMovement, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Tick (UZS)</label>
                  <input
                    type="number"
                    min={1}
                    value={formConfig.tickMovement.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        tickMovement: { ...formConfig.tickMovement, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-neutral-500">
                Bitta tickdagi narx o‘zgarishi qat’iy ravishda shu oraliqda bo‘ladi.
              </p>
            </div>

            {/* 8 & 9. TREND BIAS & STRENGTH */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">8 & 9. Trend Yo‘nalishi & Kuchi</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {formConfig.activeBiasDirection}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['BULLISH', 'NEUTRAL', 'BEARISH'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setFormConfig({ ...formConfig, activeBiasDirection: dir })}
                    className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                      formConfig.activeBiasDirection === dir
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                        : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Trend Kuchi</label>
                  <input
                    type="number"
                    value={formConfig.trendStrength.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        trendStrength: { ...formConfig.trendStrength, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Trend Kuchi</label>
                  <input
                    type="number"
                    value={formConfig.trendStrength.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        trendStrength: { ...formConfig.trendStrength, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 10 & 11. REVERSAL & PULLBACK CONTROL */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">10 & 11. Reversal & Pullback</span>
                <span className="text-[10px] text-neutral-400 font-mono">Qaytish Ehtimoli</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Min Qaytish (%)</label>
                  <input
                    type="number"
                    value={formConfig.reversalProbability.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        reversalProbability: { ...formConfig.reversalProbability, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Max Qaytish (%)</label>
                  <input
                    type="number"
                    value={formConfig.reversalProbability.max}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        reversalProbability: { ...formConfig.reversalProbability, max: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Pullback Davomiyligi (ticks)</label>
                  <input
                    type="number"
                    value={formConfig.pullbackDurationTicks}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, pullbackDurationTicks: Number(e.target.value) })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Pullback Tez-tezligi</label>
                  <input
                    type="number"
                    value={formConfig.pullbackFrequency}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, pullbackFrequency: Number(e.target.value) })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 12 & 13. BREAKOUT & SPIKE CONTROL */}
            <div className="p-3 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="font-semibold text-white">12 & 13. Breakout & Spikes</span>
                <span className="text-[10px] text-amber-400 font-mono">Buzilishlar</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] block">Breakout Kuchliligi</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formConfig.breakoutStrength}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, breakoutStrength: Number(e.target.value) })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Soxta Breakout (%)</label>
                  <input
                    type="number"
                    value={formConfig.fakeBreakoutProbability}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, fakeBreakoutProbability: Number(e.target.value) })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Spike Ehtimoli Min (%)</label>
                  <input
                    type="number"
                    value={formConfig.spikeProbability.min}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        spikeProbability: { ...formConfig.spikeProbability, min: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] block">Spike Tiklanish Tezligi</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formConfig.spikeRecoverySpeed}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, spikeRecoverySpeed: Number(e.target.value) })
                    }
                    className="w-full bg-[#080B10] border border-neutral-700 rounded px-2 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARKET REGIMES (Section 14) */}
        {activeTab === 'REGIMES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-900/60 rounded border border-neutral-800">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Avtomatik Rejim Aylanishi</span>
                <span className="text-neutral-400 text-[11px] block">
                  Bozor holatlari tabiiy ravishda o‘zaro almashinib turishi
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.autoRegimeCycle}
                  onChange={(e) => setFormConfig({ ...formConfig, autoRegimeCycle: e.target.checked })}
                  className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                />
                <span className="font-mono text-xs text-amber-300">
                  {formConfig.autoRegimeCycle ? 'AVTOMATIK FAOL' : 'QO‘LDA QULFLANGAN'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(Object.keys(formConfig.regimeConfigs) as MarketRegimeType[]).map((rName) => {
                const rCfg = formConfig.regimeConfigs[rName];
                const isCurrent = metrics.currentRegime === rName;

                return (
                  <div
                    key={rName}
                    className={`p-3 rounded border transition-all ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                        : 'border-neutral-800 bg-[#0F1420]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <span className="font-bold text-white text-xs font-mono">{rName}</span>
                      {isCurrent ? (
                        <span className="text-[10px] text-amber-400 font-semibold font-mono animate-pulse">
                          ● FAOL
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setFormConfig({ ...formConfig, regime: rName, autoRegimeCycle: false });
                            onUpdateConfig({ regime: rName, autoRegimeCycle: false }, `Force switched regime: ${rName}`);
                          }}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
                        >
                          Qo‘lda Tanlash
                        </button>
                      )}
                    </div>

                    <div className="mt-2 space-y-1.5 font-mono text-[10px] text-neutral-400">
                      <div className="flex justify-between">
                        <span>Davomiylik (sek):</span>
                        <span className="text-white">{rCfg.minDurationSec}s — {rCfg.maxDurationSec}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volatillik:</span>
                        <span className="text-white">{rCfg.minVolatility} — {rCfg.maxVolatility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Harakat Tezligi:</span>
                        <span className="text-white">{rCfg.minSpeed} — {rCfg.maxSpeed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend Kuchi:</span>
                        <span className="text-white">{rCfg.trendStrength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spred Diapazoni:</span>
                        <span className="text-amber-400">{rCfg.minSpread} — {rCfg.maxSpread} UZS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STRUCTURE & WEIGHTS & EVENTS (Section 19 & 35) */}
        {activeTab === 'STRUCTURE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Procedural Weights */}
            <div className="p-4 bg-[#0F1420] rounded border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="font-semibold text-white">19. Protsedural Narx Matematika Og‘irliklari</span>
                <span className="text-[10px] text-neutral-500 font-mono">Procedural Weights</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Oq Oltin narxi sun’iy kazino emas, balki real tovar bozorining ko‘p qirrali fizik-iqtisodiy komponentlari yig‘indisidir.
              </p>

              <div className="space-y-2.5 pt-2">
                {Object.entries(formConfig.weights).map(([k, val]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-300 font-mono capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-amber-400 font-mono font-bold">{(val as number).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.5"
                      step="0.02"
                      value={val as number}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          weights: {
                            ...formConfig.weights,
                            [k]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Market Events Trigger (Section 35) */}
            <div className="p-4 bg-[#0F1420] rounded border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="font-semibold text-white">35. Bozor Voqealari Triggeri</span>
                <span className="text-[10px] text-amber-400 font-mono">Market Events</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Bozorga tezkor yangilik yoki iqtisodiy shok berish (paxta hosili, eksport, ob-havo qurg‘oqchiligi).
              </p>

              {/* Ready Event Triggers */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() =>
                    onTriggerEvent({
                      title: '🌾 Yuqori Paxta Hosildorligi',
                      description: 'Hududlarda paxta terimi kutilganidan 15% oshdi — taklif ko‘paydi',
                      impact: 'BEARISH',
                      intensity: 3,
                      durationSec: 30,
                    })
                  }
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:border-rose-500/60 text-left transition-colors"
                >
                  <span className="text-rose-400 font-semibold block text-xs">🌾 Hosil Mo‘lligi</span>
                  <span className="text-neutral-500 text-[10px] block">Narxga pasayish bosimi (-0.8%)</span>
                </button>

                <button
                  onClick={() =>
                    onTriggerEvent({
                      title: '⚡ To‘qimachilik Sanoatida Talab O‘sdi',
                      description: 'Mahalliy klasterlar xom-ashyo xaridini keskin oshirdi',
                      impact: 'BULLISH',
                      intensity: 4,
                      durationSec: 40,
                    })
                  }
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/60 text-left transition-colors"
                >
                  <span className="text-emerald-400 font-semibold block text-xs">⚡ Talabning O‘sishi</span>
                  <span className="text-neutral-500 text-[10px] block">Narxga ko‘tarilish impulsi (+1.2%)</span>
                </button>

                <button
                  onClick={() =>
                    onTriggerEvent({
                      title: '💧 Qurg‘oqchilik Xavfi',
                      description: 'Suv taqchilligi sabab kelgusi mavsum xavotirlari kuchaydi',
                      impact: 'VOLATILITY',
                      intensity: 4,
                      durationSec: 35,
                    })
                  }
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 text-left transition-colors"
                >
                  <span className="text-amber-400 font-semibold block text-xs">💧 Suv Taqchilligi</span>
                  <span className="text-neutral-500 text-[10px] block">Volatillik portlashi va spred kengayishi</span>
                </button>

                <button
                  onClick={() =>
                    onTriggerEvent({
                      title: '🌐 Jahon Paxta Birjasi Rekordi',
                      description: 'Xalqaro fyucherslar keskin yuqoriga sakradi',
                      impact: 'BULLISH',
                      intensity: 5,
                      durationSec: 45,
                    })
                  }
                  className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/60 text-left transition-colors"
                >
                  <span className="text-emerald-400 font-semibold block text-xs">🌐 Global Birja Sakrashi</span>
                  <span className="text-neutral-500 text-[10px] block">Kuchli Bullish Breakout</span>
                </button>
              </div>

              {/* Custom Event Creator */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <span className="text-neutral-300 font-medium text-xs block">Maxsus Voqea Yaratish:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masalan: 'Eksport shartnomasi imzolandi'"
                    value={customEventTitle}
                    onChange={(e) => setCustomEventTitle(e.target.value)}
                    className="flex-1 bg-[#080B10] border border-neutral-700 rounded px-2.5 py-1 text-white text-xs"
                  />
                  <select
                    value={customEventImpact}
                    onChange={(e) => setCustomEventImpact(e.target.value as any)}
                    className="bg-[#080B10] border border-neutral-700 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="BULLISH">Bullish</option>
                    <option value="BEARISH">Bearish</option>
                    <option value="VOLATILITY">Volatil</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!customEventTitle) return;
                      onTriggerEvent({
                        title: customEventTitle,
                        description: 'Admin tomonidan yuborilgan favqulodda bozor hodisasi',
                        impact: customEventImpact,
                        intensity: 3,
                        durationSec: 30,
                      });
                      setCustomEventTitle('');
                    }}
                    className="px-3 py-1 bg-amber-500 text-black font-semibold rounded text-xs hover:bg-amber-400"
                  >
                    Yuborish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRESETS (Section 24) */}
        {activeTab === 'PRESETS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(MARKET_PRESETS).map((pKey) => {
              const p = MARKET_PRESETS[pKey];
              return (
                <div key={pKey} className="p-4 bg-[#0F1420] rounded border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="font-bold text-white text-xs font-mono">{pKey}</span>
                    <button
                      onClick={() => handleLoadPreset(pKey)}
                      className="px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400 transition-colors"
                    >
                      Yuklash
                    </button>
                  </div>
                  <div className="space-y-1 font-mono text-[10px] text-neutral-400">
                    <div className="flex justify-between">
                      <span>Spred Chegarasi:</span>
                      <span className="text-amber-400">{p.spread?.min} — {p.spread?.max} UZS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volatillik:</span>
                      <span className="text-white">{p.volatility?.min} — {p.volatility?.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harakat Tezligi:</span>
                      <span className="text-white">{p.marketSpeed?.min} — {p.marketSpeed?.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agressivlik:</span>
                      <span className="text-rose-400">{p.aggressiveness?.min} — {p.aggressiveness?.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boshlang‘ich Rejim:</span>
                      <span className="text-white">{p.regime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: AUDIT LOG (Section 39) */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Admin Sozlamalari O‘zgarishlari Jurnali (Audit Trail)</span>
              <span className="font-mono text-neutral-500">Jami: {auditLogs.length} yozuv</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 bg-[#0F1420] rounded border border-neutral-800">
                Hozircha hech qanday sozlama o‘zgartirilmagan
              </div>
            ) : (
              <div className="overflow-x-auto rounded border border-neutral-800">
                <table className="w-full text-left font-mono text-[11px] border-collapse bg-[#0F1420]">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800 bg-neutral-900/60">
                      <th className="py-2 px-3">Vaqt</th>
                      <th className="py-2 px-3">Parametr / Voqea</th>
                      <th className="py-2 px-3">Eski Qiymat</th>
                      <th className="py-2 px-3">Yangi Qiymat</th>
                      <th className="py-2 px-3">Admin</th>
                      <th className="py-2 px-3">Sabab / Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {auditLogs.map((log) => {
                      const d = new Date(log.timestamp);
                      const timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(
                        d.getSeconds()
                      ).padStart(2, '0')}`;

                      return (
                        <tr key={log.id} className="hover:bg-neutral-900/40">
                          <td className="py-2 px-3 text-neutral-400 whitespace-nowrap">{timeStr}</td>
                          <td className="py-2 px-3 text-amber-400 font-semibold">{log.parameter}</td>
                          <td className="py-2 px-3 text-neutral-400 max-w-xs truncate">{log.oldValue}</td>
                          <td className="py-2 px-3 text-white font-medium max-w-xs truncate">{log.newValue}</td>
                          <td className="py-2 px-3 text-neutral-300">{log.admin}</td>
                          <td className="py-2 px-3 text-neutral-400">{log.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
