'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AppTheme } from '@/lib/market-types';
import { THEME_CLASSES } from '@/lib/theme-config';

interface AdminLoginModalProps {
  isOpen: boolean;
  theme?: AppTheme;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  theme = 'DARK',
  onSuccess,
  onCancel,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check credentials strictly per requirement: login "Admin", parol "Admin123"
    setTimeout(() => {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'Admin123') {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError('Login yoki parol noto‘g‘ri! Iltimos, tekshirib qayta urinib ko‘ring.');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${themeClasses.cardBg} ${themeClasses.border}`}
      >
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className={`text-lg font-bold font-mono tracking-tight ${themeClasses.textMain}`}>
            Admin Boshqaruv Markazi
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Xavfsiz tizimga kirish uchun login va parolni kiriting
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1.5">Admin Login</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                required
                placeholder="Admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={`w-full pl-9 pr-3 py-2.5 rounded-lg border outline-none focus:border-amber-500 transition-colors text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1.5">Admin Parol</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
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
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Tekshirilmoqda...' : 'Tizimga Kirish'}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bekor qilish (Terminalga qaytish)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
