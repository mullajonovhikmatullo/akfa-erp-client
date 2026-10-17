import { STORE_TRANSLATIONS, type StoreLocale, type StoreTranslationKey } from '@store/store-i18n'
import type { SaleInvoice } from '@store/store-stub'
import { escapeHtml, printHtml } from './printHtml'

const uzsFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const usdFormat = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const qtyFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 4 })

function uzs(value: number): string {
  //
  return uzsFormat.format(Math.round(value * 100) / 100)
}

function usd(value: number, rate: number | null): string {
  //
  return rate ? usdFormat.format(value / rate) : ''
}

function pad(value: number): string {
  //
  return String(value).padStart(2, '0')
}

function formatStamp(iso: string): string {
  //
  const date = new Date(iso)
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function documentNumber(id: string): string {
  //
  return (id.split('-')[0] ?? id).toUpperCase()
}

const HTML_LANG: Record<StoreLocale, string> = { 'uz-cy': 'uz-Cyrl', 'uz-la': 'uz-Latn', ru: 'ru', en: 'en' }

export function buildSaleInvoiceHtml(locale: StoreLocale, invoice: SaleInvoice): string {
  //
  const t = (key: StoreTranslationKey) => STORE_TRANSLATIONS[locale][key] ?? STORE_TRANSLATIONS['uz-cy'][key]
  const { sale, store, usdToUzsRate: rate, customerDebt } = invoice
  const text = (key: StoreTranslationKey) => escapeHtml(t(key))

  const rows = sale.items.map((item) => {
    //
    const listPrice = item.listUnitPrice ?? item.unitPrice
    const amount = Math.round(item.quantity * listPrice)
    return { item, listPrice, amount, discount: Math.max(0, amount - item.totalPrice) }
  })
  const units = new Set(sale.items.map((item) => item.product.unit))
  const totalQty = units.size === 1 ? qtyFormat.format(sale.items.reduce((sum, item) => sum + item.quantity, 0)) : ''
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0)
  const totalDiscount = rows.reduce((sum, row) => sum + row.discount, 0)
  const totalNet = sale.totalAmountUzs

  const body = rows.map(({ item, listPrice, amount, discount }, index) => `<tr>
    <td class="c">${index + 1}</td>
    <td class="name">${escapeHtml(item.product.name)}</td>
    <td class="n">${qtyFormat.format(item.quantity)}</td>
    <td class="n">${uzs(listPrice)}</td>
    <td class="n">${uzs(amount)}</td>
    <td class="c">${item.discountPercent > 0 ? `${qtyFormat.format(item.discountPercent)}%` : ''}</td>
    <td class="n">${discount > 0 ? uzs(discount) : ''}</td>
    <td class="n">${uzs(item.unitPrice)}</td>
    <td class="n">${uzs(item.totalPrice)}</td>
  </tr>`).join('')

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

  const settlementRow = (label: StoreTranslationKey, uzsValue: number, usdValue: string) =>
    `<tr><th>${text(label)}:</th><td class="n">${uzs(uzsValue)}</td><td class="n">${usdValue}</td></tr>`
  const settlement = [
    customerDebt ? settlementRow('invoice.debtBefore', customerDebt.beforeUzs, usd(customerDebt.beforeUzs, rate)) : '',
    settlementRow('invoice.payment', invoice.paidAtSaleUzs, usd(invoice.paidAtSaleUzs, rate)),
    settlementRow('invoice.change', invoice.changeUzs, usd(invoice.changeUzs, rate)),
    customerDebt ? settlementRow('invoice.debtAfter', customerDebt.afterUzs, usd(customerDebt.afterUzs, rate)) : '',
  ].join('')

  const party = (label: StoreTranslationKey, value: string | null | undefined) =>
    `<div class="line"><span class="k">${text(label)}:</span> <span class="v">${escapeHtml(value ?? '')}</span></div>`

  return `<!doctype html>
<html lang="${HTML_LANG[locale]}">
<head>
<meta charset="utf-8">
<title>${text('invoice.title')} № ${documentNumber(sale.id)}</title>
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
  .summary { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-top: 10px; page-break-inside: avoid; }
  .grand { font-style: italic; font-size: 12px; line-height: 1.6; white-space: nowrap; }
  .grand b { font-style: normal; }
  .settle th { text-align: right; font-weight: 700; font-style: italic; padding: 1px 8px 1px 0; white-space: nowrap; }
  .settle td { padding: 1px 0 1px 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .settle thead th { font-style: normal; text-align: right; padding: 1px 0 1px 12px; }
  .n { text-align: right; }
</style>
</head>
<body>
  <div class="top">
    <span>${escapeHtml(formatStamp(sale.createdAt))}</span>
    <span class="doc">${text('invoice.title')} № ${documentNumber(sale.id)}</span>
  </div>
  <div class="parties">
    <div class="party">
      <h3>${text('invoice.ourCompany')}</h3>
      <div class="firm">${escapeHtml(store.name)}</div>
      ${party('invoice.contactPhone', store.phone)}
      ${party('invoice.employee', sale.soldBy.fullName)}
    </div>
    <div class="party">
      <h3>${text('invoice.customer')}</h3>
      ${party('invoice.customerName', sale.customer?.fullName)}
      ${party('invoice.customerPhone', sale.customer?.phone)}
    </div>
  </div>
  <table class="items">
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
  </table>
  <div class="summary">
    <div class="grand">
      <div>${text('invoice.grandTotalUzs')}: <b>${uzs(totalNet)}</b></div>
      ${rate ? `<div>${text('invoice.grandTotalUsd')}: <b>${usd(totalNet, rate)}</b></div><div>${text('invoice.rate')}: ${uzs(rate)}</div>` : ''}
    </div>
    <table class="settle">
      <thead><tr><th></th><th>${text('invoice.currencyUzs')}</th><th>${rate ? text('invoice.currencyUsd') : ''}</th></tr></thead>
      <tbody>${settlement}</tbody>
    </table>
  </div>
</body>
</html>`
}

export function printSaleInvoice(locale: StoreLocale, invoice: SaleInvoice) {
  //
  printHtml(buildSaleInvoiceHtml(locale, invoice))
}
