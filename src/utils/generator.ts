import {
  Transaction,
  FinancialMetrics,
  MonthlySummary,
  DatasetSummary,
  DatasetPayload,
  FilterCriteria,
  CurrencyConfig,
  SUPPORTED_CURRENCIES
} from '../types';

export function formatCurrencyValue(
  amount: number,
  currency: CurrencyConfig = SUPPORTED_CURRENCIES[0],
  signPrefix = false
): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formattedNumber = absVal.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals
  });

  if (signPrefix) {
    if (amount > 0) return `+${currency.symbol}${formattedNumber}`;
    if (amount < 0) return `-${currency.symbol}${formattedNumber}`;
    return `${currency.symbol}${formattedNumber}`;
  }

  return `${isNegative ? '-' : ''}${currency.symbol}${formattedNumber}`;
}

export function calculateMetrics(transactions: Transaction[]): FinancialMetrics {
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCount++;
    } else {
      totalExpense += t.amount;
      expenseCount++;
    }
  }

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const averageTransaction = transactions.length > 0 
    ? (totalIncome + totalExpense) / transactions.length 
    : 0;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 10) / 10,
    incomeCount,
    expenseCount,
    averageTransaction: Math.round(averageTransaction * 100) / 100
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatMonthName(yearMonth: string): string {
  const parts = yearMonth.split('-');
  if (parts.length < 2) return yearMonth;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] || parts[1];
  return `${monthName} ${year}`;
}

export function calculateMonthlySummaries(
  transactions: Transaction[],
  currencyCode = 'USD'
): MonthlySummary[] {
  const map = new Map<string, {
    totalIncome: number;
    totalExpenses: number;
    incomeCount: number;
    expenseCount: number;
    transactionCount: number;
  }>();

  for (const t of transactions) {
    if (!t.date || t.date.length < 7) continue;
    const monthKey = t.date.substring(0, 7); // "YYYY-MM"
    const current = map.get(monthKey) || {
      totalIncome: 0,
      totalExpenses: 0,
      incomeCount: 0,
      expenseCount: 0,
      transactionCount: 0
    };

    if (t.type === 'income') {
      current.totalIncome += t.amount;
      current.incomeCount += 1;
    } else {
      current.totalExpenses += t.amount;
      current.expenseCount += 1;
    }
    current.transactionCount += 1;
    map.set(monthKey, current);
  }

  // Sort months chronologically
  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map(key => {
    const data = map.get(key)!;
    const totalIncome = Math.round(data.totalIncome * 100) / 100;
    const totalExpenses = Math.round(data.totalExpenses * 100) / 100;
    const netProfit = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const profitMargin = totalIncome > 0 ? Math.round(((netProfit / totalIncome) * 100) * 10) / 10 : 0;

    return {
      month: key,
      monthName: formatMonthName(key),
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: data.transactionCount,
      incomeCount: data.incomeCount,
      expenseCount: data.expenseCount,
      currency: currencyCode
    };
  });
}

export function calculateDatasetSummary(
  transactions: Transaction[],
  currencyCode = 'USD'
): DatasetSummary {
  const metrics = calculateMetrics(transactions);
  const monthly = calculateMonthlySummaries(transactions, currencyCode);

  return {
    currency: currencyCode,
    overall: {
      totalIncome: metrics.totalIncome,
      totalExpenses: metrics.totalExpense,
      netProfit: metrics.netProfit,
      profitMargin: metrics.profitMargin,
      totalTransactions: transactions.length
    },
    monthly
  };
}

export function buildDatasetPayload(
  transactions: Transaction[],
  minimalTransactions = true,
  currencyCode = 'USD'
): DatasetPayload {
  const summary = calculateDatasetSummary(transactions, currencyCode);
  const formattedTransactions = minimalTransactions
    ? transactions.map(t => ({
        date: t.date,
        description: t.description,
        category: t.category,
        type: t.type,
        amount: t.amount,
        ...(currencyCode !== 'USD' ? { currency: currencyCode } : {})
      }))
    : transactions.map(t => ({
        ...t,
        currency: currencyCode
      }));

  return {
    currency: currencyCode,
    summary,
    transactions: formattedTransactions
  };
}

