import type { InventoryRecord, ProductUnit } from '@store/store-stub'
import type { InventoryTotals, QuantityFilter, StockRow } from '../view/types'

export function createInventoryRows(
  records: InventoryRecord[],
  productImagesById: ReadonlyMap<string, string | null>,
) {
  //
  const grouped = new Map<string, StockRow>()

  for (const record of records) {
    const current = grouped.get(record.product.id)
    if (current) {
      current.quantity += record.quantity
      current.branches.add(record.branch.name)
      if (record.updatedAt > current.updatedAt) current.updatedAt = record.updatedAt
      continue
    }

    grouped.set(record.product.id, {
      productId: record.product.id,
      name: record.product.name,
      sku: record.product.sku,
      primaryThumbnailUrl: productImagesById.get(record.product.id) ?? null,
      unit: record.product.unit,
      quantity: record.quantity,
      branches: new Set([record.branch.name]),
      updatedAt: record.updatedAt,
      lowStockThreshold: record.product.lowStockThreshold ?? null,
    })
  }

  return [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name))
}

export function filterInventoryRows(rows: StockRow[], search: string, quantityFilter: QuantityFilter) {
  //
  const needle = search.trim().toLocaleLowerCase()

  return rows.filter((row) => {
    //
    const matchesSearch = !needle || `${row.name} ${row.sku ?? ''}`.toLocaleLowerCase().includes(needle)
    if (!matchesSearch) return false
    if (quantityFilter === 'out') return row.quantity <= 0
    if (quantityFilter === 'low') {
      return row.quantity > 0 && row.lowStockThreshold != null && row.quantity <= row.lowStockThreshold
    }
    if (quantityFilter === 'available') {
      return row.quantity > 0 && (row.lowStockThreshold == null || row.quantity > row.lowStockThreshold)
    }
    return true
  })
}

export function calculateInventoryTotals(rows: StockRow[]): InventoryTotals {
  //
  return rows.reduce(
    (totals, row) => {
      //
      totals[row.unit] += row.quantity
      return totals
    },
    { PIECE: 0, KG: 0 } as Record<ProductUnit, number>,
  )
}

export function formatInventoryQuantity(value: number) {
  //
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 3 }).format(value)
}

