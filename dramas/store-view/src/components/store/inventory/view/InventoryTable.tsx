import { Table } from 'antd'
import type { StockLevel } from '@store/store-stub'
import { createInventoryColumns } from './inventoryColumns'
import type { InventoryTranslate } from './types'

interface InventoryTableProps {
  rows: StockLevel[]
  loading: boolean
  page: number
  pageSize: number
  total: number
  rowIndex: (index: number) => number
  onPageChange: (page: number, pageSize: number) => void
  t: InventoryTranslate
}

export function InventoryTable({
  rows,
  loading,
  page,
  pageSize,
  total,
  rowIndex,
  onPageChange,
  t,
}: InventoryTableProps) {
  //
  const columns = createInventoryColumns({ t, rowIndex })

  return (
    <Table<StockLevel>
      rowKey="productId"
      loading={loading}
      dataSource={rows}
      scroll={{ x: 820 }}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (count) => `${count} ${t('common.countSuffix')}`,
        pageSizeOptions: ['10', '25', '50'],
      }}
      locale={{ emptyText: t('inventory.empty') }}
      columns={columns}
    />
  )
}
