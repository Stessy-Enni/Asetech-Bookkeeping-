export type TransactionType = 'income' | 'expense';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'USD ($)', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'EUR (€)', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'GBP (£)', decimals: 2 },
  { code: 'CAD', symbol: 'CA$', name: 'CAD (CA$)', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$)', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)', decimals: 0 },
  { code: 'CHF', symbol: 'CHF ', name: 'CHF (CHF)', decimals: 2 },
  { code: 'CUSTOM', symbol: '¤', name: 'Other (Custom...)', decimals: 2 }
];

export interface Transaction {
  id?: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  status?: 'settled' | 'pending';
}

export interface TransactionAnomaly {
  transactionId: string;
  isUnusual: boolean;
  categoryAverage: number;
  categoryCount: number;
  overallAverage: number;
  deviationPercent: number; // e.g. 145 (representing +145%)
  ratio: number; // e.g. 2.45
  reason: string;
  anomalyType?: 'Category peak' | 'Multi-period aggregation' | 'Capital outlay' | 'Revenue milestone' | 'Volume outlier';
  potentialReasons?: string[];
  suggestedCategory?: string;
  suggestedNormalizedAmount?: number;
}

export interface MonthlySummary {
  month: string; // Format: "YYYY-MM"
  monthName: string; // e.g. "October 2026"
  totalIncome: number;
  totalExpenses: number;
  netProfit: number; // totalIncome - totalExpenses
  profitMargin: number; // (netProfit / totalIncome) * 100
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  currency?: string;
}

export interface DatasetSummary {
  currency: string;
  overall: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalTransactions: number;
    unusualTransactionsCount?: number;
  };
  monthly: MonthlySummary[];
}

export interface DatasetPayload {
  currency: string;
  summary: DatasetSummary;
  transactions: Transaction[];
}

export interface BusinessPreset {
  id: string;
  name: string;
  industry: string;
  description: string;
  transactions: Transaction[];
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  incomeCount: number;
  expenseCount: number;
  averageTransaction: number;
  unusualCount?: number;
}

export interface MetricTrend {
  currentValue: number;
  previousValue: number;
  changeValue: number;
  percentageChange: number | null;
  direction: 'up' | 'down' | 'neutral' | 'no-data';
  isFavorable: boolean;
  label: string;
}

export interface PeriodComparison {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
  daysInPeriod: number;
  hasPreviousData: boolean;
  previousTransactionsCount: number;
  currentTransactionsCount: number;
  trends: {
    income: MetricTrend;
    expense: MetricTrend;
    netProfit: MetricTrend;
    averageTransaction: MetricTrend;
  };
}

export interface FilterCriteria {
  searchKeyword: string;
  startDate: string;
  endDate: string;
  category: string;
  type: 'all' | 'income' | 'expense';
  unusualOnly?: boolean;
}

export interface CsvMappingConfig {
  dateColumn: string;
  descriptionColumn: string;
  categoryColumn: string;
  typeColumn: string;
  typeHandling: 'column' | 'sign' | 'default_income' | 'default_expense';
  amountColumn: string;
  fallbackCategory: string;
}

export interface ParsedCsvData {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  totalRows: number;
}

export interface BusinessProfile {
  name: string;
  legalEntity: string;
  taxId: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  fiscalYearStart: string;
}

