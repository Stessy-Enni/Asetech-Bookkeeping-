import React from 'react';
import { Download, Sun, Moon, Menu } from 'lucide-react';

export type AppTab = 'dashboard' | 'analytics' | 'categories' | 'json' | 'schema' | 'settings';

const TAB_LABELS: Record<AppTab, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  categories: 'Categories',
  json: 'JSON Dataset',
  schema: 'Schema Specs',
  settings: 'Settings'
};

interface HeaderProps {
  activeTab: AppTab;
  onExportClick: () => void;
  transactionCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileMenu: () => void;
  appName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onExportClick,
  transactionCount,
  isDarkMode,
  onToggleDarkMode,
  onOpenMobileMenu,
  appName
}) => {
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left Zone: Mobile menu trigger + Contextual Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
            {appName || 'Asetech Bookkeeping'}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700" aria-hidden="true">
            /
          </span>
          <h1 className="font-semibold text-slate-900 dark:text-white whitespace-nowrap truncate">
            {TAB_LABELS[activeTab]}
          </h1>
        </div>
      </div>

      {/* Right Zone: Theme Toggle + Primary Export Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to high-contrast dark mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        <button
          type="button"
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white active:bg-slate-950 transition-colors whitespace-nowrap shrink-0 shadow-xs rounded-lg"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export ({transactionCount})</span>
        </button>
      </div>
    </header>
  );
};

