import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Copy, Check, Filter } from 'lucide-react';
import { MonthlySummary, CurrencyConfig } from '../types';
import { formatCurrencyValue } from '../utils/generator';

interface MonthlySummaryCardsProps {
  monthlySummaries: MonthlySummary[];
  currency: CurrencyConfig;
  onSelectMonth?: (month: string) => void;
  activeSelectedMonth?: string;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  monthlySummaries,
  currency,
  onSelectMonth,
  activeSelectedMonth
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(monthlySummaries, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (monthlySummaries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center text-xs text-slate-500 dark:text-slate-400">
        No monthly data available for the current selection.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs transition-colors">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Monthly Summary Statistics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated monthly income, expenses, and net profit in {currency.code}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyJson}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied Summary JSON</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Monthly JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthlySummaries.map(s => {
          const isNetPositive = s.netProfit >= 0;
          const isSelected = activeSelectedMonth === s.month;
          const totalVol = s.totalIncome + s.totalExpenses;
          const incomePct = totalVol > 0 ? (s.totalIncome / totalVol) * 100 : 50;

          return (
            <div
              key={s.month}
              className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-slate-900 dark:border-emerald-500 bg-slate-50/80 dark:bg-slate-800 shadow-xs ring-1 ring-slate-900 dark:ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {/* Top Month Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {s.monthName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    ({s.month})
                  </span>
                </div>
                {onSelectMonth && (
                  <button
                    onClick={() => onSelectMonth(isSelected ? 'all' : s.month)}
                    title={isSelected ? 'Clear month filter' : 'Filter dataset to this month'}
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    <span>{isSelected ? 'Filtered' : 'Filter'}</span>
                  </button>
                )}
              </div>

              {/* Net Profit Display */}
              <div className="mb-3 pb-3 border-b border-slate-200/70 dark:border-slate-700/70">
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Net Profit (Income - Expenses)</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{s.profitMargin.toFixed(1)}% margin</span>
                </div>
                <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                  isNetPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                }`}>
                  {formatCurrencyValue(s.netProfit, currency, true)}
                </div>
              </div>

              {/* Income & Expense Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Total Income</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyValue(s.totalIncome, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Total Expenses</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyValue(s.totalExpenses, currency)}
                  </span>
                </div>
              </div>

              {/* Volume Ratio Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="w-full bg-rose-200 dark:bg-rose-950/70 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${incomePct}%` }}
                    title={`Income: ${incomePct.toFixed(0)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1">
                  <span>{s.incomeCount} inflows</span>
                  <span>{s.transactionCount} total</span>
                  <span>{s.expenseCount} outflows</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
