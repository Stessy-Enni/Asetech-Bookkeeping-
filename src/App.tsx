import React, { useState, useMemo, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionTable } from './components/TransactionTable';
import { FilterToolbar } from './components/FilterToolbar';
import { JsonViewer } from './components/JsonViewer';
import { SchemaDocs } from './components/SchemaDocs';
import { PresetSelector } from './components/PresetSelector';
import { AddEditTransactionModal } from './components/AddEditTransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { ExportModal } from './components/ExportModal';
import { CsvUploadModal } from './components/CsvUploadModal';
import { FinancialReportModal } from './components/FinancialReportModal';
import { SettingsView } from './components/SettingsView';
import { CustomCurrencyModal } from './components/CustomCurrencyModal';
import { EvaluationSummaryModal } from './components/EvaluationSummaryModal';
import { TemplatePublishModal } from './components/TemplatePublishModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { INITIAL_TRANSACTIONS, BUSINESS_PRESETS } from './data/defaultTransactions';
import { Transaction, BusinessPreset, FilterCriteria, CurrencyConfig, SUPPORTED_CURRENCIES, BusinessProfile } from './types';
import {
  calculateMetrics,
  calculateMonthlySummaries,
  generateRandomTransactions,
  filterTransactions
} from './utils/generator';
import { detectUnusualTransactions } from './utils/anomalyDetector';
import { calculatePeriodComparison } from './utils/periodComparison';

