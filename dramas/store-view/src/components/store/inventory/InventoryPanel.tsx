import { useEffect, useRef, useState } from 'react'
import { useStoreT } from '@store/store-i18n'
import type { StockLevelQuantityFilter } from '@store/store-stub'
import { usePagination } from '../shared/hooks/usePagination'
import { useStockBatchSummary } from './hooks/useStockBatchSummary'
import { useStockLevelsPage } from './hooks/useStockLevelsPage'
import {
  InventoryFilters,
  InventoryPageHeader,
  InventorySummary,
  InventoryTable,
} from './view'

export interface InventoryPanelProps {
  branchId?: string | null
}

export function InventoryPanel({ branchId }: InventoryPanelProps) {
  //
  const t = useStoreT()
  const [search, setSearch] = useState('')
  const [quantityFilter, setQuantityFilter] = useState<StockLevelQuantityFilter>('all')
  const { page, pageSize, changePage, goToPage, resetPage, rowIndex } = usePagination()

  const stockLevelsQuery = useStockLevelsPage({
    page,
    pageSize,
    branchId: branchId ?? undefined,
    search: search.trim() || undefined,
    quantity: quantityFilter,
  })
  const { data: stockSummary } = useStockBatchSummary({ branchId: branchId ?? undefined })

  const rows = stockLevelsQuery.data?.items ?? []
  const total = stockLevelsQuery.data?.total ?? 0
  const summary = stockLevelsQuery.data?.summary
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  const previousBranchId = useRef(branchId)
  useEffect(() => {
    //
    if (previousBranchId.current === branchId) return
    previousBranchId.current = branchId
    resetPage()
  }, [branchId, resetPage])

  useEffect(() => {
    //
    if (stockLevelsQuery.isPlaceholderData || !stockLevelsQuery.data) return
    if (page > lastPage) goToPage(lastPage)
  }, [goToPage, lastPage, page, stockLevelsQuery.data, stockLevelsQuery.isPlaceholderData])

  function changeSearch(value: string) {
    //
    setSearch(value)
    resetPage()
  }

  function changeQuantityFilter(value: StockLevelQuantityFilter) {
    //
    setQuantityFilter(value)
    resetPage()
  }

  return (
    <section className="inventory-page">
      <InventoryPageHeader
        t={t}
        refreshing={stockLevelsQuery.isFetching}
        onRefresh={() => void stockLevelsQuery.refetch()}
      />
      <InventorySummary
        productCount={summary?.productCount ?? 0}
        totals={summary?.totals ?? { PIECE: 0, KG: 0 }}
        stockValue={stockSummary?.totalRemainingValueUzs ?? 0}
        t={t}
      />
      <div className="inventory-panel">
        <InventoryFilters
          search={search}
          quantityFilter={quantityFilter}
          t={t}
          onSearchChange={changeSearch}
          onQuantityFilterChange={changeQuantityFilter}
        />
        <InventoryTable
          rows={rows}
          loading={stockLevelsQuery.isLoading}
          page={page}
          pageSize={pageSize}
          total={total}
          rowIndex={rowIndex}
          onPageChange={changePage}
          t={t}
        />
      </div>
    </section>
  )
}
