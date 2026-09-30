'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MarketEngineConfig,
  LiveMarketMetrics,
  Candle,
  Position,
  ClosedTrade,
  UserAccount,
  AuditLogEntry,
  MarketEvent,
  Timeframe,
  AppTheme,
  RegisteredUser,
  UserDepositTransaction,
} from '@/lib/market-types';
import { OqOltinMarketEngine, DEFAULT_ENGINE_CONFIG } from '@/lib/market-engine';
import { TerminalHeader } from '@/components/terminal-header';
import { MarketHud } from '@/components/market-hud';
import { TradingChart } from '@/components/trading-chart';
import { OrderPanel } from '@/components/order-panel';
import { PositionsPanel } from '@/components/positions-panel';
import { AdminMarketControl } from '@/components/admin/admin-market-control';
import { UnifiedAuthModal } from '@/components/auth/unified-auth-modal';
import { MarketEventsTicker } from '@/components/market-events-ticker';
import { ShortcutsModal } from '@/components/shortcuts-modal';
import { THEME_CLASSES } from '@/lib/theme-config';

const TIMEFRAME_KEYS: Record<string, Timeframe> = {
  '1': '1S',
  '2': '5S',
  '3': '15S',
  '4': '30S',
  '5': '1M',
  '6': '5M',
  '7': '15M',
  '8': '1H',
  '9': '1D',
};

const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'user-demo-1',
    fullName: 'Demo Treydir',
    username: 'naigaks2021',
    password: 'User123',
    balanceUZS: 50000000,
    equityUZS: 50000000,
    totalDepositedUZS: 50000000,
    role: 'TRADER',
    status: 'ACTIVE',
    createdAt: Date.now() - 86400000 * 3,
    notes: 'Asosiy demo savdo hisobi',
  },
  {
    id: 'user-demo-2',
    fullName: 'Alisher Qosimov',
    username: 'alisher_trader',
    password: 'Alisher2026',
    balanceUZS: 100000000,
    equityUZS: 100000000,
    totalDepositedUZS: 100000000,
    role: 'TRADER',
    status: 'ACTIVE',
    createdAt: Date.now() - 86400000 * 5,
    notes: 'VIP Paxta eksportyor klienti',
  },
  {
    id: 'user-demo-3',
    fullName: 'Dilshod Ergashev',
    username: 'dilshod_pro',
    password: 'Dilshod77',
    balanceUZS: 25000000,
    equityUZS: 25000000,
    totalDepositedUZS: 25000000,
    role: 'TRADER',
    status: 'ACTIVE',
    createdAt: Date.now() - 86400000 * 1,
    notes: 'Buxoro klasteri savdo vakili',
  },
];

const DEFAULT_TRANSACTIONS: UserDepositTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-demo-1',
    username: 'naigaks2021',
    type: 'DEPOSIT',
    amountUZS: 50000000,
    previousBalance: 0,
    newBalance: 50000000,
    timestamp: Date.now() - 86400000 * 3,
    note: 'Boshlang‘ich depozit',
    admin: 'Admin',
  },
  {
    id: 'tx-2',
    userId: 'user-demo-2',
    username: 'alisher_trader',
    type: 'DEPOSIT',
    amountUZS: 100000000,
    previousBalance: 0,
    newBalance: 100000000,
    timestamp: Date.now() - 86400000 * 5,
    note: 'Bank o‘tkazmasi orqali to‘ldirish',
    admin: 'Admin',
  },
  {
    id: 'tx-3',
    userId: 'user-demo-3',
    username: 'dilshod_pro',
    type: 'DEPOSIT',
    amountUZS: 25000000,
    previousBalance: 0,
    newBalance: 25000000,
    timestamp: Date.now() - 86400000 * 1,
    note: 'Uzcard orqali to‘ldirish',
    admin: 'Admin',
  },
];

