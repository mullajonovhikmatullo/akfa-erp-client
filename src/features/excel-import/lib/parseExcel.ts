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

export function downloadTemplate(headers: string[], exampleRow: string[], fileName: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  // Bold header row
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
