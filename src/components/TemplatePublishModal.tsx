import React, { useState } from 'react';
import { X, Download, Copy, Check, LayoutTemplate, ExternalLink, FileCode2, FileText, FileJson } from 'lucide-react';
import { downloadFile } from '../utils/generator';

interface TemplatePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
}

type PublishTab = 'listing' | 'markdown' | 'manifest' | 'preview';

export const TemplatePublishModal: React.FC<TemplatePublishModalProps> = ({
  isOpen,
  onClose,
  appName
}) => {
  const [activeTab, setActiveTab] = useState<PublishTab>('listing');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const templateTitle = 'Analytics Dashboard Template';
  const templateSummary =
    'Data-rich admin interface with chart modules, KPI widgets and responsive layouts built in React and TypeScript.';

  const listingCopy = `${templateTitle}\n${templateSummary}\n\nPowered by ${appName} · Built with React 19, TypeScript, Tailwind CSS v4, Vite & Express.\n\nIncluded Modules:\n- Period-over-Period KPI Metric Widgets (tabular numerals, trend deltas)\n- Interactive SVG Cash Flow Trajectory & Category Dominance Charts\n- Collapsible Left Navigation Sidebar & Responsive Mobile Drawer\n- High-Density Transaction Ledger with Multi-Faceted Filters & Anomaly Detection\n- CSV Mapping Importer, Multi-Currency Engine & Print-Ready PDF Reports`;

  const publishMarkdown = `# ${templateTitle}

**${templateSummary}**

---

## Overview

**${templateTitle}** (${appName}) is a production-ready React 19 + TypeScript + Tailwind CSS v4 admin and financial analytics template featuring modular chart components, period-over-period KPI widgets, high-density data tables, and responsive navigation layouts.

## Key Modules
- **KPI Widgets (\`MetricCards.tsx\`)**: 4-column metric strip with tabular numerals and automated prior-period delta indicators.
- **Chart Modules (\`FinancialCharts.tsx\`)**: Interactive SVG cash flow trajectory chart and category share breakdown bars.
- **Collapsible Navigation (\`Sidebar.tsx\`, \`Header.tsx\`)**: Sticky desktop sidebar toggling between expanded (\`256px\`) and icon-rail (\`72px\`) widths plus mobile slide-over drawer.
- **Data Grid & Filtering (\`TransactionTable.tsx\`, \`FilterToolbar.tsx\`)**: Search, date range, category, type, and statistical anomaly filtering with bulk actions.
- **Reporting & Ingestion (\`FinancialReportModal.tsx\`, \`CsvUploadModal.tsx\`)**: CSV column mapper, JSON/CSV exporters, and print-ready PDF executive reports.
- **Light & High-Contrast Dark Mode**: Synchronized Tailwind v4 \`@custom-variant dark\` theme switching.

## Quick Start
\`\`\`bash
npm install
npm run dev
npm run build
npm start
\`\`\`

## Publishing Metadata
- **Title:** ${templateTitle}
- **Description:** ${templateSummary}
- **Standalone Showcase:** \`/analytics-dashboard-template.html\`
- **Manifest:** \`/template-manifest.json\`
`;

  const manifestJson = JSON.stringify(
    {
      title: templateTitle,
      shortDescription: templateSummary,
      version: '1.0.0',
      category: 'SaaS & Admin Dashboards',
      stack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Vite', 'Express', 'Lucide Icons'],
      features: [
        'Responsive collapsible left sidebar and mobile slide-over drawer',
        'KPI widgets with automated period-over-period delta indicators',
        'Interactive SVG cumulative cash flow chart and category dominance bars',
        'High-density transaction ledger with search, date filters, and bulk actions',
        'Statistical anomaly detection and one-click normalization',
        'Multi-currency support, CSV mapping importer, and print-ready PDF reports',
        'Light and high-contrast dark mode themes'
      ],
      tags: [
        'react',
        'typescript',
        'analytics-dashboard',
        'admin-template',
        'kpi-widgets',
        'charts',
        'tailwindcss',
        'responsive-layout'
      ],
      entryPoints: {
        application: '/',
        standaloneShowcase: '/analytics-dashboard-template.html'
      }
    },
    null,
    2
  );

  const getActiveText = () => {
    if (activeTab === 'markdown') return publishMarkdown;
    if (activeTab === 'manifest') return manifestJson;
    return listingCopy;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    downloadFile(publishMarkdown, 'ANALYTICS_DASHBOARD_TEMPLATE.md', 'text/markdown');
  };

  const handleDownloadManifest = () => {
    downloadFile(manifestJson, 'template-manifest.json', 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-xs shrink-0">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Analytics Dashboard Template — Standalone Publishing Kit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Separate showcase page, marketplace copy, README, and manifest for publishing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close publishing modal"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 shrink-0">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('listing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'listing'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Listing Copy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'markdown'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Publish README (.md)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manifest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'manifest'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Manifest (.json)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Standalone Preview</span>
            </button>
          </div>

          <a
            href="/analytics-dashboard-template.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Standalone Page</span>
          </a>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {activeTab === 'preview' ? (
            <iframe
              src="/analytics-dashboard-template.html"
              title="Analytics Dashboard Template Standalone Preview"
              className="w-full h-[520px] border-0 bg-white dark:bg-slate-950"
            />
          ) : (
            <div className="p-6">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                {getActiveText()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            {activeTab !== 'preview' && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Content'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadManifest}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .JSON</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>
            <a
              href="/analytics-dashboard-template.html"
              download="analytics-dashboard-template.html"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Standalone .HTML</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
