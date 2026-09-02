import { Table } from 'antd'
import { createInventoryColumns } from './inventoryColumns'
import type { InventoryTranslate, StockRow } from './types'

interface InventoryTableProps {
  rows: StockRow[]
  loading: boolean
  stockedProductIds: ReadonlySet<string>
  stockStatusAvailable: boolean
  t: InventoryTranslate
}

export function InventoryTable({
  rows,
  loading,
  stockedProductIds,
  stockStatusAvailable,
  t,
}: InventoryTableProps) {
  //
  const columns = createInventoryColumns({ t, stockedProductIds, stockStatusAvailable })

  return (
    <Table<StockRow>
      rowKey="productId"
      loading={loading}
      dataSource={rows}
      scroll={{ x: 760 }}
      pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }}
      locale={{ emptyText: t('inventory.empty') }}
      columns={columns}
    />
  )
}

