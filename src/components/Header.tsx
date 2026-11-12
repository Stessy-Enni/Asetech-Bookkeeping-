import React from 'react';
import { Download, Code2, LayoutDashboard, BookOpen, Sun, Moon, Calendar, PieChart, Settings } from 'lucide-react';

export type AppTab = 'dashboard' | 'analytics' | 'categories' | 'json' | 'schema' | 'settings';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onExportClick: () => void;
  transactionCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  appName: string;
  appIcon: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportClick,
  transactionCount,
  isDarkMode,
  onToggleDarkMode,
  appName,
  appIcon
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single brand wordmark with customizable icon */}
      <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
          {appIcon || 'AB'}
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
          {appName || 'Asetech Bookkeeping'}
        </span>
      </div>

      {/* Zone 2: Navigation links / menus */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'dashboard'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-emerald-500 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'analytics'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-emerald-500 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'categories'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-emerald-500 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Categories</span>
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'json'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-emerald-500 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>JSON Dataset</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'schema'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-emerald-500 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Schema Specs</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'settings'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-emerald-500 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action + dark mode toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile / Tablet quick navigation buttons with names */}
        <div className="flex md:hidden items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-2xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dash</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 shadow-2xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            title="Analytics"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${activeTab === 'categories' ? 'bg-white dark:bg-slate-700 shadow-2xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            title="Categories"
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow-2xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Dark Mode High-Contrast Toggle Button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
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
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white active:bg-slate-950 transition-colors whitespace-nowrap shrink-0 shadow-xs rounded-lg"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export ({transactionCount})</span>
        </button>
      </div>
    </header>
  );
};