export type JsonOutputMode = 'unified' | 'monthlySummaryOnly' | 'transactionsMinimal' | 'transactionsFull';

export function formatJsonOutput(
  transactions: Transaction[],
  mode: JsonOutputMode = 'unified',
  indent = 2,
  currencyCode = 'USD'
): string {
  if (mode === 'monthlySummaryOnly') {
    const monthly = calculateMonthlySummaries(transactions, currencyCode);
    return JSON.stringify(monthly, null, indent);
  }

  if (mode === 'transactionsMinimal') {
    const minimal = transactions.map(t => ({
      date: t.date,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount,
      ...(currencyCode !== 'USD' ? { currency: currencyCode } : {})
    }));
    return JSON.stringify(minimal, null, indent);
  }

  if (mode === 'transactionsFull') {
    const full = transactions.map(t => ({
      ...t,
      currency: currencyCode
    }));
    return JSON.stringify(full, null, indent);
  }

  // Default: unified format containing summary + transactions
  const payload = buildDatasetPayload(transactions, true, currencyCode);
  return JSON.stringify(payload, null, indent);
}

export function filterTransactions(
  transactions: Transaction[],
  criteria: FilterCriteria,
  anomalyIds?: Set<string>
): Transaction[] {
  return transactions.filter(t => {
    // 0. Unusual transactions filter
    if (criteria.unusualOnly && anomalyIds) {
      const id = t.id || `${t.date}-${t.description}`;
      if (!anomalyIds.has(id)) {
        return false;
      }
    }

    // 1. Transaction Type filter
    if (criteria.type !== 'all' && t.type !== criteria.type) {
      return false;
    }

    // 2. Category filter
    if (criteria.category !== 'all' && t.category !== criteria.category) {
      return false;
    }

    // 3. Search keyword (matches in description, category)
    if (criteria.searchKeyword.trim() !== '') {
      const keyword = criteria.searchKeyword.toLowerCase().trim();
      const inDesc = t.description.toLowerCase().includes(keyword);
      const inCat = t.category.toLowerCase().includes(keyword);
      if (!inDesc && !inCat) {
        return false;
      }
    }

    // 4. Date range filter
    if (criteria.startDate && t.date < criteria.startDate) {
      return false;
    }
    if (criteria.endDate && t.date > criteria.endDate) {
      return false;
    }

    return true;
  });
}

const RANDOM_INCOMES = [
  { desc: "Client Retainer - Horizon Mobility App", cat: "Consulting Retainers", min: 4500, max: 7500 },
  { desc: "Enterprise Annual License Payout", cat: "Software Licenses", min: 5200, max: 9800 },
  { desc: "Website Redesign Milestone 2 - Nordic Goods", cat: "Project Billing", min: 2800, max: 5500 },
  { desc: "Stripe Online Checkout Payout (Digital Assets)", cat: "Product Sales", min: 1400, max: 3900 },
  { desc: "Commercial Maintenance Retainer", cat: "Contract Revenue", min: 3200, max: 6400 },
  { desc: "Wholesale Partner Purchase Order", cat: "Wholesale Accounts", min: 2100, max: 4800 },
  { desc: "Strategy Sprint Invoice - Beacon Logistics", cat: "Consulting Retainers", min: 4000, max: 6200 },
  { desc: "Consulting Discovery Workshop Fee", cat: "Project Billing", min: 1800, max: 3200 },
  { desc: "Affiliate & Partner Commission Payout", cat: "Sales & Affiliates", min: 650, max: 1950 },
];