const STORAGE_KEYS = {
  TRANSACTIONS: 'fd_transactions_data',
  PRESET: 'fd_active_preset_id',
  CURRENCY: 'fd_selected_currency_code',
  CUSTOM_CURRENCY: 'fd_custom_currency',
  THEME: 'theme',
  APP_NAME: 'fd_app_name',
  APP_ICON: 'fd_app_icon',
  BUSINESS_PROFILE: 'fd_business_profile'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('fd_sidebar_collapsed') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fd_sidebar_collapsed', String(isSidebarCollapsed));
      } catch {}
    }
  }, [isSidebarCollapsed]);

  // Customizable App Name and Icon
  const [appName, setAppName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.APP_NAME) || 'Asetech Bookkeeping';
      } catch {
        return 'Asetech Bookkeeping';
      }
    }
    return 'Asetech Bookkeeping';
  });

  const [appIcon, setAppIcon] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.APP_ICON) || 'AB';
      } catch {
        return 'AB';
      }
    }
    return 'AB';
  });

  // Owner-customized image logo (fetched from server; clients see it but cannot upload/modify)
  const [appLogoUrl, setAppLogoUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('fd_app_logo_url');
      } catch {
        return null;
      }
    }
    return null;
  });
  const [appLogoFit, setAppLogoFit] = useState<'cover' | 'contain'>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('fd_app_logo_fit') === 'contain' ? 'contain' : 'cover';
      } catch {
        return 'cover';
      }
    }
    return 'cover';
  });
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [hasOwnerPasscode, setHasOwnerPasscode] = useState<boolean>(false);
  const [envManagedPasscode, setEnvManagedPasscode] = useState<boolean>(false);
  const [autoOpenOwnerUnlock, setAutoOpenOwnerUnlock] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const syncBrandingAndSession = async () => {
      try {
        const res = await fetch('/api/branding');
        if (res.ok && active) {
          const data = await res.json();
          if (typeof data.appName === 'string' && data.appName.trim()) {
            setAppName(data.appName.trim());
          }
          if (typeof data.appIcon === 'string' && data.appIcon.trim()) {
            setAppIcon(data.appIcon.trim());
          }
          setAppLogoUrl(data.appLogoDataUrl ?? null);
          setAppLogoFit(data.appLogoFit === 'contain' ? 'contain' : 'cover');
          setHasOwnerPasscode(Boolean(data.hasOwnerPasscode));
          setEnvManagedPasscode(Boolean(data.envManaged));
          try {
            if (data.appLogoDataUrl) {
              localStorage.setItem('fd_app_logo_url', data.appLogoDataUrl);
            } else {
              localStorage.removeItem('fd_app_logo_url');
            }
            localStorage.setItem('fd_app_logo_fit', data.appLogoFit === 'contain' ? 'contain' : 'cover');
          } catch {}
        }
      } catch (err) {
        console.warn('Could not fetch server branding:', err);
      }

      if (typeof window !== 'undefined' && active) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === '1' || params.get('owner') === '1') {
          setActiveTab('settings');
          setAutoOpenOwnerUnlock(true);
        }
      }
    };
    syncBrandingAndSession();
    return () => {
      active = false;
    };
  }, []);

  const handleUnlockOwner = (token: string) => {
    setOwnerToken(token);
    setHasOwnerPasscode(true);
    showToast('Admin Access unlocked');
  };

  const handleLockOwner = async () => {
    const current = ownerToken;
    setOwnerToken(null);
    if (current) {
      try {
        await fetch('/api/owner/lock', {
          method: 'POST',
          headers: { Authorization: `Bearer ${current}` }
        });
      } catch {}
    }
    showToast('Locked to User View');
  };

  const handleSaveBrandingSettings = async (nextName: string, nextIcon: string) => {
    if (!ownerToken) {
      throw new Error('Admin authorization required.');
    }
    const res = await fetch('/api/branding/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        appName: nextName.trim(),
        appIcon: nextIcon.trim()
      })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        handleLockOwner();
      }
      throw new Error(data.error || 'Failed to save application branding.');
    }
    if (typeof data.appName === 'string') setAppName(data.appName);
    if (typeof data.appIcon === 'string') setAppIcon(data.appIcon);
    showToast('Application branding updated for all users');
  };

  useEffect(() => {
    if (!ownerToken && (activeTab === 'json' || activeTab === 'schema')) {
      setActiveTab('dashboard');
    }
  }, [ownerToken, activeTab]);

  const handleLogoUpdated = (logoUrl: string | null, fit: 'cover' | 'contain') => {
    setAppLogoUrl(logoUrl);
    setAppLogoFit(fit);
    try {
      if (logoUrl) {
        localStorage.setItem('fd_app_logo_url', logoUrl);
      } else {
        localStorage.removeItem('fd_app_logo_url');
      }
      localStorage.setItem('fd_app_logo_fit', fit);
    } catch {}
  };

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILE);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      name: 'Summit Mechanical Services LLC',
      legalEntity: 'LLC (Limited Liability Company)',
      taxId: 'EIN 45-8923412',
      industry: 'Commercial & Residential Services',
      email: 'billing@summithvac.com',
      phone: '+1 (555) 382-9100',
      address: '742 Industrial Parkway, Austin, TX 78745',
      fiscalYearStart: 'January'
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.APP_NAME, appName);
        document.title = appName;
      } catch (err) {
        console.warn('Failed to save app name', err);
      }
    }
  }, [appName]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.APP_ICON, appIcon);
      } catch (err) {
        console.warn('Failed to save app icon', err);
      }
    }
  }, [appIcon]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(businessProfile));
      } catch (err) {
        console.warn('Failed to persist business profile', err);
      }
    }
  }, [businessProfile]);

  // Load transactions from localStorage or fallback to default preset
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to load saved transactions from localStorage', err);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [activePresetId, setActivePresetId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.PRESET) || 'tech-agency';
      } catch {
        return 'tech-agency';
      }
    }
    return 'tech-agency';
  });

  const [customPresets, setCustomPresets] = useState<BusinessPreset[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fd_custom_presets');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fd_custom_presets', JSON.stringify(customPresets));
      } catch (err) {
        console.warn('Failed to save custom presets', err);
      }
    }
  }, [customPresets]);

  const allPresets = useMemo(() => {
    return [...BUSINESS_PRESETS, ...customPresets];
  }, [customPresets]);

  const handleAddCustomPreset = (newPreset: BusinessPreset) => {
    setCustomPresets(prev => [...prev, newPreset]);
    setActivePresetId(newPreset.id);
    setTransactions(newPreset.transactions);
    showToast(`Created and applied custom archetype "${newPreset.name}"`);
  };

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCode = localStorage.getItem(STORAGE_KEYS.CURRENCY);
        if (savedCode === 'CUSTOM') {
          const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_CURRENCY);
          if (savedCustom) {
            return JSON.parse(savedCustom);
          }
        }
        if (savedCode) {
          const match = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
          if (match) return match;
        }
      } catch {
        return SUPPORTED_CURRENCIES[0];
      }
    }
    return SUPPORTED_CURRENCIES[0];
  });

  // Auto-save transactions to localStorage every time a modification is made
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      } catch (err) {
        console.warn('Failed to auto-save transactions to localStorage', err);
      }
    }
  }, [transactions]);

  // Persist preset preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.PRESET, activePresetId);
      } catch (err) {
        console.warn('Failed to persist active preset to localStorage', err);
      }
    }
  }, [activePresetId]);

  // Persist currency preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const isStandard = SUPPORTED_CURRENCIES.some(c => c.code === selectedCurrency.code && c.code !== 'CUSTOM');
        if (isStandard) {
          localStorage.setItem(STORAGE_KEYS.CURRENCY, selectedCurrency.code);
        } else {
          localStorage.setItem(STORAGE_KEYS.CURRENCY, 'CUSTOM');
          localStorage.setItem(STORAGE_KEYS.CUSTOM_CURRENCY, JSON.stringify(selectedCurrency));
        }
      } catch (err) {
        console.warn('Failed to persist active currency to localStorage', err);
      }
    }
  }, [selectedCurrency]);

  // Dark mode theme state with localStorage & system preference fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync theme changes to <html> class and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  // Filter criteria state
  const [filters, setFilters] = useState<FilterCriteria>({
    searchKeyword: '',
    startDate: '',
    endDate: '',
    category: 'all',
    type: 'all',
    unusualOnly: false
  });

  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCustomCurrencyModalOpen, setIsCustomCurrencyModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [inspectingTransaction, setInspectingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Anomaly detection map for all transactions
  const anomalyMap = useMemo(() => {
    return detectUnusualTransactions(transactions, selectedCurrency);
  }, [transactions, selectedCurrency]);

  const anomalyIds = useMemo(() => {
    return new Set(anomalyMap.keys());
  }, [anomalyMap]);

  // Derived filtered transactions (including unusualOnly check)
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters, anomalyIds);
  }, [transactions, filters, anomalyIds]);

  const isFiltered = useMemo(() => {
    return (
      filters.searchKeyword.trim() !== '' ||
      filters.startDate !== '' ||
      filters.endDate !== '' ||
      filters.category !== 'all' ||
      filters.type !== 'all' ||
      Boolean(filters.unusualOnly)
    );
  }, [filters]);

  // Period comparison mode when no explicit date filter is active ('latestMonth' or 'fullPeriod')
  const [unfilteredCompareMode, setUnfilteredCompareMode] = useState<'latestMonth' | 'fullPeriod'>('latestMonth');

  const isDateFiltered = Boolean(filters.startDate || filters.endDate);

  // Metrics and monthly summaries (using active currency)
  const activeMetrics = useMemo(() => {
    return calculateMetrics(filteredTransactions);
  }, [filteredTransactions]);

  // Period-over-period comparison metrics and trends
  const periodComparison = useMemo(() => {
    return calculatePeriodComparison(
      transactions,
      filteredTransactions,
      filters,
      selectedCurrency,
      anomalyIds,
      unfilteredCompareMode
    );
  }, [transactions, filteredTransactions, filters, selectedCurrency, anomalyIds, unfilteredCompareMode]);

  const monthlySummaries = useMemo(() => {
    return calculateMonthlySummaries(transactions, selectedCurrency.code);
  }, [transactions, selectedCurrency.code]);

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fd_custom_categories');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fd_custom_categories', JSON.stringify(customCategories));
      } catch (err) {
        console.warn('Failed to save custom categories', err);
      }
    }
  }, [customCategories]);

  // Distinct categories available in dataset + custom categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    customCategories.forEach(c => set.add(c));
    return Array.from(set).sort();
  }, [transactions, customCategories]);

  const handleAddCategory = (name: string) => {
    if (!customCategories.includes(name)) {
      setCustomCategories(prev => [...prev, name]);
      showToast(`Added category "${name}"`);
    } else {
      showToast(`Category "${name}" already exists`);
    }
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    setTransactions(prev =>
      prev.map(t => (t.category === oldName ? { ...t, category: newName } : t))
    );
    setCustomCategories(prev => prev.map(c => (c === oldName ? newName : c)));
    showToast(`Renamed category "${oldName}" to "${newName}" across transactions`);
  };

  const handleDeleteCategory = (name: string) => {
    setCustomCategories(prev => prev.filter(c => c !== name));
    showToast(`Removed category "${name}"`);
  };

  // Distinct months in dataset
  const availableMonths = useMemo(() => {
    return monthlySummaries.map(m => m.month);
  }, [monthlySummaries]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCurrencyChange = (newCurrency: CurrencyConfig) => {
    setSelectedCurrency(newCurrency);
    showToast(`Currency updated to ${newCurrency.name}`);
  };

  const handleSaveCustomCurrency = (custom: CurrencyConfig) => {
    setSelectedCurrency(custom);
    showToast(`Custom currency ${custom.code} (${custom.symbol}) applied`);
  };

  const handleSelectPreset = (preset: BusinessPreset) => {
    setActivePresetId(preset.id);
    setTransactions(preset.transactions);
    setFilters({
      searchKeyword: '',
      startDate: '',
      endDate: '',
      category: 'all',
      type: 'all',
      unusualOnly: false
    });
    showToast(`Loaded ${preset.name} (${preset.transactions.length} transactions)`);
  };

  const handleResetToSample = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setActivePresetId('tech-agency');
    showToast('Reset dataset to sample bookkeeping records');
  };

  const handleGenerateRandom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const freshBatch = generateRandomTransactions(10, true, selectedCurrency.code);
      setTransactions(freshBatch);
      setActivePresetId('custom');
      setIsGenerating(false);
      setFilters({
        searchKeyword: '',
        startDate: '',
        endDate: '',
        category: 'all',
        type: 'all',
        unusualOnly: false
      });
      showToast(`Generated 10 multi-month transactions in ${selectedCurrency.code}`);
    }, 250);
  };

  const handleFilterChange = (updated: Partial<FilterCriteria>) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchKeyword: '',
      startDate: '',
      endDate: '',
      category: 'all',
      type: 'all',
      unusualOnly: false
    });
    showToast('Filters reset to show all transactions');
  };

  const handleSelectMonthFilter = (month: string) => {
    if (month === 'all') {
      setFilters(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: `${month}-01`,
        endDate: `${month}-31`
      }));
    }
  };

  const activeSelectedMonth = useMemo(() => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate.startsWith(filters.endDate.substring(0, 7))
    ) {
      return filters.startDate.substring(0, 7);
    }
    return undefined;
  }, [filters.startDate, filters.endDate]);

  const handleSaveTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev =>
        prev.map(t => (t.id === transaction.id ? transaction : t))
      );
      showToast('Transaction updated successfully');
    } else {
      setTransactions(prev => [transaction, ...prev]);
      showToast('New transaction added to dataset');
    }
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id && updated.id && t.id === updated.id) return updated;
        if (!t.id && !updated.id && t.description === updated.description && t.date === updated.date) return updated;
        return t;
      })
    );
    setInspectingTransaction(updated);
    showToast(`Normalized "${updated.description}"`);
  };

  const handleDeleteTransaction = (id?: string) => {
    if (!id) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed from dataset');
  };

  const handleBulkDelete = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const count = ids.length;
    setTransactions(prev => prev.filter(t => !t.id || !ids.includes(t.id)));
    showToast(`Bulk deleted ${count} ${count === 1 ? 'transaction' : 'transactions'}`);
  };

  const handleImportCsv = (importedTransactions: Transaction[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setTransactions(importedTransactions);
      setActivePresetId('custom');
      showToast(`Replaced dataset with ${importedTransactions.length} imported CSV transactions`);
    } else {
      setTransactions(prev => [...prev, ...importedTransactions]);
      showToast(`Appended ${importedTransactions.length} CSV transactions to dataset`);
    }
  };

  const inspectedAnomaly = useMemo(() => {
    if (!inspectingTransaction) return undefined;
    const id = inspectingTransaction.id || `${inspectingTransaction.date}-${inspectingTransaction.description}`;
    return anomalyMap.get(id);
  }, [inspectingTransaction, anomalyMap]);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Collapsible Left Sidebar with Logo, App Name & Menus */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appName={appName}
        appIcon={appIcon}
        appLogoUrl={appLogoUrl}
        appLogoFit={appLogoFit}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isOwnerUnlocked={Boolean(ownerToken)}
      />

      {/* Right Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Streamlined Top Workspace Bar */}
        <Header
          activeTab={activeTab}
          onExportClick={() => setIsExportModalOpen(true)}
          transactionCount={transactions.length}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          appName={appName}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Archetype, Currency, CSV Upload & Generator Toolbar (shown on dashboard & analytics) */}
        {activeTab !== 'settings' && (
          <PresetSelector
            presets={allPresets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onGenerateRandom={handleGenerateRandom}
            isGenerating={isGenerating}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            onImportCsvClick={() => setIsCsvModalOpen(true)}
            onOpenReportClick={() => setIsReportModalOpen(true)}
            onOpenCustomCurrency={() => setIsCustomCurrencyModalOpen(true)}
          />
        )}

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Search and Filtering Toolbar with Anomaly Outlier filter */}
            <FilterToolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              categories={availableCategories}
              totalCount={transactions.length}
              filteredCount={filteredTransactions.length}
              availableMonths={availableMonths}
              unusualCount={anomalyMap.size}
            />

            {/* KPI Metric Cards with Period-over-Period Trend Indicators */}
            <MetricCards
              metrics={activeMetrics}
              currency={selectedCurrency}
              periodComparison={periodComparison}
              unfilteredMode={unfilteredCompareMode}
              onToggleUnfilteredMode={() =>
                setUnfilteredCompareMode(prev => (prev === 'latestMonth' ? 'fullPeriod' : 'latestMonth'))
              }
              isDateFiltered={isDateFiltered}
              onOpenReportClick={() => setIsReportModalOpen(true)}
            />

            {/* Monthly Summary Statistics Cards */}
            <MonthlySummaryCards
              monthlySummaries={monthlySummaries}
              currency={selectedCurrency}
              onSelectMonth={handleSelectMonthFilter}
              activeSelectedMonth={activeSelectedMonth}
            />

            {/* Visual Charts: Cash Flow Timeline & Categories */}
            <FinancialCharts transactions={filteredTransactions} currency={selectedCurrency} />

            {/* High-Density Data Grid / Transaction Table with Bulk Delete, CSV Upload & Warning Indicators */}
            <TransactionTable
              transactions={filteredTransactions}
              totalUnfilteredCount={transactions.length}
              currency={selectedCurrency}
              anomalyMap={anomalyMap}
              onAddClick={() => {
                setEditingTransaction(null);
                setIsAddEditModalOpen(true);
              }}
              onImportCsvClick={() => setIsCsvModalOpen(true)}
              onEditClick={t => {
                setEditingTransaction(t);
                setIsAddEditModalOpen(true);
              }}
              onDeleteClick={handleDeleteTransaction}
              onBulkDeleteClick={handleBulkDelete}
              onSelectTransaction={t => setInspectingTransaction(t)}
              onResetFilters={isFiltered ? handleResetFilters : undefined}
            />
          </div>
        )}

        {/* Tab 2: Monthly Analytics Page */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Monthly Analytics & Cash Flow Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed monthly income, expenditure, and net profit breakdowns across all periods.
              </p>
            </div>

            <MonthlySummaryCards
              monthlySummaries={monthlySummaries}
              currency={selectedCurrency}
              onSelectMonth={month => {
                handleSelectMonthFilter(month);
                setActiveTab('dashboard');
              }}
              activeSelectedMonth={activeSelectedMonth}
            />

            <FinancialCharts transactions={transactions} currency={selectedCurrency} />
          </div>
        )}

        {/* Tab 3: Categories & Dominance Page */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Category Dominance & Summary Report
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Analyze spending velocity, category wallet share, and generate comprehensive intelligence reports.
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Open Full Analysis Report
              </button>
            </div>

            <FinancialCharts transactions={transactions} currency={selectedCurrency} />
          </div>
        )}

        {/* Tab 4: JSON Dataset View (Owner Only) */}
        {activeTab === 'json' && ownerToken && (
          <div className="space-y-4">
            <JsonViewer
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              isFiltered={isFiltered}
              currency={selectedCurrency}
            />
          </div>
        )}

        {/* Tab 5: Schema & API Specs (Owner Only) */}
        {activeTab === 'schema' && ownerToken && (
          <div className="space-y-4">
            <SchemaDocs />
          </div>
        )}

        {/* Tab 6: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            appName={appName}
            appIcon={appIcon}
            onSaveBrandingSettings={handleSaveBrandingSettings}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            transactionCount={transactions.length}
            onResetData={handleResetToSample}
            onOpenCustomCurrency={() => setIsCustomCurrencyModalOpen(true)}
            businessProfile={businessProfile}
            onUpdateBusinessProfile={setBusinessProfile}
            presets={allPresets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onAddCustomPreset={handleAddCustomPreset}
            categories={availableCategories}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            currentTransactions={transactions}
            onOpenEvalModal={() => setIsEvalModalOpen(true)}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            appLogoUrl={appLogoUrl}
            appLogoFit={appLogoFit}
            ownerToken={ownerToken}
            hasOwnerPasscode={hasOwnerPasscode}
            envManagedPasscode={envManagedPasscode}
            onUnlockOwner={handleUnlockOwner}
            onLockOwner={handleLockOwner}
            onLogoUpdated={handleLogoUpdated}
            autoOpenOwnerUnlock={autoOpenOwnerUnlock}
            onDismissAutoOpenOwnerUnlock={() => setAutoOpenOwnerUnlock(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{appName}</span>
          <span aria-hidden="true">·</span>
          <span>Active Currency: {selectedCurrency.name}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Auto-saved locally
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>{transactions.length} transactions</span>
          <span aria-hidden="true">·</span>
          <span>{monthlySummaries.length} monthly summaries</span>
          <span aria-hidden="true">·</span>
          <span>{anomalyMap.size} unusual flagged</span>
        </div>
      </footer>
      </div>

      {/* Modals */}
      <CustomCurrencyModal
        isOpen={isCustomCurrencyModalOpen}
        onClose={() => setIsCustomCurrencyModalOpen(false)}
        onSaveCustomCurrency={handleSaveCustomCurrency}
        currentCurrency={selectedCurrency}
      />
      <AddEditTransactionModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        existingCategories={availableCategories}
        currency={selectedCurrency}
      />

      <TransactionDetailModal
        transaction={inspectingTransaction}
        onClose={() => setInspectingTransaction(null)}
        currency={selectedCurrency}
        anomaly={inspectedAnomaly}
        availableCategories={availableCategories}
        onUpdateTransaction={handleUpdateTransaction}
      />

      <FinancialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={filteredTransactions}
        allTransactions={transactions}
        currency={selectedCurrency}
        isFiltered={isFiltered}
        businessProfile={businessProfile}
        appLogoUrl={appLogoUrl}
        appLogoFit={appLogoFit}
        appName={appName}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={isFiltered ? filteredTransactions : transactions}
        currency={selectedCurrency}
      />

      {/* CSV Upload & Mapping Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportCsv}
        currency={selectedCurrency}
      />

      <EvaluationSummaryModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        appName={appName}
      />

      <TemplatePublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        appName={appName}
      />

      <AIChatDrawer
        transactions={transactions}
        currency={selectedCurrency}
        appName={appName}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 dark:border-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
