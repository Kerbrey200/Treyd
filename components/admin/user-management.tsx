'use client';

import React, { useState } from 'react';
import { RegisteredUser, UserDepositTransaction, AppTheme } from '@/lib/market-types';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import {
  Users,
  UserPlus,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  CheckCircle,
  XCircle,
  Key,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  Clock,
  Sparkles,
  FileText,
  History as HistoryIcon,
} from 'lucide-react';

interface UserManagementProps {
  users: RegisteredUser[];
  activeUserId: string;
  transactions: UserDepositTransaction[];
  theme?: AppTheme;
  onAddUser: (user: Omit<RegisteredUser, 'id' | 'createdAt' | 'equityUZS' | 'totalDepositedUZS'>) => void;
  onDeposit: (userId: string, amount: number, note: string) => void;
  onWithdraw: (userId: string, amount: number, note: string) => void;
  onUpdatePassword: (userId: string, newPass: string) => void;
  onToggleStatus: (userId: string) => void;
  onSelectActiveUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  activeUserId,
  transactions,
  theme = 'DARK',
  onAddUser,
  onDeposit,
  onWithdraw,
  onUpdatePassword,
  onToggleStatus,
  onSelectActiveUser,
  onDeleteUser,
}) => {
  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  // View state: 'USERS' or 'TRANSACTIONS'
  const [subTab, setSubTab] = useState<'USERS' | 'TRANSACTIONS'>('USERS');

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositModalUser, setDepositModalUser] = useState<RegisteredUser | null>(null);
  const [withdrawModalUser, setWithdrawModalUser] = useState<RegisteredUser | null>(null);
  const [editPassUser, setEditPassUser] = useState<RegisteredUser | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Add User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newInitialDeposit, setNewInitialDeposit] = useState('50000000');
  const [newNotes, setNewNotes] = useState('');
  const [addError, setAddError] = useState('');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('10000000');
  const [depositNote, setDepositNote] = useState('Depozit to‘ldirildi');

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('5000000');
  const [withdrawNote, setWithdrawNote] = useState('Mablag‘ yechildi');
  const [withdrawError, setWithdrawError] = useState('');

  // Edit Password Form State
  const [newPassInput, setNewPassInput] = useState('');

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregated Stats
  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;
  const totalBalanceAll = users.reduce((sum, u) => sum + u.balanceUZS, 0);
  const totalDepositedAll = users.reduce((sum, u) => sum + (u.totalDepositedUZS || u.balanceUZS), 0);

  // Handle Add User Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      setAddError('Iltimos, foydalanuvchi ism-familiyasini kiriting!');
      return;
    }
    if (!newUsername.trim()) {
      setAddError('Iltimos, login (username) kiriting!');
      return;
    }
    if (!newPassword.trim()) {
      setAddError('Iltimos, parol kiriting!');
      return;
    }
    const cleanUsername = newUsername.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setAddError(`"${newUsername}" nomli login allaqachon mavjud! Boshqa login tanlang.`);
      return;
    }

    const depAmount = parseFloat(newInitialDeposit) || 0;
    if (depAmount < 0) {
      setAddError('Boshlang‘ich depozit manfiy bo‘lishi mumkin emas!');
      return;
    }

    onAddUser({
      fullName: newFullName.trim(),
      username: cleanUsername,
      password: newPassword.trim(),
      balanceUZS: depAmount,
      role: 'TRADER',
      status: 'ACTIVE',
      notes: newNotes.trim() || undefined,
    });

    // Reset & close
    setNewFullName('');
    setNewUsername('');
    setNewPassword('');
    setNewInitialDeposit('50000000');
    setNewNotes('');
    setAddError('');
    setIsAddModalOpen(false);
  };

  // Handle Deposit Submit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalUser) return;
    const amount = parseFloat(depositAmount) || 0;
    if (amount <= 0) return;

    onDeposit(depositModalUser.id, amount, depositNote.trim() || 'Balans to‘ldirildi');
    setDepositModalUser(null);
  };

  // Handle Withdraw Submit
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawModalUser) return;
    const amount = parseFloat(withdrawAmount) || 0;
    if (amount <= 0) return;
    if (amount > withdrawModalUser.balanceUZS) {
      setWithdrawError('Yechish summasi mavjud balansdan ko‘p bo‘lishi mumkin emas!');
      return;
    }

    onWithdraw(withdrawModalUser.id, amount, withdrawNote.trim() || 'Mablag‘ yechildi');
    setWithdrawModalUser(null);
    setWithdrawError('');
  };

  // Handle Password Edit Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPassUser) return;
    if (!newPassInput.trim()) return;

    onUpdatePassword(editPassUser.id, newPassInput.trim());
    setEditPassUser(null);
    setNewPassInput('');
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden p-4 md:p-6 space-y-6">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${themeClasses.cardBg} ${themeClasses.border}`}
        >
          <div>
            <span className={`text-xs uppercase font-mono tracking-wider ${themeClasses.textSubtle}`}>
              Jami Foydalanuvchilar
            </span>
            <div className={`text-2xl font-bold font-mono mt-1 ${themeClasses.textMain}`}>{totalUsers} ta</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{activeUsersCount} ta faol treydir</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Depozit */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${themeClasses.cardBg} ${themeClasses.border}`}
        >
          <div>
            <span className={`text-xs uppercase font-mono tracking-wider ${themeClasses.textSubtle}`}>
              Jami Depozitlar (Balans)
            </span>
            <div className="text-xl font-bold font-mono mt-1 text-amber-400">
              {formatUZS(totalBalanceAll)} UZS
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-mono">Barcha foydalanuvchilar balansi</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Cumulative Inflow */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${themeClasses.cardBg} ${themeClasses.border}`}
        >
          <div>
            <span className={`text-xs uppercase font-mono tracking-wider ${themeClasses.textSubtle}`}>
              Kiritilgan Jami Sarmoya
            </span>
            <div className={`text-xl font-bold font-mono mt-1 ${themeClasses.textMain}`}>
              {formatUZS(totalDepositedAll)} UZS
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-mono">Tizimga kiritilgan sarmoya</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Quick Action Button */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-center items-stretch shadow-xs ${themeClasses.cardBg} ${themeClasses.border}`}
        >
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi Foydalanuvchi Qo‘shish</span>
          </button>
          <span className="text-[10px] text-neutral-400 text-center mt-2 font-mono">
            Login, parol va depozit bilan yangi hisob ochish
          </span>
        </div>
      </div>

      {/* 2. SUB NAVIGATION & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sub Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <button
            onClick={() => setSubTab('USERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
              subTab === 'USERS'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Foydalanuvchilar Ro‘yxati ({users.length})</span>
          </button>

          <button
            onClick={() => setSubTab('TRANSACTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
              subTab === 'TRANSACTIONS'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Depozit Tarixi ({transactions.length})</span>
          </button>
        </div>

        {/* Search & Filter */}
        {subTab === 'USERS' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ism yoki login bo‘yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs font-mono outline-none w-52 sm:w-64 focus:border-amber-500 transition-colors ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono outline-none focus:border-amber-500 ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
            >
              <option value="ALL">Barchasi</option>
              <option value="ACTIVE">Faol</option>
              <option value="BLOCKED">Bloklangan</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. MAIN TABLE VIEW: USERS LIST */}
      {subTab === 'USERS' ? (
        <div className={`flex-1 overflow-auto rounded-xl border ${themeClasses.cardBg} ${themeClasses.border}`}>
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className={`border-b ${themeClasses.headerBg} ${themeClasses.border} text-neutral-400`}>
                <th className="py-3 px-4 font-semibold">Foydalanuvchi</th>
                <th className="py-3 px-4 font-semibold">Login (Username)</th>
                <th className="py-3 px-4 font-semibold">Parol</th>
                <th className="py-3 px-4 font-semibold">Joriy Depozit / Balans</th>
                <th className="py-3 px-4 font-semibold">Holati</th>
                <th className="py-3 px-4 font-semibold">Ochilgan sana</th>
                <th className="py-3 px-4 font-semibold text-right">Amallar & Boshqaruv</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-neutral-500">
                    Foydalanuvchi topilmadi. Yuqoridagi tugma orqali yangi foydalanuvchi qo‘shing.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActiveTrader = u.id === activeUserId;
                  const isVisible = showPasswords[u.id];

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-neutral-800/30 transition-colors ${
                        isActiveTrader ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1.5 text-white">
                              <span>{u.fullName}</span>
                              {isActiveTrader && (
                                <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-bold rounded">
                                  Faol Terminal
                                </span>
                              )}
                            </div>
                            {u.notes && <div className="text-[10px] text-neutral-400 truncate max-w-xs">{u.notes}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4 font-semibold text-amber-300">@{u.username}</td>

                      {/* Password */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-neutral-200">
                            {isVisible ? u.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 text-neutral-400 hover:text-white rounded"
                            title={isVisible ? 'Parolni yashirish' : 'Parolni ko‘rish'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Balance / Deposit */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-emerald-400 text-sm tabular-nums">
                          {formatUZS(u.balanceUZS)} UZS
                        </div>
                        <div className="text-[10px] text-neutral-500 tabular-nums">
                          Kiritilgan: {formatUZS(u.totalDepositedUZS || u.balanceUZS)} UZS
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
                            <XCircle className="w-3 h-3" />
                            Bloklangan
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-neutral-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Deposit button */}
                          <button
                            onClick={() => {
                              setDepositModalUser(u);
                              setDepositAmount('10000000');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] transition-all cursor-pointer"
                            title="Depozit kiritish (Balansni to‘ldirish)"
                          >
                            <Wallet className="w-3 h-3" />
                            <span>+ Depozit</span>
                          </button>

                          {/* Withdraw button */}
                          <button
                            onClick={() => {
                              setWithdrawModalUser(u);
                              setWithdrawAmount('5000000');
                              setWithdrawError('');
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-[11px] transition-all cursor-pointer"
                            title="Mablag‘ yechish"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Yechish</span>
                          </button>

                          {/* Switch active trader */}
                          {!isActiveTrader && (
                            <button
                              onClick={() => onSelectActiveUser(u.id)}
                              className="px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-medium text-[11px] transition-all cursor-pointer"
                              title="Terminalda ushbu foydalanuvchi hisobiga o‘tish"
                            >
                              Tanlash
                            </button>
                          )}

                          {/* Edit Password */}
                          <button
                            onClick={() => {
                              setEditPassUser(u);
                              setNewPassInput('');
                            }}
                            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
                            title="Parolni o‘zgartirish"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Block/Unblock */}
                          <button
                            onClick={() => onToggleStatus(u.id)}
                            className={`p-1.5 rounded-md transition-all cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400'
                                : 'hover:bg-emerald-500/20 text-rose-400 hover:text-emerald-400'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Foydalanuvchini bloklash' : 'Foydalanuvchini faollashtirish'}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Rostdan ham "${u.fullName}" (@${u.username}) hisobini o‘chirmoqchimisiz?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-all cursor-pointer"
                            title="Hisobni butunlay o‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* 4. TRANSACTIONS TAB */
        <div className={`flex-1 overflow-auto rounded-xl border ${themeClasses.cardBg} ${themeClasses.border}`}>
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className={`border-b ${themeClasses.headerBg} ${themeClasses.border} text-neutral-400`}>
                <th className="py-3 px-4 font-semibold">Vaqt</th>
                <th className="py-3 px-4 font-semibold">Foydalanuvchi</th>
                <th className="py-3 px-4 font-semibold">Amal Turi</th>
                <th className="py-3 px-4 font-semibold">Miqdor</th>
                <th className="py-3 px-4 font-semibold">Oldingi Balans</th>
                <th className="py-3 px-4 font-semibold">Yangi Balans</th>
                <th className="py-3 px-4 font-semibold">Izoh</th>
                <th className="py-3 px-4 font-semibold">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-neutral-500">
                    Depozit tranzaksiyalari tarixi hozircha mavjud emas.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">@{tx.username}</td>
                    <td className="py-3 px-4">
                      {tx.type === 'DEPOSIT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          <ArrowDownLeft className="w-3 h-3" />
                          + DEPOZIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          <ArrowUpRight className="w-3 h-3" />
                          - YECHISH
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3 px-4 font-bold text-sm tabular-nums ${
                        tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}
                      {formatUZS(tx.amountUZS)} UZS
                    </td>
                    <td className="py-3 px-4 text-neutral-400 tabular-nums">{formatUZS(tx.previousBalance)} UZS</td>
                    <td className="py-3 px-4 font-bold text-white tabular-nums">{formatUZS(tx.newBalance)} UZS</td>
                    <td className="py-3 px-4 text-neutral-300 text-[11px]">{tx.note}</td>
                    <td className="py-3 px-4 text-amber-400 text-[11px] font-semibold">{tx.admin}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. MODAL: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${themeClasses.cardBg} ${themeClasses.border}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Yangi Foydalanuvchi Qo‘shish</h3>
                  <p className="text-[11px] text-neutral-400">Login, parol va depozit hisobini yaratish</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">To‘liq Ism va Familiya *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Jamshid Karimov"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Login (Foydalanuvchi nomi) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
                  <input
                    type="text"
                    required
                    placeholder="masalan: jamshid_trader"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Parol (Maxfiy so‘z) *</label>
                <input
                  type="text"
                  required
                  placeholder="Foydalanuvchi paroli (masalan: Jamshid2026)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Boshlang‘ich Depozit Miqdori (UZS) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000000"
                  placeholder="50 000 000"
                  value={newInitialDeposit}
                  onChange={(e) => setNewInitialDeposit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs text-amber-400 font-bold ${themeClasses.inputBg} ${themeClasses.border}`}
                />
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {['10000000', '25000000', '50000000', '100000000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewInitialDeposit(amt)}
                      className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 hover:text-white"
                    >
                      {formatUZS(parseFloat(amt))} UZS
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Qo‘shimcha Izoh (Ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Eslatma yoki mijoz haqida qisqacha..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Hisobni Yaratish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: DEPOSIT TOP-UP */}
      {depositModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${themeClasses.cardBg} ${themeClasses.border}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Depozit Kiritish (Balans To‘ldirish)</h3>
                  <p className="text-[11px] text-neutral-400">
                    Foydalanuvchi: <span className="text-amber-400 font-bold">{depositModalUser.fullName}</span> (@{depositModalUser.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDepositModalUser(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Current Balance */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 mb-4 flex items-center justify-between font-mono text-xs">
              <span className="text-neutral-400">Joriy Balans:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatUZS(depositModalUser.balanceUZS)} UZS</span>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Kiritiladigan Depozit Miqdori (UZS) *</label>
                <input
                  type="number"
                  required
                  min="10000"
                  step="100000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-emerald-500 text-sm text-emerald-400 font-bold ${themeClasses.inputBg} ${themeClasses.border}`}
                />
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {['1000000', '5000000', '10000000', '25000000', '50000000', '100000000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 hover:text-white hover:border-emerald-500/40"
                    >
                      +{formatUZS(parseFloat(amt))}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">To‘lov Manbasi / Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Uzcard / Humo / Naqd to‘lov"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>

              {/* Preview New Balance */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-medium">Yangi kutilayotgan balans:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatUZS(depositModalUser.balanceUZS + (parseFloat(depositAmount) || 0))} UZS
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setDepositModalUser(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Depozitni Kiritish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: WITHDRAW */}
      {withdrawModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${themeClasses.cardBg} ${themeClasses.border}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Mablag‘ Yechish</h3>
                  <p className="text-[11px] text-neutral-400">
                    Foydalanuvchi: <span className="text-amber-400 font-bold">{withdrawModalUser.fullName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWithdrawModalUser(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {withdrawError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {withdrawError}
              </div>
            )}

            {/* Current Balance */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 mb-4 flex items-center justify-between font-mono text-xs">
              <span className="text-neutral-400">Mavjud Balans:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatUZS(withdrawModalUser.balanceUZS)} UZS</span>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Yechiladigan Summa (UZS) *</label>
                <input
                  type="number"
                  required
                  min="10000"
                  max={withdrawModalUser.balanceUZS}
                  step="100000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-rose-500 text-sm text-rose-400 font-bold ${themeClasses.inputBg} ${themeClasses.border}`}
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Yechish Sababi / Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Plastik kartaga o‘tkazma"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setWithdrawModalUser(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Yechishni Tasdiqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: EDIT PASSWORD */}
      {editPassUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${themeClasses.cardBg} ${themeClasses.border}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Parolni O‘zgartirish</h3>
                  <p className="text-[11px] text-neutral-400">@{editPassUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditPassUser(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Yangi Parol *</label>
                <input
                  type="text"
                  required
                  placeholder="Yangi parolni kiriting..."
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:border-amber-500 text-xs ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditPassUser(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Key className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
