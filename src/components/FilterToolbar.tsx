import React from 'react';
import { Search, Calendar, Tag, ArrowDownLeft, ArrowUpRight, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { FilterCriteria } from '../types';

interface FilterToolbarProps {
  filters: FilterCriteria;
  onFilterChange: (updated: Partial<FilterCriteria>) => void;
  onResetFilters: () => void;
  categories: string[];
  totalCount: number;
  filteredCount: number;
  availableMonths: string[];
  unusualCount?: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  totalCount,
  filteredCount,
  availableMonths,
  unusualCount = 0
}) => {
  const hasActiveFilters =
    filters.searchKeyword.trim() !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    Boolean(filters.unusualOnly);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5 shadow-2xs transition-colors">
      {/* Top row: Search input + Type segmented buttons + Unusual filter toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search by keyword in description */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchKeyword}
            onChange={e => onFilterChange({ searchKeyword: e.target.value })}
            placeholder="Search keywords in description (e.g., 'Retainer', 'Payroll', 'Software')..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 dark:focus:border-slate-100 transition-colors"
          />
          {filters.searchKeyword && (
            <button
              onClick={() => onFilterChange({ searchKeyword: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unusual Outliers Quick Filter Toggle */}
          {unusualCount > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({ unusualOnly: !filters.unusualOnly })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                filters.unusualOnly
                  ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-semibold shadow-xs ring-1 ring-amber-400'
                  : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40'
              }`}
              title="Show only transactions significantly higher than their category average"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Unusual Only ({unusualCount})</span>
            </button>
          )}

          {/* Transaction Type Filter */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 shrink-0">
            <button
              onClick={() => onFilterChange({ type: 'all' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.type === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => onFilterChange({ type: 'income' })}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Income</span>
            </button>
            <button
              onClick={() => onFilterChange({ type: 'expense' })}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Date Range Pickers + Category Filter + Quick Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date range pickers */}
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Date Range:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onFilterChange({ startDate: e.target.value })}
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
              title="Start Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onFilterChange({ endDate: e.target.value })}
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
              title="End Date"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Category:</span>
            <select
              value={filters.category}
              onChange={e => onFilterChange({ category: e.target.value })}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 max-w-[220px]"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c} value={c} className="dark:bg-slate-800 dark:text-slate-200">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status & Reset button */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Filtered: </span>
            <span className="font-semibold text-slate-900 dark:text-white">{filteredCount}</span>
            <span> of {totalCount} transactions</span>
            {filters.unusualOnly && (
              <span className="text-amber-700 dark:text-amber-400 font-semibold ml-1.5">
                (Unusual Outliers)
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
