import { useEffect, useMemo, useState } from 'react';
import { App as AntdApp, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PlatformFlowApi,
  PlatformSeekApi,
} from '@store/platform-stub';
import type { CreatePaymentPayload, PaymentStatus, PlatformPayment } from '@store/platform-stub';
import { formatDateTime, formatMoney, paymentStatusLabels } from '../../shared/lib/platformFormatters';

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

type ReceiptPreview = {
  url: string;
  fileName: string;
  mimeType: string;
  note: string | null;
};

export const PaymentsPage = () => {
  //
  const { message } = AntdApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CreatePaymentPayload>();
  const [status, setStatus] = useState<PaymentStatus | undefined>('PENDING');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PlatformPayment | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<ReceiptPreview | null>(null);

  useEffect(
    () => () => {
      if (receiptPreview?.url) URL.revokeObjectURL(receiptPreview.url);
    },
    [receiptPreview?.url],
  );

  const paymentsQuery = useQuery({
    queryKey: ['platform-payments', status],
    queryFn: () => PlatformSeekApi.listPayments(status),
  });

  const storesQuery = useQuery({
    queryKey: ['platform-stores', { page: 1, pageSize: 100 }],
    queryFn: () => PlatformSeekApi.listStores({ page: 1, pageSize: 100 }),
  });

  const refreshPlatformData = async () => {
    //
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['platform-payments'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-dashboard'] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: PlatformFlowApi.createPayment,
    onSuccess: async () => {
      //
      message.success('Manual to‘lov yaratildi');
      setCreateModalOpen(false);
      form.resetFields();
      await refreshPlatformData();
    },
    onError: (error) => {
      //
      message.error(error instanceof Error ? error.message : 'To‘lov yaratilmadi');
      void refreshPlatformData();
    },
  });

  const approveMutation = useMutation({
    mutationFn: PlatformFlowApi.approvePayment,
    onSuccess: async () => {
      //
      message.success('To‘lov tasdiqlandi');
      await refreshPlatformData();
    },
    onError: (error) => {
      //
      message.error(error instanceof Error ? error.message : 'To‘lovni tasdiqlab bo‘lmadi');
      void refreshPlatformData();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      PlatformFlowApi.rejectPayment({ paymentId: id, note }),
    onSuccess: async () => {
      //
      message.success('To‘lov rad etildi');
      setRejectTarget(null);
      setRejectNote('');
      await refreshPlatformData();
    },
    onError: (error) => {
      //
      message.error(error instanceof Error ? error.message : 'To‘lovni rad etib bo‘lmadi');
      void refreshPlatformData();
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
      (storesQuery.data?.items ?? [])
        .filter(
          (store) =>
            store.status !== 'SUSPENDED' &&
            store.status !== 'CANCELLED' &&
            Boolean(store.plan) &&
            Number(store.plan?.monthlyPriceUzs) > 0,
        )
        .map((store) => ({
          label: `${store.name} · ${store.plan?.name} · ${formatMoney(store.plan?.monthlyPriceUzs ?? 0)}`,
          value: store.id,
        })),
    [storesQuery.data?.items],
  );

  const submitCreatePayment = async () => {
    //
    const values = await form.validateFields();
    createMutation.mutate({ ...values, currency: 'UZS' });
  };

  const selectStore = (storeId: string) => {
    //
    const store = storesQuery.data?.items.find((item) => item.id === storeId);
    form.setFieldsValue({
      storeId,
      amount: store?.plan?.monthlyPriceUzs,
      currency: 'UZS',
    });
  };

  const openReceipt = async (payment: PlatformPayment) => {
    //
    if (!payment.receiptMedia) return;
    setOpeningReceiptId(payment.receiptMedia.id);
    try {
      const blob = await PlatformSeekApi.downloadMedia(payment.receiptMedia.id);
      const url = URL.createObjectURL(blob);
      setReceiptPreview({
        url,
        fileName: payment.receiptMedia.fileName,
        mimeType: payment.receiptMedia.mimeType,
        note: payment.note,
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Chekni ochib bo‘lmadi');
    } finally {
      setOpeningReceiptId(null);
    }
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
          icon={<i className="icons-add-plus-circle icon-size-18" />}
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
          <Button icon={<i className="icons-file icon-size-18" />} onClick={() => void paymentsQuery.refetch()}>
            Yangilash
          </Button>
        </div>

        <Table<PlatformPayment>
          rowKey="id"
          loading={paymentsQuery.isLoading}
          dataSource={payments}
          scroll={{ x: 1830 }}
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
              title: 'Filial',
              key: 'branch',
              width: 180,
              render: (_value, payment) => payment.branch?.name ?? 'Platform kiritgan',
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
              title: 'Yuborgan',
              key: 'submittedBy',
              width: 190,
              render: (_value, payment) => (
                <div className="table-primary-cell">
                  <strong>{payment.submittedBy?.fullName ?? 'Platform admin'}</strong>
                  <span>{payment.submittedBy?.username ?? 'manual'}</span>
                </div>
              ),
            },
            {
              title: 'Chek',
              key: 'receipt',
              width: 150,
              render: (_value, payment) =>
                payment.receiptMedia ? (
                  <Button
                    size="small"
                    icon={<i className="icons-eye icon-size-16" />}
                    loading={openingReceiptId === payment.receiptMedia.id}
                    onClick={() => void openReceipt(payment)}
                  >
                    Ko‘rish
                  </Button>
                ) : (
                  <span className="muted-text">Manual</span>
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
              fixed: 'right',
              width: 250,
              render: (_value, payment) =>
                payment.status === 'PENDING' ? (
                  <Space size={6} wrap={false}>
                    <Popconfirm
                      title={`${payment.store.name} to‘lovini tasdiqlaysizmi?`}
                      description={`${formatMoney(payment.amount, payment.currency)} · ${formatDateTime(payment.periodStart)} – ${formatDateTime(payment.periodEnd)}`}
                      okText="Ha"
                      cancelText="Yo‘q"
                      onConfirm={() => approveMutation.mutate(payment.id)}
                    >
                      <Button
                        size="small"
                        type="primary"
                        icon={<i className="icons-circle-check icon-size-16" />}
                        loading={approveMutation.isPending}
                      >
                        Tasdiqlash
                      </Button>
                    </Popconfirm>
                    <Button
                      size="small"
                      danger
                      icon={<i className="icons-close-circle icon-size-16" />}
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
        title={receiptPreview?.fileName ?? 'To‘lov cheki'}
        open={Boolean(receiptPreview)}
        width={880}
        footer={
          <Button type="primary" onClick={() => setReceiptPreview(null)}>
            Yopish
          </Button>
        }
        onCancel={() => setReceiptPreview(null)}
      >
        <div className="payment-receipt-note">
          <span>Yuboruvchi izohi</span>
          <p>{receiptPreview?.note?.trim() || '—'}</p>
        </div>
        <div className="receipt-preview">
          {receiptPreview?.mimeType === 'application/pdf' ? (
            <iframe src={receiptPreview.url} title={receiptPreview.fileName} />
          ) : receiptPreview ? (
            <img src={receiptPreview.url} alt={receiptPreview.fileName} />
          ) : null}
        </div>
      </Modal>

      <Modal
        title="Manual to‘lov qo‘shish"
        open={createModalOpen}
        okText="Yaratish"
        cancelText="Bekor qilish"
        confirmLoading={createMutation.isPending}
        onOk={submitCreatePayment}
        onCancel={() => {
          //
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
              onChange={selectStore}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Oylik tarif summasi"
            rules={[{ required: true, message: 'Do‘konni tanlang' }]}
          >
            <InputNumber
              readOnly
              controls={false}
              precision={0}
              addonAfter="UZS"
              className="u-w-full"
              placeholder="Do‘kon tanlanganda avtomatik belgilanadi"
            />
          </Form.Item>
          <Form.Item name="currency" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Izoh">
            <Input.TextArea
              maxLength={500}
              showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
              rows={3}
              placeholder="Masalan: Click chek raqami yoki karta to‘lovi"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="To‘lovni rad etish"
        open={Boolean(rejectTarget)}
        okText="Rad etish"
        okButtonProps={{ danger: true, disabled: rejectNote.trim().length < 3 }}
        cancelText="Bekor qilish"
        confirmLoading={rejectMutation.isPending}
        onOk={() => {
          if (rejectTarget) rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote });
        }}
        onCancel={() => {
          //
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
            showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
            rows={3}
            placeholder="Rad etish sababi"
          />
        </div>
      </Modal>
    </section>
  );
};
