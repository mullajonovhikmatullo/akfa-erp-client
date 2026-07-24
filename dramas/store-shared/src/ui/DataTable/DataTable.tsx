import { Table } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'

export type ColumnDef<T> = TableColumnsType<T>[number] & {
  responsiveHide?: boolean
}

interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnDef<T>[]
  loading?: boolean
  emptyText?: string
}

export function DataTable<T extends object>({
  columns,
  loading = false,
  emptyText = 'No records found',
  pagination,
  ...rest
}: DataTableProps<T>) {
  //
  const processedColumns = columns.map((col) => {
    //
    if (!col.responsiveHide) return col
    return {
      ...col,
      className: [col.className, 'col-hide-mobile'].filter(Boolean).join(' '),
      onHeaderCell: () => ({ className: 'col-hide-mobile' }),
    }
  })

  return (
    <Table<T>
      columns={processedColumns}
      loading={loading}
      locale={{ emptyText }}
      pagination={
        pagination !== false
          ? {
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} records`,
              pageSizeOptions: ['10', '25', '50'],
              ...((pagination as object) ?? {}),
            }
          : false
      }
      scroll={{ x: 'max-content' }}
      size="small"
      {...rest}
    />
  )
}
