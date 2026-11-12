import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Tag,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Transaction, CurrencyConfig, TransactionAnomaly } from '../types';
import { formatCurrencyValue } from '../utils/generator';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  currency: CurrencyConfig;
  anomaly?: TransactionAnomaly;
  availableCategories?: string[];
  onUpdateTransaction?: (updated: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  currency,
  anomaly,
  availableCategories = [],
  onUpdateTransaction
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [originalSnapshot, setOriginalSnapshot] = useState<Transaction | null>(null);
  const [normalizationHistory, setNormalizationHistory] = useState<{
    originalAmount: number;
    originalCategory: string;
    actionType: 'amount' | 'category';
  } | null>(null);

  // Sync category select with transaction
  useEffect(() => {
    if (transaction) {
      setSelectedCategory(transaction.category);
      setOriginalSnapshot(null);
      setNormalizationHistory(null);
    }
  }, [transaction?.id]);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  // 1-Click Normalization: Adjust Amount to Category Average
  const handleNormalizeAmount = () => {
    if (!transaction || !anomaly) return;

    const targetAmount = anomaly.suggestedNormalizedAmount ?? anomaly.categoryAverage;
    const roundedTarget = Math.round(targetAmount * 100) / 100;

    setOriginalSnapshot({ ...transaction });
    setNormalizationHistory({
      originalAmount: transaction.amount,
      originalCategory: transaction.category,
      actionType: 'amount'
    });

    const updated: Transaction = {
      ...transaction,
      amount: roundedTarget
    };

    onUpdateTransaction?.(updated);
  };

  // 1-Click Normalization: Reclassify Category
  const handleReclassifyCategory = (targetCat: string) => {
    if (!transaction || !targetCat || targetCat === transaction.category) return;

    setOriginalSnapshot({ ...transaction });
    setNormalizationHistory({
      originalAmount: transaction.amount,
      originalCategory: transaction.category,
      actionType: 'category'
    });

    const updated: Transaction = {
      ...transaction,
      category: targetCat
    };

    onUpdateTransaction?.(updated);
  };

  // 1-Click Undo Normalization
  const handleUndo = () => {
    if (!originalSnapshot) return;
    onUpdateTransaction?.(originalSnapshot);
    setOriginalSnapshot(null);
    setNormalizationHistory(null);
  };

  const minimalJson = JSON.stringify(
    {
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      ...(currency.code !== 'USD' ? { currency: currency.code } : {}),
      ...(anomaly ? { isUnusual: true, anomalyType: anomaly.anomalyType, categoryDeviation: `+${anomaly.deviationPercent}%` } : {})
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(minimalJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const potentialReasons = anomaly?.potentialReasons || [
    `Category peak: Transaction amount (${formatCurrencyValue(transaction.amount, currency)}) is significantly higher than typical category expenditures.`,
    'Periodic lump sum: May reflect a multi-month bundled invoice, upfront retainer, or quarterly settlement.',
    'Classification review: Consider assigning to an asset account or higher-volume cost center.'
  ];

  const suggestedCat = anomaly?.suggestedCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Record Inspection</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
              {transaction.id || 'txn'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Section A: Active Anomaly Callout with Potential Reasons & 1-Click Normalization */}
          {anomaly ? (
            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-3.5 transition-colors">
              {/* Header with Anomaly Type */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100">
                      Unusual Transaction Detected: {anomaly.anomalyType || 'Category peak'}
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      {anomaly.reason}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold text-amber-800 dark:text-amber-300 whitespace-nowrap bg-amber-100/70 dark:bg-amber-900/50 px-2 py-0.5 rounded border border-amber-200/80 dark:border-amber-800/60 shrink-0">
                  +{anomaly.deviationPercent}% deviation
                </span>
              </div>

              {/* Potential Reasons List */}
              <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
                <span className="text-[11px] font-semibold text-amber-950 dark:text-amber-200 block">
                  Potential Reasons for Anomaly:
                </span>
                <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-300">
                  {potentialReasons.map((reasonText, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">·</span>
                      <span>{reasonText}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 1-Click Normalization Actions Toolbar */}
              <div className="pt-3 border-t border-amber-200/80 dark:border-amber-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>One-Click Normalization:</span>
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400">
                    Aligns record to dataset benchmarks
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Option 1: One-Click Normalize Amount */}
                  <button
                    type="button"
                    onClick={handleNormalizeAmount}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-2xs transition-colors"
                    title={`Adjust amount to the category average of ${formatCurrencyValue(anomaly.suggestedNormalizedAmount || anomaly.categoryAverage, currency)}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      Normalize Amount to {formatCurrencyValue(anomaly.suggestedNormalizedAmount || anomaly.categoryAverage, currency)}
                    </span>
                  </button>

                  {/* Option 2: One-Click Reclassify Category */}
                  {suggestedCat && suggestedCat !== transaction.category && (
                    <button
                      type="button"
                      onClick={() => handleReclassifyCategory(suggestedCat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-950 dark:text-amber-100 bg-white dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition-colors shadow-2xs"
                      title={`Reclassify to ${suggestedCat} where this amount matches the typical volume`}
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Reclassify to &ldquo;{suggestedCat}&rdquo;</span>
                    </button>
                  )}
                </div>

                {/* Optional category selector if user wants a different category */}
                {availableCategories.length > 1 && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-900 dark:text-amber-300">
                    <span className="shrink-0 text-slate-500 dark:text-slate-400">Or change to:</span>
                    <select
                      value={selectedCategory}
                      onChange={e => {
                        setSelectedCategory(e.target.value);
                        if (e.target.value !== transaction.category) {
                          handleReclassifyCategory(e.target.value);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-amber-300/80 dark:border-amber-700/80 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {availableCategories.map(c => (
                        <option key={c} value={c}>
                          {c} {c === suggestedCat ? ' (Recommended)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Successfully Normalized Banner with Undo Action
            normalizationHistory && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-emerald-950 dark:text-emerald-100">
                      Transaction Successfully Normalized
                    </span>
                    <span className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                      {normalizationHistory.actionType === 'amount'
                        ? `Amount adjusted from ${formatCurrencyValue(normalizationHistory.originalAmount, currency)} to ${formatCurrencyValue(transaction.amount, currency)} (matches category benchmark).`
                        : `Reclassified from "${normalizationHistory.originalCategory}" to "${transaction.category}".`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUndo}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-white dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors shrink-0 shadow-2xs"
                  title="Revert to original transaction values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              </div>
            )
          )}

          {/* Section B: Main Transaction Overview */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {transaction.description}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{transaction.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{transaction.date}</span>
                {transaction.paymentMethod && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{transaction.paymentMethod}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1 font-medium text-xs mb-0.5">
                {isIncome ? (
                  <>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">Income</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span className="text-rose-700 dark:text-rose-400">Expense</span>
                  </>
                )}
              </div>
              <div className={`text-xl font-bold font-mono tabular-nums ${isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                {formatCurrencyValue(transaction.amount, currency, true)}
              </div>
            </div>
          </div>

          {/* Section C: Raw JSON Schema Representation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Raw JSON Schema Representation ({currency.code})
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Record'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800">
              <pre><code>{minimalJson}</code></pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {anomaly ? (
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flagged outlier</span>
              </span>
            ) : normalizationHistory ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Benchmark verified</span>
              </span>
            ) : (
              <span>Within standard benchmark variance</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
