import {
  Transaction,
  FinancialMetrics,
  FilterCriteria,
  CurrencyConfig,
  MetricTrend,
  PeriodComparison
} from '../types';
import { calculateMetrics, formatCurrencyValue } from './generator';

function padZero(num: number): string {
  return String(num).padStart(2, '0');
}

function parseDateUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d || 1));
}

function formatDateIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = padZero(date.getUTCMonth() + 1);
  const d = padZero(date.getUTCDate());
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const monthName = MONTH_NAMES_SHORT[m - 1] || `${m}`;
  return `${monthName} ${d}, ${y}`;
}

export function formatPeriodRangeLabel(startStr: string, endStr: string): string {
  if (!startStr || !endStr) return 'All dates';
  if (startStr === endStr) return formatFriendlyDate(startStr);

  const [y1, m1, d1] = startStr.split('-').map(Number);
  const [y2, m2, d2] = endStr.split('-').map(Number);

  // Full calendar month check: 1st of month to last of month
  const lastDayOfMonth = new Date(Date.UTC(y1, m1, 0)).getUTCDate();
  if (y1 === y2 && m1 === m2 && d1 === 1 && d2 === lastDayOfMonth) {
    return `${MONTH_NAMES_FULL[m1 - 1]} ${y1}`;
  }

  if (y1 === y2) {
    if (m1 === m2) {
      return `${MONTH_NAMES_SHORT[m1 - 1]} ${d1} – ${d2}, ${y1}`;
    }
    return `${MONTH_NAMES_SHORT[m1 - 1]} ${d1} – ${MONTH_NAMES_SHORT[m2 - 1]} ${d2}, ${y1}`;
  }

  return `${formatFriendlyDate(startStr)} – ${formatFriendlyDate(endStr)}`;
}

export function getDaysInMonth(year: number, month1Indexed: number): number {
  return new Date(Date.UTC(year, month1Indexed, 0)).getUTCDate();
}

/**
 * Calculates a single metric's period-over-period trend
 */
export function calculateMetricTrend(
  currentValue: number,
  previousValue: number,
  metricType: 'income' | 'expense' | 'netProfit' | 'averageTransaction',
  hasPriorData: boolean,
  currency: CurrencyConfig
): MetricTrend {
  if (!hasPriorData) {
    return {
      currentValue,
      previousValue: 0,
      changeValue: 0,
      percentageChange: null,
      direction: 'no-data',
      isFavorable: true,
      label: 'No prior data'
    };
  }

  const changeValue = Math.round((currentValue - previousValue) * 100) / 100;

  // Percentage change calculation
  let percentageChange: number | null = null;
  if (previousValue === 0) {
    if (currentValue === 0) {
      percentageChange = 0;
    } else if (currentValue > 0) {
      percentageChange = 100;
    } else {
      percentageChange = -100;
    }
  } else {
    // Standard relative change with absolute baseline to support negative values (like net profit)
    percentageChange = Math.round(((currentValue - previousValue) / Math.abs(previousValue)) * 1000) / 10;
  }

  // Direction
  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (changeValue > 0.001) direction = 'up';
  else if (changeValue < -0.001) direction = 'down';

  // Favorability determination:
  // - For income, profit, avg transaction: increase is favorable
  // - For expenses: decrease is favorable (saving money!)
  let isFavorable = true;
  if (metricType === 'expense') {
    isFavorable = changeValue <= 0;
  } else {
    isFavorable = changeValue >= 0;
  }

  // Formatted label
  let label = '0.0%';
  if (percentageChange !== null) {
    const sign = percentageChange > 0 ? '+' : '';
    label = `${sign}${percentageChange.toFixed(1)}%`;
  }

  return {
    currentValue,
    previousValue,
    changeValue,
    percentageChange,
    direction,
    isFavorable,
    label
  };
}

/**
 * Given user filters and the full transaction dataset, determines:
 * 1. The currently filtered date range
 * 2. The previous equivalent timeframe (same duration or previous month)
 * 3. The metrics and percentage changes for each key metric
 */
