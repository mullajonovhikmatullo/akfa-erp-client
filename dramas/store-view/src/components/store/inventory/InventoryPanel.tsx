import { useMemo, useState } from 'react'
import { useProductsList } from '../product/hooks/useProductsList'
import { useInventoryList } from './hooks/useInventoryList'
import { useStockBatchSummary } from './hooks/useStockBatchSummary'
import { useStockBatchesList } from './hooks/useStockBatchesList'
import { calculateInventoryTotals, createInventoryRows, filterInventoryRows } from './lib/inventory-rows'
import {
  InventoryFilters,
  InventoryPageHeader,
  InventorySummary,
  InventoryTable,
  type InventoryTranslate,
  type QuantityFilter,
} from './view'

export interface InventoryPanelProps {
  branchId?: string | null
  t: InventoryTranslate
}

export function InventoryPanel({ branchId, t }: InventoryPanelProps) {
  //
  const [search, setSearch] = useState('')
  const [quantityFilter, setQuantityFilter] = useState<QuantityFilter>('all')

  const { data: products = [] } = useProductsList()
  const inventoryQuery = useInventoryList(branchId ? { branchId } : undefined)
  const stockBatchesQuery = useStockBatchesList(branchId ? { branchId } : undefined)
  const { data: stockSummary } = useStockBatchSummary({ branchId: branchId ?? undefined })

  const productImagesById = useMemo(
    () => new Map(products.map((product) => [product.id, product.primaryThumbnailUrl ?? product.primaryImageUrl ?? null])),
    [products],
  )
  const rows = useMemo(
    () => createInventoryRows(inventoryQuery.data ?? [], productImagesById),
    [inventoryQuery.data, productImagesById],
  )
  const filteredRows = useMemo(
    () => filterInventoryRows(rows, search, quantityFilter),
    [quantityFilter, rows, search],
  )
  const totals = useMemo(() => calculateInventoryTotals(rows), [rows])
  const stockedProductIds = useMemo(
    () => new Set((stockBatchesQuery.data ?? []).map((batch) => batch.product.id)),
    [stockBatchesQuery.data],
  )
  const stockStatusAvailable = stockBatchesQuery.data !== undefined && !stockBatchesQuery.isError

  return (
    <section className="inventory-page">
      <InventoryPageHeader
        t={t}
        refreshing={inventoryQuery.isFetching}
        onRefresh={() => void inventoryQuery.refetch()}
      />
      <InventorySummary
        productCount={rows.length}
        totals={totals}
        stockValue={stockSummary?.totalRemainingValueUzs ?? 0}
        t={t}
      />
      <div className="inventory-panel">
        <InventoryFilters
          search={search}
          quantityFilter={quantityFilter}
          t={t}
          onSearchChange={setSearch}
          onQuantityFilterChange={setQuantityFilter}
        />
        <InventoryTable
          rows={filteredRows}
          loading={inventoryQuery.isLoading}
          stockedProductIds={stockedProductIds}
          stockStatusAvailable={stockStatusAvailable}
          t={t}
        />
      </div>
    </section>
  )
}
