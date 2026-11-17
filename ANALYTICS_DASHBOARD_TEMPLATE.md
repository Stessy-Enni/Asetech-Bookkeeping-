# Analytics Dashboard Template

**Data-rich admin interface with chart modules, KPI widgets and responsive layouts built in React and TypeScript.**

---

## Overview

**Analytics Dashboard Template** (powered by **Asetech Bookkeeping**) is a production-ready React 19 + TypeScript + Tailwind CSS v4 admin and financial analytics interface designed for multi-industry operations, executive reporting, and interactive dataset exploration.

It pairs high-density tabular data grids and SVG-native chart modules with period-over-period KPI widgets, a collapsible navigation shell, light/dark themes, CSV data ingestion, and print-ready PDF executive reporting.

---

## Key Modules & Capabilities

### 1. KPI Widgets & Period-over-Period Telemetry (`MetricCards.tsx`)
- **Four Core KPI Cards**: Gross Income, Operating Expenses, Net Profit Margin, and Average Transaction Size with `tabular-nums` alignment.
- **Contextual Trend Indicators**: Automated period-over-period percentage deltas comparing the active date range or latest month against the equivalent prior timeframe, with domain-aware favorable/unfavorable color + icon semantics.
- **Monthly Summary Strip (`MonthlySummaryCards.tsx`)**: Interactive month-by-month performance cards that cross-filter the dashboard ledger on click.

### 2. Interactive Chart Modules (`FinancialCharts.tsx`)
- **Cumulative Cash Flow Trajectory**: Responsive SVG line and zero-baseline chart tracking sequential net balance movement with hover inspection tooltips.
- **Category Dominance & Wallet Share**: Proportional horizontal breakdown bars separating income and expense categories with transaction counts and percentage shares.

### 3. Responsive Admin Layout & Collapsible Navigation (`Sidebar.tsx`, `Header.tsx`)
- **Collapsible Left Rail**: Sticky desktop sidebar toggling smoothly between expanded (`256px`) and icon-rail (`72px`) widths with persisted state in `localStorage`.
- **Mobile Slide-Over Drawer**: Touch-friendly slide-over navigation drawer (`>= 44px` hit targets) triggered from a streamlined top breadcrumb bar.
- **High-Contrast Dual Theme**: Full Light and Dark mode switching using Tailwind CSS v4 `@custom-variant dark` and synchronized `<html>` theme state.

### 4. High-Density Ledger & Data Workflows (`TransactionTable.tsx`, `FilterToolbar.tsx`)
- **Multi-Faceted Filtering**: Live keyword search, date range presets, category and transaction-type filters, plus an anomaly outlier filter.
- **Anomaly Detection & Normalization**: Statistical outlier detection (`anomalyDetector.ts`) flagging unusual deviations with one-click category/amount normalization.
- **CSV Import & Multi-Format Export**: Interactive column-mapping CSV uploader (`CsvUploadModal.tsx`) and JSON/CSV payload exporter (`ExportModal.tsx`).
- **Executive Print / PDF Reports (`FinancialReportModal.tsx`)**: Dedicated print media stylesheet producing clean paper/PDF financial summaries.

### 5. Business Customization & Optional Server Extensions
- **8 Industry Archetypes + Custom Builder**: Pre-loaded charts of accounts for agencies, retail, e-commerce, trades, real estate, healthcare, creative studios, and solo practitioners.
- **Multi-Currency Engine**: Built-in global currencies plus a custom currency formatter.
- **Owner-Restricted Admin Controls (`OwnerLogoControl.tsx`, `server.ts`)**: Passcode-protected owner mode for custom logo uploads and developer JSON/Schema inspection, hidden from standard client views.
- **Optional Gemini AI Analyst (`AIChatDrawer.tsx`, `/api/ai/chat`)**: Server-side `@google/genai` integration with retry backoff and fallback models for natural-language ledger queries.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **UI Framework** | React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Icons** | Lucide React (`lucide-react`) |
| **Build Tooling** | Vite 8 + esbuild |
| **Backend Server** | Node.js + Express (`server.ts`) |
| **AI Integration** | `@google/genai` (server-side proxy `/api/ai/chat`) |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure optional environment variables (copy .env.example)
cp .env.example .env

# 3. Start development server (port 3000)
npm run dev

# 4. Build client & production server bundle
npm run build

# 5. Run production server
npm start
```

---

## Project Structure

```text
├── index.html                  # Document entry & typography setup
├── server.ts                   # Express server, static serving, /api/ai/chat, owner branding APIs
├── src/
│   ├── App.tsx                 # Workspace shell, state persistence & view orchestration
│   ├── types.ts                # TypeScript domain interfaces (Transaction, CurrencyConfig, BusinessProfile)
│   ├── index.css               # Tailwind v4 setup, @custom-variant dark & @media print rules
│   ├── components/
│   │   ├── Sidebar.tsx         # Collapsible left navigation rail & mobile drawer
│   │   ├── Header.tsx          # Top breadcrumb bar, theme toggle & export trigger
│   │   ├── MetricCards.tsx     # KPI widgets with period-over-period comparison
│   │   ├── FinancialCharts.tsx # Cash flow SVG trajectory & category breakdown charts
│   │   ├── MonthlySummaryCards.tsx
│   │   ├── FilterToolbar.tsx   # Multi-criteria filtering & anomaly toggles
│   │   ├── TransactionTable.tsx
│   │   ├── FinancialReportModal.tsx
│   │   ├── CsvUploadModal.tsx
│   │   ├── ExportModal.tsx
│   │   ├── SettingsView.tsx
│   │   └── AIChatDrawer.tsx
│   ├── data/
│   │   └── defaultTransactions.ts
│   └── utils/
│       ├── generator.ts
│       ├── anomalyDetector.ts
│       └── periodComparison.ts
└── public/
    ├── analytics-dashboard-template.html  # Standalone publishable showcase page
    └── template-manifest.json             # Publishable template metadata
```

---

## Publishing Checklist

- **Title**: `Analytics Dashboard Template`
- **Short Description**: `Data-rich admin interface with chart modules, KPI widgets and responsive layouts built in React and TypeScript.`
- **Category**: `Admin & Analytics / SaaS Dashboard`
- **Tags**: `react`, `typescript`, `tailwind-css`, `analytics-dashboard`, `kpi-widgets`, `charts`, `admin-template`, `responsive`
- **Standalone Showcase URL**: `/analytics-dashboard-template.html`
