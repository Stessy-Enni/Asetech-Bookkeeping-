import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  initialData?: Transaction | null;
  existingCategories: string[];
  currency: CurrencyConfig;
}

export const AddEditTransactionModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories,
  currency
}) => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setPaymentMethod(initialData.paymentMethod || 'ACH Transfer');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setCategory(existingCategories[0] || 'Consulting Retainers');
      setType('income');
      setAmount('');
      setPaymentMethod('Direct Deposit');
    }
    setError('');
  }, [initialData, isOpen, existingCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    onSave({
      id: initialData?.id || `txn_${Date.now()}`,
      date,
      description: description.trim(),
      category: category.trim(),
      type,
      amount: Math.round(numAmount * 100) / 100,
      currency: currency.code,
      paymentMethod,
      status: 'settled'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                Income (Inflow)
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  type === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                Expense (Outflow)
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description / Vendor / Client
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Client Retainer - Acme Tech"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              required
              list="category-suggestions"
              placeholder="e.g. Consulting & Retainers, Software & Cloud..."
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
            <datalist id="category-suggestions">
              {existingCategories.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Amount with current currency */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount ({currency.code} {currency.symbol.trim()})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                {currency.symbol.trim()}
              </span>
              <input
                type="number"
                step={currency.decimals === 0 ? "1" : "0.01"}
                min="0.01"
                required
                placeholder={currency.decimals === 0 ? "1000" : "0.00"}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors"
            >
              {initialData ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
