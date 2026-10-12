import type { StoreTranslator } from '@store/store-i18n'
import { formatDateTime, formatUZS } from '@store/store-shared/lib/formatters'
import type { SaleListItem } from '@store/store-stub'

interface PrintSalesReportOptions {
  t: StoreTranslator
  sales: SaleListItem[]
  filters: string[]
  firstRowNumber: number
  total: number
}

function escapeHtml(value: string): string {
  //
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildSalesReportHtml({ t, sales, filters, firstRowNumber, total }: PrintSalesReportOptions): string {
  //
  const sum = (pick: (sale: SaleListItem) => number) => sales.reduce((acc, sale) => acc + pick(sale), 0)
  const lastRowNumber = firstRowNumber + sales.length - 1
  const rows = sales.map((sale, index) => `
    <tr>
      <td class="muted">${firstRowNumber + index}</td>
      <td class="nowrap">${escapeHtml(formatDateTime(sale.createdAt))}</td>
      <td>${escapeHtml(sale.customer?.fullName ?? t('sales.anonymous'))}${sale.customer?.phone ? `<div class="muted">${escapeHtml(sale.customer.phone)}</div>` : ''}</td>
      <td>${escapeHtml(sale.branch.name)}</td>
      <td>${escapeHtml(t(sale.saleType === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale'))}</td>
      <td>${escapeHtml(sale.soldBy.fullName)}</td>
      <td class="num">${sale._count.items}</td>
      <td class="num">${sale.discountAmountUzs > 0 ? escapeHtml(formatUZS(sale.discountAmountUzs)) : '—'}</td>
      <td class="num strong">${escapeHtml(formatUZS(sale.totalAmountUzs))}</td>
      <td class="num">${escapeHtml(formatUZS(sale.paidAmountUzs))}</td>
      <td class="num">${sale.debtAmountUzs > 0 ? escapeHtml(formatUZS(sale.debtAmountUzs)) : '—'}</td>
    </tr>`).join('')

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(t('sales.printTitle'))}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111; font: 11px/1.35 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 16px; }
  .meta { margin-bottom: 10px; color: #555; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td { padding: 4px 6px; border: 1px solid #bbb; text-align: left; vertical-align: top; }
  th { background: #f1f1f1; font-weight: 700; }
  tfoot td { background: #f7f7f7; font-weight: 700; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .nowrap { white-space: nowrap; }
  .strong { font-weight: 700; }
  .muted { color: #666; }
</style>
</head>
<body>
  <h1>${escapeHtml(t('sales.printTitle'))}</h1>
  <div class="meta">
    ${filters.map(escapeHtml).join(' · ')}<br>
    ${escapeHtml(t('sales.printRows', { from: firstRowNumber, to: lastRowNumber, total }))} · ${escapeHtml(t('sales.printedAt'))}: ${escapeHtml(formatDateTime(new Date().toISOString()))}
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>${escapeHtml(t('common.date'))}</th>
        <th>${escapeHtml(t('nav.customers'))}</th>
        <th>${escapeHtml(t('common.branch'))}</th>
        <th>${escapeHtml(t('sales.colType'))}</th>
        <th>${escapeHtml(t('sales.printSoldBy'))}</th>
        <th class="num">${escapeHtml(t('nav.products'))}</th>
        <th class="num">${escapeHtml(t('sales.drawerDiscount'))}</th>
        <th class="num">${escapeHtml(t('common.total'))}</th>
        <th class="num">${escapeHtml(t('sales.colPaid'))}</th>
        <th class="num">${escapeHtml(t('sales.drawerDebt'))}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="6">${escapeHtml(t('sales.printTotals'))}</td>
        <td class="num">${sum((sale) => sale._count.items)}</td>
        <td class="num">${escapeHtml(formatUZS(sum((sale) => sale.discountAmountUzs)))}</td>
        <td class="num">${escapeHtml(formatUZS(sum((sale) => sale.totalAmountUzs)))}</td>
        <td class="num">${escapeHtml(formatUZS(sum((sale) => sale.paidAmountUzs)))}</td>
        <td class="num">${escapeHtml(formatUZS(sum((sale) => sale.debtAmountUzs)))}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`
}

export function printSalesReport(options: PrintSalesReportOptions) {
  //
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)

  const frameWindow = frame.contentWindow
  if (!frameWindow) {
    frame.remove()
    return
  }

  frameWindow.document.open()
  frameWindow.document.write(buildSalesReportHtml(options))
  frameWindow.document.close()
  frameWindow.addEventListener('afterprint', () => setTimeout(() => frame.remove(), 0), { once: true })
  frameWindow.focus()
  frameWindow.print()
}
