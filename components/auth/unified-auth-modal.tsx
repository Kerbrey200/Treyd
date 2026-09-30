'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Users,
  LogOut,
  X,
  KeyRound,
  Shield,
} from 'lucide-react';
import { AppTheme, RegisteredUser } from '@/lib/market-types';
import { THEME_CLASSES } from '@/lib/theme-config';
import { formatUZS } from '@/lib/utils';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  theme?: AppTheme;
  users: RegisteredUser[];
  activeUser?: RegisteredUser;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  onTraderLogin: (userId: string) => void;
  onAdminLogin: () => void;
  onLogout: () => void;
  onClose: () => void;
  initialRole?: 'TRADER' | 'ADMIN';
  alertMessage?: string;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  theme = 'DARK',
  users,
  activeUser,
  isAuthenticated,
  isAdminAuthenticated,
  onTraderLogin,
  onAdminLogin,
  onLogout,
  onClose,
  initialRole = 'TRADER',
  alertMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'QUICK_SELECT'>('LOGIN');
  const [username, setUsername] = useState(initialRole === 'ADMIN' ? 'Admin' : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(alertMessage || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  // Unified submit handler for BOTH User and Admin without exposing passwords
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      // 1. Check Admin Credentials: Login "Admin", Parol "Admin123" (strictly server/state checked, never displayed)
      if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'Admin123') {
        setIsLoading(false);
        setSuccessMsg('Administrator tizimiga muvaffaqiyatli ulandi!');
        setTimeout(() => {
          onAdminLogin();
          onClose();
        }, 300);
        return;
      }

      // 2. Check Trader Credentials in registered users list
      const matchedUser = users.find(
        (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
      );

      if (matchedUser) {
        if (matchedUser.password === cleanPass) {
          if (matchedUser.status === 'BLOCKED') {
            setIsLoading(false);
            setError('Ushbu hisob admin tomonidan bloklangan! Administratorga murojaat qiling.');
            return;
          }
          setIsLoading(false);
          setSuccessMsg(`Xush kelibsiz, ${matchedUser.fullName}! Savdo terminali faollashdi.`);
          setTimeout(() => {
            onTraderLogin(matchedUser.id);
            onClose();
          }, 300);
          return;
        } else {
          setIsLoading(false);
          setError('Kiritilgan parol noto‘g‘ri! Iltimos, qayta tekshirib kiriting.');
          return;
        }
      }

      // 3. User not found
      setIsLoading(false);
      setError('Login yoki parol xato! Tizimda bunday hisob topilmadi.');
    }, 250);
  };

  const handleSelectTraderForLogin = (user: RegisteredUser) => {
    setUsername(user.username);
    setPassword('');
    setActiveTab('LOGIN');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${themeClasses.cardBg} ${themeClasses.border}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          title="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Portal Branding Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-amber-400/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className={`text-lg font-bold font-mono tracking-tight ${themeClasses.textMain}`}>
            OQ OLTIN / UZS — Kirish Portali
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Savdo qilish va tizimni boshqarish uchun shaxsiy hisobingizga kiring
          </p>
        </div>

        {/* Current Active Account Status Banner */}
        <div className="mb-5 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAuthenticated || isAdminAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
              }`}
            />
            <div>
              <span className="text-neutral-400 text-[10px] block">Joriy Holat:</span>
              <span className="font-bold text-white">
                {isAdminAuthenticated
                  ? 'Administrator (Admin)'
                  : isAuthenticated && activeUser
                  ? `@${activeUser.username} (${activeUser.fullName})`
                  : 'Mehmon (Kirilmagan — Savdo cheklangan)'}
              </span>
            </div>
          </div>
          {(isAuthenticated || isAdminAuthenticated) && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors"
              title="Hisobdan chiqish"
            >
              <LogOut className="w-3 h-3" />
              <span>Chiqish</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 mb-5 font-mono text-xs">
          <button
            onClick={() => setActiveTab('LOGIN')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Login & Parol</span>
          </button>

          <button
            onClick={() => setActiveTab('QUICK_SELECT')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'QUICK_SELECT'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mavjud Treydirlar</span>
          </button>
        </div>

        {/* Alerts: Error or Success */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: UNIFIED LOGIN FORM */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-mono">
            {/* Username / Login */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1.5">
                Login / Foydalanuvchi nomi
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Loginni kiriting"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-lg border outline-none focus:border-amber-500 transition-colors text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-neutral-300 font-semibold">Parol</label>
                <span className="text-[10px] text-neutral-500">Maxfiy kalit</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Parolni kiriting"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-lg border outline-none focus:border-amber-500 transition-colors text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  title={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Notice: No passwords displayed */}
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Kirish orqali barcha savdo amaliyotlari va shaxsiy hisob faollashadi.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isLoading ? 'Tekshirilmoqda...' : 'Tizimga Kirish'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: REGISTERED TRADERS LIST (NO PASSWORDS EXPOSED) */}
        {activeTab === 'QUICK_SELECT' && (
          <div className="space-y-3 font-mono">
            <p className="text-[11px] text-neutral-400">
              Tizimda ro‘yxatdan o‘tgan treydirlar. Loginni tanlang va parolingizni kiriting:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {/* Admin Selection Row (Password NEVER shown) */}
              <div
                onClick={() => {
                  setUsername('Admin');
                  setPassword('');
                  setActiveTab('LOGIN');
                  setError('');
                }}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <span>Administrator</span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] rounded font-semibold">
                        Boshqaruv
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">Bozor va foydalanuvchilar boshqaruvi</div>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold underline">Tanlash →</span>
              </div>

              {/* Trader Users List (Passwords NEVER shown) */}
              {users.map((u) => {
                const isCurrent = u.id === activeUser?.id && isAuthenticated;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectTraderForLogin(u)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          <span className="text-neutral-400 font-normal">(@{u.username})</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-semibold">
                              Faol
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold">
                          Depozit: {formatUZS(u.balanceUZS)} UZS
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 hover:text-white">Tanlash →</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
