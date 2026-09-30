'use client';

import React from 'react';
import { AppTheme } from '@/lib/market-types';
import { THEME_CLASSES } from '@/lib/theme-config';
import { X, Keyboard, HelpCircle } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  theme?: AppTheme;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, theme = 'DARK', onClose }) => {
  if (!isOpen) return null;

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div
        className={`w-full max-w-md border rounded-lg shadow-2xl p-5 transition-colors duration-200 ${
          theme === 'LIGHT'
            ? 'bg-white border-slate-300 text-slate-800'
            : theme === 'OLED'
            ? 'bg-black border-neutral-800 text-neutral-100'
            : theme === 'GOLD'
            ? 'bg-[#181410] border-amber-900/60 text-amber-50'
            : 'bg-[#0F1422] border-neutral-800 text-neutral-200'
        }`}
      >
        <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.border}`}>
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-500" />
            <h3 className={`text-sm font-bold tracking-wide ${themeClasses.textMain}`}>
              Tezkor Tugmalar & Boshqaruv (Hotkeys)
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${themeClasses.textMuted} hover:${themeClasses.textMain}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 font-mono text-xs">
          <div className={`flex justify-between items-center py-1 border-b ${themeClasses.border}`}>
            <span className={themeClasses.textMuted}>BUY (Olish) Buyurtmasi</span>
            <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
              B
            </kbd>
          </div>

          <div className={`flex justify-between items-center py-1 border-b ${themeClasses.border}`}>
            <span className={themeClasses.textMuted}>SELL (Sotish) Buyurtmasi</span>
            <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
              S
            </kbd>
          </div>

          <div className={`flex justify-between items-center py-1 border-b ${themeClasses.border}`}>
            <span className={themeClasses.textMuted}>Bozorni To‘xtatish / Davom ettirish</span>
            <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
              SPACE
            </kbd>
          </div>

          <div className={`flex justify-between items-center py-1 border-b ${themeClasses.border}`}>
            <span className={themeClasses.textMuted}>Barcha Ochiq Pozitsiyalarni Yopish</span>
            <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
              C
            </kbd>
          </div>

          <div className={`flex justify-between items-center py-1 border-b ${themeClasses.border}`}>
            <span className={themeClasses.textMuted}>Grafikni Qayta Tiklash (Reset)</span>
            <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
              R
            </kbd>
          </div>

          <div className={`flex justify-between items-center py-1 border-b ${themeClasses.border}`}>
            <span className={themeClasses.textMuted}>Vaqt oralig‘ini almashtirish (1S..1D)</span>
            <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
              1 .. 9
            </kbd>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className={themeClasses.textMuted}>Masshtabni o‘zgartirish (Zoom +/-)</span>
            <div className="flex gap-1">
              <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
                +
              </kbd>
              <kbd className={`px-2 py-0.5 rounded border text-amber-500 font-bold ${themeClasses.cardBg} ${themeClasses.border}`}>
                -
              </kbd>
            </div>
          </div>
        </div>

        <div className={`pt-3 border-t text-center ${themeClasses.border}`}>
          <button
            onClick={onClose}
            className="w-full py-2 rounded bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  );
};
