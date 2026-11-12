import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Transaction, CurrencyConfig, CsvMappingConfig, ParsedCsvData } from '../types';
import {
  parseCsvText,
  guessInitialMapping,
  convertRowToTransaction,
  SAMPLE_CSV_TEXT
} from '../utils/csvParser';
import { formatCurrencyValue } from '../utils/generator';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[], mode: 'replace' | 'append') => void;
  currency: CurrencyConfig;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currency
}) => {
  const [step, setStep] = useState<'upload' | 'mapping'>('upload');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedCsvData | null>(null);
  const [mapping, setMapping] = useState<CsvMappingConfig>({
    dateColumn: '',
    descriptionColumn: '',
    categoryColumn: '',
    typeColumn: '',
    typeHandling: 'column',
    amountColumn: '',
    fallbackCategory: 'General Business'
  });
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processRawText = (rawText: string, fileName = 'uploaded_data.csv') => {
    setError(null);
    try {
      const parsed = parseCsvText(rawText, fileName);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError('No valid rows or headers found in this CSV. Please check formatting.');
        return;
      }
      setParsedData(parsed);
      const guessed = guessInitialMapping(parsed.headers);
      setMapping(guessed);
      setStep('mapping');
    } catch (err) {
      setError(`Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      processRawText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      processRawText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    processRawText(SAMPLE_CSV_TEXT, 'sample_small_business_ledger.csv');
  };

  // Convert preview rows
  const previewTransactions = useMemo(() => {
    if (!parsedData || !mapping.amountColumn || !mapping.dateColumn) return [];
    const previewCount = Math.min(parsedData.rows.length, 5);
    const result: Transaction[] = [];

    for (let i = 0; i < previewCount; i++) {
      const row = parsedData.rows[i];
      const txn = convertRowToTransaction(row, mapping, i, currency.code);
      if (txn) result.push(txn);
    }
    return result;
  }, [parsedData, mapping, currency.code]);

  // Total valid convertable count
  const allParsedTransactions = useMemo(() => {
    if (!parsedData || !mapping.amountColumn || !mapping.dateColumn) return [];
    const list: Transaction[] = [];
    parsedData.rows.forEach((row, i) => {
      const txn = convertRowToTransaction(row, mapping, i, currency.code);
      if (txn) list.push(txn);
    });
    return list;
  }, [parsedData, mapping, currency.code]);

  const handleConfirmImport = () => {
    if (allParsedTransactions.length === 0) {
      setError('No valid transactions could be parsed with current column mappings.');
      return;
    }
    onImport(allParsedTransactions, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep('upload');
    setParsedData(null);
    setPastedText('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {step === 'upload' ? 'Upload & Import CSV Dataset' : 'Map CSV Columns to Transaction Schema'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'upload'
                  ? 'Import transactions from your bank, accounting software, or spreadsheets'
                  : `Mapping columns from ${parsedData?.fileName} (${parsedData?.totalRows} rows detected)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'upload' ? (
            <div className="space-y-4">
              {/* Input mode switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setInputMode('file')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      inputMode === 'file'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Upload CSV File
                  </button>
                  <button
                    onClick={() => setInputMode('paste')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      inputMode === 'paste'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Paste Raw CSV
                  </button>
                </div>

                <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                  <span>Try Sample CSV</span>
                </button>
              </div>

              {inputMode === 'file' ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 scale-[0.99]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs mx-auto flex items-center justify-center mb-3 text-slate-700 dark:text-slate-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                    Click to select or drag and drop your CSV file here
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Supports comma, semicolon, or tab-delimited files exported from QuickBooks, Xero, Stripe, or bank statements.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={7}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste CSV text with header row here...&#10;Date,Description,Category,Type,Amount&#10;2026-10-02,Client Payment,Sales,income,4500.00&#10;2026-10-05,Software Subscriptions,Software,expense,120.00"
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 dark:focus:border-slate-100"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => processRawText(pastedText, 'pasted_data.csv')}
                      disabled={!pastedText.trim()}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 rounded-lg transition-colors"
                    >
                      Parse CSV Text
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mapping View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Detected CSV Columns: {parsedData?.headers.join(', ')}
                </span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Choose Another File</span>
                </button>
              </div>

              {/* Column Mapping Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                {/* Date Column */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Date Column <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={mapping.dateColumn}
                    onChange={e => setMapping(prev => ({ ...prev, dateColumn: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                  >
                    <option value="">Select column...</option>
                    {parsedData?.headers.map(h => (
                      <option key={h} value={h} className="dark:bg-slate-800">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Column */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Amount Column <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={mapping.amountColumn}
                    onChange={e => setMapping(prev => ({ ...prev, amountColumn: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                  >
                    <option value="">Select column...</option>
                    {parsedData?.headers.map(h => (
                      <option key={h} value={h} className="dark:bg-slate-800">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description Column */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Description Column <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={mapping.descriptionColumn}
                    onChange={e => setMapping(prev => ({ ...prev, descriptionColumn: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                  >
                    <option value="">Select column...</option>
                    {parsedData?.headers.map(h => (
                      <option key={h} value={h} className="dark:bg-slate-800">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Column */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Category Column
                  </label>
                  <select
                    value={mapping.categoryColumn}
                    onChange={e => setMapping(prev => ({ ...prev, categoryColumn: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                  >
                    <option value="">(None - use fallback below)</option>
                    {parsedData?.headers.map(h => (
                      <option key={h} value={h} className="dark:bg-slate-800">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Handling Mode */}
                <div className="md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Transaction Type Handling (Income vs Expense)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    <label className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="typeHandling"
                        checked={mapping.typeHandling === 'column'}
                        onChange={() => setMapping(prev => ({ ...prev, typeHandling: 'column' }))}
                        className="text-slate-900 dark:text-white"
                      />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">From Type Column</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Reads income/credit vs expense/debit</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="typeHandling"
                        checked={mapping.typeHandling === 'sign'}
                        onChange={() => setMapping(prev => ({ ...prev, typeHandling: 'sign' }))}
                        className="text-slate-900 dark:text-white"
                      />
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">From Amount Sign</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Negative (-) is Expense, Positive is Income</span>
                      </div>
                    </label>
                  </div>

                  {mapping.typeHandling === 'column' && (
                    <div className="mt-2">
                      <select
                        value={mapping.typeColumn}
                        onChange={e => setMapping(prev => ({ ...prev, typeColumn: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                      >
                        <option value="">Select column identifying Type...</option>
                        {parsedData?.headers.map(h => (
                          <option key={h} value={h} className="dark:bg-slate-800">
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Preview Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Live Preview (First {previewTransactions.length} Mapped Rows)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    ✓ {allParsedTransactions.length} of {parsedData?.totalRows} rows valid
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {previewTransactions.map((t, idx) => {
                        const isIncome = t.type === 'income';
                        return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{t.date}</td>
                            <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                              {t.description}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{t.category}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center gap-1 font-medium ${
                                isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                              }`}>
                                {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {t.type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                              {formatCurrencyValue(t.amount, currency, true)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Mode: Replace vs Append */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Dataset Import Destination
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Choose whether to replace existing transactions or append to the ledger
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                    />
                    <span>Replace All</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                    />
                    <span>Append</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {step === 'mapping' && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={allParsedTransactions.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>
                Import {allParsedTransactions.length} Transactions ({importMode === 'replace' ? 'Replace' : 'Append'})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
