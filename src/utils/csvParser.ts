import { Transaction, CsvMappingConfig, ParsedCsvData } from '../types';

/**
 * Robust CSV parser that handles delimiters, quotes, newlines, and trims BOM.
 */
export function parseCsvText(text: string, fileName = 'upload.csv'): ParsedCsvData {
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    return { headers: [], rows: [], fileName, totalRows: 0 };
  }

  // Detect delimiter: inspect first line for commas vs semicolons vs tabs
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  } else if (firstLine.includes('\t') && !firstLine.includes(',')) {
    delimiter = '\t';
  }

  const rawRows = parseCsvTokens(cleanText, delimiter);
  if (rawRows.length === 0) {
    return { headers: [], rows: [], fileName, totalRows: 0 };
  }

  const headers = rawRows[0].map(h => h.trim().replace(/^["']|["']$/g, ''));
  const dataRows: Record<string, string>[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const rowTokens = rawRows[i];
    // Skip empty lines
    if (rowTokens.length === 1 && rowTokens[0].trim() === '') continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, colIndex) => {
      rowObj[h] = rowTokens[colIndex] !== undefined ? rowTokens[colIndex].trim() : '';
    });
    dataRows.push(rowObj);
  }

  return {
    headers,
    rows: dataRows,
    fileName,
    totalRows: dataRows.length
  };
}

/**
 * Tokenizer respecting quoted strings with escaped double quotes
 */
function parseCsvTokens(text: string, delimiter: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      currentRow.push(currentToken);
      currentToken = '';
      i++;
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentToken);
      currentToken = '';
      lines.push(currentRow);
      currentRow = [];
      i++;
      continue;
    }

    currentToken += char;
    i++;
  }

  if (currentToken.length > 0 || currentRow.length > 0) {
    currentRow.push(currentToken);
    lines.push(currentRow);
  }

  return lines;
}

/**
 * Auto-detect column mappings based on common financial header names
 */
export function guessInitialMapping(headers: string[]): CsvMappingConfig {
  const lowerHeaders = headers.map(h => h.toLowerCase());

  const findHeader = (candidates: string[]): string => {
    for (const cand of candidates) {
      const idx = lowerHeaders.findIndex(h => h.includes(cand));
      if (idx !== -1) return headers[idx];
    }
    return headers[0] || '';
  };

  const dateCol = findHeader(['date', 'posted', 'timestamp', 'day', 'time', 'period']);
  const descCol = findHeader(['description', 'desc', 'memo', 'detail', 'payee', 'vendor', 'merchant', 'narrative', 'title', 'name']);
  const catCol = findHeader(['category', 'classification', 'cat', 'account', 'tag', 'group']);
  const typeCol = findHeader(['type', 'direction', 'flow', 'credit/debit', 'dr/cr', 'kind']);
  const amtCol = findHeader(['amount', 'amt', 'total', 'value', 'net', 'sum', 'cost', 'price']);

  return {
    dateColumn: dateCol,
    descriptionColumn: descCol,
    categoryColumn: catCol,
    typeColumn: typeCol,
    typeHandling: typeCol ? 'column' : 'sign',
    amountColumn: amtCol,
    fallbackCategory: 'General Business'
  };
}

/**
 * Normalizes varied date formats into ISO "YYYY-MM-DD"
 */
export function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];

  const trimmed = raw.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try parsing MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        // MM/DD/YYYY or DD/MM/YYYY
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        const month = p0 <= 12 ? p0 : p1;
        const day = p0 <= 12 ? p1 : p0;
        return `${parts[2]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  // General JavaScript Date fallback
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Converts a single parsed CSV row into a clean Transaction record
 */
export function convertRowToTransaction(
  row: Record<string, string>,
  mapping: CsvMappingConfig,
  index: number,
  currencyCode = 'USD'
): Transaction | null {
  const rawDate = row[mapping.dateColumn] || '';
  const rawDesc = row[mapping.descriptionColumn] || '';
  const rawCat = row[mapping.categoryColumn] || '';
  const rawType = row[mapping.typeColumn] || '';
  const rawAmt = row[mapping.amountColumn] || '';

  // Clean and parse amount
  let cleanAmtStr = rawAmt.trim().replace(/[$€£¥CA$A$CHF,\s]/gi, '');
  let isNegativeFromSign = false;

  // Handle accounting parentheses like (125.50)
  if (/^\(.*\)$/.test(cleanAmtStr)) {
    isNegativeFromSign = true;
    cleanAmtStr = cleanAmtStr.replace(/[()]/g, '');
  } else if (cleanAmtStr.startsWith('-')) {
    isNegativeFromSign = true;
    cleanAmtStr = cleanAmtStr.replace('-', '');
  }

  const parsedAmount = parseFloat(cleanAmtStr);
  if (isNaN(parsedAmount) || parsedAmount === 0) {
    return null;
  }

  const finalAmount = Math.round(Math.abs(parsedAmount) * 100) / 100;

  // Resolve type (income or expense)
  let finalType: 'income' | 'expense' = 'expense';

  if (mapping.typeHandling === 'default_income') {
    finalType = 'income';
  } else if (mapping.typeHandling === 'default_expense') {
    finalType = 'expense';
  } else if (mapping.typeHandling === 'sign') {
    finalType = isNegativeFromSign ? 'expense' : 'income';
  } else if (mapping.typeHandling === 'column') {
    const tLower = rawType.toLowerCase().trim();
    if (
      tLower.includes('inc') ||
      tLower.includes('credit') ||
      tLower.includes('cr') ||
      tLower.includes('rev') ||
      tLower.includes('dep') ||
      tLower.includes('inflow')
    ) {
      finalType = 'income';
    } else if (
      tLower.includes('exp') ||
      tLower.includes('debit') ||
      tLower.includes('dr') ||
      tLower.includes('outflow') ||
      tLower.includes('pay') ||
      tLower.includes('cost')
    ) {
      finalType = 'expense';
    } else {
      // Fallback to sign
      finalType = isNegativeFromSign ? 'expense' : 'income';
    }
  }

  const date = normalizeDate(rawDate);
  const description = rawDesc.trim() || `Imported Transaction #${index + 1}`;
  const category = rawCat.trim() || mapping.fallbackCategory || 'General Business';

  return {
    id: `import_${Date.now()}_${index}`,
    date,
    description,
    category,
    type: finalType,
    amount: finalAmount,
    currency: currencyCode,
    paymentMethod: 'Imported CSV',
    status: 'settled'
  };
}

export const SAMPLE_CSV_TEXT = `Date,Description,Category,Type,Amount
2026-09-02,"Direct Deposit - Client Invoice #1042","Consulting & Retainers",income,5800.00
2026-09-05,"Google Workspace & Cloud Server Cluster","Software & Cloud",expense,289.40
2026-09-11,"Commercial Co-working Office Lease","Facilities & Rent",expense,1350.00
2026-09-18,"Digital Product Sales Batch Payout","Product Sales",income,2450.00
2026-09-24,"Semi-Monthly Team Payroll & Benefits","Payroll & Compensation",expense,3900.00
2026-10-03,"Strategic Advisory Sprint Retainer","Consulting & Retainers",income,6200.00
2026-10-10,"Commercial General Liability Policy","Insurance & Legal",expense,580.00
2026-10-17,"Ergonomic Standing Desks & Displays","Equipment & Hardware",expense,920.50
2026-10-22,"Paid Search & Social Acquisition Ads","Marketing & Advertising",expense,460.00
2026-10-29,"Client Milestone Sign-off Payment","Project Billing",income,4100.00`;
