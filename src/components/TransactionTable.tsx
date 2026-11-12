import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  CheckSquare,
  Square,
  MinusSquare,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { Transaction, CurrencyConfig, TransactionAnomaly } from '../types';
import { formatCurrencyValue } from '../utils/generator';

interface TransactionTableProps {
  transactions: Transaction[];
  totalUnfilteredCount: number;
  currency: CurrencyConfig;
  anomalyMap: Map<string, TransactionAnomaly>;
  onAddClick: () => void;
  onImportCsvClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (id?: string) => void;
  onBulkDeleteClick: (ids: string[]) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onResetFilters?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  totalUnfilteredCount,
  currency,
  anomalyMap,
  onAddClick,
  onImportCsvClick,
  onEditClick,
  onDeleteClick,
  onBulkDeleteClick,
  onSelectTransaction,
  onResetFilters
}) => {
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [activeAnomalyTooltip, setActiveAnomalyTooltip] = useState<string | null>(null);

  // Sorting
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      } else if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else {
        return sortOrder === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
      }
    });
  }, [transactions, sortField, sortOrder]);

  const toggleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Selection handlers
  const handleToggleRow = (id?: string) => {
    if (!id) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = transactions.length > 0 && transactions.every(t => t.id && selectedIds.has(t.id));
  const someVisibleSelected = transactions.some(t => t.id && selectedIds.has(t.id)) && !allVisibleSelected;

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      transactions.forEach(t => {
        if (t.id) next.add(t.id);
      });
      setSelectedIds(next);
    }
  };

  const handleExecuteBulkDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    onBulkDeleteClick(idsToDelete);
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
  };

  // Count unusual transactions among visible rows
  const visibleUnusualCount = useMemo(() => {
    return transactions.filter(t => {
      const id = t.id || `${t.date}-${t.description}`;
      return anomalyMap.has(id);
    }).length;
  }, [transactions, anomalyMap]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
      {/* Table Actions Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Transaction Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Displaying {transactions.length} of {totalUnfilteredCount} transactions · Currency: {currency.name}
            </p>
          </div>

          {/* Anomaly Indicator Flag in header */}
          {visibleUnusualCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{visibleUnusualCount} unusual {visibleUnusualCount === 1 ? 'transaction' : 'transactions'} flagged</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk delete action trigger */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={onImportCsvClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Import transactions from CSV file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Sticky Bar if any rows selected */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckSquare className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            <span>
              <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? 'transaction' : 'transactions'} selected for bulk operation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* High-Density Data Grid with Anomaly Highlighting */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-wider uppercase">
              <th className="py-2.5 pl-4 pr-2 w-8 select-none">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  aria-label="Select all transactions"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center"
                >
                  {allVisibleSelected ? (
                    <CheckSquare className="w-4 h-4 text-slate-900 dark:text-white" />
                  ) : someVisibleSelected ? (
                    <MinusSquare className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  )}
                </button>
              </th>
              <th
                onClick={() => toggleSort('date')}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 whitespace-nowrap">Description</th>
              <th
                onClick={() => toggleSort('category')}
                className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 whitespace-nowrap">Type</th>
              <th
                onClick={() => toggleSort('amount')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount ({currency.symbol.trim()})</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-medium text-slate-800 dark:text-slate-200">No transactions match current filters</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Try broadening your search query, expanding the date range, or uploading your own CSV file.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {onResetFilters && (
                        <button
                          onClick={onResetFilters}
                          className="px-3 py-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md font-medium transition-colors"
                        >
                          Reset Filters
                        </button>
                      )}
                      <button
                        onClick={onImportCsvClick}
                        className="px-3 py-1 text-xs text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md font-medium transition-colors"
                      >
                        Upload CSV
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedTransactions.map(t => {
                const isIncome = t.type === 'income';
                const id = t.id || `${t.date}-${t.description}`;
                const isSelected = t.id ? selectedIds.has(t.id) : false;
                const anomaly = anomalyMap.get(id);
                const isUnusual = Boolean(anomaly);

                return (
                  <tr
                    key={id}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-slate-100/90 dark:bg-slate-800/90'
                        : isUnusual
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/35'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2 w-8">
                      <button
                        type="button"
                        onClick={() => handleToggleRow(t.id)}
                        aria-label={`Select ${t.description}`}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-slate-900 dark:text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.date}
                    </td>

                    {/* Description + Warning Indicator Badge */}
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium max-w-[280px]">
                      <div className="flex flex-col gap-1 items-start">
                        <button
                          onClick={() => onSelectTransaction(t)}
                          className="text-left hover:underline hover:text-slate-700 dark:hover:text-slate-300 truncate w-full block"
                          title={t.description}
                        >
                          {t.description}
                        </button>

                        {/* Warning Indicator Pill if unusual */}
                        {isUnusual && anomaly && (
                          <div className="relative group/warn inline-flex items-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTransaction(t);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
                              title={`${anomaly.reason} · Click to inspect potential reasons and normalize`}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                              <span>Unusual ({anomaly.ratio}x avg)</span>
                            </button>

                            {/* Accessible Popover Detail on Hover */}
                            <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/warn:block z-30 w-72 p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-lg shadow-xl text-xs leading-relaxed border border-slate-700 pointer-events-none">
                              <div className="font-semibold text-amber-400 flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{anomaly.anomalyType || 'Unusually High Transaction'}</span>
                                </span>
                                <span className="text-[10px] text-amber-300 font-normal">Click to normalize</span>
                              </div>
                              <p className="text-slate-300 text-[11px] mb-2">{anomaly.reason}</p>
                              <div className="pt-2 border-t border-slate-800 dark:border-slate-700 text-[11px] text-slate-400 space-y-1">
                                <div className="flex justify-between">
                                  <span>Category:</span>
                                  <span className="font-medium text-slate-200">{t.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Category Mean:</span>
                                  <span className="font-mono text-slate-200">
                                    {formatCurrencyValue(anomaly.categoryAverage, currency)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Variance:</span>
                                  <span className="font-mono font-semibold text-amber-400">
                                    +{anomaly.deviationPercent}% vs average
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category: clean unboxed text */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <span>{t.category}</span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
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
                    </td>

                    {/* Amount formatted with changeable currency and subtle anomaly dot */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}>
                          {formatCurrencyValue(t.amount, currency, true)}
                        </span>
                        {isUnusual && (
                          <span
                            title="Significantly higher than category average"
                            className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0"
                          />
                        )}
                      </div>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectTransaction(t)}
                          title="View JSON detail"
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditClick(t)}
                          title="Edit transaction"
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(t.id)}
                          title="Delete transaction"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
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

      {/* Table Footer Summary */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Filtered Records: </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {transactions.length} active
          </span>
          {visibleUnusualCount > 0 && (
            <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
              {visibleUnusualCount} unusual outliers
            </span>
          )}
          {selectedIds.size > 0 && (
            <span className="text-rose-700 dark:text-rose-400 font-semibold ml-2">
              ({selectedIds.size} selected)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>
            Income: {transactions.filter(t => t.type === 'income').length}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Expense: {transactions.filter(t => t.type === 'expense').length}
          </span>
        </div>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Confirm Bulk Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permanently delete {selectedIds.size} transactions?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              This action will remove the {selectedIds.size} selected records from the dataset and immediately recalculate all monthly summaries and totals.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Delete {selectedIds.size} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
