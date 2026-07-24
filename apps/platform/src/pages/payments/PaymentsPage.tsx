import { useMemo, useState } from 'react';
import { App as AntdApp, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { CheckCircle, PlusCircle, Receipt, XCircle } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PlatformFlowApi,
  PlatformSeekApi,
} from '@store/platform-stub';
import type { CreatePaymentPayload, Currency, PaymentStatus, PlatformPayment } from '@store/platform-stub';
import { currencyLabels, formatDateTime, formatMoney, paymentStatusLabels } from '../../shared/lib/platformFormatters';

const paymentStatusOptions: Array<{ label: string; value: PaymentStatus }> = [
  { label: paymentStatusLabels.PENDING, value: 'PENDING' },
  { label: paymentStatusLabels.APPROVED, value: 'APPROVED' },
  { label: paymentStatusLabels.REJECTED, value: 'REJECTED' },
];

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
};

const currencyOptions: Array<{ label: string; value: Currency }> = [
  { label: currencyLabels.UZS, value: 'UZS' },
  { label: currencyLabels.USD, value: 'USD' },
];

export const PaymentsPage = () => {
  const { message } = AntdApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CreatePaymentPayload>();
  const [status, setStatus] = useState<PaymentStatus | undefined>('PENDING');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PlatformPayment | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const paymentsQuery = useQuery({
    queryKey: ['platform-payments', status],
    queryFn: () => PlatformSeekApi.listPayments(status),
  });

  const storesQuery = useQuery({
    queryKey: ['platform-stores', { page: 1, pageSize: 100 }],
    queryFn: () => PlatformSeekApi.listStores({ page: 1, pageSize: 100 }),
  });

  const refreshPlatformData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['platform-payments'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: PlatformFlowApi.createPayment,
    onSuccess: async () => {
      message.success('Manual to‘lov yaratildi');
      setCreateModalOpen(false);
      form.resetFields();
      await refreshPlatformData();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'To‘lov yaratilmadi');
    },
  });

  const approveMutation = useMutation({
    mutationFn: PlatformFlowApi.approvePayment,
    onSuccess: async () => {
      message.success('To‘lov tasdiqlandi');
      await refreshPlatformData();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'To‘lovni tasdiqlab bo‘lmadi');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      PlatformFlowApi.rejectPayment({ paymentId: id, note }),
    onSuccess: async () => {
      message.success('To‘lov rad etildi');
      setRejectTarget(null);
      setRejectNote('');
      await refreshPlatformData();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'To‘lovni rad etib bo‘lmadi');
    },
  });

  const payments = paymentsQuery.data ?? [];
  const paymentSummary = useMemo(
    () => ({
      total: payments.length,
      amount: payments.reduce((sum, payment) => (payment.currency === 'UZS' ? sum + payment.amount : sum), 0),
    }),
    [payments],
  );
  const storeOptions = useMemo(
    () =>
      (storesQuery.data?.items ?? []).map((store) => ({
        label: `${store.name} · ${store.ownerName}`,
        value: store.id,
      })),
    [storesQuery.data?.items],
  );

  const submitCreatePayment = async () => {
    const values = await form.validateFields();
    createMutation.mutate(values);
  };

  return (
    <section className="operation-page">
      <div className="operation-page__header">
        <div>
          <span className="operation-page__eyebrow">Manual billing</span>
          <h1>To‘lovlar</h1>
        </div>
        <Button
          type="primary"
          icon={<PlusCircle size={18} weight="duotone" />}
          onClick={() => setCreateModalOpen(true)}
        >
          To‘lov qo‘shish
        </Button>
      </div>

      <div className="operation-stats" aria-label="To‘lovlar ko‘rsatkichlari">
        <div>
          <span>Ro‘yxat</span>
          <strong>{paymentSummary.total}</strong>
        </div>
        <div>
          <span>UZS summa</span>
          <strong>{formatMoney(paymentSummary.amount)}</strong>
        </div>
        <div>
          <span>Filtr</span>
          <strong>{status ? paymentStatusLabels[status] : 'Barchasi'}</strong>
        </div>
      </div>

      <div className="operation-panel">
        <div className="operation-toolbar">
          <Select
            className="operation-toolbar__select"
            allowClear
            placeholder="To‘lov statusi"
            value={status}
            options={paymentStatusOptions}
            onChange={setStatus}
          />
          <Button icon={<Receipt size={18} weight="duotone" />} onClick={() => void paymentsQuery.refetch()}>
            Yangilash
          </Button>
        </div>

        <Table<PlatformPayment>
          rowKey="id"
          loading={paymentsQuery.isLoading}
          dataSource={payments}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          columns={[
            {
              title: 'Do‘kon',
              key: 'store',
              fixed: 'left',
              width: 240,
              render: (_value, payment) => (
                <div className="table-primary-cell">
                  <strong>{payment.store.name}</strong>
                  <span>{payment.store.slug}</span>
                </div>
              ),
            },
            {
              title: 'Summa',
              key: 'amount',
              width: 160,
              render: (_value, payment) => <strong>{formatMoney(payment.amount, payment.currency)}</strong>,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              width: 150,
              render: (value: PaymentStatus) => (
                <Tag color={paymentStatusColors[value]}>{paymentStatusLabels[value]}</Tag>
              ),
            },
            {
              title: 'Davr',
              key: 'period',
              width: 260,
              render: (_value, payment) => (
                <div className="table-primary-cell">
                  <span>Boshlanish: {formatDateTime(payment.periodStart)}</span>
                  <span>Tugash: {formatDateTime(payment.periodEnd)}</span>
                </div>
              ),
            },
            {
              title: 'Sana',
              key: 'dates',
              width: 220,
              render: (_value, payment) => (
                <div className="table-primary-cell">
                  <span>Yaratilgan: {formatDateTime(payment.createdAt)}</span>
                  <span>To‘langan: {formatDateTime(payment.paidAt)}</span>
                </div>
              ),
            },
            {
              title: 'Tasdiqlagan',
              key: 'approvedBy',
              width: 180,
              render: (_value, payment) => payment.approvedBy?.fullName ?? '-',
            },
            {
              title: 'Amallar',
              key: 'actions',
              width: 220,
              render: (_value, payment) =>
                payment.status === 'PENDING' ? (
                  <Space size={6}>
                    <Popconfirm
                      title="To‘lovni tasdiqlaysizmi?"
                      okText="Ha"
                      cancelText="Yo‘q"
                      onConfirm={() => approveMutation.mutate(payment.id)}
                    >
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircle size={16} weight="duotone" />}
                        loading={approveMutation.isPending}
                      >
                        Tasdiqlash
                      </Button>
                    </Popconfirm>
                    <Button
                      size="small"
                      danger
                      icon={<XCircle size={16} weight="duotone" />}
                      onClick={() => setRejectTarget(payment)}
                    >
                      Rad etish
                    </Button>
                  </Space>
                ) : (
                  <span className="muted-text">Amal yopilgan</span>
                ),
            },
          ]}
        />
      </div>

      <Modal
        title="Manual to‘lov qo‘shish"
        open={createModalOpen}
        okText="Yaratish"
        cancelText="Bekor qilish"
        confirmLoading={createMutation.isPending}
        onOk={submitCreatePayment}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
      >
        <Form<CreatePaymentPayload>
          form={form}
          layout="vertical"
          initialValues={{ currency: 'UZS' }}
          className="operation-form"
        >
          <Form.Item name="storeId" label="Do‘kon" rules={[{ required: true, message: 'Do‘konni tanlang' }]}>
            <Select
              showSearch
              loading={storesQuery.isLoading}
              options={storeOptions}
              optionFilterProp="label"
              placeholder="Do‘konni tanlang"
            />
          </Form.Item>
          <Form.Item name="amount" label="Summa" rules={[{ required: true, message: 'Summani kiriting' }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="399000" />
          </Form.Item>
          <Form.Item name="currency" label="Valyuta" rules={[{ required: true }]}>
            <Select options={currencyOptions} />
          </Form.Item>
          <Form.Item name="note" label="Izoh">
            <Input.TextArea maxLength={500} rows={3} placeholder="Masalan: Click chek raqami yoki karta to‘lovi" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="To‘lovni rad etish"
        open={Boolean(rejectTarget)}
        okText="Rad etish"
        okButtonProps={{ danger: true }}
        cancelText="Bekor qilish"
        confirmLoading={rejectMutation.isPending}
        onOk={() => {
          if (rejectTarget) rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote });
        }}
        onCancel={() => {
          setRejectTarget(null);
          setRejectNote('');
        }}
      >
        <div className="status-change-modal">
          <p>
            <strong>{rejectTarget?.store.name}</strong> uchun to‘lov rad etiladi.
          </p>
          <Input.TextArea
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Rad etish sababi"
          />
        </div>
      </Modal>
    </section>
  );
};
