import * as XLSX from 'xlsx'

export interface TemplateHint {
  label: string
  items: string[]
}

export function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  //
  return new Promise((resolve, reject) => {
    //
    const reader = new FileReader()
    reader.onload = (event) => {
      //
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0] ?? ''
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
          resolve([])
          return
        }
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
          defval: '',
          raw: false,
        })
        resolve(rows)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function downloadTemplate(headers: string[], exampleRows: string[][], fileName: string, hints?: TemplateHint[]) {
  //
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleRows])
  worksheet['!cols'] = headers.map((header, index) => ({
    wch: Math.max(header.length, ...exampleRows.map((row) => row[index]?.length ?? 0), 12) + 2,
  }))
  headers.forEach((_, index) => {
    //
    const cell = XLSX.utils.encode_cell({ r: 0, c: index })
    if (worksheet[cell]) worksheet[cell].s = { font: { bold: true } }
  })

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  if (hints?.length) {
    const maxItems = Math.max(...hints.map((hint) => hint.items.length))
    const hintRows = [
      hints.map((hint) => hint.label),
      ...Array.from({ length: maxItems }, (_, rowIndex) => hints.map((hint) => hint.items[rowIndex] ?? '')),
    ]
    const hintWorksheet = XLSX.utils.aoa_to_sheet(hintRows)
    hintWorksheet['!cols'] = hints.map((hint) => ({
      wch: Math.min(Math.max(hint.label.length, ...hint.items.map((item) => item.length), 14) + 2, 60),
    }))
    hints.forEach((_, index) => {
      //
      const cell = XLSX.utils.encode_cell({ r: 0, c: index })
      if (hintWorksheet[cell]) hintWorksheet[cell].s = { font: { bold: true } }
    })
    XLSX.utils.book_append_sheet(workbook, hintWorksheet, 'Values')
  }

  XLSX.writeFile(workbook, fileName)
}

export function normaliseKey(value: string) {
  //
  return value.toLowerCase().replace(/\s+/g, '').replace(/_/g, '')
}

export function getField(row: Record<string, string>, key: string): string {
  //
  const normalized = normaliseKey(key)
  for (const rowKey of Object.keys(row)) {
    if (normaliseKey(rowKey) === normalized) return (row[rowKey] ?? '').trim()
  }
  return ''
}

function normaliseNumericText(value: string) {
  //
  const compact = value.trim().replace(/[\s']/g, '')
  const commaCount = (compact.match(/,/g) ?? []).length
  const dotCount = (compact.match(/\./g) ?? []).length

  if (commaCount > 0 && dotCount > 0) {
    const decimalSep = compact.lastIndexOf(',') > compact.lastIndexOf('.') ? ',' : '.'
    const thousandsSep = decimalSep === ',' ? '.' : ','
    return compact.replace(new RegExp(`\\${thousandsSep}`, 'g'), '').replace(decimalSep, '.')
  }

  if (commaCount > 1) return compact.replace(/,/g, '')
  if (dotCount > 1) return compact.replace(/\./g, '')

  if (commaCount === 1) {
    const [whole, fraction = ''] = compact.split(',')
    return fraction.length === 3 ? `${whole}${fraction}` : `${whole}.${fraction}`
  }

  if (dotCount === 1) {
    const [whole, fraction = ''] = compact.split('.')
    return fraction.length === 3 ? `${whole}${fraction}` : compact
  }

  return compact
}

export function parseExcelNumber(value: string): number | undefined {
  //
  if (!value.trim()) return undefined
  return Number(normaliseNumericText(value))
}

export function hasMaxTwoDecimals(value: number) {
  //
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-9
}

export function isUuid(value: string) {
  //
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
