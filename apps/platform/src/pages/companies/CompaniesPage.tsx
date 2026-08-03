import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { App as AntdApp, Button, Input, Modal, Select, Space, Table, Tag, Tooltip } from 'antd';
import {
  Buildings,
  CheckCircle,
  Clock,
  Copy,
  LinkSimple,
  PencilSimple,
  PauseCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlatformFlowApi, PlatformSeekApi } from '@store/platform-stub';
import type { PlatformStore, StoreStatus } from '@store/platform-stub';
import {
  formatDateTime,
  formatLimitCount,
  formatMoney,
  storeStatusLabels,
} from '../../shared/lib/platformFormatters';
import { createOwnerSetupUrl } from '../../shared/lib/ownerSetupUrl';

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
  const [statusConfirmation, setStatusConfirmation] = useState('');
  const [statusPassword, setStatusPassword] = useState('');
  const [pendingPlanChange, setPendingPlanChange] = useState<PlatformStore | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [setupTarget, setSetupTarget] = useState<PlatformStore | null>(null);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupResult, setSetupResult] = useState<{
    storeName: string;
    username: string;
    setupCode: string;
    setupExpiresAt: string;
  } | null>(null);

  useEffect(() => {
    setStatus(initialStatus);
    setPage(1);
  }, [initialStatus]);

  const storesQuery = useQuery({
    queryKey: ['platform-stores', { page, pageSize, search, status }],
    queryFn: () => PlatformSeekApi.listStores({ page, pageSize, search, status }),
  });
  const dashboardQuery = useQuery({
    queryKey: ['platform-dashboard', 'metrics'],
    queryFn: PlatformSeekApi.dashboard,
  });
  const plansQuery = useQuery(PlatformSeekApi.fetch.listPlans());

  const statusMutation = useMutation({
    mutationFn: ({
      storeId,
      nextStatus,
      expectedVersion,
      note,
      confirmation,
    }: {
      storeId: string;
      nextStatus: StoreStatus;
      expectedVersion: number;
      note?: string;
      confirmation?: string;
    }) =>
      PlatformFlowApi.updateStoreStatus({
        storeId,
        status: nextStatus,
        expectedVersion,
        note,
        confirmation,
        currentPassword:
          nextStatus === 'CANCELLED' ||
          (pendingStatusChange?.store.status === 'CANCELLED' &&
            (nextStatus === 'ACTIVE' || nextStatus === 'TRIALING'))
            ? statusPassword
            : undefined,
      }),
    onSuccess: async () => {
      message.success('Do‘kon statusi yangilandi');
      setPendingStatusChange(null);
      setStatusNote('');
      setStatusConfirmation('');
      setStatusPassword('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-payments'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-dashboard'] }),
      ]);
    },
    onError: (error) => {
      setStatusPassword('');
      message.error(error instanceof Error ? error.message : 'Statusni yangilab bo‘lmadi');
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-payments'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-dashboard'] }),
      ]);
    },
  });
  const planMutation = useMutation({
    mutationFn: () => {
      if (!pendingPlanChange || !selectedPlanId) {
        throw new Error('Tarifni tanlang');
      }

      return PlatformFlowApi.updateStorePlan({
        storeId: pendingPlanChange.id,
        payload: {
          planId: selectedPlanId,
          expectedVersion: pendingPlanChange.billingVersion,
        },
      });
    },
    onSuccess: async () => {
      message.success('Do‘kon tarifi yangilandi');
      setPendingPlanChange(null);
      setSelectedPlanId('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-payments'] }),
      ]);
    },
    onError: (error) => {
      setPendingPlanChange(null);
      setSelectedPlanId('');
      message.error(error instanceof Error ? error.message : 'Do‘kon tarifini yangilab bo‘lmadi');
      void queryClient.invalidateQueries({ queryKey: ['platform-stores'] });
    },
  });
  const setupMutation = useMutation({
    mutationFn: (store: PlatformStore) =>
      PlatformFlowApi.regenerateOwnerSetup(store.id, setupPassword),
    onSuccess: (result, store) => {
      setSetupTarget(null);
      setSetupPassword('');
      setSetupResult({
        storeName: store.name,
        username: result.owner.username,
        setupCode: result.setupCode,
        setupExpiresAt: result.setupExpiresAt,
      });
    },
    onError: (error) => {
      setSetupPassword('');
      message.error(error instanceof Error ? error.message : 'Setup manzilini yangilab bo‘lmadi');
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
      expectedVersion: pendingStatusChange.store.billingVersion,
      note: statusNote,
      confirmation: statusConfirmation,
    });
  };

  const openPlanChange = (store: PlatformStore) => {
    setPendingPlanChange(store);
    setSelectedPlanId(store.plan?.id ?? '');
  };

  const openSetupRegeneration = (store: PlatformStore) => {
    try {
      createOwnerSetupUrl('configuration-check');
      setSetupTarget(store);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Store login manzili konfiguratsiya qilinmagan',
      );
    }
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
                  <Button
                    type="link"
                    size="small"
                    icon={<PencilSimple size={15} />}
                    onClick={() => openPlanChange(store)}
                  >
                    Tarifni almashtirish
                  </Button>
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
              width: 220,
              render: (_value, store) => (
                <Space size={6}>
                  <Select<StoreStatus>
                    value={undefined}
                    placeholder="Status"
                    options={statusOptions.filter((option) =>
                      store.allowedStatusTransitions.includes(option.value),
                    )}
                    disabled={store.allowedStatusTransitions.length === 0}
                    onChange={(nextStatus) => setPendingStatusChange({ store, status: nextStatus })}
                    style={{ width: 140 }}
                  />
                  {store.ownerAccount?.mustChangePassword &&
                  store.ownerAccount.isActive &&
                  store.status !== 'SUSPENDED' &&
                  store.status !== 'CANCELLED' ? (
                    <Tooltip title="Yangi setup manzili">
                      <Button
                        aria-label="Yangi setup manzili"
                        icon={<LinkSimple size={18} />}
                        loading={
                          setupMutation.isPending &&
                          setupMutation.variables?.id === store.id
                        }
                        onClick={() => openSetupRegeneration(store)}
                      />
                    </Tooltip>
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Do‘kon tarifini o‘zgartirish"
        open={Boolean(pendingPlanChange)}
        okText="Tarifni saqlash"
        cancelText="Bekor qilish"
        confirmLoading={planMutation.isPending}
        okButtonProps={{
          disabled:
            !pendingPlanChange ||
            !selectedPlanId ||
            selectedPlanId === pendingPlanChange.plan?.id ||
            plansQuery.isLoading,
        }}
        onOk={() => planMutation.mutate()}
        onCancel={() => {
          setPendingPlanChange(null);
          setSelectedPlanId('');
        }}
      >
        <div className="status-change-modal">
          <p>
            <strong>{pendingPlanChange?.name}</strong> do‘koni uchun yangi tarifni tanlang.
            Joriy tarif: <strong>{pendingPlanChange?.plan?.name ?? 'Tarif yo‘q'}</strong>.
          </p>
          <Select
            value={selectedPlanId || undefined}
            loading={plansQuery.isLoading}
            placeholder="Yangi tarifni tanlang"
            options={(plansQuery.data ?? []).map((plan) => ({
              value: plan.id,
              label: `${plan.name} — ${formatMoney(plan.monthlyPriceUzs)}`,
            }))}
            onChange={setSelectedPlanId}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>

      <Modal
        title="Do‘kon statusini o‘zgartirish"
        open={Boolean(pendingStatusChange)}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
        confirmLoading={statusMutation.isPending}
        okButtonProps={{
          disabled:
            !pendingStatusChange ||
              ((pendingStatusChange.status === 'SUSPENDED' || pendingStatusChange.status === 'CANCELLED') &&
              statusNote.trim().length < 3) ||
            (pendingStatusChange.status === 'CANCELLED' &&
              (![
                pendingStatusChange.store.name,
                pendingStatusChange.store.slug,
              ].includes(statusConfirmation.trim()) ||
                statusPassword.length === 0)) ||
            (pendingStatusChange.store.status === 'CANCELLED' &&
              (pendingStatusChange.status === 'ACTIVE' || pendingStatusChange.status === 'TRIALING') &&
              statusPassword.length === 0),
        }}
        onOk={confirmStatusChange}
        onCancel={() => {
          setPendingStatusChange(null);
          setStatusNote('');
          setStatusConfirmation('');
          setStatusPassword('');
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
            placeholder={
              pendingStatusChange?.status === 'SUSPENDED' || pendingStatusChange?.status === 'CANCELLED'
                ? 'Sabab (majburiy)'
                : 'Izoh'
            }
          />
          {pendingStatusChange?.status === 'CANCELLED' ||
          (pendingStatusChange?.store.status === 'CANCELLED' &&
            (pendingStatusChange.status === 'ACTIVE' || pendingStatusChange.status === 'TRIALING')) ? (
            <>
              {pendingStatusChange.status === 'CANCELLED' ? <Input
                value={statusConfirmation}
                onChange={(event) => setStatusConfirmation(event.target.value)}
                placeholder={`Tasdiqlash uchun “${pendingStatusChange.store.name}” deb yozing`}
                maxLength={120}
              /> : null}
              <Input.Password
                value={statusPassword}
                onChange={(event) => setStatusPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Platform egasining joriy paroli"
              />
            </>
          ) : null}
        </div>
      </Modal>

      <Modal
        title="Yangi setup manzilini yaratish"
        open={Boolean(setupTarget)}
        okText="Yaratish"
        cancelText="Bekor qilish"
        confirmLoading={setupMutation.isPending}
        okButtonProps={{ disabled: setupPassword.length === 0 }}
        onOk={() => {
          if (!setupTarget || !setupPassword) return;
          setupMutation.mutate(setupTarget);
        }}
        onCancel={() => {
          setSetupTarget(null);
          setSetupPassword('');
        }}
      >
        <div className="status-change-modal">
          <p>
            <strong>{setupTarget?.name}</strong> uchun oldingi ishlatilmagan setup manzili bekor
            qilinadi.
          </p>
          <Input.Password
            value={setupPassword}
            onChange={(event) => setSetupPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Platform egasining joriy paroli"
            onPressEnter={() => {
              if (setupTarget && setupPassword) {
                setupMutation.mutate(setupTarget);
              }
            }}
          />
        </div>
      </Modal>

      <Modal
        title="Do‘kon egasi uchun yangi setup"
        open={Boolean(setupResult)}
        footer={[
          <Button
            key="copy"
            type="primary"
            icon={<Copy size={18} />}
            onClick={() => {
              if (!setupResult) return;
              void navigator.clipboard
                .writeText(createOwnerSetupUrl(setupResult.setupCode))
                .then(() => message.success('Setup manzili nusxalandi'))
                .catch(() => message.error('Setup manzilini nusxalab bo‘lmadi'));
            }}
          >
            Setup manzilini nusxalash
          </Button>,
          <Button key="close" onClick={() => setSetupResult(null)}>
            Yopish
          </Button>,
        ]}
        onCancel={() => setSetupResult(null)}
      >
        <div className="setup-result">
          <div>
            <span>Do‘kon</span>
            <strong>{setupResult?.storeName}</strong>
          </div>
          <div>
            <span>Login</span>
            <strong>{setupResult?.username}</strong>
          </div>
          <div>
            <span>Setup muddati</span>
            <strong>{formatDateTime(setupResult?.setupExpiresAt ?? null)}</strong>
          </div>
          <Input
            readOnly
            value={setupResult ? createOwnerSetupUrl(setupResult.setupCode) : ''}
          />
        </div>
      </Modal>
    </section>
  );
};
