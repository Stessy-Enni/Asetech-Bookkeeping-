import { Transaction, CurrencyConfig } from '../types';
import { formatCurrencyValue, calculateMonthlySummaries, formatMonthName } from './generator';

export interface CategoryShare {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyCategoryDominance {
  month: string;
  monthName: string;
  topExpenseCategory: string;
  topExpenseAmount: number;
  topExpensePercentage: number;
  totalMonthlyExpense: number;
  topIncomeCategory: string;
  topIncomeAmount: number;
  totalMonthlyIncome: number;
}

export interface SpendingVelocityMetrics {
  totalExpense: number;
  totalDays: number;
  dailyVelocity: number;
  weeklyVelocity: number;
  monthlyProjectedBurn: number;
  dailyNetCashFlow: number;
  velocityTrend: 'Accelerating' | 'Decelerating' | 'Stable' | 'Insufficient data';
  monthOverMonthVelocityChanges: Array<{
    month: string;
    monthName: string;
    dailyExpense: number;
    totalExpense: number;
    pctChangeFromPrior: number | null;
  }>;
}

export interface TransactionPatternMetrics {
  totalTransactions: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  totalDays: number;
  incomeCount: number;
  expenseCount: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  averageIncomeTicket: number;
  averageExpenseTicket: number;
  inflowCadenceDays: number;
  outflowCadenceDays: number;
  revenueToExpenseCoverageRatio: number;
  cashFlowHealth: 'Strongly Positive' | 'Moderate Surplus' | 'Breakeven' | 'Net Deficit';
}

export interface FinancialReportData {
  generatedAt: string;
  currency: CurrencyConfig;
  patterns: TransactionPatternMetrics;
  velocity: SpendingVelocityMetrics;
  expenseCategories: CategoryShare[];
  incomeCategories: CategoryShare[];
  dominantExpenseCategory: CategoryShare | null;
  dominantIncomeCategory: CategoryShare | null;
  concentrationRisk: 'High Concentration' | 'Moderate Concentration' | 'Balanced Distribution';
  monthlyDominance: MonthlyCategoryDominance[];
  executiveObservations: string[];
  markdownReport: string;
}

export function generateFinancialReport(
  transactions: Transaction[],
  currency: CurrencyConfig
): FinancialReportData {
  const generatedAt = new Date().toISOString();
  if (!transactions || transactions.length === 0) {
    return createEmptyReport(currency, generatedAt);
  }

  // 1. Sort transactions chronologically
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const dateRangeStart = sorted[0].date;
  const dateRangeEnd = sorted[sorted.length - 1].date;

  const startDateObj = new Date(dateRangeStart + 'T00:00:00Z');
  const endDateObj = new Date(dateRangeEnd + 'T00:00:00Z');
  const msDiff = Math.max(0, endDateObj.getTime() - startDateObj.getTime());
  const totalDays = Math.max(1, Math.round(msDiff / 86400000) + 1);

  // 2. Aggregate Incomes & Expenses
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  const expenseCategoryMap = new Map<string, { amount: number; count: number }>();
  const incomeCategoryMap = new Map<string, { amount: number; count: number }>();

  // Monthly buckets for category dominance
  const monthlyCategoryExpenseMap = new Map<string, Map<string, number>>();
  const monthlyCategoryIncomeMap = new Map<string, Map<string, number>>();
  const monthlyExpenseTotals = new Map<string, number>();
  const monthlyIncomeTotals = new Map<string, number>();

  for (const t of sorted) {
    const monthKey = t.date ? t.date.substring(0, 7) : 'Unknown';

    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCount += 1;

      const curr = incomeCategoryMap.get(t.category) || { amount: 0, count: 0 };
      curr.amount += t.amount;
      curr.count += 1;
      incomeCategoryMap.set(t.category, curr);

      // Monthly
      const mInc = monthlyCategoryIncomeMap.get(monthKey) || new Map<string, number>();
      mInc.set(t.category, (mInc.get(t.category) || 0) + t.amount);
      monthlyCategoryIncomeMap.set(monthKey, mInc);
      monthlyIncomeTotals.set(monthKey, (monthlyIncomeTotals.get(monthKey) || 0) + t.amount);
    } else {
      totalExpense += t.amount;
      expenseCount += 1;

      const curr = expenseCategoryMap.get(t.category) || { amount: 0, count: 0 };
      curr.amount += t.amount;
      curr.count += 1;
      expenseCategoryMap.set(t.category, curr);

      // Monthly
      const mExp = monthlyCategoryExpenseMap.get(monthKey) || new Map<string, number>();
      mExp.set(t.category, (mExp.get(t.category) || 0) + t.amount);
      monthlyCategoryExpenseMap.set(monthKey, mExp);
      monthlyExpenseTotals.set(monthKey, (monthlyExpenseTotals.get(monthKey) || 0) + t.amount);
    }
  }

