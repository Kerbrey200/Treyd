import { AppTheme } from './market-types';

export interface ThemeColors {
  headerBg: string;
  surfaceBg: string;
  cardBg: string;
  cardSubtleBg: string;
  inputBg: string;
  border: string;
  borderSubtle: string;
  textMain: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentText: string;
  accentBg: string;
  tableHover: string;
}

export const THEME_CLASSES: Record<AppTheme, ThemeColors> = {
  DARK: {
    headerBg: 'bg-[#090C12]',
    surfaceBg: 'bg-[#0E131F]',
    cardBg: 'bg-[#111724]',
    cardSubtleBg: 'bg-[#172033]',
    inputBg: 'bg-[#080A0F]',
    border: 'border-neutral-800',
    borderSubtle: 'border-neutral-700/60',
    textMain: 'text-white',
    textMuted: 'text-neutral-400',
    textSubtle: 'text-neutral-500',
    accent: 'border-amber-500/40 text-amber-400',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
    tableHover: 'hover:bg-neutral-900/60',
  },
  LIGHT: {
    headerBg: 'bg-white',
    surfaceBg: 'bg-white',
    cardBg: 'bg-slate-50',
    cardSubtleBg: 'bg-slate-100',
    inputBg: 'bg-white',
    border: 'border-slate-200',
    borderSubtle: 'border-slate-300',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-600',
    textSubtle: 'text-slate-400',
    accent: 'border-amber-600/40 text-amber-700',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-500/15',
    tableHover: 'hover:bg-slate-100/70',
  },
  OLED: {
    headerBg: 'bg-black',
    surfaceBg: 'bg-black',
    cardBg: 'bg-[#080808]',
    cardSubtleBg: 'bg-[#121212]',
    inputBg: 'bg-black',
    border: 'border-neutral-900',
    borderSubtle: 'border-neutral-800',
    textMain: 'text-white',
    textMuted: 'text-neutral-400',
    textSubtle: 'text-neutral-600',
    accent: 'border-yellow-500/50 text-yellow-400',
    accentText: 'text-yellow-400',
    accentBg: 'bg-yellow-500/20',
    tableHover: 'hover:bg-neutral-950',
  },
  GOLD: {
    headerBg: 'bg-[#0E0C0A]',
    surfaceBg: 'bg-[#181512]',
    cardBg: 'bg-[#1F1B17]',
    cardSubtleBg: 'bg-[#29241E]',
    inputBg: 'bg-[#0B0A08]',
    border: 'border-amber-950/60',
    borderSubtle: 'border-amber-900/40',
    textMain: 'text-amber-50',
    textMuted: 'text-amber-200/70',
    textSubtle: 'text-amber-400/40',
    accent: 'border-amber-500/50 text-amber-400',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/20',
    tableHover: 'hover:bg-amber-950/30',
  },
};
