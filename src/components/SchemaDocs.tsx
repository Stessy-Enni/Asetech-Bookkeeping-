import React, { useState } from 'react';
import { Check, Copy, Code, Layers, Sparkles, Calendar } from 'lucide-react';

export const SchemaDocs: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const unifiedSchemaExample = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FinancialDatasetWithMonthlySummary",
  "type": "object",
  "required": ["currency", "summary", "transactions"],
  "properties": {
    "currency": { "type": "string", "example": "USD" },
    "summary": {
      "type": "object",
      "required": ["overall", "monthly"],
      "properties": {
        "overall": {
          "type": "object",
          "required": ["totalIncome", "totalExpenses", "netProfit", "profitMargin", "totalTransactions"],
          "properties": {
            "totalIncome": { "type": "number", "example": 16990.25 },
            "totalExpenses": { "type": "number", "example": 7803.90 },
            "netProfit": { "type": "number", "example": 9186.35 },
            "profitMargin": { "type": "number", "example": 54.1 },
            "totalTransactions": { "type": "integer", "example": 10 }
          }
        },
        "monthly": {
          "type": "array",
          "description": "Monthly aggregated statistics for each month represented in transactions",
          "items": {
            "type": "object",
            "required": ["month", "monthName", "totalIncome", "totalExpenses", "netProfit", "transactionCount"],
            "properties": {
              "month": { "type": "string", "example": "2026-10" },
              "monthName": { "type": "string", "example": "October 2026" },
              "totalIncome": { "type": "number", "example": 4750.00 },
              "totalExpenses": { "type": "number", "example": 658.50 },
              "netProfit": { "type": "number", "example": 4091.50, "description": "totalIncome - totalExpenses" },
              "profitMargin": { "type": "number", "example": 86.1 },
              "transactionCount": { "type": "integer", "example": 3 }
            }
          }
        }
      }
    },
    "transactions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["date", "description", "category", "type", "amount"],
        "properties": {
          "date": { "type": "string", "format": "date", "example": "2026-10-04" },
          "description": { "type": "string", "example": "Google Workspace & Cloud Infrastructure" },
          "category": { "type": "string", "example": "Software & Cloud" },
          "type": { "type": "string", "enum": ["income", "expense"] },
          "amount": { "type": "number", "example": 248.50 }
        }
      }
    }
  }
}`;

  const reactHookSnippet = `// Example: Consuming Monthly Summaries & Filtered Transactions in React
import { useMemo, useState } from 'react';

export function useMonthlyDashboard(dataset) {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return dataset.transactions;
    return dataset.transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [dataset.transactions, selectedMonth]);

  const activeMonthlySummary = useMemo(() => {
    if (selectedMonth === 'all') return dataset.summary.overall;
    return dataset.summary.monthly.find(m => m.month === selectedMonth);
  }, [dataset.summary, selectedMonth]);

  return {
    currency: dataset.currency,
    monthlySummaries: dataset.summary.monthly,
    activeMonthlySummary,
    transactions: filteredTransactions,
    selectedMonth,
    setSelectedMonth
  };
}`;

  const pythonSnippet = `# Example: Calculating & Plotting Monthly Net Profit with Pandas
import pandas as pd
import json

with open("financial_dataset_with_monthly_summary.json", "r") as f:
    payload = json.load(f)

# Direct access to pre-calculated monthly statistics:
monthly_df = pd.DataFrame(payload["summary"]["monthly"])
print(f"Currency: {payload.get('currency', 'USD')}")
print("Monthly Summary Statistics:")
print(monthly_df[["monthName", "totalIncome", "totalExpenses", "netProfit", "profitMargin"]])

# Verify against raw transaction ledger:
txns_df = pd.DataFrame(payload["transactions"])
txns_df["month"] = pd.to_datetime(txns_df["date"]).dt.to_period("M")
computed = txns_df.pivot_table(
    index="month",
    columns="type",
    values="amount",
    aggfunc="sum",
    fill_value=0
)
computed["net_profit"] = computed["income"] - computed["expense"]
print("\\nLedger Re-computation Match:\\n", computed)
`;

  return (
    <div className="space-y-6">
      {/* Schema Specification Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            JSON Schema Contract with Monthly Summaries
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
          Standardized contract designed for seamless ingestion into financial dashboards, charting libraries, and business intelligence pipelines.
        </p>

        {/* Monthly Summary Fields Reference Table */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Monthly Summary Object Fields (<code className="font-mono text-slate-600 dark:text-slate-400">summary.monthly[]</code>)
            </h3>
          </div>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Field</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Formula / Constraint</th>
                  <th className="py-2.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">month</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">string</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">YYYY-MM</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">ISO year-month key for grouping and sorting.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">monthName</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">string</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">e.g. "October 2026"</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Human-readable label for dashboard chart axes and headers.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">totalIncome</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">number</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">Sum of type: 'income'</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Total gross revenue received in this calendar month.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">totalExpenses</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">number</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">Sum of type: 'expense'</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Total operating and capital expenses in this month.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">netProfit</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">number</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">totalIncome - totalExpenses</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Net operating balance for the month (positive or negative).</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">transactionCount</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">integer</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">&gt;= 1</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Number of individual transactions booked within this month.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Fields Reference Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Transaction Item Fields (<code className="font-mono text-slate-600 dark:text-slate-400">transactions[]</code>)
            </h3>
          </div>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Field</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Constraint</th>
                  <th className="py-2.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">date</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">string</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">YYYY-MM-DD (ISO)</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Calendar settlement date.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">description</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">string</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">3-120 chars</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Contextual vendor name, client invoice title, or purpose.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">category</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">string</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">Classification</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Accounting ledger bucket.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">type</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">enum</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">"income" | "expense"</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Cash flow directionality.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">amount</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">number</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">Float &gt; 0.00</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Positive decimal value in active currency.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Code Integration Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* React Snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">React Hook Aggregator</span>
            </div>
            <button
              onClick={() => copyCode(reactHookSnippet, 'react')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              {copiedSnippet === 'react' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSnippet === 'react' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto flex-1">
            <pre><code>{reactHookSnippet}</code></pre>
          </div>
        </div>

        {/* Python Snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Python Pandas Analysis</span>
            </div>
            <button
              onClick={() => copyCode(pythonSnippet, 'python')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              {copiedSnippet === 'python' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSnippet === 'python' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto flex-1">
            <pre><code>{pythonSnippet}</code></pre>
          </div>
        </div>
      </div>

      {/* JSON Schema Definition */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
            Full JSON Schema (Draft-07)
          </span>
          <button
            onClick={() => copyCode(unifiedSchemaExample, 'schema')}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
          >
            {copiedSnippet === 'schema' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSnippet === 'schema' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-72">
          <pre><code>{unifiedSchemaExample}</code></pre>
        </div>
      </div>
    </div>
  );
};
