import { Transaction, TransactionAnomaly, CurrencyConfig } from '../types';
import { formatCurrencyValue } from './generator';

/**
 * Detects transactions that are significantly higher than the average for their category.
 * Returns a Map from transaction ID to its TransactionAnomaly details.
 */
export function detectUnusualTransactions(
  transactions: Transaction[],
  currency: CurrencyConfig,
  thresholdMultiplier = 1.55
): Map<string, TransactionAnomaly> {
  const resultMap = new Map<string, TransactionAnomaly>();
  if (transactions.length === 0) return resultMap;

  // 1. Group amounts by category
  const categoryStats = new Map<string, { sum: number; count: number; amounts: number[] }>();
  let overallSum = 0;

  for (const t of transactions) {
    overallSum += t.amount;
    const cat = t.category || 'Uncategorized';
    const current = categoryStats.get(cat) || { sum: 0, count: 0, amounts: [] };
    current.sum += t.amount;
    current.count += 1;
    current.amounts.push(t.amount);
    categoryStats.set(cat, current);
  }

  const overallAverage = overallSum / (transactions.length || 1);

  // Helper to find a better-fitting category with a closer average amount
  function findClosestCategory(
    currentCat: string,
    amount: number,
    type: string
  ): string | undefined {
    let bestCat: string | undefined = undefined;
    let minDiff = Infinity;

    for (const [otherCat, otherStat] of categoryStats.entries()) {
      if (otherCat === currentCat || otherStat.count < 1) continue;
      const otherAvg = otherStat.sum / otherStat.count;
      const diff = Math.abs(otherAvg - amount);
      // Ensure the transaction wouldn't be an extreme outlier in the target category (e.g. ratio < 1.4)
      const ratioInTarget = otherAvg > 0 ? amount / otherAvg : 1;
      if (ratioInTarget <= 1.45 && ratioInTarget >= 0.55 && diff < minDiff) {
        minDiff = diff;
        bestCat = otherCat;
      }
    }

    if (!bestCat) {
      if (type === 'expense') {
        if (amount >= 1500 && currentCat !== 'Equipment & Hardware') {
          return 'Equipment & Hardware';
        }
        if (currentCat !== 'Facilities & Rent') {
          return 'Facilities & Rent';
        }
      } else {
        if (amount >= 3500 && currentCat !== 'Consulting & Retainers') {
          return 'Consulting & Retainers';
        }
        if (currentCat !== 'Project Billing') {
          return 'Project Billing';
        }
      }
    }

    return bestCat;
  }

  // 2. Evaluate each transaction
  for (const t of transactions) {
    const id = t.id || `${t.date}-${t.description}`;
    const cat = t.category || 'Uncategorized';
    const stat = categoryStats.get(cat);
    if (!stat) continue;

    const catAvg = stat.sum / stat.count;
    const descLower = (t.description || '').toLowerCase();

    if (stat.count >= 2) {
      // Multiple items in category: check if significantly higher than category average
      const ratio = catAvg > 0 ? t.amount / catAvg : 1;
      const deviationPercent = catAvg > 0 ? ((t.amount - catAvg) / catAvg) * 100 : 0;

      // Flag if exceeds thresholdMultiplier (e.g. 1.55x) and exceeds baseline absolute diff ($150)
      if (ratio >= thresholdMultiplier && (t.amount - catAvg) >= 150) {
        // Determine specific anomaly type
        let anomalyType: 'Category peak' | 'Multi-period aggregation' | 'Capital outlay' | 'Revenue milestone' | 'Volume outlier' = 'Category peak';
        if (t.type === 'income') {
          anomalyType = descLower.includes('milestone') || descLower.includes('retainer') || descLower.includes('enterprise')
            ? 'Revenue milestone'
            : 'Category peak';
        } else {
          if (descLower.includes('quarterly') || descLower.includes('annual') || descLower.includes('payroll') || descLower.includes('bi-weekly')) {
            anomalyType = 'Multi-period aggregation';
          } else if (descLower.includes('hardware') || descLower.includes('monitor') || descLower.includes('machine') || descLower.includes('installation') || descLower.includes('lease') || descLower.includes('equipment')) {
            anomalyType = 'Capital outlay';
          } else {
            anomalyType = 'Category peak';
          }
        }

        // Generate context-aware potential reasons
        const reasons: string[] = [
          `Category peak: Transaction amount (${formatCurrencyValue(t.amount, currency)}) is ${ratio.toFixed(1)}x higher (+${Math.round(deviationPercent)}%) than the ${cat} baseline of ${formatCurrencyValue(catAvg, currency)}.`
        ];

        if (anomalyType === 'Multi-period aggregation') {
          reasons.push('Period aggregation: Payment may bundle multiple billing cycles, multi-person payroll, or upfront quarterly commitments.');
        } else if (anomalyType === 'Capital outlay') {
          reasons.push('Capital asset vs. operating expense: High-value hardware, tooling, or machinery may be a capital asset rather than routine operational overhead.');
        } else if (anomalyType === 'Revenue milestone') {
          reasons.push('Contract milestone: Significant client milestone, upfront retainer, or enterprise delivery payout that creates a non-recurring revenue spike.');
        } else {
          reasons.push('Non-recurring outlay: Irregular one-time operational expense or bulk purchase that distorts routine monthly spending.');
        }

        reasons.push(`Classification review: Amount significantly exceeds ${cat} norms; consider reclassifying to a higher-volume cost center or adjusting to the category benchmark.`);

        const suggestedCat = findClosestCategory(cat, t.amount, t.type);
        const suggestedNormalizedAmount = Math.round(catAvg * 100) / 100;

        resultMap.set(id, {
          transactionId: id,
          isUnusual: true,
          categoryAverage: Math.round(catAvg * 100) / 100,
          categoryCount: stat.count,
          overallAverage: Math.round(overallAverage * 100) / 100,
          deviationPercent: Math.round(deviationPercent),
          ratio: Math.round(ratio * 10) / 10,
          reason: `${formatCurrencyValue(t.amount, currency)} is ${ratio.toFixed(1)}x higher (+${Math.round(deviationPercent)}%) than the ${cat} average (${formatCurrencyValue(catAvg, currency)})`,
          anomalyType,
          potentialReasons: reasons,
          suggestedCategory: suggestedCat,
          suggestedNormalizedAmount
        });
      }
    } else {
      // Single transaction in category: check if significantly higher than overall average
      const overallRatio = overallAverage > 0 ? t.amount / overallAverage : 1;
      const deviationPercent = overallAverage > 0 ? ((t.amount - overallAverage) / overallAverage) * 100 : 0;

      if (overallRatio >= thresholdMultiplier * 1.25 && (t.amount - overallAverage) >= 250) {
        const anomalyType = t.type === 'income' ? 'Revenue milestone' : 'Volume outlier';
        const reasons: string[] = [
          `Category peak / Isolated outlier: Sole transaction in "${cat}" is ${overallRatio.toFixed(1)}x higher than the overall business average of ${formatCurrencyValue(overallAverage, currency)}.`,
          `Category creation: Single-entry category creates an isolated volume distortion without an established baseline.`,
          `Reclassification recommended: Merge into an existing active category with comparable transaction amounts.`
        ];

        const suggestedCat = findClosestCategory(cat, t.amount, t.type);
        const suggestedNormalizedAmount = Math.round(overallAverage * 100) / 100;

        resultMap.set(id, {
          transactionId: id,
          isUnusual: true,
          categoryAverage: t.amount,
          categoryCount: 1,
          overallAverage: Math.round(overallAverage * 100) / 100,
          deviationPercent: Math.round(deviationPercent),
          ratio: Math.round(overallRatio * 10) / 10,
          reason: `${formatCurrencyValue(t.amount, currency)} is ${overallRatio.toFixed(1)}x higher than the overall business average (${formatCurrencyValue(overallAverage, currency)})`,
          anomalyType,
          potentialReasons: reasons,
          suggestedCategory: suggestedCat,
          suggestedNormalizedAmount
        });
      }
    }
  }

  return resultMap;
}
