import type { StoreLocale } from '@store/store-i18n'
import type { SaleReport, SaleReportQuery } from '@store/store-stub'
import { escapeHtml, printHtml } from '../../print/printHtml'
import { formatStamp, linesTableHtml, partyLine, printTextFor, qty, settlementRow, templateDocument, usd, uzs } from '../../print/printTemplate'

interface PrintSalesReportOptions {
  locale: StoreLocale
  report: SaleReport
  query: SaleReportQuery
  periodLabel: string
}

export function buildSalesReportHtml({ locale, report, query, periodLabel }: PrintSalesReportOptions): string {
  //
  const text = printTextFor(locale)
  const { summary, store, usdToUzsRate: rate } = report
  const saleType = query.saleType === 'RETAIL'
    ? text('sales.typeRetail')
    : query.saleType === 'WHOLESALE' ? text('sales.typeWholesale') : text('sales.filterAllTypes')
  const status = query.hasDebt === true ? text('sales.hasDebt') : query.hasDebt === false ? text('sales.filterPaid') : null
  const truncated = report.linesTruncated
    ? `<p class="note">${text('invoice.linesTruncated').replace('{count}', qty(report.lines.length))}</p>`
    : ''
  const row = (label: string, value: number, strong = false) => {
    //
    const wrap = (cell: string) => (strong ? `<b>${cell}</b>` : cell)
    return settlementRow(wrap(label), wrap(uzs(value)), wrap(usd(value, rate)))
  }

  const settlement = [
    ...report.payments.map((payment) => row(text(`payment.${payment.paymentMethod}`), payment.amountUzs)),
    row(text('sales.reportOnDebt'), summary.debtUzs),
    row(text('sales.reportDebtCollected'), summary.debtCollectedUzs),
    row(text('sales.reportReceived'), summary.receivedUzs, true),
  ].join('')
  const title = `${text('sales.printTitle')}: ${escapeHtml(periodLabel)}`

  return templateDocument(locale, title, `
  <div class="top">
    <span>${escapeHtml(formatStamp(new Date()))}</span>
    <span class="doc">${title}</span>
  </div>
  <div class="parties">
    <div class="party">
      <h3>${text('invoice.ourCompany')}</h3>
      <div class="firm">${escapeHtml(store.name)}</div>
      ${partyLine(text('invoice.contactPhone'), store.phone)}
      ${store.branchName ? partyLine(text('common.branch'), store.branchName) : ''}
    </div>
    <div class="party">
      <h3>${text('invoice.reportInfo')}</h3>
      ${partyLine(text('invoice.period'), periodLabel)}
      ${partyLine(text('invoice.saleType'), saleType)}
      ${status ? partyLine(text('invoice.status'), status) : ''}
      ${partyLine(text('sales.reportSalesCount'), qty(summary.salesCount))}
    </div>
  </div>
  ${truncated}
  ${linesTableHtml(text, report.lines, rate)}
  <div class="summary">
    <div class="grand">
      <div>${text('invoice.grandTotalUzs')}: <b>${uzs(summary.totalUzs)}</b></div>
      ${rate ? `<div>${text('invoice.grandTotalUsd')}: <b>${usd(summary.totalUzs, rate)}</b></div><div>${text('invoice.rate')}: ${uzs(rate)}</div>` : ''}
    </div>
    <table class="settle">
      <thead><tr><th></th><th>${text('invoice.currencyUzs')}</th><th>${rate ? text('invoice.currencyUsd') : ''}</th></tr></thead>
      <tbody>${settlement}</tbody>
    </table>
  </div>`)
}

export function printSalesReport(options: PrintSalesReportOptions) {
  //
  printHtml(buildSalesReportHtml(options))
}
