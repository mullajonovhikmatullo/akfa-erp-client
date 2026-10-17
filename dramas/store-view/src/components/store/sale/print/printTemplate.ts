import { STORE_TRANSLATIONS, type StoreLocale, type StoreTranslationKey } from '@store/store-i18n'
import { escapeHtml } from './printHtml'

export type PrintText = (key: StoreTranslationKey) => string

export interface TemplateLine {
  name: string
  quantity: number
  unit: string
  listUnitPrice: number
  discountPercent: number
  unitPrice: number
  listTotalUzs: number
  totalUzs: number
}

const uzsFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const usdFormat = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const qtyFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 4 })

const HTML_LANG: Record<StoreLocale, string> = { 'uz-cy': 'uz-Cyrl', 'uz-la': 'uz-Latn', ru: 'ru', en: 'en' }

export function uzs(value: number): string {
  //
  return uzsFormat.format(Math.round(value * 100) / 100)
}

export function usd(value: number, rate: number | null): string {
  //
  return rate ? usdFormat.format(value / rate) : ''
}

export function qty(value: number): string {
  //
  return qtyFormat.format(value)
}

function pad(value: number): string {
  //
  return String(value).padStart(2, '0')
}

export function formatStamp(date: Date): string {
  //
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function printTextFor(locale: StoreLocale): (key: StoreTranslationKey) => string {
  //
  return (key) => escapeHtml(STORE_TRANSLATIONS[locale][key] ?? STORE_TRANSLATIONS['uz-cy'][key])
}

export function partyLine(label: string, value: string | null | undefined): string {
  //
  return `<div class="line"><span class="k">${label}:</span> <span class="v">${escapeHtml(value ?? '')}</span></div>`
}

export function settlementRow(label: string, uzsValue: string, usdValue: string): string {
  //
  return `<tr><th>${label}:</th><td class="n">${uzsValue}</td><td class="n">${usdValue}</td></tr>`
}

export function linesTableHtml(text: PrintText, lines: TemplateLine[], rate: number | null): string {
  //
  const units = new Set(lines.map((line) => line.unit))
  const totalQty = units.size === 1 ? qty(lines.reduce((sum, line) => sum + line.quantity, 0)) : ''
  const totalAmount = lines.reduce((sum, line) => sum + line.listTotalUzs, 0)
  const totalNet = lines.reduce((sum, line) => sum + line.totalUzs, 0)
  const totalDiscount = Math.max(0, totalAmount - totalNet)

  const body = lines.map((line, index) => {
    //
    const discount = Math.max(0, line.listTotalUzs - line.totalUzs)
    return `<tr>
    <td class="c">${index + 1}</td>
    <td class="name">${escapeHtml(line.name)}</td>
    <td class="n">${qty(line.quantity)}</td>
    <td class="n">${uzs(line.listUnitPrice)}</td>
    <td class="n">${uzs(line.listTotalUzs)}</td>
    <td class="c">${line.discountPercent > 0 ? `${qty(line.discountPercent)}%` : ''}</td>
    <td class="n">${discount > 0 ? uzs(discount) : ''}</td>
    <td class="n">${uzs(line.unitPrice)}</td>
    <td class="n">${uzs(line.totalUzs)}</td>
  </tr>`
  }).join('')

  const usdRow = rate
    ? `<tr class="total">
      <td colspan="2" class="label">${text('invoice.totalUsd')}</td>
      <td></td><td></td>
      <td class="n">${usd(totalAmount, rate)}</td>
      <td></td>
      <td class="n">${totalDiscount > 0 ? usd(totalDiscount, rate) : ''}</td>
      <td></td>
      <td class="n">${usd(totalNet, rate)}</td>
    </tr>`
    : ''

  return `<table class="items">
    <colgroup>
      <col style="width:4%"><col><col style="width:7%"><col style="width:8%"><col style="width:11%">
      <col style="width:6%"><col style="width:9%"><col style="width:9%"><col style="width:11%">
    </colgroup>
    <thead><tr>
      <th>№</th>
      <th>${text('invoice.colProduct')}</th>
      <th>${text('invoice.colQty')}</th>
      <th>${text('invoice.colPrice')}</th>
      <th>${text('invoice.colAmount')}</th>
      <th>${text('invoice.colDiscount')}</th>
      <th>${text('invoice.colDiscountAmount')}</th>
      <th>${text('invoice.colDiscountedPrice')}</th>
      <th>${text('invoice.colDiscountedAmount')}</th>
    </tr></thead>
    <tbody>
      ${body}
      <tr class="total">
        <td colspan="2" class="label">${text('invoice.totalUzs')}</td>
        <td class="n">${totalQty}</td>
        <td></td>
        <td class="n">${uzs(totalAmount)}</td>
        <td></td>
        <td class="n">${totalDiscount > 0 ? uzs(totalDiscount) : ''}</td>
        <td></td>
        <td class="n">${uzs(totalNet)}</td>
      </tr>
      ${usdRow}
    </tbody>
  </table>`
}

export function templateDocument(locale: StoreLocale, title: string, body: string): string {
  //
  return `<!doctype html>
<html lang="${HTML_LANG[locale]}">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #000; font: 11px/1.3 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .top { display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; margin-bottom: 8px; }
  .top .doc { font-size: 14px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 12px; }
  .party h3 { margin: 0 0 3px; font-size: 12px; text-align: center; }
  .party .firm { font-weight: 700; }
  .line { font-weight: 700; padding: 1px 0; }
  .line .v { font-weight: 400; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .items th, .items td { border: 1px solid #000; padding: 2px 4px; vertical-align: middle; }
  .items th { background: #fff2cc; font-weight: 700; text-align: center; }
  .items td.n { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .items td.c { text-align: center; white-space: nowrap; }
  .items td.name { word-break: break-word; }
  .items tr.total td { background: #fff2cc; font-weight: 700; }
  .items tr.total td.label { text-align: center; }
  .note { margin: 4px 0; font-style: italic; }
  .summary { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-top: 10px; page-break-inside: avoid; }
  .grand { font-style: italic; font-size: 12px; line-height: 1.6; white-space: nowrap; }
  .grand b { font-style: normal; }
  .settle { width: auto; }
  .settle th { text-align: right; font-weight: 700; font-style: italic; padding: 1px 8px 1px 0; white-space: nowrap; }
  .settle td { padding: 1px 0 1px 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .settle thead th { font-style: normal; text-align: right; padding: 1px 0 1px 12px; }
  .n { text-align: right; }
</style>
</head>
<body>
${body}
</body>
</html>`
}
