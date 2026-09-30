'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserAccount, AppTheme, RegisteredUser } from '@/lib/market-types';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import { Sliders, TrendingUp, HelpCircle, Palette, Sun, Moon, Sparkles, Contrast, Check, ChevronDown, Lock, User, LogOut, Shield } from 'lucide-react';

interface TerminalHeaderProps {
  currentView: 'TERMINAL' | 'ADMIN';
  onViewChange: (view: 'TERMINAL' | 'ADMIN') => void;
  account: UserAccount;
  activeUser?: RegisteredUser;
  isAuthenticated?: boolean;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
  onLogout?: () => void;
  onOpenAuthModal: (role?: 'TRADER' | 'ADMIN') => void;
  onOpenShortcuts: () => void;
  isPaused: boolean;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const THEME_OPTIONS: { id: AppTheme; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'DARK', label: "Qorong'i (Pro)", icon: Moon },
  { id: 'LIGHT', label: "Yorug' (Light)", icon: Sun },
  { id: 'OLED', label: 'OLED (Pitch Black)', icon: Contrast },
  { id: 'GOLD', label: 'Oltin Paxta (Gold)', icon: Sparkles },
];

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  currentView,
  onViewChange,
  account,
  activeUser,
  isAuthenticated = false,
  isAdminAuthenticated = false,
  onAdminLogout,
  onLogout,
  onOpenAuthModal,
  onOpenShortcuts,
  isPaused,
  theme,
  onThemeChange,
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ActiveIcon = activeTheme.icon;
  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  return (
    <header className={`flex items-center justify-between px-5 py-2.5 border-b text-xs select-none transition-colors duration-200 ${themeClasses.headerBg} ${themeClasses.border} ${themeClasses.textMain}`}>
      {/* Zone 1: Single text element wordmark (Top Bar Contract) */}
      <div className="flex items-center gap-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewChange('TERMINAL');
          }}
          className={`text-base font-bold tracking-tight font-mono hover:text-amber-400 transition-colors ${themeClasses.textMain}`}
        >
          OQ OLTIN / UZS
        </a>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onViewChange('TERMINAL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
            currentView === 'TERMINAL'
              ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/40'
              : `${themeClasses.textMuted} hover:${themeClasses.textMain}`
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Savdo Terminali
        </button>

        <button
          onClick={() => {
            if (isAdminAuthenticated) {
              onViewChange('ADMIN');
            } else {
              onOpenAuthModal('ADMIN');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'ADMIN'
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
              : `${themeClasses.textMuted} hover:${themeClasses.textMain}`
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Admin Boshqaruv Markazi</span>
          {!isAdminAuthenticated && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[9px] font-mono">
              <Lock className="w-2.5 h-2.5" />
              <span>Parol</span>
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* If authenticated (Trader or Admin): render account chip and logout */}
        {isAuthenticated || isAdminAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenAuthModal(isAdminAuthenticated ? 'ADMIN' : 'TRADER')}
              className={`flex items-center gap-2 font-mono text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 ${
                isAdminAuthenticated
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-800 hover:border-neutral-700'
              }`}
              title="Hisob ma’lumotlari va boshqa hisobga o‘tish"
            >
              {isAdminAuthenticated ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">Admin</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-neutral-400">Treydir:</span>
                  <span className="font-bold text-white">@{activeUser?.username || 'user'}</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-neutral-400 opacity-70" />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-rose-500/20 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Tizimdan chiqish (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          /* Unauthenticated Guest: show prominent Kirish button */
          <button
            onClick={() => onOpenAuthModal('TRADER')}
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kirish</span>
          </button>
        )}

        {/* Balance badge */}
        <div className={`hidden sm:flex items-center gap-2 font-mono text-[11px] px-2.5 py-1 rounded border ${themeClasses.cardBg} ${themeClasses.border} ${themeClasses.textMuted}`}>
          <span className={themeClasses.textSubtle}>Mablag‘:</span>
          {isAuthenticated || isAdminAuthenticated ? (
            <span className={`font-bold tabular-nums ${themeClasses.textMain}`}>
              {formatUZS(account.balanceUZS)} UZS
            </span>
          ) : (
            <span className="font-semibold text-amber-400/90">
              Kirilmagan
            </span>
          )}
        </div>

        {/* Theme Switcher Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${themeClasses.cardBg} ${themeClasses.border} ${themeClasses.textMain}`}
            title="Mavzuni (Tema) tanlash"
          >
            <ActiveIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono text-[11px]">{activeTheme.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isThemeOpen && (
            <div
              className={`absolute right-0 mt-1.5 w-44 border rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                theme === 'LIGHT'
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-[#0E131F] border-neutral-700 text-neutral-100'
              }`}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-neutral-500 tracking-wider border-b border-neutral-700/40">
                Rang Mavzusi (Theme)
              </div>
              {THEME_OPTIONS.map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setIsThemeOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-1.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-400 font-semibold'
                        : `${themeClasses.tableHover} ${theme === 'LIGHT' ? 'text-slate-700' : 'text-neutral-300'}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                      <span>{t.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onOpenShortcuts}
          title="Tezkor tugmalar"
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
