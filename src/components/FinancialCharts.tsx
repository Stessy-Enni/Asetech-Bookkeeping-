import React, { useMemo, useState } from 'react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrencyValue } from '../utils/generator';

interface FinancialChartsProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ transactions, currency }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    desc: string;
    type: 'income' | 'expense';
    amount: number;
    balance: number;
  } | null>(null);

  // Sort chronologically for timeline
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // Calculate cumulative balances and timeline points
  const timelineData = useMemo(() => {
    let runningBalance = 0;
    return sortedTransactions.map(t => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return {
        ...t,
        runningBalance
      };
    });
  }, [sortedTransactions]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { category: string; type: 'income' | 'expense'; amount: number; count: number }>();
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;

      const existing = map.get(t.category);
      if (existing) {
        existing.amount += t.amount;
        existing.count += 1;
      } else {
        map.set(t.category, {
          category: t.category,
          type: t.type,
          amount: t.amount,
          count: 1
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .map(item => ({
        ...item,
        percent: item.type === 'income' 
          ? (item.amount / (totalIncome || 1)) * 100 
          : (item.amount / (totalExpense || 1)) * 100
      }));
  }, [transactions]);

  // SVG dimensions for Timeline Chart
  const svgWidth = 640;
  const svgHeight = 180;
  const paddingX = 35;
  const paddingY = 25;

  const minBalance = Math.min(0, ...timelineData.map(d => d.runningBalance));
  const maxBalance = Math.max(1000, ...timelineData.map(d => d.runningBalance));
  const balanceRange = (maxBalance - minBalance) || 1;

  const getX = (index: number) => {
    if (timelineData.length <= 1) return svgWidth / 2;
    return paddingX + (index / (timelineData.length - 1)) * (svgWidth - 2 * paddingX);
  };

  const getY = (balance: number) => {
    return svgHeight - paddingY - ((balance - minBalance) / balanceRange) * (svgHeight - 2 * paddingY);
  };

  // Generate SVG path for cumulative balance
  const balancePath = useMemo(() => {
    if (timelineData.length === 0) return '';
    return timelineData.reduce((path, d, i) => {
      const x = getX(i);
      const y = getY(d.runningBalance);
      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  }, [timelineData, minBalance, maxBalance]);

  // Zero-line Y
  const zeroY = getY(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cash Flow Timeline Chart */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cumulative Cash Flow Trajectory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Net balance movement across the {transactions.length} sequential transactions ({currency.code})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-900 dark:bg-slate-100 inline-block"></span>
              <span>Net Balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block"></span>
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block"></span>
              <span>Expense</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full aspect-[640/220] min-h-[200px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Zero balance grid line */}
            <line
              x1={paddingX}
              y1={zeroY}
              x2={svgWidth - paddingX}
              y2={zeroY}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            {/* Upper line */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={svgWidth - paddingX}
              y2={paddingY}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="1"
            />
            {/* Lower line */}
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="1"
            />

            {/* Income & Expense transaction stems */}
            {timelineData.map((d, i) => {
              const x = getX(i);
              const y = getY(d.runningBalance);
              const isIncome = d.type === 'income';

              return (
                <g key={d.id || i}>
                  <line
                    x1={x}
                    y1={zeroY}
                    x2={x}
                    y2={y}
                    stroke={isIncome ? '#10b981' : '#f43f5e'}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={isIncome ? '#10b981' : '#f43f5e'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-transform hover:scale-125"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        date: d.date,
                        desc: d.description,
                        type: d.type,
                        amount: d.amount,
                        balance: d.runningBalance
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* Continuous Net Balance Line */}
            {balancePath && (
              <path
                d={balancePath}
                fill="none"
                stroke="currentColor"
                className="text-slate-900 dark:text-slate-100"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none max-w-xs border border-slate-700">
              <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
                <span>{hoveredPoint.date}</span>
                <span className={hoveredPoint.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                  {hoveredPoint.type.toUpperCase()}
                </span>
              </div>
              <div className="font-medium text-slate-100 truncate mt-0.5">
                {hoveredPoint.desc}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs pt-1 border-t border-slate-800 dark:border-slate-700">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrencyValue(hoveredPoint.amount, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Balance:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-200">
                  {formatCurrencyValue(hoveredPoint.balance, currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>{sortedTransactions[0]?.date || 'Start'}</span>
          <span>Timeline Span: {sortedTransactions.length} Transactions</span>
          <span>{sortedTransactions[sortedTransactions.length - 1]?.date || 'End'}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-2xs transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Top Categories by Volume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribution of revenue streams & operating cost centers in {currency.code}
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {categoryStats.slice(0, 5).map(cat => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">{cat.percent.toFixed(0)}%</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrencyValue(cat.amount, currency)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, cat.percent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{categoryStats.length} total distinct categories</span>
          <span className="font-mono text-[11px]">Aggregated by Category</span>
        </div>
      </div>
    </div>
  );
};
