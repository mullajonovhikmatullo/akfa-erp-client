import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { PRODUCT_UNIT_LABELS } from '@store/store-shared/core'
import type { ProductUnit, SaleListItem } from '@store/store-stub'

export function createTopProductColumns(t: (key: string) => string): ColumnDef<{
  productId: string
  name: string
  sku: string | null
  unit: string
  totalQuantity: number
  totalRevenue: number
}>[] {
  //
  return [
    { title: t('analytics.colProduct'), key: 'name', render: (_, row) => <div><div style={{ fontWeight: 600 }}>{row.name}</div>{row.sku ? <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{row.sku}</div> : null}</div> },
    { title: t('analytics.colQty'), key: 'qty', width: 120, align: 'right', render: (_, row) => <span className="num">{row.totalQuantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[row.unit as ProductUnit] ?? row.unit}</span> },
    { title: t('analytics.colRevenue'), key: 'rev', width: 160, align: 'right', render: (_, row) => <span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={row.totalRevenue} currency="UZS" /></span> },
  ]
}

export function createLowStockColumns(t: (key: string) => string): ColumnDef<{
  productId: string
  name: string
  sku: string | null
  unit: string
  currentStock: number
  threshold: number
  branchId: string
  branchName: string
}>[] {
  //
  return [
    { title: t('analytics.colProduct'), key: 'name', render: (_, row) => <div><div style={{ fontWeight: 500 }}>{row.name}</div><div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{row.branchName}</div></div> },
    { title: t('analytics.colRemaining'), key: 'stock', width: 130, align: 'right', render: (_, row) => <span className="num" style={{ color: 'var(--danger)', fontWeight: 600 }}>{row.currentStock} / {row.threshold} {PRODUCT_UNIT_LABELS[row.unit as ProductUnit] ?? row.unit}</span> },
  ]
}

export function createDebtColumns(t: (key: string) => string, page: number, pageSize: number): ColumnDef<SaleListItem>[] {
  //
  return [
    { title: '#', key: '_idx', width: 52, align: 'center', render: (_, __, index) => <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{(page - 1) * pageSize + index + 1}</span> },
    { title: t('analytics.colCustomer'), key: 'customer', render: (_, sale) => sale.customer ? <div><div style={{ fontWeight: 600 }}>{sale.customer.fullName}</div></div> : <span style={{ color: 'var(--ink-4)' }}>{t('sales.anonymous')}</span> },
    { title: t('analytics.colPhone'), key: 'phone', width: 150, render: (_, sale) => sale.customer?.phone ? <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{sale.customer.phone}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span> },
    { title: t('analytics.colBranch'), key: 'branch', width: 140, render: (_, sale) => <StatusBadge tone="muted">{sale.branch.name}</StatusBadge> },
    { title: t('analytics.colDueDate'), key: 'dueDate', width: 150, render: (_, sale) => <div><div style={{ fontWeight: 700, color: sale.debtDueDate ? 'var(--danger)' : 'var(--ink-4)' }}>{sale.debtDueDate ? formatDate(sale.debtDueDate) : t('analytics.noDeadline')}</div><div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{t('common.date')}: {formatDate(sale.createdAt)}</div></div> },
    { title: t('analytics.colOverdueBy'), key: 'lateBy', width: 130, align: 'center', render: (_, sale) => sale.debtDueDate ? <StatusBadge tone="danger" dot>{getLateDays(sale.debtDueDate)} {t('analytics.daysLateSuffix')}</StatusBadge> : <StatusBadge tone="muted">{t('analytics.noDeadline')}</StatusBadge> },
    { title: t('analytics.colDebt'), key: 'debt', width: 170, align: 'right', render: (_, sale) => <span className="num" style={{ fontWeight: 700, color: 'var(--danger)' }}><MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" /></span> },
  ]
}

export function getLateDays(dueDate: string) {
  //
  const now = new Date()
  const due = new Date(dueDate)
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime()
  return Math.max(0, Math.floor((startNow - startDue) / 86400000))
}

export function sortDebtRows(a: SaleListItem, b: SaleListItem, sort: 'dueDateAsc' | 'debtDesc' | 'lateDesc' | 'createdDesc') {
  //
  if (sort === 'debtDesc') return b.debtAmountUzs - a.debtAmountUzs || compareDueDate(a, b)
  if (sort === 'lateDesc') return getSortableLateDays(b) - getSortableLateDays(a) || b.debtAmountUzs - a.debtAmountUzs
  if (sort === 'createdDesc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  return compareDueDate(a, b)
}

function compareDueDate(a: SaleListItem, b: SaleListItem) {
  //
  return getDueTime(a) - getDueTime(b) || b.debtAmountUzs - a.debtAmountUzs
}

function getDueTime(sale: SaleListItem) {
  //
  return sale.debtDueDate ? new Date(sale.debtDueDate).getTime() : Number.MAX_SAFE_INTEGER
}

function getSortableLateDays(sale: SaleListItem) {
  //
  return sale.debtDueDate ? getLateDays(sale.debtDueDate) : -1
}

export function formatCompactAmount(amount: number) {
  //
  const abs = Math.abs(amount)
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${Math.round(abs / 1e3)}K`
  return String(abs)
}
