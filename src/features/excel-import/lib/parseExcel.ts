import * as XLSX from 'xlsx';

export function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const sheetName = wb.SheetNames[0] ?? '';
        const ws = wb.Sheets[sheetName];
        if (!ws) { resolve([]); return; }
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
          defval: '',
          raw: false, // everything as string — we parse numbers ourselves
        });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate(headers: string[], exampleRows: string[][], fileName: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleRows]);
  headers.forEach((_, i) => {
    const cell = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[cell]) ws[cell].s = { font: { bold: true } };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, fileName);
}

/** Normalise a raw Excel header to lowercase-no-spaces for fuzzy matching */
export function normaliseKey(s: string) {
  return s.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
}

/** Pick a value from a raw row regardless of letter case / spaces in header */
export function getField(row: Record<string, string>, key: string): string {
  const norm = normaliseKey(key);
  for (const k of Object.keys(row)) {
    if (normaliseKey(k) === norm) return (row[k] ?? '').trim();
  }
  return '';
}

function normaliseNumericText(value: string) {
  const compact = value.trim().replace(/[\s']/g, '');
  const commaCount = (compact.match(/,/g) ?? []).length;
  const dotCount = (compact.match(/\./g) ?? []).length;

  if (commaCount > 0 && dotCount > 0) {
    const decimalSep = compact.lastIndexOf(',') > compact.lastIndexOf('.') ? ',' : '.';
    const thousandsSep = decimalSep === ',' ? '.' : ',';
    return compact
      .replace(new RegExp(`\\${thousandsSep}`, 'g'), '')
      .replace(decimalSep, '.');
  }

  if (commaCount > 1) return compact.replace(/,/g, '');
  if (dotCount > 1) return compact.replace(/\./g, '');

  if (commaCount === 1) {
    const [whole, fraction = ''] = compact.split(',');
    return fraction.length === 3 ? `${whole}${fraction}` : `${whole}.${fraction}`;
  }

  if (dotCount === 1) {
    const [whole, fraction = ''] = compact.split('.');
    return fraction.length === 3 ? `${whole}${fraction}` : compact;
  }

  return compact;
}

export function parseExcelNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  return Number(normaliseNumericText(value));
}

export function hasMaxTwoDecimals(value: number) {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-9;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