const RANDOM_EXPENSES = [
  { desc: "Gusto Bi-Weekly Team Payroll", cat: "Payroll & Compensation", min: 3800, max: 6200 },
  { desc: "AWS Cloud Compute & RDS Cluster", cat: "Software & Cloud", min: 310, max: 680 },
  { desc: "WeWork Dedicated Team Space Lease", cat: "Facilities & Rent", min: 1200, max: 1850 },
  { desc: "Google Workspace & Slack Enterprise", cat: "Software & Cloud", min: 180, max: 340 },
  { desc: "Quarterly Professional Liability Insurance", cat: "Insurance & Legal", min: 550, max: 890 },
  { desc: "Dell Ultrasharp Monitors & Ergonomic Hardware", cat: "Equipment & Hardware", min: 850, max: 1899 },
  { desc: "AdRoll & Meta Retargeting Ad Campaign", cat: "Marketing & Advertising", min: 410, max: 1450 },
  { desc: "Accounting & Certified Tax Audit Advisory", cat: "Professional Services", min: 450, max: 950 },
  { desc: "Office High-Speed Fiber Internet", cat: "Utilities", min: 160, max: 280 },
  { desc: "Eco Compostable Office Supplies", cat: "Office Supplies", min: 120, max: 350 },
];

export function generateRandomTransactions(
  count = 10,
  multiMonth = true,
  currencyCode = 'USD'
): Transaction[] {
  const result: Transaction[] = [];

  const monthConfigs = multiMonth 
    ? [
        { year: 2026, month: 8, daysInMonth: 31 },
        { year: 2026, month: 9, daysInMonth: 30 },
        { year: 2026, month: 10, daysInMonth: 31 },
      ]
    : [
        { year: 2026, month: 10, daysInMonth: 31 }
      ];

  const incomeIndices = new Set([0, 3, 6, 9]);

  for (let i = 0; i < count; i++) {
    const isIncome = incomeIndices.has(i % 10);
    const monthConfig = monthConfigs[i % monthConfigs.length];
    const day = Math.min(monthConfig.daysInMonth, Math.max(1, Math.floor((i + 1) * 2.8)));
    const dateStr = `${monthConfig.year}-${String(monthConfig.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (isIncome) {
      const template = RANDOM_INCOMES[Math.floor(Math.random() * RANDOM_INCOMES.length)];
      const rawAmt = template.min + Math.random() * (template.max - template.min);
      const roundedAmt = Math.round(rawAmt * 100) / 100;
      result.push({
        id: `txn_${String(i + 1).padStart(2, '0')}`,
        date: dateStr,
        description: template.desc,
        category: template.cat,
        type: 'income',
        amount: roundedAmt,
        currency: currencyCode,
        paymentMethod: 'ACH Direct Deposit',
        status: 'settled'
      });
    } else {
      const template = RANDOM_EXPENSES[Math.floor(Math.random() * RANDOM_EXPENSES.length)];
      const rawAmt = template.min + Math.random() * (template.max - template.min);
      const roundedAmt = Math.round(rawAmt * 100) / 100;
      result.push({
        id: `txn_${String(i + 1).padStart(2, '0')}`,
        date: dateStr,
        description: template.desc,
        category: template.cat,
        type: 'expense',
        amount: roundedAmt,
        currency: currencyCode,
        paymentMethod: 'Corporate Visa',
        status: 'settled'
      });
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function exportToCsv(transactions: Transaction[], currencyCode = 'USD'): string {
  const headers = ['date', 'description', 'category', 'type', 'amount', 'currency'];
  const rows = transactions.map(t => [
    `"${t.date}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.type}"`,
    t.amount.toFixed(2),
    `"${t.currency || currencyCode}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportMonthlySummaryCsv(summaries: MonthlySummary[]): string {
  const headers = ['month', 'month_name', 'total_income', 'total_expenses', 'net_profit', 'profit_margin_pct', 'transaction_count', 'currency'];
  const rows = summaries.map(s => [
    `"${s.month}"`,
    `"${s.monthName}"`,
    s.totalIncome.toFixed(2),
    s.totalExpenses.toFixed(2),
    s.netProfit.toFixed(2),
    s.profitMargin.toFixed(1),
    s.transactionCount.toString(),
    `"${s.currency || 'USD'}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
