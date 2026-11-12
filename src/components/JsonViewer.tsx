import React, { useState } from 'react';
import { Copy, Check, Download, FileSpreadsheet, Layers, Calendar, ListFilter } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';
import {
  formatJsonOutput,
  JsonOutputMode,
  exportToCsv,
  exportMonthlySummaryCsv,
  calculateMonthlySummaries,
  downloadFile
} from '../utils/generator';

interface JsonViewerProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isFiltered: boolean;
  currency: CurrencyConfig;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  transactions,
  filteredTransactions,
  isFiltered,
  currency
}) => {
  const [outputMode, setOutputMode] = useState<JsonOutputMode>('unified');
  const [useFilteredData, setUseFilteredData] = useState<boolean>(false);
  const [indentSize, setIndentSize] = useState<2 | 4 | 0>(2);
  const [copied, setCopied] = useState(false);

  const activeData = useFilteredData && isFiltered ? filteredTransactions : transactions;
  const jsonString = formatJsonOutput(activeData, outputMode, indentSize, currency.code);
  const byteSize = new Blob([jsonString]).size;
  const monthlySummaries = calculateMonthlySummaries(activeData, currency.code);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
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
    downloadFile(jsonString, filenameMap[outputMode], 'application/json');
  };

  const handleDownloadCsv = () => {
    if (outputMode === 'monthlySummaryOnly') {
      const csv = exportMonthlySummaryCsv(monthlySummaries);
      downloadFile(csv, `monthly_summary_${currency.code.toLowerCase()}.csv`, 'text/csv');
    } else {
      const csv = exportToCsv(activeData, currency.code);
      downloadFile(csv, `transactions_ledger_${currency.code.toLowerCase()}.csv`, 'text/csv');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
      {/* Top configuration bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              JSON Output & Monthly Statistics Payload
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ({activeData.length} records · {monthlySummaries.length} months · Currency: {currency.code})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured JSON output with monthly income, expenses, and net profit summaries ready for dashboard ingestion
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Data scope toggle if filtered */}
          {isFiltered && (
            <div className="flex items-center p-0.5 bg-slate-200/90 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setUseFilteredData(false)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  !useFilteredData
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setUseFilteredData(true)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  useFilteredData
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListFilter className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Filtered ({filteredTransactions.length})</span>
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.JSON</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>.CSV</span>
          </button>
        </div>
      </div>

      {/* Output format selectors & indentation bar */}
      <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Output Structure Modes */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium mr-1">Output Structure:</span>
          <button
            onClick={() => setOutputMode('unified')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
              outputMode === 'unified'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Unified (Summary + Transactions)</span>
          </button>

          <button
            onClick={() => setOutputMode('monthlySummaryOnly')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
              outputMode === 'monthlySummaryOnly'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Monthly Summary Only</span>
          </button>

          <button
            onClick={() => setOutputMode('transactionsMinimal')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              outputMode === 'transactionsMinimal'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Transactions Array (5 Fields)
          </button>

          <button
            onClick={() => setOutputMode('transactionsFull')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              outputMode === 'transactionsFull'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Transactions (Extended)
          </button>
        </div>

        {/* Indent spacing */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 mr-1">Format:</span>
          <button
            onClick={() => setIndentSize(2)}
            className={`px-2 py-0.5 rounded ${
              indentSize === 2
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            2 sp
          </button>
          <button
            onClick={() => setIndentSize(4)}
            className={`px-2 py-0.5 rounded ${
              indentSize === 4
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            4 sp
          </button>
          <button
            onClick={() => setIndentSize(0)}
            className={`px-2 py-0.5 rounded ${
              indentSize === 0
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            min
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative bg-slate-950 p-4 overflow-x-auto text-xs font-mono leading-relaxed select-text max-h-[580px]">
        <pre className="text-slate-200">
          <code>{jsonString}</code>
        </pre>
      </div>

      {/* JSON schema field explanation */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block font-mono">currency</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Active standard 3-letter currency code (e.g. {currency.code}).
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block font-mono">summary.monthly[]</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Array of monthly objects containing totalIncome, totalExpenses, and netProfit.
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block font-mono">monthly.netProfit</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Calculated as totalIncome minus totalExpenses for that exact calendar month.
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block font-mono">transactions[]</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Array of transaction items with date, description, category, type, and amount.
          </span>
        </div>
      </div>
    </div>
  );
};
