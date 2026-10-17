import type { StoreTranslator } from '@store/store-i18n'
import { formatDateTime, formatUZS } from '@store/store-shared/lib/formatters'
import type { SaleListItem, SaleReport, SaleReportMethodRow } from '@store/store-stub'
import { escapeHtml, printHtml } from '../../print/printHtml'

interface PrintSalesReportOptions {
  t: StoreTranslator
  report: SaleReport
  periodLabel: string
  filters: string[]
}

function money(value: number): string {
  //
  return escapeHtml(formatUZS(value))
}

function formatDay(day: string): string {
  //
  const [year, month, date] = day.split('-')
  return `${date}.${month}.${year}`
}

function table(headers: { label: string; num?: boolean }[], rows: string[][], footer?: string[]): string {
  //
  const head = headers.map((header) => `<th${header.num ? ' class="num"' : ''}>${escapeHtml(header.label)}</th>`).join('')
  const cell = (values: string[], tag: 'td') => values.map((value, index) => `<${tag}${headers[index]?.num ? ' class="num"' : ''}>${value}</${tag}>`).join('')
  const body = rows.map((row) => `<tr>${cell(row, 'td')}</tr>`).join('')
  const foot = footer ? `<tfoot><tr>${cell(footer, 'td')}</tr></tfoot>` : ''
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table>`
}

function methodSection(t: StoreTranslator, title: string, rows: SaleReportMethodRow[]): string {
  //
  if (rows.length === 0) return ''
  const total = rows.reduce((sum, row) => sum + row.amountUzs, 0)
  const count = rows.reduce((sum, row) => sum + row.count, 0)
  return `<section><h2>${escapeHtml(title)}</h2>${table(
    [{ label: t('sales.reportPaymentMethod') }, { label: t('sales.reportCount'), num: true }, { label: t('sales.reportAmount'), num: true }],
    rows.map((row) => [escapeHtml(t(`payment.${row.paymentMethod}`)), String(row.count), money(row.amountUzs)]),
    [escapeHtml(t('sales.printTotals')), String(count), money(total)],
  )}</section>`
}

function salesSection(t: StoreTranslator, report: SaleReport): string {
  //
  if (!report.sales) return `<p class="muted">${escapeHtml(t('sales.reportSalesOmitted'))}</p>`
  if (report.sales.length === 0) return ''
  const sales: SaleListItem[] = report.sales
  const rows = sales.map((sale, index) => [
    `<span class="muted">${index + 1}</span>`,
    `<span class="nowrap">${escapeHtml(formatDateTime(sale.createdAt))}</span>`,
    `${escapeHtml(sale.customer?.fullName ?? t('sales.anonymous'))}${sale.customer?.phone ? `<div class="muted">${escapeHtml(sale.customer.phone)}</div>` : ''}`,
    escapeHtml(sale.branch.name),
    escapeHtml(t(sale.saleType === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale')),
    escapeHtml(sale.soldBy.fullName),
    String(sale._count.items),
    sale.discountAmountUzs > 0 ? money(sale.discountAmountUzs) : '—',
    `<strong>${money(sale.totalAmountUzs)}</strong>`,
    money(sale.paidAmountUzs),
    sale.debtAmountUzs > 0 ? money(sale.debtAmountUzs) : '—',
  ])
  const truncated = report.salesTruncated
    ? `<p class="muted">${escapeHtml(t('sales.reportSalesTruncated', { count: sales.length, total: report.summary.salesCount }))}</p>`
    : ''
  return `<section class="break"><h2>${escapeHtml(t('sales.reportSalesList'))}</h2>${truncated}${table(
    [
      { label: '#' },
      { label: t('common.date') },
      { label: t('nav.customers') },
      { label: t('common.branch') },
      { label: t('sales.colType') },
      { label: t('sales.printSoldBy') },
      { label: t('nav.products'), num: true },
      { label: t('sales.drawerDiscount'), num: true },
      { label: t('common.total'), num: true },
      { label: t('sales.colPaid'), num: true },
      { label: t('sales.drawerDebt'), num: true },
    ],
    rows,
    report.salesTruncated ? undefined : [
      '', escapeHtml(t('sales.printTotals')), '', '', '', '',
      String(sales.reduce((sum, sale) => sum + sale._count.items, 0)),
      money(report.summary.discountUzs),
      money(report.summary.totalUzs),
      money(report.summary.paidUzs),
      money(report.summary.debtUzs),
    ],
  )}</section>`
}

function buildSalesReportHtml({ t, report, periodLabel, filters }: PrintSalesReportOptions): string {
  //
  const { summary } = report
  const stats: [string, string, boolean?][] = [
    [t('sales.reportSalesCount'), String(summary.salesCount)],
    [t('sales.reportItemsSold'), summary.itemsQuantity.toLocaleString('ru-RU')],
    [t('newSale.rowListTotal'), money(summary.listTotalUzs)],
    [t('sales.drawerDiscount'), money(summary.discountUzs)],
    [t('sales.reportRevenue'), money(summary.totalUzs), true],
    [t('sales.reportPaidAtSale'), money(summary.paidUzs)],
    [t('sales.reportOnDebt'), money(summary.debtUzs)],
    [t('sales.reportDebtCollected'), money(summary.debtCollectedUzs)],
    [t('sales.reportReceived'), money(summary.receivedUzs), true],
  ]
  const statsHtml = stats.map(([label, value, strong]) => `<div class="stat${strong ? ' strong' : ''}"><span>${escapeHtml(label)}</span><b>${value}</b></div>`).join('')

  const byDay = report.byDay.length > 1
    ? `<section><h2>${escapeHtml(t('sales.reportByDay'))}</h2>${table(
      [
        { label: t('common.date') },
        { label: t('sales.reportCount'), num: true },
        { label: t('sales.drawerDiscount'), num: true },
        { label: t('sales.reportRevenue'), num: true },
        { label: t('sales.colPaid'), num: true },
        { label: t('sales.drawerDebt'), num: true },
      ],
      report.byDay.map((day) => [formatDay(day.day), String(day.salesCount), money(day.discountUzs), money(day.totalUzs), money(day.paidUzs), money(day.debtUzs)]),
      [escapeHtml(t('sales.printTotals')), String(summary.salesCount), money(summary.discountUzs), money(summary.totalUzs), money(summary.paidUzs), money(summary.debtUzs)],
    )}</section>`
    : ''

  const bySeller = report.bySeller.length > 0
    ? `<section><h2>${escapeHtml(t('sales.reportBySeller'))}</h2>${table(
      [{ label: t('sales.printSoldBy') }, { label: t('sales.reportCount'), num: true }, { label: t('sales.reportRevenue'), num: true }],
      report.bySeller.map((seller) => [escapeHtml(seller.fullName), String(seller.salesCount), money(seller.totalUzs)]),
    )}</section>`
    : ''

  const topProducts = report.topProducts.length > 0
    ? `<section><h2>${escapeHtml(t('sales.reportTopProducts'))}</h2>${table(
      [{ label: t('newSale.colProduct') }, { label: t('newSale.colQty'), num: true }, { label: t('sales.reportRevenue'), num: true }],
      report.topProducts.map((product) => [
        `${escapeHtml(product.name)}${product.sku ? ` <span class="muted">${escapeHtml(product.sku)}</span>` : ''}`,
        `${product.quantity.toLocaleString('ru-RU')} ${escapeHtml(t(`units.${product.unit}`))}`,
        money(product.totalUzs),
      ]),
    )}</section>`
    : ''

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(t('sales.printTitle'))} · ${escapeHtml(periodLabel)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111; font: 11px/1.35 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
  h1 { margin: 0 0 2px; font-size: 17px; }
  h2 { margin: 14px 0 6px; font-size: 13px; }
  .meta { margin-bottom: 10px; color: #555; }
  .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .stat { border: 1px solid #bbb; padding: 6px 8px; }
  .stat span { display: block; color: #555; font-size: 10px; }
  .stat b { font-size: 13px; font-variant-numeric: tabular-nums; }
  .stat.strong { background: #f1f1f1; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; align-items: start; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td { padding: 4px 6px; border: 1px solid #bbb; text-align: left; vertical-align: top; }
  th { background: #f1f1f1; font-weight: 700; }
  tfoot td { background: #f7f7f7; font-weight: 700; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .nowrap { white-space: nowrap; }
  .muted { color: #666; }
  section { page-break-inside: avoid; }
  section.break { page-break-inside: auto; }
</style>
</head>
<body>
  <h1>${escapeHtml(t('sales.printTitle'))}: ${escapeHtml(periodLabel)}</h1>
  <div class="meta">
    ${filters.map(escapeHtml).join(' · ')}${filters.length ? ' · ' : ''}${escapeHtml(t('sales.printedAt'))}: ${escapeHtml(formatDateTime(new Date().toISOString()))}
  </div>
  <div class="stats">${statsHtml}</div>
  <div class="grid2">
    <div>${methodSection(t, t('sales.reportPaymentsAtSale'), report.payments)}${methodSection(t, t('sales.reportDebtCollections'), report.debtCollections)}${bySeller}</div>
    <div>${topProducts}</div>
  </div>
  ${byDay}
  ${salesSection(t, report)}
</body>
</html>`
}

export function printSalesReport(options: PrintSalesReportOptions) {
  //
  printHtml(buildSalesReportHtml(options))
}
