import { useState } from 'react';
import { Button, Select, Popconfirm, Tooltip, Table } from 'antd';
import {
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  useTransfers,
  useCompleteTransfer,
  useCancelTransfer,
} from '@/entities/transfer';
import { NewTransferModal } from '@/features/create-transfer';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Transfer, TransferStatus } from '@/shared/types/domain';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';

const STATUS_OPTIONS: { value: TransferStatus; label: string }[] = [
  { value: 'PENDING', label: 'Кутилмоқда' },
  { value: 'COMPLETED', label: 'Якунланган' },
  { value: 'CANCELLED', label: 'Бекор қилинган' },
];

const STATUS_TONE: Record<TransferStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const STATUS_LABEL: Record<TransferStatus, string> = {
  PENDING: 'Кутилмоқда',
  COMPLETED: 'Якунланган',
  CANCELLED: 'Бекор қилинган',
};

export function TransfersPage() {
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { isSuper } = useCurrentUser();
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TransferStatus | undefined>();

  const { data: transfers = [], isLoading, isFetching, refetch } = useTransfers({
    status: statusFilter,
    limit: 100,
  });

  const completeMutation = useCompleteTransfer();
  const cancelMutation = useCancelTransfer();

  const pendingCount = transfers.filter((t) => t.status === 'PENDING').length;

  const columns: ColumnDef<Transfer>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Transfer, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: 'Сана',
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: 'Йўналиш',
      key: 'route',
      render: (_: unknown, t: Transfer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge tone="info">{t.fromBranch.name}</StatusBadge>
          <ArrowRightOutlined style={{ color: 'var(--ink-4)', fontSize: 11 }} />
          <StatusBadge tone="muted">{t.toBranch.name}</StatusBadge>
        </div>
      ),
    },
    {
      title: 'Маҳсулотлар',
      key: 'items',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, t: Transfer) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {t.items.length} тур
        </span>
      ),
    },
    {
      title: 'Тан нархи',
      key: 'cost',
      width: 160,
      align: 'right',
      render: (_: unknown, t: Transfer) => {
        const total = t.items.reduce((sum, i) => sum + i.totalCostUzs, 0);
        return (
          <span className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={total} currency="UZS" />
          </span>
        );
      },
    },
    {
      title: 'Ҳолат',
      dataIndex: 'status',
      width: 140,
      render: (v: TransferStatus) => (
        <StatusBadge tone={STATUS_TONE[v]} dot>{STATUS_LABEL[v]}</StatusBadge>
      ),
    },
    {
      title: 'Яратувчи',
      key: 'initiatedBy',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, t: Transfer) => (
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{t.initiatedBy.fullName}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, t: Transfer) => {
        if (t.status !== 'PENDING') return null;
        return (
          <div style={{ display: 'flex', gap: 4 }}>
            {isSuper && (
              <Popconfirm
                title="Якунлансинми?"
                description="Омбор захираси шу заҳоти янгиланади."
                okText="Ҳа, якунла"
                cancelText="Бекор"
                okButtonProps={{ loading: completeMutation.isPending }}
                onConfirm={(e) => { e?.stopPropagation(); completeMutation.mutate(t.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Tooltip title="Якунлаш">
                  <Button
                    size="small"
                    type="text"
                    icon={<CheckCircleOutlined style={{ color: 'var(--success)' }} />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
              </Popconfirm>
            )}
            <Popconfirm
              title="Бекор қилинсинми?"
              description="Трансфер бекор қилинади, омбор ўзгармайди."
              okText="Ҳа, бекор қил"
              cancelText="Йўқ"
              okButtonProps={{ danger: true, loading: cancelMutation.isPending }}
              onConfirm={(e) => { e?.stopPropagation(); cancelMutation.mutate(t.id); }}
              onPopupClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="Бекор қилиш">
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Трансферлар</h1>
          <div className="sub">
            {transfers.length} та трансфер · {pendingCount} та кутилмоқда
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Янгилаш">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<SwapOutlined />} onClick={() => setCreating(true)}>
            Янги трансфер
          </Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            placeholder="Барча ҳолатлар"
            style={{ minWidth: 180 }}
            options={STATUS_OPTIONS}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{transfers.length}</strong> та натижа
          </span>
        </div>

        <DataTable<Transfer>
          rowKey="id"
          dataSource={transfers}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (t) => `${t} ta`, pageSizeOptions: ['10', '25', '50'] }}
          expandable={{
            expandedRowRender: (transfer) => (
              <div style={{ padding: '8px 0 8px 48px' }}>
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={transfer.items}
                  columns={[
                    {
                      title: 'Маҳсулот',
                      key: 'name',
                      render: (_, item) => (
                        <div>
                          <span style={{ fontWeight: 500 }}>{item.product.name}</span>
                          {item.product.sku && (
                            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                              {item.product.sku}
                            </span>
                          )}
                        </div>
                      ),
                    },
                    {
                      title: 'Миқдор',
                      key: 'qty',
                      width: 120,
                      align: 'right',
                      render: (_, item) => (
                        <span className="num">
                          {item.quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[item.product.unit]}
                        </span>
                      ),
                    },
                    {
                      title: 'Тан нархи',
                      key: 'unit',
                      width: 150,
                      align: 'right',
                      render: (_, item) => (
                        <span className="num">
                          <MoneyDisplay amount={item.unitCostUzs} currency="UZS" />
                        </span>
                      ),
                    },
                    {
                      title: 'Жами',
                      key: 'total',
                      width: 150,
                      align: 'right',
                      render: (_, item) => (
                        <span className="num" style={{ fontWeight: 700 }}>
                          <MoneyDisplay amount={item.totalCostUzs} currency="UZS" />
                        </span>
                      ),
                    },
                  ]}
                />
                {transfer.note && (
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                    "{transfer.note}"
                  </div>
                )}
                {transfer.completedBy && (
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-3)' }}>
                    Якунлаган: {transfer.completedBy.fullName} · {formatDate(transfer.completedAt!)}
                  </div>
                )}
              </div>
            ),
            rowExpandable: () => true,
          }}
          emptyText="Трансферлар топилмади"
        />
      </div>

      <NewTransferModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