  const netProfit = Math.round((totalIncome - totalExpense) * 100) / 100;
  const profitMargin = totalIncome > 0 ? Math.round(((netProfit / totalIncome) * 100) * 10) / 10 : 0;
  const averageIncomeTicket = incomeCount > 0 ? Math.round((totalIncome / incomeCount) * 100) / 100 : 0;
  const averageExpenseTicket = expenseCount > 0 ? Math.round((totalExpense / expenseCount) * 100) / 100 : 0;
  const inflowCadenceDays = incomeCount > 0 ? Math.round((totalDays / incomeCount) * 10) / 10 : totalDays;
  const outflowCadenceDays = expenseCount > 0 ? Math.round((totalDays / expenseCount) * 10) / 10 : totalDays;
  const revenueToExpenseCoverageRatio = totalExpense > 0 ? Math.round((totalIncome / totalExpense) * 100) / 100 : 999;

  let cashFlowHealth: 'Strongly Positive' | 'Moderate Surplus' | 'Breakeven' | 'Net Deficit' = 'Breakeven';
  if (profitMargin >= 25) cashFlowHealth = 'Strongly Positive';
  else if (profitMargin > 5) cashFlowHealth = 'Moderate Surplus';
  else if (profitMargin >= -5) cashFlowHealth = 'Breakeven';
  else cashFlowHealth = 'Net Deficit';

  const patterns: TransactionPatternMetrics = {
    totalTransactions: sorted.length,
    dateRangeStart,
    dateRangeEnd,
    totalDays,
    incomeCount,
    expenseCount,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netProfit,
    profitMargin,
    averageIncomeTicket,
    averageExpenseTicket,
    inflowCadenceDays,
    outflowCadenceDays,
    revenueToExpenseCoverageRatio,
    cashFlowHealth
  };

