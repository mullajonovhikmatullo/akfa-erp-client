import type { StoreLocale } from '@store/store-i18n'
import type { SaleInvoice } from '@store/store-stub'
import { escapeHtml, printHtml } from './printHtml'
import { formatStamp, linesTableHtml, partyLine, printTextFor, settlementRow, templateDocument, usd, uzs } from './printTemplate'

function documentNumber(id: string): string {
  //
  return (id.split('-')[0] ?? id).toUpperCase()
}

export function buildSaleInvoiceHtml(locale: StoreLocale, invoice: SaleInvoice): string {
  //
  const text = printTextFor(locale)
  const { sale, store, usdToUzsRate: rate, customerDebt } = invoice
  const lines = sale.items.map((item) => {
    //
    const listUnitPrice = item.listUnitPrice ?? item.unitPrice
    return {
      name: item.product.name,
      quantity: item.quantity,
      unit: item.product.unit,
      listUnitPrice,
      discountPercent: item.discountPercent,
      unitPrice: item.unitPrice,
      listTotalUzs: Math.round(item.quantity * listUnitPrice),
      totalUzs: item.totalPrice,
    }
  })
  const settlement = [
    customerDebt ? settlementRow(text('invoice.debtBefore'), uzs(customerDebt.beforeUzs), usd(customerDebt.beforeUzs, rate)) : '',
    settlementRow(text('invoice.payment'), uzs(invoice.paidAtSaleUzs), usd(invoice.paidAtSaleUzs, rate)),
    settlementRow(text('invoice.change'), uzs(invoice.changeUzs), usd(invoice.changeUzs, rate)),
    customerDebt ? settlementRow(text('invoice.debtAfter'), uzs(customerDebt.afterUzs), usd(customerDebt.afterUzs, rate)) : '',
  ].join('')
  const title = `${text('invoice.title')} № ${documentNumber(sale.id)}`

  return templateDocument(locale, title, `
  <div class="top">
    <span>${escapeHtml(formatStamp(new Date(sale.createdAt)))}</span>
    <span class="doc">${title}</span>
  </div>
  <div class="parties">
    <div class="party">
      <h3>${text('invoice.ourCompany')}</h3>
      <div class="firm">${escapeHtml(store.name)}</div>
      ${partyLine(text('invoice.contactPhone'), store.phone)}
      ${partyLine(text('invoice.employee'), sale.soldBy.fullName)}
    </div>
    <div class="party">
      <h3>${text('invoice.customer')}</h3>
      ${partyLine(text('invoice.customerName'), sale.customer?.fullName)}
      ${partyLine(text('invoice.customerPhone'), sale.customer?.phone)}
    </div>
  </div>
  ${linesTableHtml(text, lines, rate)}
  <div class="summary">
    <div class="grand">
      <div>${text('invoice.grandTotalUzs')}: <b>${uzs(sale.totalAmountUzs)}</b></div>
      ${rate ? `<div>${text('invoice.grandTotalUsd')}: <b>${usd(sale.totalAmountUzs, rate)}</b></div><div>${text('invoice.rate')}: ${uzs(rate)}</div>` : ''}
    </div>
    <table class="settle">
      <thead><tr><th></th><th>${text('invoice.currencyUzs')}</th><th>${rate ? text('invoice.currencyUsd') : ''}</th></tr></thead>
      <tbody>${settlement}</tbody>
    </table>
  </div>`)
}

export function printSaleInvoice(locale: StoreLocale, invoice: SaleInvoice) {
  //
  printHtml(buildSaleInvoiceHtml(locale, invoice))
}
