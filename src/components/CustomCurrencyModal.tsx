import React, { useState } from 'react';
import { X, Coins, Check } from 'lucide-react';
import { CurrencyConfig } from '../types';

interface CustomCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomCurrency: (currency: CurrencyConfig) => void;
  currentCurrency: CurrencyConfig;
}

export const CustomCurrencyModal: React.FC<CustomCurrencyModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomCurrency,
  currentCurrency
}) => {
  const [code, setCode] = useState(currentCurrency.code === 'CUSTOM' ? 'INR' : currentCurrency.code);
  const [symbol, setSymbol] = useState(currentCurrency.symbol === '¤' ? '₹' : currentCurrency.symbol);
  const [name, setName] = useState(currentCurrency.name.includes('Custom') ? 'Indian Rupee' : currentCurrency.name);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase() || 'CUSTOM';
    const cleanSymbol = symbol.trim() || cleanCode;
    const cleanName = name.trim() || `${cleanCode} (${cleanSymbol})`;

    const customConfig: CurrencyConfig = {
      code: cleanCode,
      symbol: cleanSymbol,
      name: cleanName,
      decimals: 2
    };

    onSaveCustomCurrency(customConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Configure Custom / Other Currency
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Currency Code (e.g., INR, ZAR, SGD, MXN)
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="INR"
              maxLength={5}
              required
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Currency Symbol (e.g., ₹, R$, S$, R)
            </label>
            <input
              type="text"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              placeholder="₹"
              maxLength={6}
              required
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Currency Description / Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Indian Rupee (₹)"
              maxLength={35}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Currency</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