export default function OqOltinApp() {
  const [engine] = useState(() => new OqOltinMarketEngine(DEFAULT_ENGINE_CONFIG));

  // Application view state
  const [currentView, setCurrentView] = useState<'TERMINAL' | 'ADMIN'>('TERMINAL');
  const [theme, setTheme] = useState<AppTheme>('DARK');
  const [timeframe, setTimeframe] = useState<Timeframe>('5S');
  const [chartSpeed, setChartSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST' | 'ULTRA'>('NORMAL');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Unified Authentication State (Universal Login for both Trader and Admin)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('oq_oltin_auth_session') === 'true';
      } catch {}
    }
    return false;
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('oq_oltin_admin_session') === 'true';
      } catch {}
    }
    return false;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'TRADER' | 'ADMIN'>('TRADER');
  const [authAlertMessage, setAuthAlertMessage] = useState<string>('');

  const handleOpenAuthModal = useCallback((role: 'TRADER' | 'ADMIN' = 'TRADER', msg = '') => {
    setAuthModalRole(role);
    setAuthAlertMessage(msg);
    setIsAuthModalOpen(true);
  }, []);

  // Registered Users & Deposit Management State with LocalStorage Persistence
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oq_oltin_users');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_USERS;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oq_oltin_active_user');
        if (saved) return saved;
      } catch {}
    }
    return 'user-demo-1';
  });

  const [transactions, setTransactions] = useState<UserDepositTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oq_oltin_transactions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_TRANSACTIONS;
  });

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  // Reactive engine states
  const [config, setConfig] = useState<MarketEngineConfig>(() => engine.config);
  const [metrics, setMetrics] = useState<LiveMarketMetrics>(() => engine.metrics);
  const [candles, setCandles] = useState<Candle[]>(() => engine.getCandles('5S'));
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);

  // User Account & Trading State (synchronized with active trader's balance)
  const [account, setAccount] = useState<UserAccount>(() => ({
    balanceUZS: activeUser?.balanceUZS || 50000000,
    equityUZS: activeUser?.balanceUZS || 50000000,
    marginUsedUZS: 0,
    freeMarginUZS: activeUser?.balanceUZS || 50000000,
    marginLevelPct: 100,
  }));

  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => [
    {
      id: 'init-log',
      timestamp: 1774880000000,
      parameter: 'Engine Boot',
      oldValue: 'None',
      newValue: 'Initial OQ OLTIN simulation running',
      admin: 'SYSTEM',
      reason: 'Bozor dvigateli ishga tushirildi',
    },
  ]);

  // Sync candles for current timeframe
  const refreshCandles = useCallback(() => {
    setCandles([...engine.getCandles(timeframe)]);
  }, [engine, timeframe]);

  // Main Simulation Loop
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const runTick = () => {
      const eng = engine;

      // Tick execution (Section 19, 41)
      const tick = eng.stepTick();
      const currentPrice = tick.newPrice;
      const bid = tick.bid;
      const ask = tick.ask;

      setMetrics({ ...eng.metrics });

      // SL / TP Check & Floating P/L calculation for open positions
      setPositions((prevPositions) => {
        const remaining: Position[] = [];
        const newlyClosed: ClosedTrade[] = [];

        prevPositions.forEach((pos) => {
          const evalPrice = pos.type === 'BUY' ? bid : ask;
          const diff = pos.type === 'BUY' ? evalPrice - pos.openPrice : pos.openPrice - evalPrice;
          const pnl = diff * pos.volumeKg;
          const pnlPct = (diff / pos.openPrice) * 100;

          // Check Take Profit hit
          if (pos.takeProfit) {
            const tpHit = pos.type === 'BUY' ? evalPrice >= pos.takeProfit : evalPrice <= pos.takeProfit;
            if (tpHit) {
              newlyClosed.push({
                id: 'close-' + pos.id,
                symbol: pos.symbol,
                type: pos.type,
                openPrice: pos.openPrice,
                closePrice: evalPrice,
                volumeKg: pos.volumeKg,
                openedAt: pos.openedAt,
                closedAt: Date.now(),
                realizedPnL: pnl,
                realizedPnLPct: pnlPct,
                reason: 'TAKE_PROFIT',
              });
              return;
            }
          }

          // Check Stop Loss hit
          if (pos.stopLoss) {
            const slHit = pos.type === 'BUY' ? evalPrice <= pos.stopLoss : evalPrice >= pos.stopLoss;
            if (slHit) {
              newlyClosed.push({
                id: 'close-' + pos.id,
                symbol: pos.symbol,
                type: pos.type,
                openPrice: pos.openPrice,
                closePrice: evalPrice,
                volumeKg: pos.volumeKg,
                openedAt: pos.openedAt,
                closedAt: Date.now(),
                realizedPnL: pnl,
                realizedPnLPct: pnlPct,
                reason: 'STOP_LOSS',
              });
              return;
            }
          }

          // Position stays open, update floating pnl
          remaining.push({
            ...pos,
            currentPrice: evalPrice,
            unrealizedPnL: pnl,
            unrealizedPnLPct: pnlPct,
          });
        });

        // Handle newly closed trades
        if (newlyClosed.length > 0) {
          setClosedTrades((hist) => [...newlyClosed, ...hist].slice(0, 100));
          const realizedNet = newlyClosed.reduce((acc, t) => acc + t.realizedPnL, 0);
          setAccount((acc) => {
            const newBal = acc.balanceUZS + realizedNet;
            return {
              ...acc,
              balanceUZS: newBal,
            };
          });
        }

        return remaining;
      });

      // Update Equity & Free margin
      setAccount((acc) => {
        const totalFloating = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
        const marginUsed = positions.reduce((sum, p) => sum + p.marginUsed, 0);
        const equity = acc.balanceUZS + totalFloating;
        const freeMargin = Math.max(0, equity - marginUsed);
        const marginLevel = marginUsed > 0 ? (equity / marginUsed) * 100 : 100;

        return {
          ...acc,
          equityUZS: equity,
          marginUsedUZS: marginUsed,
          freeMarginUZS: freeMargin,
          marginLevelPct: marginLevel,
        };
      });

      // Refresh chart candles
      refreshCandles();

      // Schedule next tick based on speed & chart speed
      const baseDelay = Math.max(50, 600 - eng.metrics.currentSpeed * 5);
      const speedMultiplier =
        chartSpeed === 'SLOW' ? 1.5 : chartSpeed === 'NORMAL' ? 1.0 : chartSpeed === 'FAST' ? 0.6 : 0.3;

      const delay = Math.round(baseDelay * speedMultiplier);
      timerId = setTimeout(runTick, delay);
    };

    timerId = setTimeout(runTick, 250);

    return () => clearTimeout(timerId);
  }, [chartSpeed, positions, refreshCandles, engine]);

  // Timeframe change handler
  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    setCandles([...engine.getCandles(tf)]);
  };

  // Handle Opening Position (Section 30 & 31)
  const handleOpenPosition = useCallback(
    (order: {
      type: 'BUY' | 'SELL';
      volumeKg: number;
      stopLoss?: number;
      takeProfit?: number;
      price: number;
    }) => {
      // Strictly block opening trade if login & password are not entered!
      if (!isAuthenticated && !isAdminAuthenticated) {
        handleOpenAuthModal('TRADER', 'Savdo ochish uchun avval tizimga kiring!');
        return;
      }

      const marginReq = Math.round(order.price * order.volumeKg * 0.05);

      if (account.freeMarginUZS < marginReq) {
        alert("Mablag' yetarli emas! Erkin marjangiz ushbu hajmga yetmaydi.");
        return;
      }

      const newPos: Position = {
        id: 'pos-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        symbol: 'OQ OLTIN / UZS',
        type: order.type,
        openPrice: order.price,
        currentPrice: order.price,
        volumeKg: order.volumeKg,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        openedAt: Date.now(),
        unrealizedPnL: -(metrics.currentSpread * order.volumeKg), // initial spread deduction
        unrealizedPnLPct: -((metrics.currentSpread / order.price) * 100),
        marginUsed: marginReq,
      };

      setPositions((prev) => [newPos, ...prev]);
    },
    [isAuthenticated, isAdminAuthenticated, account.freeMarginUZS, metrics.currentSpread, handleOpenAuthModal]
  );

  // Close single position
  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const closed: ClosedTrade = {
      id: 'close-' + pos.id,
      symbol: pos.symbol,
      type: pos.type,
      openPrice: pos.openPrice,
      closePrice: pos.currentPrice,
      volumeKg: pos.volumeKg,
      openedAt: pos.openedAt,
      closedAt: Date.now(),
      realizedPnL: pos.unrealizedPnL,
      realizedPnLPct: pos.unrealizedPnLPct,
      reason: 'MANUAL',
    };

    setPositions((prev) => prev.filter((p) => p.id !== id));
    setClosedTrades((hist) => [closed, ...hist]);
    setAccount((acc) => ({
      ...acc,
      balanceUZS: acc.balanceUZS + pos.unrealizedPnL,
    }));
  };

  // Close all positions
  const handleCloseAllPositions = () => {
    positions.forEach((pos) => handleClosePosition(pos.id));
  };

  // Modify SL / TP inline
  const handleUpdateSLTP = (id: string, sl?: number, tp?: number) => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.id === id) {
          return {
            ...pos,
            stopLoss: sl,
            takeProfit: tp,
          };
        }
        return pos;
      })
    );
  };

  // Update Config by Admin (Section 38 & 39)
  const handleUpdateConfig = (newConfig: Partial<MarketEngineConfig>, reason = 'Admin parameter change') => {
    const oldConfig = { ...engine.config };
    engine.updateConfig(newConfig);

    // Record audit entries
    const newLogs: AuditLogEntry[] = [];
    Object.keys(newConfig).forEach((k) => {
      const key = k as keyof MarketEngineConfig;
      newLogs.push({
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        timestamp: Date.now(),
        parameter: key,
        oldValue: JSON.stringify(oldConfig[key]),
        newValue: JSON.stringify(newConfig[key]),
        admin: 'ADMINISTRATOR',
        reason,
      });
    });

    setAuditLogs((prev) => [...newLogs, ...prev].slice(0, 100));
    setConfig({ ...engine.config });
    setMetrics({ ...engine.metrics });
  };

  // Trigger Market Event (Section 35)
  const handleTriggerEvent = (event: {
    title: string;
    description: string;
    impact: 'BULLISH' | 'BEARISH' | 'VOLATILITY';
    intensity: number;
    durationSec: number;
  }) => {
    const created = engine.triggerEvent(event);
    setMarketEvents((prev) => [...prev, created]);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        timestamp: Date.now(),
        parameter: 'MARKET_EVENT',
        oldValue: 'None',
        newValue: `${event.title} (${event.impact})`,
        admin: 'ADMINISTRATOR',
        reason: 'Manual market news event trigger',
      },
      ...prev,
    ]);
  };

  // Reset Simulation (Section 40)
  const handleResetSimulation = () => {
    engine.updateConfig(DEFAULT_ENGINE_CONFIG);
    setConfig({ ...engine.config });
    setMetrics({ ...engine.metrics });
    setPositions([]);
    setClosedTrades([]);
    setAccount({
      balanceUZS: 50000000,
      equityUZS: 50000000,
      marginUsedUZS: 0,
      freeMarginUZS: 50000000,
      marginLevelPct: 100,
    });
    setAuditLogs((prev) => [
      {
        id: 'reset-' + Date.now(),
        timestamp: Date.now(),
        parameter: 'SIMULATION_RESET',
        oldValue: 'Active',
        newValue: 'Clean Initial State',
        admin: 'ADMINISTRATOR',
        reason: 'Simulation reset to default initial state',
      },
      ...prev,
    ]);
    refreshCandles();
  };

  // User Management Operations (Foydalanuvchilar va Depozit Boshqaruvi)
  const handleAddUser = (newUserData: Omit<RegisteredUser, 'id' | 'createdAt' | 'equityUZS' | 'totalDepositedUZS'>) => {
    const id = 'user-' + Date.now();
    const newUser: RegisteredUser = {
      ...newUserData,
      id,
      equityUZS: newUserData.balanceUZS,
      totalDepositedUZS: newUserData.balanceUZS,
      createdAt: Date.now(),
    };

    setUsers((prev) => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('oq_oltin_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (newUser.balanceUZS > 0) {
      const tx: UserDepositTransaction = {
        id: 'tx-' + Date.now(),
        userId: id,
        username: newUser.username,
        type: 'DEPOSIT',
        amountUZS: newUser.balanceUZS,
        previousBalance: 0,
        newBalance: newUser.balanceUZS,
        timestamp: Date.now(),
        note: 'Boshlang‘ich depozit',
        admin: 'Admin',
      };
      setTransactions((prev) => {
        const updated = [tx, ...prev];
        try {
          localStorage.setItem('oq_oltin_transactions', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleDeposit = (userId: string, amount: number, note: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const newBal = u.balanceUZS + amount;
          return {
            ...u,
            balanceUZS: newBal,
            equityUZS: (u.equityUZS || u.balanceUZS) + amount,
            totalDepositedUZS: (u.totalDepositedUZS || u.balanceUZS) + amount,
          };
        }
        return u;
      });
      try {
        localStorage.setItem('oq_oltin_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const tx: UserDepositTransaction = {
      id: 'tx-' + Date.now(),
      userId,
      username: targetUser.username,
      type: 'DEPOSIT',
      amountUZS: amount,
      previousBalance: targetUser.balanceUZS,
      newBalance: targetUser.balanceUZS + amount,
      timestamp: Date.now(),
      note: note || 'Depozit to‘ldirildi',
      admin: 'Admin',
    };
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      try {
        localStorage.setItem('oq_oltin_transactions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // If currently active trader, update terminal account balance in real-time
    if (userId === activeUserId) {
      setAccount((prev) => ({
        ...prev,
        balanceUZS: prev.balanceUZS + amount,
        equityUZS: prev.equityUZS + amount,
        freeMarginUZS: prev.freeMarginUZS + amount,
      }));
    }
  };

  const handleWithdraw = (userId: string, amount: number, note: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const newBal = Math.max(0, u.balanceUZS - amount);
          return {
            ...u,
            balanceUZS: newBal,
            equityUZS: Math.max(0, (u.equityUZS || u.balanceUZS) - amount),
          };
        }
        return u;
      });
      try {
        localStorage.setItem('oq_oltin_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const tx: UserDepositTransaction = {
      id: 'tx-' + Date.now(),
      userId,
      username: targetUser.username,
      type: 'WITHDRAW',
      amountUZS: amount,
      previousBalance: targetUser.balanceUZS,
      newBalance: Math.max(0, targetUser.balanceUZS - amount),
      timestamp: Date.now(),
      note: note || 'Mablag‘ yechildi',
      admin: 'Admin',
    };
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      try {
        localStorage.setItem('oq_oltin_transactions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (userId === activeUserId) {
      setAccount((prev) => ({
        ...prev,
        balanceUZS: Math.max(0, prev.balanceUZS - amount),
        equityUZS: Math.max(0, prev.equityUZS - amount),
        freeMarginUZS: Math.max(0, prev.freeMarginUZS - amount),
      }));
    }
  };

  const handleUpdatePassword = (userId: string, newPass: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u));
      try {
        localStorage.setItem('oq_oltin_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? ('BLOCKED' as const) : ('ACTIVE' as const) } : u
      );
      try {
        localStorage.setItem('oq_oltin_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectActiveUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setActiveUserId(userId);
    try {
      localStorage.setItem('oq_oltin_active_user', userId);
    } catch {}

    setAccount({
      balanceUZS: target.balanceUZS,
      equityUZS: target.balanceUZS,
      marginUsedUZS: 0,
      freeMarginUZS: target.balanceUZS,
      marginLevelPct: 100,
    });
    setPositions([]);
    setCurrentView('TERMINAL');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('oq_oltin_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (activeUserId === userId && users.length > 1) {
      const nextUser = users.find((u) => u.id !== userId);
      if (nextUser) handleSelectActiveUser(nextUser.id);
    }
  };

  // Unified Authentication Handlers (Treydir va Admin uchun yagona tizim)

  const handleViewChange = (targetView: 'TERMINAL' | 'ADMIN') => {
    if (targetView === 'ADMIN') {
      if (isAdminAuthenticated) {
        setCurrentView('ADMIN');
      } else {
        handleOpenAuthModal('ADMIN');
      }
    } else {
      setCurrentView('TERMINAL');
    }
  };

  const handleTraderLogin = (userId: string) => {
    handleSelectActiveUser(userId);
    setIsAuthenticated(true);
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.setItem('oq_oltin_auth_session', 'true');
      sessionStorage.removeItem('oq_oltin_admin_session');
    } catch {}
    setAuthAlertMessage('');
    setIsAuthModalOpen(false);
    setCurrentView('TERMINAL');
  };

  const handleAdminLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('oq_oltin_auth_session', 'true');
      sessionStorage.setItem('oq_oltin_admin_session', 'true');
    } catch {}
    setAuthAlertMessage('');
    setIsAuthModalOpen(false);
    setCurrentView('ADMIN');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('oq_oltin_auth_session');
      sessionStorage.removeItem('oq_oltin_admin_session');
    } catch {}
    setAuthAlertMessage('');
    setIsAuthModalOpen(false);
    setCurrentView('TERMINAL');
  };

  // Keyboard Hotkeys (Section 34)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleOpenPosition({
          type: 'BUY',
          volumeKg: 100,
          price: metrics.askPrice,
        });
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleOpenPosition({
          type: 'SELL',
          volumeKg: 100,
          price: metrics.bidPrice,
        });
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleUpdateConfig(
          { isPaused: !config.isPaused },
          config.isPaused ? 'Resume via Hotkey' : 'Pause via Hotkey'
        );
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCloseAllPositions();
      } else if (TIMEFRAME_KEYS[e.key]) {
        e.preventDefault();
        handleTimeframeChange(TIMEFRAME_KEYS[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const themeContainerClass =
    theme === 'LIGHT'
      ? 'bg-slate-100 text-slate-900'
      : theme === 'OLED'
      ? 'bg-black text-neutral-100'
      : theme === 'GOLD'
      ? 'bg-[#12100E] text-amber-50'
      : 'bg-[#0B0E14] text-neutral-100';

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  return (
    <div
      data-theme={theme}
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans antialiased transition-colors duration-200 ${themeContainerClass}`}
    >
      {/* Top Bar Header Contract */}
      <TerminalHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        account={account}
        activeUser={activeUser}
        isAuthenticated={isAuthenticated}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={handleLogout}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isPaused={config.isPaused}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Discrete Event Ticker */}
      <MarketEventsTicker events={marketEvents} theme={theme} />

      {/* Market HUD */}
      <MarketHud metrics={metrics} isPaused={config.isPaused} theme={theme} />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentView === 'TERMINAL' ? (
          <div className="flex flex-col lg:flex-row flex-1 h-full w-full overflow-hidden">
            {/* Left Area: Interactive Candlestick Chart & Positions */}
            <div className={`flex-1 flex flex-col h-full min-w-0 border-r ${themeClasses.border}`}>
              {/* Candlestick Chart Viewport */}
              <div className="flex-[3] min-h-[320px] relative">
                <TradingChart
                  candles={candles}
                  timeframe={timeframe}
                  onTimeframeChange={handleTimeframeChange}
                  currentPrice={metrics.currentPrice}
                  bidPrice={metrics.bidPrice}
                  askPrice={metrics.askPrice}
                  positions={positions}
                  marketEvents={marketEvents}
                  chartSpeed={chartSpeed}
                  onChartSpeedChange={setChartSpeed}
                  isPaused={config.isPaused}
                  theme={theme}
                  onQuickTrade={(type, volumeKg) =>
                    handleOpenPosition({
                      type,
                      volumeKg,
                      price: type === 'BUY' ? metrics.askPrice : metrics.bidPrice,
                    })
                  }
                  onClosePosition={handleClosePosition}
                  onCloseAllPositions={handleCloseAllPositions}
                />
              </div>

              {/* Bottom Area: Positions & Trade History */}
              <div className={`flex-[2] min-h-[180px] border-t ${themeClasses.border}`}>
                <PositionsPanel
                  positions={positions}
                  closedTrades={closedTrades}
                  account={account}
                  theme={theme}
                  onClosePosition={handleClosePosition}
                  onCloseAllPositions={handleCloseAllPositions}
                  onUpdateSLTP={handleUpdateSLTP}
                />
              </div>
            </div>

            {/* Right Area: Order Entry Panel */}
            <div className={`w-full lg:w-80 shrink-0 h-full border-t lg:border-t-0 ${themeClasses.border}`}>
              <OrderPanel
                metrics={metrics}
                balanceUZS={account.balanceUZS}
                theme={theme}
                isAuthenticated={isAuthenticated}
                onOpenAuthModal={(role) => handleOpenAuthModal(role || 'TRADER')}
                onOpenPosition={handleOpenPosition}
              />
            </div>
          </div>
        ) : (
          /* Admin Market Control Center with User Management & Deposit Controls */
          <div className="flex-1 h-full w-full overflow-hidden">
            <AdminMarketControl
              config={config}
              metrics={metrics}
              auditLogs={auditLogs}
              theme={theme}
              users={users}
              activeUserId={activeUserId}
              transactions={transactions}
              onAddUser={handleAddUser}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onUpdatePassword={handleUpdatePassword}
              onToggleStatus={handleToggleStatus}
              onSelectActiveUser={handleSelectActiveUser}
              onDeleteUser={handleDeleteUser}
              onAdminLogout={handleLogout}
              onUpdateConfig={handleUpdateConfig}
              onTriggerEvent={handleTriggerEvent}
              onResetSimulation={handleResetSimulation}
            />
          </div>
        )}
      </main>

      {/* Unified Professional Auth Modal (Treydir va Admin uchun bitta xavfsiz portal) */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        theme={theme}
        users={users}
        activeUser={activeUser}
        isAuthenticated={isAuthenticated}
        isAdminAuthenticated={isAdminAuthenticated}
        onTraderLogin={handleTraderLogin}
        onAdminLogin={handleAdminLoginSuccess}
        onLogout={handleLogout}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
        alertMessage={authAlertMessage}
      />

      {/* Hotkeys Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} theme={theme} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
