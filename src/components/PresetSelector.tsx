import React from 'react';
import { RefreshCw, Building2, Coffee, ShoppingBag, Wrench, Coins, Upload, FileText } from 'lucide-react';
import { BusinessPreset, CurrencyConfig, SUPPORTED_CURRENCIES } from '../types';

interface PresetSelectorProps {
  presets: BusinessPreset[];
  activePresetId: string;
  onSelectPreset: (preset: BusinessPreset) => void;
  onGenerateRandom: () => void;
  isGenerating?: boolean;
  selectedCurrency: CurrencyConfig;
  onCurrencyChange: (currency: CurrencyConfig) => void;
  onImportCsvClick: () => void;
  onOpenReportClick?: () => void;
  onOpenCustomCurrency?: () => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onGenerateRandom,
  isGenerating = false,
  selectedCurrency,
  onCurrencyChange,
  onImportCsvClick,
  onOpenReportClick,
  onOpenCustomCurrency
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'tech-agency':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'cafe-roastery':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'ecommerce-store':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'trades-contractor':
        return <Wrench className="w-3.5 h-3.5" />;
      default:
        return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs transition-colors">
      {/* Preset tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          Business Archetype:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map(p => {
            const isActive = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {getIcon(p.id)}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right controls: Currency Selector + Import CSV + Generate Batch */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
          <Coins className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Currency:</span>
          <select
            value={SUPPORTED_CURRENCIES.some(c => c.code === selectedCurrency.code) ? selectedCurrency.code : 'CUSTOM'}
            onChange={e => {
              if (e.target.value === 'CUSTOM') {
                onOpenCustomCurrency?.();
              } else {
                const matched = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                if (matched) onCurrencyChange(matched);
              }
            }}
            className="text-xs font-semibold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="dark:bg-slate-800 dark:text-slate-100">
                {c.code === 'CUSTOM' && !SUPPORTED_CURRENCIES.some(s => s.code === selectedCurrency.code)
                  ? `${selectedCurrency.name} (${selectedCurrency.symbol})`
                  : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Import CSV Trigger */}
        <button
          onClick={onImportCsvClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          title="Upload and map CSV file to populate transactions"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Upload CSV</span>
        </button>

        {/* Generate Analysis Report Trigger */}
        {onOpenReportClick && (
          <button
            onClick={onOpenReportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Generate text-based summary report analyzing patterns, velocity, and category dominance"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Analysis Report</span>
          </button>
        )}

        {/* Generate Batch */}
        <button
          onClick={onGenerateRandom}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap active:scale-98 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Generate New Batch</span>
        </button>
      </div>
    </div>
  );
};