  // 3. Category Shares & Dominance
  const expenseCategories: CategoryShare[] = Array.from(expenseCategoryMap.entries())
    .map(([cat, data]) => ({
      category: cat,
      amount: Math.round(data.amount * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 1000) / 10 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const incomeCategories: CategoryShare[] = Array.from(incomeCategoryMap.entries())
    .map(([cat, data]) => ({
      category: cat,
      amount: Math.round(data.amount * 100) / 100,
      percentage: totalIncome > 0 ? Math.round((data.amount / totalIncome) * 1000) / 10 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const dominantExpenseCategory = expenseCategories.length > 0 ? expenseCategories[0] : null;
  const dominantIncomeCategory = incomeCategories.length > 0 ? incomeCategories[0] : null;

  let concentrationRisk: 'High Concentration' | 'Moderate Concentration' | 'Balanced Distribution' = 'Balanced Distribution';
  if (dominantExpenseCategory) {
    if (dominantExpenseCategory.percentage >= 45) {
      concentrationRisk = 'High Concentration';
    } else if (dominantExpenseCategory.percentage >= 30) {
      concentrationRisk = 'Moderate Concentration';
    }
  }

  // Monthly Dominance Timeline
  const distinctMonths = Array.from(new Set([...monthlyExpenseTotals.keys(), ...monthlyIncomeTotals.keys()])).sort();
  const monthlyDominance: MonthlyCategoryDominance[] = distinctMonths.map(month => {
    const totalExp = monthlyExpenseTotals.get(month) || 0;
    const totalInc = monthlyIncomeTotals.get(month) || 0;

    let topExpCat = 'None';
    let topExpAmt = 0;
    const expMap = monthlyCategoryExpenseMap.get(month);
    if (expMap) {
      for (const [c, amt] of expMap.entries()) {
        if (amt > topExpAmt) {
          topExpAmt = amt;
          topExpCat = c;
        }
      }
    }

    let topIncCat = 'None';
    let topIncAmt = 0;
    const incMap = monthlyCategoryIncomeMap.get(month);
    if (incMap) {
      for (const [c, amt] of incMap.entries()) {
        if (amt > topIncAmt) {
          topIncAmt = amt;
          topIncCat = c;
        }
      }
    }

    return {
      month,
      monthName: formatMonthName(month),
      topExpenseCategory: topExpCat,
      topExpenseAmount: Math.round(topExpAmt * 100) / 100,
      topExpensePercentage: totalExp > 0 ? Math.round((topExpAmt / totalExp) * 1000) / 10 : 0,
      totalMonthlyExpense: Math.round(totalExp * 100) / 100,
      topIncomeCategory: topIncCat,
      topIncomeAmount: Math.round(topIncAmt * 100) / 100,
      totalMonthlyIncome: Math.round(totalInc * 100) / 100
    };
  });

  // 4. Spending Velocity Calculations
  const dailyVelocity = Math.round((totalExpense / totalDays) * 100) / 100;
  const weeklyVelocity = Math.round((dailyVelocity * 7) * 100) / 100;
  const monthlyProjectedBurn = Math.round((dailyVelocity * 30.4) * 100) / 100;
  const dailyNetCashFlow = Math.round((netProfit / totalDays) * 100) / 100;

  // Month-over-month velocity shifts
  const monthlySummaries = calculateMonthlySummaries(sorted, currency.code);
  const monthOverMonthVelocityChanges: Array<{
    month: string;
    monthName: string;
    dailyExpense: number;
    totalExpense: number;
    pctChangeFromPrior: number | null;
  }> = [];

  let priorDailyExp: number | null = null;
  for (let i = 0; i < monthlySummaries.length; i++) {
    const m = monthlySummaries[i];
    const daysInThisMonth = 30; // Approximation for velocity
    const dailyExp = Math.round((m.totalExpenses / daysInThisMonth) * 100) / 100;

    let pctChange: number | null = null;
    if (priorDailyExp !== null && priorDailyExp > 0) {
      pctChange = Math.round(((dailyExp - priorDailyExp) / priorDailyExp) * 1000) / 10;
    }

    monthOverMonthVelocityChanges.push({
      month: m.month,
      monthName: m.monthName,
      dailyExpense: dailyExp,
      totalExpense: m.totalExpenses,
      pctChangeFromPrior: pctChange
    });

    priorDailyExp = dailyExp;
  }

  let velocityTrend: 'Accelerating' | 'Decelerating' | 'Stable' | 'Insufficient data' = 'Insufficient data';
  if (monthOverMonthVelocityChanges.length >= 2) {
    const latestChange = monthOverMonthVelocityChanges[monthOverMonthVelocityChanges.length - 1].pctChangeFromPrior;
    if (latestChange !== null) {
      if (latestChange > 12) velocityTrend = 'Accelerating';
      else if (latestChange < -12) velocityTrend = 'Decelerating';
      else velocityTrend = 'Stable';
    }
  }

  const velocity: SpendingVelocityMetrics = {
    totalExpense: Math.round(totalExpense * 100) / 100,
    totalDays,
    dailyVelocity,
    weeklyVelocity,
    monthlyProjectedBurn,
    dailyNetCashFlow,
    velocityTrend,
    monthOverMonthVelocityChanges
  };

  // 5. Executive Observations
  const executiveObservations: string[] = [
    `Cash Flow Structure: The business achieved an aggregate net margin of ${profitMargin.toFixed(1)}% (${formatCurrencyValue(netProfit, currency)}) on ${formatCurrencyValue(totalIncome, currency)} gross revenue, with a revenue-to-expense coverage ratio of ${revenueToExpenseCoverageRatio.toFixed(2)}x.`,
    `Burn Velocity: Operating expenses burn at an average rate of ${formatCurrencyValue(dailyVelocity, currency)}/day (${formatCurrencyValue(weeklyVelocity, currency)}/week, ~${formatCurrencyValue(monthlyProjectedBurn, currency)}/month). The velocity trend is currently classified as "${velocityTrend}".`,
    dominantExpenseCategory
      ? `Expense Concentration: "${dominantExpenseCategory.category}" constitutes the dominant cost driver, consuming ${dominantExpenseCategory.percentage.toFixed(1)}% (${formatCurrencyValue(dominantExpenseCategory.amount, currency)}) of all expenditures across ${dominantExpenseCategory.count} transaction(s). This represents ${concentrationRisk.toLowerCase()}.`
      : 'Expense Distribution: Minimal expenditures recorded.',
    dominantIncomeCategory
      ? `Revenue Anchor: The primary top-line driver is "${dominantIncomeCategory.category}", generating ${dominantIncomeCategory.percentage.toFixed(1)}% (${formatCurrencyValue(dominantIncomeCategory.amount, currency)}) of inflows across ${dominantIncomeCategory.count} transaction(s).`
      : 'Revenue Distribution: Minimal inflows recorded.',
    `Transaction Cadence: On average, inflows occur every ${inflowCadenceDays} days (avg ticket: ${formatCurrencyValue(averageIncomeTicket, currency)}), while outflows occur every ${outflowCadenceDays} days (avg ticket: ${formatCurrencyValue(averageExpenseTicket, currency)}).`
  ];

  // 6. Formatted Markdown Text Report
  const markdownReport = generateMarkdownReportText({
    currency,
    patterns,
    velocity,
    expenseCategories,
    incomeCategories,
    dominantExpenseCategory,
    dominantIncomeCategory,
    concentrationRisk,
    monthlyDominance,
    executiveObservations,
    generatedAt
  });

  return {
    generatedAt,
    currency,
    patterns,
    velocity,
    expenseCategories,
    incomeCategories,
    dominantExpenseCategory,
    dominantIncomeCategory,
    concentrationRisk,
    monthlyDominance,
    executiveObservations,
    markdownReport
  };
}

function generateMarkdownReportText(data: {
  currency: CurrencyConfig;
  patterns: TransactionPatternMetrics;
  velocity: SpendingVelocityMetrics;
  expenseCategories: CategoryShare[];
  incomeCategories: CategoryShare[];
  dominantExpenseCategory: CategoryShare | null;
  dominantIncomeCategory: CategoryShare | null;
  concentrationRisk: string;
  monthlyDominance: MonthlyCategoryDominance[];
  executiveObservations: string[];
  generatedAt: string;
}): string {
  const { currency, patterns, velocity, expenseCategories, incomeCategories, monthlyDominance, executiveObservations, generatedAt } = data;

  const lines: string[] = [];

  lines.push('# Small Business Financial Pattern & Velocity Analysis Report');
  lines.push(`Generated: ${new Date(generatedAt).toLocaleString()} · Currency: ${currency.name}`);
  lines.push(`Timeframe: ${patterns.dateRangeStart} to ${patterns.dateRangeEnd} (${patterns.totalDays} calendar days)`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 1. Executive Summary & Health Assessment');
  lines.push(`- **Cash Flow Status**: ${patterns.cashFlowHealth} (${patterns.profitMargin.toFixed(1)}% net margin)`);
  lines.push(`- **Gross Revenue**: ${formatCurrencyValue(patterns.totalIncome, currency)} (${patterns.incomeCount} inflows)`);
  lines.push(`- **Operating Overhead**: ${formatCurrencyValue(patterns.totalExpense, currency)} (${patterns.expenseCount} outflows)`);
  lines.push(`- **Net Profit**: ${formatCurrencyValue(patterns.netProfit, currency, true)}`);
  lines.push(`- **Daily Net Cash Accumulation**: ${formatCurrencyValue(velocity.dailyNetCashFlow, currency, true)}/day`);
  lines.push(`- **Coverage Ratio**: ${patterns.revenueToExpenseCoverageRatio.toFixed(2)}x (Gross Revenue / Operating Overhead)`);
  lines.push('');

  lines.push('## 2. Spending Velocity & Outflow Momentum');
  lines.push(`- **Daily Burn Rate**: ${formatCurrencyValue(velocity.dailyVelocity, currency)}/day`);
  lines.push(`- **Weekly Outflow Velocity**: ${formatCurrencyValue(velocity.weeklyVelocity, currency)}/week`);
  lines.push(`- **Projected Monthly Burn**: ${formatCurrencyValue(velocity.monthlyProjectedBurn, currency)}/month`);
  lines.push(`- **Velocity Trajectory**: ${velocity.velocityTrend}`);
  lines.push('');
  lines.push('### Month-over-Month Velocity Breakdown');
  lines.push('| Month | Total Outflows | Daily Velocity | MoM Variance |');
  lines.push('| :--- | :--- | :--- | :--- |');
  velocity.monthOverMonthVelocityChanges.forEach(m => {
    const varianceStr = m.pctChangeFromPrior !== null ? `${m.pctChangeFromPrior > 0 ? '+' : ''}${m.pctChangeFromPrior.toFixed(1)}%` : 'Baseline';
    lines.push(`| ${m.monthName} | ${formatCurrencyValue(m.totalExpense, currency)} | ${formatCurrencyValue(m.dailyExpense, currency)}/day | ${varianceStr} |`);
  });
  lines.push('');

  lines.push('## 3. Category Dominance & Wallet Share');
  lines.push(`- **Primary Cost Center**: ${data.dominantExpenseCategory ? `${data.dominantExpenseCategory.category} (${data.dominantExpenseCategory.percentage.toFixed(1)}%)` : 'N/A'}`);
  lines.push(`- **Concentration Risk Level**: ${data.concentrationRisk}`);
  lines.push('');
  lines.push('### Operating Expense Wallet Share');
  lines.push('| Category | Total Outflows | Wallet Share (%) | Txn Count |');
  lines.push('| :--- | :--- | :--- | :--- |');
  expenseCategories.forEach(c => {
    lines.push(`| ${c.category} | ${formatCurrencyValue(c.amount, currency)} | ${c.percentage.toFixed(1)}% | ${c.count} |`);
  });
  lines.push('');

  lines.push('### Inflow Revenue Streams');
  lines.push('| Revenue Stream | Total Inflows | Income Share (%) | Txn Count |');
  lines.push('| :--- | :--- | :--- | :--- |');
  incomeCategories.forEach(c => {
    lines.push(`| ${c.category} | ${formatCurrencyValue(c.amount, currency)} | ${c.percentage.toFixed(1)}% | ${c.count} |`);
  });
  lines.push('');

  lines.push('## 4. Category Dominance Timeline by Month');
  lines.push('| Month | Top Expense Driver | Category Spend | Mo. Expense Share | Top Inflow Driver |');
  lines.push('| :--- | :--- | :--- | :--- | :--- |');
  monthlyDominance.forEach(m => {
    lines.push(`| ${m.monthName} | ${m.topExpenseCategory} | ${formatCurrencyValue(m.topExpenseAmount, currency)} | ${m.topExpensePercentage.toFixed(1)}% | ${m.topIncomeCategory} (${formatCurrencyValue(m.topIncomeAmount, currency)}) |`);
  });
  lines.push('');

  lines.push('## 5. Strategic Takeaways & Observations');
  executiveObservations.forEach((obs, idx) => {
    lines.push(`${idx + 1}. ${obs}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('*Report compiled by Financial Data Generator engine.*');

  return lines.join('\n');
}

function createEmptyReport(currency: CurrencyConfig, generatedAt: string): FinancialReportData {
  const emptyPatterns: TransactionPatternMetrics = {
    totalTransactions: 0,
    dateRangeStart: '',
    dateRangeEnd: '',
    totalDays: 0,
    incomeCount: 0,
    expenseCount: 0,
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    profitMargin: 0,
    averageIncomeTicket: 0,
    averageExpenseTicket: 0,
    inflowCadenceDays: 0,
    outflowCadenceDays: 0,
    revenueToExpenseCoverageRatio: 0,
    cashFlowHealth: 'Breakeven'
  };

  const emptyVelocity: SpendingVelocityMetrics = {
    totalExpense: 0,
    totalDays: 0,
    dailyVelocity: 0,
    weeklyVelocity: 0,
    monthlyProjectedBurn: 0,
    dailyNetCashFlow: 0,
    velocityTrend: 'Insufficient data',
    monthOverMonthVelocityChanges: []
  };

  return {
    generatedAt,
    currency,
    patterns: emptyPatterns,
    velocity: emptyVelocity,
    expenseCategories: [],
    incomeCategories: [],
    dominantExpenseCategory: null,
    dominantIncomeCategory: null,
    concentrationRisk: 'Balanced Distribution',
    monthlyDominance: [],
    executiveObservations: ['No transaction records available to analyze.'],
    markdownReport: '# Financial Analysis Report\n\nNo transaction records available.'
  };
}