export function calculatePeriodComparison(
  allTransactions: Transaction[],
  filteredTransactions: Transaction[],
  filters: FilterCriteria,
  currency: CurrencyConfig,
  anomalyIds?: Set<string>,
  unfilteredMode: 'latestMonth' | 'fullPeriod' = 'latestMonth'
): PeriodComparison {
  // 1. Determine currently active start and end dates
  let currentStart = filters.startDate;
  let currentEnd = filters.endDate;
  let isUserDateFiltered = Boolean(currentStart || currentEnd);

  // If neither date filter is specified, check transactions
  if (!currentStart && !currentEnd) {
    if (filteredTransactions.length === 0) {
      const today = formatDateIso(new Date());
      return createEmptyComparison(today, today, currency);
    }

    // Collect all transaction dates
    const dates = filteredTransactions.map(t => t.date).filter(Boolean).sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    if (unfilteredMode === 'latestMonth') {
      // Find the latest calendar month present in the filtered transactions
      const latestMonthKey = maxDate.substring(0, 7); // "YYYY-MM"
      const [latestY, latestM] = latestMonthKey.split('-').map(Number);
      const daysInLatestMonth = getDaysInMonth(latestY, latestM);

      currentStart = `${latestMonthKey}-01`;
      currentEnd = `${latestMonthKey}-${padZero(daysInLatestMonth)}`;
    } else {
      currentStart = minDate;
      currentEnd = maxDate;
    }
  } else if (currentStart && !currentEnd) {
    const dates = filteredTransactions.map(t => t.date).filter(Boolean).sort();
    currentEnd = dates.length > 0 ? dates[dates.length - 1] : currentStart;
  } else if (!currentStart && currentEnd) {
    const dates = filteredTransactions.map(t => t.date).filter(Boolean).sort();
    currentStart = dates.length > 0 ? dates[0] : currentEnd;
  }

  // 2. Compute equivalent previous timeframe
  let prevStart = '';
  let prevEnd = '';

  const [y1, m1, d1] = currentStart.split('-').map(Number);
  const [y2, m2, d2] = currentEnd.split('-').map(Number);
  const daysInCurrentMonth = getDaysInMonth(y1, m1);

  // Special check: Is the current period an exact single calendar month?
  const isExactSingleMonth = y1 === y2 && m1 === m2 && d1 === 1 && d2 === daysInCurrentMonth;

  if (isExactSingleMonth) {
    // Previous equivalent timeframe is the immediately preceding calendar month
    let prevYear = y1;
    let prevMonth = m1 - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    prevStart = `${prevYear}-${padZero(prevMonth)}-01`;
    prevEnd = `${prevYear}-${padZero(prevMonth)}-${padZero(daysInPrevMonth)}`;
  } else {
    // Arbitrary date span: calculate exact duration in days and shift back
    const startDateObj = parseDateUtc(currentStart);
    const endDateObj = parseDateUtc(currentEnd);
    const msDiff = endDateObj.getTime() - startDateObj.getTime();
    const durationDays = Math.max(1, Math.round(msDiff / 86400000) + 1);

    const prevEndDateObj = new Date(startDateObj.getTime() - 86400000);
    const prevStartDateObj = new Date(prevEndDateObj.getTime() - (durationDays - 1) * 86400000);

    prevStart = formatDateIso(prevStartDateObj);
    prevEnd = formatDateIso(prevEndDateObj);
  }

  // Calculate day count
  const currStartObj = parseDateUtc(currentStart);
  const currEndObj = parseDateUtc(currentEnd);
  const daysInPeriod = Math.max(1, Math.round((currEndObj.getTime() - currStartObj.getTime()) / 86400000) + 1);

  // 3. Filter current transactions matching this date window AND user's other filters
  const currentWindowTransactions = allTransactions.filter(t => {
    if (!t.date || t.date < currentStart || t.date > currentEnd) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.searchKeyword.trim() !== '') {
      const kw = filters.searchKeyword.toLowerCase().trim();
      const inDesc = t.description.toLowerCase().includes(kw);
      const inCat = t.category.toLowerCase().includes(kw);
      if (!inDesc && !inCat) return false;
    }
    if (filters.unusualOnly && anomalyIds) {
      const id = t.id || `${t.date}-${t.description}`;
      if (!anomalyIds.has(id)) return false;
    }
    return true;
  });

  // 4. Filter previous transactions matching the previous date window AND user's other filters
  const previousWindowTransactions = allTransactions.filter(t => {
    if (!t.date || t.date < prevStart || t.date > prevEnd) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.searchKeyword.trim() !== '') {
      const kw = filters.searchKeyword.toLowerCase().trim();
      const inDesc = t.description.toLowerCase().includes(kw);
      const inCat = t.category.toLowerCase().includes(kw);
      if (!inDesc && !inCat) return false;
    }
    if (filters.unusualOnly && anomalyIds) {
      const id = t.id || `${t.date}-${t.description}`;
      if (!anomalyIds.has(id)) return false;
    }
    return true;
  });

  // Calculate metrics for both periods
  const currentMetrics = calculateMetrics(currentWindowTransactions);
  const previousMetrics = calculateMetrics(previousWindowTransactions);

  // Check if we have transactions in the dataset before or during the previous timeframe
  // If no transactions exist anywhere in or before the previous timeframe, mark hasPreviousData false
  const hasPreviousData = previousWindowTransactions.length > 0 || allTransactions.some(t => t.date && t.date <= prevEnd);

  // Calculate trends for key metrics
  const incomeTrend = calculateMetricTrend(
    currentMetrics.totalIncome,
    previousMetrics.totalIncome,
    'income',
    hasPreviousData,
    currency
  );

  const expenseTrend = calculateMetricTrend(
    currentMetrics.totalExpense,
    previousMetrics.totalExpense,
    'expense',
    hasPreviousData,
    currency
  );

  const netProfitTrend = calculateMetricTrend(
    currentMetrics.netProfit,
    previousMetrics.netProfit,
    'netProfit',
    hasPreviousData,
    currency
  );

  const averageTransactionTrend = calculateMetricTrend(
    currentMetrics.averageTransaction,
    previousMetrics.averageTransaction,
    'averageTransaction',
    hasPreviousData,
    currency
  );

  const currentPeriodLabel = formatPeriodRangeLabel(currentStart, currentEnd);
  const previousPeriodLabel = formatPeriodRangeLabel(prevStart, prevEnd);

  return {
    currentPeriodLabel,
    previousPeriodLabel,
    currentStartDate: currentStart,
    currentEndDate: currentEnd,
    previousStartDate: prevStart,
    previousEndDate: prevEnd,
    daysInPeriod,
    hasPreviousData: previousWindowTransactions.length > 0,
    previousTransactionsCount: previousWindowTransactions.length,
    currentTransactionsCount: currentWindowTransactions.length,
    trends: {
      income: incomeTrend,
      expense: expenseTrend,
      netProfit: netProfitTrend,
      averageTransaction: averageTransactionTrend
    }
  };
}

function createEmptyComparison(start: string, end: string, currency: CurrencyConfig): PeriodComparison {
  const emptyTrend: MetricTrend = {
    currentValue: 0,
    previousValue: 0,
    changeValue: 0,
    percentageChange: null,
    direction: 'no-data',
    isFavorable: true,
    label: 'No data'
  };

  return {
    currentPeriodLabel: formatFriendlyDate(start),
    previousPeriodLabel: 'Prior period',
    currentStartDate: start,
    currentEndDate: end,
    previousStartDate: start,
    previousEndDate: end,
    daysInPeriod: 1,
    hasPreviousData: false,
    previousTransactionsCount: 0,
    currentTransactionsCount: 0,
    trends: {
      income: emptyTrend,
      expense: emptyTrend,
      netProfit: emptyTrend,
      averageTransaction: emptyTrend
    }
  };
}
