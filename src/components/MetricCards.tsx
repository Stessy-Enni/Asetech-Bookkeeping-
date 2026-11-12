import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  HelpCircle,
  FileText
} from 'lucide-react';
import { FinancialMetrics, CurrencyConfig, PeriodComparison, MetricTrend } from '../types';
import { formatCurrencyValue } from '../utils/generator';

interface MetricCardsProps {
  metrics: FinancialMetrics;
  currency: CurrencyConfig;
  periodComparison?: PeriodComparison;
  unfilteredMode?: 'latestMonth' | 'fullPeriod';
  onToggleUnfilteredMode?: () => void;
  isDateFiltered?: boolean;
  onOpenReportClick?: () => void;
}

interface TrendBadgeProps {
  trend?: MetricTrend;
  currency: CurrencyConfig;
  metricType: 'income' | 'expense' | 'netProfit' | 'averageTransaction';
}

const TrendBadge: React.FC<TrendBadgeProps> = ({ trend, currency, metricType }) => {
  if (!trend || trend.direction === 'no-data' || trend.percentageChange === null) {
    return (
      <div
        className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
        title="No transaction records exist in the previous equivalent timeframe for comparison."
      >
        <span className="font-mono text-slate-600 dark:text-slate-400">—</span>
        <span>No prior period data</span>
      </div>
    );
  }

  const { percentageChange, direction, isFavorable, changeValue, previousValue } = trend;
  const isUp = direction === 'up';
  const isDown = direction === 'down';

  // Semantic color coding adhering to financial domain rules:
  // - Income, Net Profit, Average: Up is favorable (emerald), Down is unfavorable (rose)
  // - Operating Expenses: Down is favorable (spending reduced, emerald), Up is unfavorable (spending increased, rose)
  let textColor = 'text-slate-600 dark:text-slate-400';
  let bgColor = 'bg-slate-100 dark:bg-slate-800';

  if (direction !== 'neutral') {
    if (isFavorable) {
      textColor = 'text-emerald-700 dark:text-emerald-400';
      bgColor = 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80';
    } else {
      textColor = 'text-rose-700 dark:text-rose-400';
      bgColor = 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80';
    }
  }

  const sign = percentageChange > 0 ? '+' : '';
  const formattedPct = `${sign}${percentageChange.toFixed(1)}%`;
  const formattedChangeVal = formatCurrencyValue(changeValue, currency, true);
  const formattedPriorVal = formatCurrencyValue(previousValue, currency, metricType === 'netProfit');

  return (
    <div
      className="flex items-center gap-1.5 text-xs"
      title={`Previous period value: ${formattedPriorVal} · Net change: ${formattedChangeVal} (${metricType === 'expense' && isDown ? 'favorable cost reduction' : isFavorable ? 'favorable growth' : 'unfavorable variance'})`}
    >
      <span
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono tabular-nums transition-colors ${textColor} ${bgColor}`}
      >
        {isUp && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
        {isDown && <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
        {!isUp && !isDown && <Minus className="w-3.5 h-3.5 shrink-0" />}
        <span>{formattedPct}</span>
      </span>
      <span className="text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
        vs. prior period
      </span>
    </div>
  );
};

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  currency,
  periodComparison,
  unfilteredMode = 'latestMonth',
  onToggleUnfilteredMode,
  isDateFiltered = false,
  onOpenReportClick
}) => {
  const isNetPositive = metrics.netProfit >= 0;

  return (
    <div className="space-y-2.5">
      {/* Period-over-Period Context Header */}
      {periodComparison && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Period Trend:</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {periodComparison.currentPeriodLabel}
            </span>
            <span className="text-slate-400">vs</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {periodComparison.previousPeriodLabel}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ({periodComparison.daysInPeriod} days)
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isDateFiltered && onToggleUnfilteredMode && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Comparison Scope:</span>
                <button
                  type="button"
                  onClick={onToggleUnfilteredMode}
                  className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium shadow-2xs"
                  title="Toggle between comparing latest active month vs prior month, or full dataset timeframe"
                >
                  {unfilteredMode === 'latestMonth' ? 'Latest Month (Oct vs Sep)' : 'Full Dataset (vs Prior Timeframe)'}
                </button>
              </div>
            )}

            {onOpenReportClick && (
              <button
                type="button"
                onClick={onOpenReportClick}
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium shadow-2xs text-[11px]"
                title="Generate comprehensive text-based summary report analyzing patterns, velocity, and dominance"
              >
                <FileText className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>Summary Report</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid of Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Income */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
              <span>Gross Income</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCurrencyValue(metrics.totalIncome, currency)}
            </div>

            {/* Trend Indicator */}
            <div className="mt-2.5">
              <TrendBadge
                trend={periodComparison?.trends.income}
                currency={currency}
                metricType="income"
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {metrics.incomeCount} inflows
            </span>
            {periodComparison && periodComparison.hasPreviousData && (
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                Prior: {formatCurrencyValue(periodComparison.trends.income.previousValue, currency)}
              </span>
            )}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
              <span>Operating Expenses</span>
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCurrencyValue(metrics.totalExpense, currency)}
            </div>

            {/* Trend Indicator */}
            <div className="mt-2.5">
              <TrendBadge
                trend={periodComparison?.trends.expense}
                currency={currency}
                metricType="expense"
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="font-medium text-rose-700 dark:text-rose-400">
              {metrics.expenseCount} outflows
            </span>
            {periodComparison && periodComparison.hasPreviousData && (
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                Prior: {formatCurrencyValue(periodComparison.trends.expense.previousValue, currency)}
              </span>
            )}
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
              <span>Net Cash Flow</span>
              <DollarSign className={`w-4 h-4 ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
            </div>
            <div className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${isNetPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {formatCurrencyValue(metrics.netProfit, currency, true)}
            </div>

            {/* Trend Indicator */}
            <div className="mt-2.5">
              <TrendBadge
                trend={periodComparison?.trends.netProfit}
                currency={currency}
                metricType="netProfit"
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {metrics.profitMargin.toFixed(1)}% margin
            </span>
            {periodComparison && periodComparison.hasPreviousData && (
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                Prior: {formatCurrencyValue(periodComparison.trends.netProfit.previousValue, currency, true)}
              </span>
            )}
          </div>
        </div>

        {/* Average Transaction */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
              <span>Average Transaction</span>
              <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCurrencyValue(metrics.averageTransaction, currency)}
            </div>

            {/* Trend Indicator */}
            <div className="mt-2.5">
              <TrendBadge
                trend={periodComparison?.trends.averageTransaction}
                currency={currency}
                metricType="averageTransaction"
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              {metrics.incomeCount + metrics.expenseCount} total
            </span>
            {periodComparison && periodComparison.hasPreviousData && (
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                Prior: {formatCurrencyValue(periodComparison.trends.averageTransaction.previousValue, currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
