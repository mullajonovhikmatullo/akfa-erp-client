import type { TableColumnsType, TableProps } from 'antd';
export type ColumnDef<T> = TableColumnsType<T>[number] & {
    responsiveHide?: boolean;
};
interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
    columns: ColumnDef<T>[];
    loading?: boolean;
    emptyText?: string;
}
export declare function DataTable<T extends object>({ columns, loading, emptyText, pagination, ...rest }: DataTableProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DataTable.d.ts.map