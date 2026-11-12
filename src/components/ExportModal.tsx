import React, { useState } from 'react';
import { X, Copy, Check, Download, FileSpreadsheet, FileJson, Calendar, Layers } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';
import {
  formatJsonOutput,
  JsonOutputMode,
  exportToCsv,
  exportMonthlySummaryCsv,
  calculateMonthlySummaries,
  downloadFile
} from '../utils/generator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: CurrencyConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currency
}) => {
  const [selectedFormat, setSelectedFormat] = useState<JsonOutputMode>('unified');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonContent = formatJsonOutput(transactions, selectedFormat, 2, currency.code);
  const monthlySummaries = calculateMonthlySummaries(transactions, currency.code);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const filenameMap: Record<JsonOutputMode, string> = {
      unified: `financial_dataset_${currency.code.toLowerCase()}_with_monthly_summary.json`,
      monthlySummaryOnly: `monthly_summary_${currency.code.toLowerCase()}.json`,
      transactionsMinimal: `transactions_${currency.code.toLowerCase()}_5_fields.json`,
      transactionsFull: `transactions_${currency.code.toLowerCase()}_extended.json`
    };
    downloadFile(jsonContent, filenameMap[selectedFormat], 'application/json');
  };

  const handleDownloadCsv = () => {
    if (selectedFormat === 'monthlySummaryOnly') {
      const csv = exportMonthlySummaryCsv(monthlySummaries);
      downloadFile(csv, `monthly_summary_${currency.code.toLowerCase()}.csv`, 'text/csv');
    } else {
      const csv = exportToCsv(transactions, currency.code);
      downloadFile(csv, `transactions_ledger_${currency.code.toLowerCase()}.csv`, 'text/csv');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Export Financial Dataset ({currency.code})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {transactions.length} transactions across {monthlySummaries.length} months in {currency.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Select Output Schema Structure:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSelectedFormat('unified')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedFormat === 'unified'
                    ? 'border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-emerald-500 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-slate-900 dark:text-white">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Unified Package</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Monthly summary + transactions ({currency.code})
                </p>
              </button>

              <button
                onClick={() => setSelectedFormat('monthlySummaryOnly')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedFormat === 'monthlySummaryOnly'
                    ? 'border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-emerald-500 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-slate-900 dark:text-white">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Monthly Summary</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Income, expenses & net profit per month
                </p>
              </button>

              <button
                onClick={() => setSelectedFormat('transactionsMinimal')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedFormat === 'transactionsMinimal'
                    ? 'border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-emerald-500 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-slate-900 dark:text-white">
                  <FileJson className="w-3.5 h-3.5" />
                  <span>5 Fields Array</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  date, description, category, type, amount
                </p>
              </button>

              <button
                onClick={() => setSelectedFormat('transactionsFull')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedFormat === 'transactionsFull'
                    ? 'border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-emerald-500 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-slate-900 dark:text-white">
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Extended Array</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  With payment method & settlement status
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadJson}
              className="p-3 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group"
            >
              <div className="flex items-center justify-between mb-1">
                <FileJson className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
                <Download className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Download JSON File
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Formatted for dashboard applications
              </div>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="p-3 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group"
            >
              <div className="flex items-center justify-between mb-1">
                <FileSpreadsheet className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white" />
                <Download className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Download CSV Spreadsheet
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedFormat === 'monthlySummaryOnly' ? 'Monthly summary metrics' : 'Transaction ledger rows'}
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Copied JSON to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy JSON Payload ({currency.code})</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
