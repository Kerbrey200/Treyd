'use client';

import React, { useState } from 'react';
import { Position, ClosedTrade, UserAccount, AppTheme } from '@/lib/market-types';
import { formatUZS } from '@/lib/utils';
import { THEME_CLASSES } from '@/lib/theme-config';
import { X, TrendingUp, TrendingDown, Clock, ShieldCheck, Edit2, Check, Flame } from 'lucide-react';

interface PositionsPanelProps {
  positions: Position[];
  closedTrades: ClosedTrade[];
  account: UserAccount;
  theme?: AppTheme;
  onClosePosition: (id: string) => void;
  onCloseAllPositions: () => void;
  onUpdateSLTP: (id: string, sl?: number, tp?: number) => void;
}

export const PositionsPanel: React.FC<PositionsPanelProps> = ({
  positions,
  closedTrades,
  account,
  theme = 'DARK',
  onClosePosition,
  onCloseAllPositions,
  onUpdateSLTP,
}) => {
  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'HISTORY'>('POSITIONS');
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editSL, setEditSL] = useState<number | ''>('');
  const [editTP, setEditTP] = useState<number | ''>('');

  const themeClasses = THEME_CLASSES[theme] || THEME_CLASSES.DARK;

  const totalFloatingPnL = positions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
  const profitPositionsCount = positions.filter((p) => p.unrealizedPnL > 0).length;
  const lossPositionsCount = positions.filter((p) => p.unrealizedPnL < 0).length;

  const startEdit = (pos: Position) => {
    setEditingPosId(pos.id);
    setEditSL(pos.stopLoss ?? '');
    setEditTP(pos.takeProfit ?? '');
  };

  const saveEdit = (posId: string) => {
    const sl = editSL === '' ? undefined : Number(editSL);
    const tp = editTP === '' ? undefined : Number(editTP);
    onUpdateSLTP(posId, sl, tp);
    setEditingPosId(null);
  };

  const handleCloseProfitableOnly = () => {
    positions
      .filter((p) => p.unrealizedPnL > 0)
      .forEach((p) => onClosePosition(p.id));
  };

  return (
    <div className={`flex flex-col h-full text-xs select-none transition-colors duration-200 ${themeClasses.surfaceBg} ${themeClasses.textMain}`}>
      {/* Tab Navigation Header with Prominent Close All Button */}
      <div className={`flex flex-wrap items-center justify-between px-3 py-2 border-b ${themeClasses.border}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded text-xs transition-colors ${
              activeTab === 'POSITIONS'
                ? `${themeClasses.cardSubtleBg} ${themeClasses.textMain}`
                : `${themeClasses.textMuted} hover:${themeClasses.textMain}`
            }`}
          >
            <span>Ochiq Pozitsiyalar</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                positions.length > 0 ? 'bg-amber-500/20 text-amber-500 font-bold' : `${themeClasses.cardBg} ${themeClasses.textSubtle}`
              }`}
            >
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-1 px-3 py-1 font-semibold rounded text-xs transition-colors ${
              activeTab === 'HISTORY'
                ? `${themeClasses.cardSubtleBg} ${themeClasses.textMain}`
                : `${themeClasses.textMuted} hover:${themeClasses.textMain}`
            }`}
          >
            <span>Tarix</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${themeClasses.cardBg} ${themeClasses.textSubtle}`}>
              {closedTrades.length}
            </span>
          </button>
        </div>

        {/* Quick Close Bulk Actions & P/L Indicator */}
        <div className="flex items-center gap-2">
          {positions.length > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Total floating P/L pill */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-xs font-bold ${
                  totalFloatingPnL >= 0
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                }`}
              >
                <span>P/L:</span>
                <span className="tabular-nums">
                  {totalFloatingPnL >= 0 ? '+' : ''}
                  {formatUZS(totalFloatingPnL)} UZS
                </span>
              </div>

              {/* Close Profitable Button */}
              {profitPositionsCount > 0 && (
                <button
                  onClick={handleCloseProfitableOnly}
                  title="Faqat foydadagi pozitsiyalarni yopish"
                  className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30 transition-colors"
                >
                  ✓ Foydani Yopish ({profitPositionsCount})
                </button>
              )}

              {/* Close All Button */}
              <button
                onClick={onCloseAllPositions}
                title="Barcha ochiq pozitsiyalarni bir vaqtda yopish"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold shadow-sm transition-colors active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>Barchasini Yopish</span>
              </button>
            </div>
          )}

          {/* Account metrics readout */}
          <div className={`hidden lg:flex items-center gap-3 font-mono text-[11px] pl-2 border-l ${themeClasses.border} ${themeClasses.textMuted}`}>
            <div>
              Balans: <strong className={`tabular-nums ${themeClasses.textMain}`}>{formatUZS(account.balanceUZS)} UZS</strong>
            </div>
            <span className="opacity-40">·</span>
            <div>
              Ekviti: <strong className={`tabular-nums ${themeClasses.textMain}`}>{formatUZS(account.equityUZS)} UZS</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'POSITIONS' ? (
          positions.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-28 ${themeClasses.textSubtle}`}>
              <ShieldCheck className="w-6 h-6 mb-1 opacity-40" />
              <span className="text-xs">Hozirda hech qanday ochiq savdo pozitsiyasi yo‘q</span>
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[10px] ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.textSubtle}`}>
                  <th className="py-1.5 px-3">TURI</th>
                  <th className="py-1.5 px-3">HAJM</th>
                  <th className="py-1.5 px-3">KIRISH NARXI</th>
                  <th className="py-1.5 px-3">JORIY NARX</th>
                  <th className="py-1.5 px-3">SL / TP</th>
                  <th className="py-1.5 px-3">P/L (FOYDA/ZARAR)</th>
                  <th className="py-1.5 px-3 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClasses.border}`}>
                {positions.map((pos) => {
                  const isProfit = pos.unrealizedPnL >= 0;
                  const isEditing = editingPosId === pos.id;

                  return (
                    <tr
                      key={pos.id}
                      className={`transition-colors ${themeClasses.tableHover}`}
                    >
                      <td className="py-2 px-3">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            pos.type === 'BUY' ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {pos.type === 'BUY' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {pos.type}
                        </span>
                      </td>
                      <td className={`py-2 px-3 font-semibold tabular-nums ${themeClasses.textMain}`}>
                        {pos.volumeKg} kg
                      </td>
                      <td className={`py-2 px-3 tabular-nums ${themeClasses.textMuted}`}>
                        {formatUZS(pos.openPrice)} UZS
                      </td>
                      <td className={`py-2 px-3 tabular-nums font-semibold ${themeClasses.textMain}`}>
                        {formatUZS(pos.currentPrice)} UZS
                      </td>
                      <td className="py-2 px-3 tabular-nums text-[10px]">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editSL}
                              onChange={(e) => setEditSL(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="SL"
                              className={`w-16 border px-1 py-0.5 rounded text-[10px] ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                            />
                            <input
                              type="number"
                              value={editTP}
                              onChange={(e) => setEditTP(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="TP"
                              className={`w-16 border px-1 py-0.5 rounded text-[10px] ${themeClasses.inputBg} ${themeClasses.border} ${themeClasses.textMain}`}
                            />
                            <button
                              onClick={() => saveEdit(pos.id)}
                              className="px-1.5 py-0.5 bg-amber-500 text-black font-bold rounded text-[9px]"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={pos.stopLoss ? 'text-rose-500' : themeClasses.textSubtle}>
                              {pos.stopLoss ? `SL: ${formatUZS(pos.stopLoss)}` : 'SL: —'}
                            </span>
                            <span className="opacity-40">/</span>
                            <span className={pos.takeProfit ? 'text-emerald-500' : themeClasses.textSubtle}>
                              {pos.takeProfit ? `TP: ${formatUZS(pos.takeProfit)}` : 'TP: —'}
                            </span>
                            <button
                              onClick={() => startEdit(pos)}
                              title="SL/TP sozlash"
                              className={`${themeClasses.textSubtle} hover:${themeClasses.textMain}`}
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 tabular-nums font-bold text-xs">
                        <span className={isProfit ? 'text-emerald-500' : 'text-rose-500'}>
                          {isProfit ? '+' : ''}
                          {formatUZS(pos.unrealizedPnL)} UZS
                          <span className="text-[10px] ml-1 opacity-80">
                            ({pos.unrealizedPnLPct >= 0 ? '+' : ''}
                            {pos.unrealizedPnLPct.toFixed(2)}%)
                          </span>
                        </span>
                      </td>

                      {/* FAST CLOSE BUTTON */}
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => onClosePosition(pos.id)}
                          title="Pozitsiyani darhol yopish"
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded font-mono text-xs font-bold transition-all shadow-xs active:scale-95 text-white ${
                            isProfit
                              ? 'bg-emerald-600 hover:bg-emerald-500'
                              : 'bg-rose-600 hover:bg-rose-500'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Yopish</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : closedTrades.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-28 ${themeClasses.textSubtle}`}>
            <Clock className="w-6 h-6 mb-1 opacity-40" />
            <span className="text-xs">Yopilgan savdolar tarixi bo‘sh</span>
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.textSubtle}`}>
                <th className="py-1.5 px-3">VAQT</th>
                <th className="py-1.5 px-3">TURI</th>
                <th className="py-1.5 px-3">HAJM</th>
                <th className="py-1.5 px-3">OCHILISH</th>
                <th className="py-1.5 px-3">YOPILISH</th>
                <th className="py-1.5 px-3">SABAB</th>
                <th className="py-1.5 px-3 text-right">YAKUNIY P/L</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.border}`}>
              {closedTrades.map((trade) => {
                const isProfit = trade.realizedPnL >= 0;
                const d = new Date(trade.closedAt);
                const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(
                  d.getMinutes()
                ).padStart(2, '0')}:${String(
                  d.getSeconds()
                ).padStart(2, '0')}`;

                return (
                  <tr key={trade.id} className={`transition-colors ${themeClasses.tableHover}`}>
                    <td className={`py-2 px-3 ${themeClasses.textMuted}`}>{timeStr}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`font-bold ${
                          trade.type === 'BUY' ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 tabular-nums">{trade.volumeKg} kg</td>
                    <td className="py-2 px-3 tabular-nums">{formatUZS(trade.openPrice)} UZS</td>
                    <td className={`py-2 px-3 tabular-nums ${themeClasses.textMain}`}>
                      {formatUZS(trade.closePrice)} UZS
                    </td>
                    <td className={`py-2 px-3 text-[10px] ${themeClasses.textMuted}`}>
                      {trade.reason === 'TAKE_PROFIT'
                        ? '🎯 TP'
                        : trade.reason === 'STOP_LOSS'
                        ? '🛑 SL'
                        : 'Qo‘lda'}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold tabular-nums">
                      <span className={isProfit ? 'text-emerald-500' : 'text-rose-500'}>
                        {isProfit ? '+' : ''}
                        {formatUZS(trade.realizedPnL)} UZS
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
