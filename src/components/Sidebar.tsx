import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  PieChart,
  Code2,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import type { AppTab } from './Header';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  appName: string;
  appIcon: string;
  appLogoUrl?: string | null;
  appLogoFit?: 'cover' | 'contain';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isOwnerUnlocked: boolean;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'primary' | 'system';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'primary' },
  { id: 'analytics', label: 'Analytics', icon: Calendar, group: 'primary' },
  { id: 'categories', label: 'Categories', icon: PieChart, group: 'primary' },
  { id: 'json', label: 'JSON Dataset', icon: Code2, group: 'system' },
  { id: 'schema', label: 'Schema Specs', icon: BookOpen, group: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'system' }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  appName,
  appIcon,
  appLogoUrl,
  appLogoFit = 'cover',
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  isOwnerUnlocked
}) => {
  const displayTitle = appName || 'Asetech Bookkeeping';
  const primaryItems = NAV_ITEMS.filter(item => item.group === 'primary');
  const systemItems = NAV_ITEMS.filter(
    item =>
      item.group === 'system' &&
      (isOwnerUnlocked || (item.id !== 'json' && item.id !== 'schema'))
  );

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const renderBrandMark = () => {
    if (appLogoUrl) {
      return (
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
          <img
            src={appLogoUrl}
            alt={`${displayTitle} logo`}
            referrerPolicy="no-referrer"
            className={`w-full h-full ${appLogoFit === 'contain' ? 'object-contain p-0.5' : 'object-cover'}`}
          />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs shrink-0">
        {appIcon || 'AB'}
      </div>
    );
  };

  const renderNavButton = (item: NavItem, collapsed: boolean, mobile = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelectTab(item.id)}
        title={collapsed ? item.label : undefined}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        className={`w-full flex items-center ${
          collapsed ? 'justify-center px-2' : 'gap-3 px-3'
        } ${
          mobile ? 'min-h-[44px]' : 'min-h-[40px]'
        } rounded-lg text-[13px] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-emerald-500 ${
          isActive
            ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white dark:ring-1 dark:ring-emerald-500/40 font-semibold shadow-2xs'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 ${
            isActive
              ? 'text-white dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        aria-label="Sidebar"
        className={`hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-[width] duration-150 ease-out z-30 ${
          isCollapsed ? 'md:w-[72px]' : 'md:w-64'
        }`}
      >
        {/* Top of Sidebar: Logo, Name & Collapse Control */}
        <div
          className={`border-b border-slate-200 dark:border-slate-800 shrink-0 ${
            isCollapsed
              ? 'px-2 py-3 flex flex-col items-center gap-2.5'
              : 'h-16 px-4 flex items-center justify-between gap-2'
          }`}
        >
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            title={displayTitle}
            className={`flex items-center gap-2.5 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-emerald-500 ${
              isCollapsed ? 'justify-center' : 'min-w-0 flex-1'
            }`}
          >
            {renderBrandMark()}
            {!isCollapsed && (
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {displayTitle}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-emerald-500"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Menus */}
        <nav
          aria-label="Primary Navigation"
          className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2.5' : 'px-3'} space-y-1`}
        >
          {primaryItems.map(item => renderNavButton(item, isCollapsed))}

          <div className="my-3 border-t border-slate-200/80 dark:border-slate-800/80" />

          {systemItems.map(item => renderNavButton(item, isCollapsed))}
        </nav>
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-150 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
          onClick={onCloseMobile}
        />

        <aside
          aria-label="Mobile Navigation"
          className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl transform transition-transform duration-150 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
            >
              {renderBrandMark()}
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {displayTitle}
              </span>
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav aria-label="Mobile Primary Navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
            {primaryItems.map(item => renderNavButton(item, false, true))}

            <div className="my-3 border-t border-slate-200/80 dark:border-slate-800/80" />

            {systemItems.map(item => renderNavButton(item, false, true))}
          </nav>
        </aside>
      </div>
    </>
  );
};
