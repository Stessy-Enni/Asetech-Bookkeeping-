import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Activity,
  PieChart,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Calendar,
  Printer
} from 'lucide-react';
import { Transaction, CurrencyConfig, BusinessProfile } from '../types';
import { generateFinancialReport, FinancialReportData } from '../utils/reportAnalysis';
import { formatCurrencyValue, downloadFile } from '../utils/generator';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  allTransactions: Transaction[];
  currency: CurrencyConfig;
  isFiltered: boolean;
  businessProfile?: BusinessProfile;
  appLogoUrl?: string | null;
  appLogoFit?: 'cover' | 'contain';
  appName?: string;
}

type ReportTab = 'summary' | 'categories' | 'velocity' | 'rawText';

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  allTransactions,
  currency,
  isFiltered,
  businessProfile,
  appLogoUrl,
  appLogoFit = 'cover',
  appName
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [useAllData, setUseAllData] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Pick dataset based on toggle
  const activeDataset = useMemo(() => {
    if (useAllData || !isFiltered) return allTransactions;
    return transactions;
  }, [useAllData, isFiltered, allTransactions, transactions]);

  // Compute report
  const report: FinancialReportData = useMemo(() => {
    return generateFinancialReport(activeDataset, currency);
  }, [activeDataset, currency]);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(report.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `financial_analysis_report_${currency.code.toLowerCase()}_${report.patterns.dateRangeStart || 'dataset'}.md`;
    downloadFile(report.markdownReport, filename, 'text/markdown');
  };

  const handleDownloadText = () => {
    const filename = `financial_analysis_report_${currency.code.toLowerCase()}_${report.patterns.dateRangeStart || 'dataset'}.txt`;
    downloadFile(report.markdownReport, filename, 'text/plain');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            {appLogoUrl ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src={appLogoUrl}
                  alt={appName || 'App Logo'}
                  className={`w-full h-full ${appLogoFit === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Financial Pattern & Velocity Analysis Report
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  ({report.patterns.totalTransactions} transactions)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pattern telemetry, daily burn velocity, and category dominance breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Scope toggle if filtered */}
            {isFiltered && (
              <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md text-[11px]">
                <button
                  type="button"
                  onClick={() => setUseAllData(false)}
                  className={`px-2 py-0.5 rounded transition-colors font-medium ${
                    !useAllData
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Filtered Scope ({transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUseAllData(true)}
                  className={`px-2 py-0.5 rounded transition-colors font-medium ${
                    useAllData
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Records ({allTransactions.length})
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400 shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Executive Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('velocity')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'velocity'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spending Velocity</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Category Dominance</span>
          </button>
          <button
            onClick={() => setActiveTab('rawText')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rawText'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text / Markdown Document</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-slate-900 dark:text-slate-100">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              {businessProfile && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                        {businessProfile.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded font-mono">
                        {businessProfile.legalEntity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {businessProfile.industry} {businessProfile.taxId ? `· Tax ID: ${businessProfile.taxId}` : ''}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <div>{businessProfile.email}</div>
                    <div>{businessProfile.address}</div>
                  </div>
                </div>
              )}

              {/* Top Key KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                    Daily Spending Velocity
                  </span>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {formatCurrencyValue(report.velocity.dailyVelocity, currency)}
                    <span className="text-xs font-normal text-slate-500">/day</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    ~{formatCurrencyValue(report.velocity.monthlyProjectedBurn, currency)}/mo burn
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                    Coverage Ratio
                  </span>
                  <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {report.patterns.revenueToExpenseCoverageRatio.toFixed(2)}x
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Gross Inflow / Outflow
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                    Net Profit Margin
                  </span>
                  <div className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                    report.patterns.profitMargin >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                  }`}>
                    {report.patterns.profitMargin.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatCurrencyValue(report.patterns.netProfit, currency, true)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                    Primary Cost Center
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate" title={report.dominantExpenseCategory?.category || 'None'}>
                    {report.dominantExpenseCategory?.category || 'None'}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {report.dominantExpenseCategory?.percentage.toFixed(1)}% wallet share
                  </span>
                </div>
              </div>

              {/* Strategic Observations Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Strategic Analysis & Financial Health Synthesis
                </h4>
                <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {report.executiveObservations.map((obs, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Cadence & Velocity Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Inflow Velocity & Ticket Size</span>
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Total Revenue Volume:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatCurrencyValue(report.patterns.totalIncome, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Inflow Ticket:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatCurrencyValue(report.patterns.averageIncomeTicket, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inflow Arrival Interval:</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        Every ~{report.patterns.inflowCadenceDays} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Outflow Cadence & Overhead Momentum</span>
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Total Operating Overhead:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatCurrencyValue(report.patterns.totalExpense, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Outflow Ticket:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatCurrencyValue(report.patterns.averageExpenseTicket, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outflow Cadence:</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        Every ~{report.patterns.outflowCadenceDays} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPENDING VELOCITY */}
          {activeTab === 'velocity' && (
            <div className="space-y-5">
              {/* Velocity Run-rate Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    Daily Outflow Velocity
                  </span>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    {formatCurrencyValue(report.velocity.dailyVelocity, currency)}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Calculated over {report.velocity.totalDays} calendar days
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    Weekly Outflow Momentum
                  </span>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    {formatCurrencyValue(report.velocity.weeklyVelocity, currency)}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    7-day rolling burn rate
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    Monthly Projected Burn
                  </span>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    {formatCurrencyValue(report.velocity.monthlyProjectedBurn, currency)}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Trajectory: <span className="font-semibold text-slate-800 dark:text-slate-200">{report.velocity.velocityTrend}</span>
                  </span>
                </div>
              </div>

              {/* Month-over-Month Velocity Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Month-over-Month Outflow Velocity Progression
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comparing daily average spend by period
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2.5 px-4">Period</th>
                        <th className="py-2.5 px-4">Total Period Spend</th>
                        <th className="py-2.5 px-4">Daily Velocity</th>
                        <th className="py-2.5 px-4 text-right">MoM Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {report.velocity.monthOverMonthVelocityChanges.map(row => (
                        <tr key={row.month} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                            {row.monthName}
                          </td>
                          <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {formatCurrencyValue(row.totalExpense, currency)}
                          </td>
                          <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {formatCurrencyValue(row.dailyExpense, currency)}/day
                          </td>
                          <td className="py-2.5 px-4 font-mono tabular-nums text-right">
                            {row.pctChangeFromPrior === null ? (
                              <span className="text-slate-400">Baseline</span>
                            ) : row.pctChangeFromPrior > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                +{row.pctChangeFromPrior.toFixed(1)}% (Accelerating)
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {row.pctChangeFromPrior.toFixed(1)}% (Decelerating)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY DOMINANCE */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Category Risk Header */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Concentration Risk Assessment: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{report.concentrationRisk}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Primary Cost Center accounts for {report.dominantExpenseCategory?.percentage.toFixed(1)}% of all expenditures
                </div>
              </div>

              {/* Expense Category Shares */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Operating Overhead: Wallet Share by Category
                </h4>
                <div className="space-y-2">
                  {report.expenseCategories.map(cat => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cat.category} <span className="text-slate-400 text-[11px]">({cat.count} txns)</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {formatCurrencyValue(cat.amount, currency)}
                          </span>
                          <span className="text-slate-500 text-[11px] w-12 text-right">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Category Dominance Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Category Dominance Over Time (Monthly Shifts)
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2.5 px-4">Month</th>
                        <th className="py-2.5 px-4">Top Spending Driver</th>
                        <th className="py-2.5 px-4">Category Spend</th>
                        <th className="py-2.5 px-4">Mo. Share</th>
                        <th className="py-2.5 px-4">Top Revenue Stream</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {report.monthlyDominance.map(m => (
                        <tr key={m.month} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                            {m.monthName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {m.topExpenseCategory}
                          </td>
                          <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {formatCurrencyValue(m.topExpenseAmount, currency)}
                          </td>
                          <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                            {m.topExpensePercentage.toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {m.topIncomeCategory}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW TEXT / MARKDOWN REPORT */}
          {activeTab === 'rawText' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Formatted Plain Text / Markdown Document</span>
                <span className="font-mono text-[11px]">
                  {report.markdownReport.split('\n').length} lines · {new Blob([report.markdownReport]).size} bytes
                </span>
              </div>
              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 max-h-[50vh] leading-relaxed">
                <pre><code>{report.markdownReport}</code></pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Analysis generated {new Date(report.generatedAt).toLocaleTimeString()}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Full Report' : 'Copy Report'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
              title="Print report or save as PDF via browser print"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
