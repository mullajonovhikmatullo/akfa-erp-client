import { useState } from 'react';
import { Button, Select, Popconfirm, Tooltip, Table, Modal, Alert } from 'antd';
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
import type { ColumnDef } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

const STATUS_TONE: Record<TransferStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function TransfersPage() {
  const t = useT();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { isSuper, branchId: userBranchId, user } = useCurrentUser();
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TransferStatus | undefined>();
  const [confirmingTransfer, setConfirmingTransfer] = useState<Transfer | null>(null);

  const { data: transfers = [], isLoading, isFetching, refetch } = useTransfers({
    status: statusFilter,
    limit: 100,
  });

  const completeMutation = useCompleteTransfer();
  const cancelMutation = useCancelTransfer();

  const pendingCount = transfers.filter((tr) => tr.status === 'PENDING').length;
  const confirmingTotal = confirmingTransfer?.items.reduce((sum, item) => sum + item.totalCostUzs, 0) ?? 0;

  const STATUS_OPTIONS: { value: TransferStatus; label: string }[] = [
    { value: 'PENDING', label: t('transfers.statusPendingLabel') },
    { value: 'COMPLETED', label: t('transfers.statusCompleted') },
    { value: 'CANCELLED', label: t('transfers.statusCancelled') },
  ];

  const STATUS_LABEL: Record<TransferStatus, string> = {
    PENDING: t('transfers.statusPendingLabel'),
    COMPLETED: t('transfers.statusCompleted'),
    CANCELLED: t('transfers.statusCancelled'),
  };

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
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDateTime(v)}</span>
      ),
    },
    {
      title: t('transfers.colRoute'),
      key: 'route',
      render: (_: unknown, tr: Transfer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge tone="info">{tr.fromBranch.name}</StatusBadge>
          <ArrowRightOutlined style={{ color: 'var(--ink-4)', fontSize: 11 }} />
          <StatusBadge tone="muted">{tr.toBranch.name}</StatusBadge>
        </div>
      ),
    },
    {
      title: t('nav.products'),
      key: 'items',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, tr: Transfer) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {tr.items.length} {t('transfers.itemTypeSuffix')}
        </span>
      ),
    },
    {
      title: t('transfers.colCost'),
      key: 'cost',
      width: 160,
      align: 'right',
      render: (_: unknown, tr: Transfer) => {
        const total = tr.items.reduce((sum, i) => sum + i.totalCostUzs, 0);
        return (
          <span className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={total} currency="UZS" />
          </span>
        );
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 140,
      render: (v: TransferStatus) => (
        <StatusBadge tone={STATUS_TONE[v]} dot>{STATUS_LABEL[v]}</StatusBadge>
      ),
    },
    {
      title: t('transfers.colCreatedBy'),
      key: 'initiatedBy',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, tr: Transfer) => (
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{tr.initiatedBy.fullName}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, tr: Transfer) => {
        if (tr.status !== 'PENDING') return null;
        const isReceiverBranch = tr.toBranch.id === userBranchId;
        const canComplete = !isSuper && isReceiverBranch;
        const canCancel = isSuper || (!isReceiverBranch && tr.initiatedBy.id === user?.id);
        return (
          <div style={{ display: 'flex', gap: 4 }}>
            {canComplete && (
              <Button
                size="small"
                type="text"
                icon={<CheckCircleOutlined style={{ color: 'var(--success)' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmingTransfer(tr);
                }}
              />
            )}
            {canCancel && (
              <Popconfirm
                title={t('transfers.cancelTitle')}
                description={t('transfers.cancelDesc')}
                okText={t('transfers.cancelOk')}
                cancelText={t('common.no')}
                okButtonProps={{ danger: true, loading: cancelMutation.isPending }}
                onConfirm={(e) => { e?.stopPropagation(); cancelMutation.mutate(tr.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.transfers')}</h1>
          <div className="sub">
            {transfers.length} {t('transfers.subtitleSuffix')} · {pendingCount} {t('transfers.statusPending')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<SwapOutlined />} onClick={() => setCreating(true)}>
            {t('transfers.newTransfer')}
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
            placeholder={t('transfers.filterAll')}
            style={{ minWidth: 180 }}
            options={STATUS_OPTIONS}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{transfers.length}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<Transfer>
          rowKey="id"
          dataSource={transfers}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (total) => `${total} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
          expandable={{
            expandedRowRender: (transfer) => (
              <ExpandedTransferRow transfer={transfer} t={t} />
            ),
            rowExpandable: () => true,
          }}
          emptyText={t('transfers.empty')}
        />
      </div>

      <NewTransferModal open={creating} onClose={() => setCreating(false)} />
      <Modal
        open={Boolean(confirmingTransfer)}
        title={t('transfers.confirmReceiptTitle')}
        okText={t('transfers.confirmReceiptOk')}
        cancelText={t('transfers.confirmReceiptCancel')}
        okButtonProps={{ loading: completeMutation.isPending }}
        onCancel={() => setConfirmingTransfer(null)}
        onOk={() => {
          if (!confirmingTransfer) return;
          completeMutation.mutate(confirmingTransfer.id, {
            onSuccess: () => setConfirmingTransfer(null),
          });
        }}
      >
        {confirmingTransfer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert
              type="warning"
              showIcon
              message={t('transfers.confirmReceiptWarning')}
              description={t('transfers.confirmReceiptDesc')}
            />
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <InfoRow label={t('transfers.confirmReceiptRoute')} value={`${confirmingTransfer.fromBranch.name} → ${confirmingTransfer.toBranch.name}`} />
              <InfoRow label={t('transfers.confirmReceiptItems')} value={`${confirmingTransfer.items.length} ${t('transfers.itemTypeSuffix')}`} />
              <InfoRow label={t('transfers.colCost')} value={<MoneyDisplay amount={confirmingTotal} currency="UZS" />} />
            </div>
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={confirmingTransfer.items}
              columns={[
                {
                  title: t('transfers.colProduct'),
                  key: 'product',
                  render: (_, item) => item.product.name,
                },
                {
                  title: t('transfers.colQty'),
                  key: 'quantity',
                  width: 130,
                  align: 'right',
                  render: (_, item) => (
                    <span className="num">
                      {item.quantity.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function ExpandedTransferRow({ transfer, t }: { transfer: Transfer; t: (key: string) => string }) {
  return (
    <div style={{ padding: '8px 0 8px 48px' }}>
      <Table
        size="small"
        pagination={false}
        rowKey="id"
        dataSource={transfer.items}
        columns={[
          {
            title: t('transfers.colProduct'),
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
            title: t('transfers.colQty'),
            key: 'qty',
            width: 120,
            align: 'right',
            render: (_, item) => (
              <span className="num">
                {item.quantity.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
              </span>
            ),
          },
          {
            title: t('transfers.colCost'),
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
            title: t('transfers.colTotal'),
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
          {t('transfers.completedByLabel')}: {transfer.completedBy.fullName} · {formatDateTime(transfer.completedAt)}
        </div>
      )}
    </div>
  );
}
