import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { App as AntdApp, Button, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { Buildings, CheckCircle, Clock, PauseCircle, WarningCircle } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlatformFlowApi, PlatformSeekApi } from '@store/platform-stub';
import type { PlatformStore, StoreStatus } from '@store/platform-stub';
import {
  formatDateTime,
  formatLimitCount,
  formatMoney,
  storeStatusLabels,
} from '../../shared/lib/platformFormatters';

interface CompaniesPageProps {
  initialStatus?: StoreStatus;
  title?: string;
}

const statusOptions: Array<{ label: string; value: StoreStatus }> = [
  { label: storeStatusLabels.TRIALING, value: 'TRIALING' },
  { label: storeStatusLabels.ACTIVE, value: 'ACTIVE' },
  { label: storeStatusLabels.PAST_DUE, value: 'PAST_DUE' },
  { label: storeStatusLabels.SUSPENDED, value: 'SUSPENDED' },
  { label: storeStatusLabels.CANCELLED, value: 'CANCELLED' },
];

const storeStatusColors: Record<StoreStatus, string> = {
  TRIALING: 'blue',
  ACTIVE: 'green',
  PAST_DUE: 'orange',
  SUSPENDED: 'red',
  CANCELLED: 'default',
};

const statusIcons: Record<StoreStatus, ReactNode> = {
  TRIALING: <Clock size={16} weight="duotone" />,
  ACTIVE: <CheckCircle size={16} weight="duotone" />,
  PAST_DUE: <WarningCircle size={16} weight="duotone" />,
  SUSPENDED: <PauseCircle size={16} weight="duotone" />,
  CANCELLED: <PauseCircle size={16} weight="duotone" />,
};

