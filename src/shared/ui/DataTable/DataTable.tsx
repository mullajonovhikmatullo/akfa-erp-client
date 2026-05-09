import { Table } from 'antd';
import type { TableProps, TableColumnsType } from 'antd';

// Re-export AntD table column type under a cleaner name
export type { TableColumnsType as ColumnDef };

interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: TableColumnsType<T>;
  loading?: boolean;
  emptyText?: string;
}

export function DataTable<T extends object>({
  columns,
  loading = false,
  emptyText = 'No records found',
  pagination,
  ...rest
}: DataTableProps<T>) {
  return (
    <Table<T>
      columns={columns}
      loading={loading}
      locale={{ emptyText }}
      pagination={
        pagination !== false
          ? {
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total) => `${total} records`,
              pageSizeOptions: ['10', '15', '25', '50'],
              ...((pagination as object) ?? {}),
            }
          : false
      }
      scroll={{ x: 'max-content' }}
      size="middle"
      {...rest}
    />
  );
}