export const CompaniesPage = ({ initialStatus, title = 'Mijoz kompaniyalar' }: CompaniesPageProps) => {
  const { message } = AntdApp.useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StoreStatus | undefined>(initialStatus);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    store: PlatformStore;
    status: StoreStatus;
  } | null>(null);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    setStatus(initialStatus);
    setPage(1);
  }, [initialStatus]);

  const storesQuery = useQuery({
    queryKey: ['platform-stores', { page, pageSize, search, status }],
    queryFn: () => PlatformSeekApi.listStores({ page, pageSize, search, status }),
  });
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: PlatformSeekApi.dashboard,
  });

  const statusMutation = useMutation({
    mutationFn: ({ storeId, nextStatus, note }: { storeId: string; nextStatus: StoreStatus; note?: string }) =>
      PlatformFlowApi.updateStoreStatus({ storeId, status: nextStatus, note }),
    onSuccess: async () => {
      message.success('Do‘kon statusi yangilandi');
      setPendingStatusChange(null);
      setStatusNote('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'Statusni yangilab bo‘lmadi');
    },
  });

  const stores = storesQuery.data?.items ?? [];
  const total = storesQuery.data?.total ?? 0;
  const storesByStatus = dashboardQuery.data?.storesByStatus ?? {};
  const platformTotal =
    (storesByStatus.TRIALING ?? 0) +
    (storesByStatus.ACTIVE ?? 0) +
    (storesByStatus.PAST_DUE ?? 0) +
    (storesByStatus.SUSPENDED ?? 0) +
    (storesByStatus.CANCELLED ?? 0);

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;

    statusMutation.mutate({
      storeId: pendingStatusChange.store.id,
      nextStatus: pendingStatusChange.status,
      note: statusNote,
    });
  };

  return (
    <section className="operation-page">
      <div className="operation-page__header">
        <div>
          <span className="operation-page__eyebrow">Platform admin</span>
          <h1>{title}</h1>
        </div>
        <Button icon={<Buildings size={18} weight="duotone" />} onClick={() => void storesQuery.refetch()}>
          Yangilash
        </Button>
      </div>

      <div className="operation-stats" aria-label="Do‘konlar ko‘rsatkichlari">
        <div>
          <span>Jami</span>
          <strong>{platformTotal || total}</strong>
        </div>
        <div>
          <span>Faol</span>
          <strong>{dashboardQuery.data?.activeStores ?? storesByStatus.ACTIVE ?? 0}</strong>
        </div>
        <div>
          <span>Sinovda</span>
          <strong>{storesByStatus.TRIALING ?? 0}</strong>
        </div>
        <div>
          <span>Qarzdor</span>
          <strong>{dashboardQuery.data?.overdueStores ?? storesByStatus.PAST_DUE ?? 0}</strong>
        </div>
        <div>
          <span>Bloklangan</span>
          <strong>{(storesByStatus.SUSPENDED ?? 0) + (storesByStatus.CANCELLED ?? 0)}</strong>
        </div>
      </div>

      <div className="operation-panel">
        <div className="operation-toolbar">
          <Input.Search
            className="operation-toolbar__search"
            placeholder="Do‘kon, slug, egasi yoki telefon bo‘yicha qidirish"
            allowClear
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSearch={(value) => {
              setSearch(value.trim());
              setPage(1);
            }}
          />
          <Select
            className="operation-toolbar__select"
            allowClear
            placeholder="Status"
            value={status}
            options={statusOptions}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>

        <Table<PlatformStore>
          rowKey="id"
          loading={storesQuery.isLoading}
          dataSource={stores}
          scroll={{ x: 1120 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          columns={[
            {
              title: 'Do‘kon',
              dataIndex: 'name',
              key: 'name',
              fixed: 'left',
              width: 240,
              render: (_value, store) => (
                <div className="table-primary-cell">
                  <strong>{store.name}</strong>
                  <span>{store.slug}</span>
                </div>
              ),
            },
            {
              title: 'Egasi',
              key: 'owner',
              width: 230,
              render: (_value, store) => (
                <div className="table-primary-cell">
                  <strong>{store.ownerName}</strong>
                  <span>{store.phone}</span>
                  {store.email ? <span>{store.email}</span> : null}
                </div>
              ),
            },
            {
              title: 'Tarif',
              key: 'plan',
              width: 190,
              render: (_value, store) => (
                <div className="table-primary-cell">
                  <strong>{store.plan?.name ?? 'Tarif yo‘q'}</strong>
                  <span>{formatMoney(store.plan?.monthlyPriceUzs ?? 0)}</span>
                </div>
              ),
            },
            {
              title: 'Hajm',
              key: 'counts',
              width: 210,
              render: (_value, store) => (
                <Space size={4} wrap>
                  <Tag>{formatLimitCount(store._count.branches, 'filial')}</Tag>
                  <Tag>{formatLimitCount(store._count.users, 'user')}</Tag>
                  <Tag>{formatLimitCount(store._count.products, 'mahsulot')}</Tag>
                </Space>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              width: 170,
              render: (value: StoreStatus) => (
                <Tag className="status-tag" color={storeStatusColors[value]} icon={statusIcons[value]}>
                  {storeStatusLabels[value]}
                </Tag>
              ),
            },
            {
              title: 'Muddat',
              key: 'dates',
              width: 240,
              render: (_value, store) => (
                <div className="table-primary-cell">
                  <span>Sinov: {formatDateTime(store.trialEndsAt)}</span>
                  <span>Keyingi to‘lov: {formatDateTime(store.subscription?.nextPaymentDueAt ?? null)}</span>
                </div>
              ),
            },
            {
              title: 'Boshqaruv',
              key: 'actions',
              width: 180,
              render: (_value, store) => (
                <Select<StoreStatus>
                  value={store.status}
                  options={statusOptions}
                  onChange={(nextStatus) => setPendingStatusChange({ store, status: nextStatus })}
                  style={{ width: 154 }}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Do‘kon statusini o‘zgartirish"
        open={Boolean(pendingStatusChange)}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
        confirmLoading={statusMutation.isPending}
        onOk={confirmStatusChange}
        onCancel={() => {
          setPendingStatusChange(null);
          setStatusNote('');
        }}
      >
        <div className="status-change-modal">
          <p>
            <strong>{pendingStatusChange?.store.name}</strong> statusi{' '}
            <strong>{pendingStatusChange ? storeStatusLabels[pendingStatusChange.status] : ''}</strong> holatiga
            o‘zgartiriladi.
          </p>
          <Input.TextArea
            value={statusNote}
            onChange={(event) => setStatusNote(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Izoh"
          />
        </div>
      </Modal>
    </section>
  );
};
