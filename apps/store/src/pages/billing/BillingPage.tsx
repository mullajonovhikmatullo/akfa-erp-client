import { useEffect, useRef, useState } from 'react';
import {
  App as AntdApp,
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd';
import { CheckCircle, Eye, FileArrowUp, Receipt, WarningCircle, X } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BillingFlowApi,
  BillingSeekApi,
  type SubmitTenantPaymentPayload,
  type TenantPayment,
} from '@store/store-stub';
import { useT } from '@/shared/lib/i18n';

const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;
const ACCEPTED_RECEIPTS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(new Date(value)) : '—';

const formatClearDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      if (comma < 0) return reject(new Error('Invalid file'));
      resolve(result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

type PaymentForm = {
  note?: string;
};

type ReceiptPreview = {
  url: string;
  fileName: string;
  mimeType: string;
  note: string | null;
};

export function BillingPage() {
  const t = useT();
  const { message } = AntdApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<PaymentForm>();
  const [modalOpen, setModalOpen] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState<UploadFile[]>([]);
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState<ReceiptPreview | null>(null);
  const selectedReceiptPreviewUrlRef = useRef<string | null>(null);
  const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<ReceiptPreview | null>(null);

  useEffect(
    () => () => {
      if (selectedReceiptPreviewUrlRef.current) {
        URL.revokeObjectURL(selectedReceiptPreviewUrlRef.current);
      }
    },
    [],
  );

  useEffect(
    () => () => {
      if (receiptPreview?.url) URL.revokeObjectURL(receiptPreview.url);
    },
    [receiptPreview?.url],
  );

  const updateReceiptSelection = (fileList: UploadFile[]) => {
    const nextFiles = fileList.slice(-1);
    const nextFile = nextFiles[0]?.originFileObj;

    if (selectedReceiptPreviewUrlRef.current) {
      URL.revokeObjectURL(selectedReceiptPreviewUrlRef.current);
    }

    const nextPreview = nextFile
      ? {
          url: URL.createObjectURL(nextFile),
          fileName: nextFile.name,
          mimeType: nextFile.type,
        }
      : null;

    selectedReceiptPreviewUrlRef.current = nextPreview?.url ?? null;
    setReceiptFiles(nextFiles);
    setSelectedReceiptPreview(nextPreview);
  };

  const clearReceiptSelection = () => updateReceiptSelection([]);

  const summaryQuery = useQuery({
    ...BillingSeekApi.fetch.summary(),
    refetchInterval: 30_000,
  });
  const paymentsQuery = useQuery({
    ...BillingSeekApi.fetch.listPayments(),
    refetchInterval: 30_000,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tenant-billing'] });
  };

  const submitMutation = useMutation({
    mutationFn: BillingFlowApi.submitPayment,
    onSuccess: () => {
      message.success(t('billing.submitSuccess'));
      setModalOpen(false);
      void refresh();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : t('billing.submitError'));
      void refresh();
    },
  });

  const closePaymentModal = () => {
    setModalOpen(false);
  };

  const resetPaymentModal = () => {
    clearReceiptSelection();
    form.resetFields();
    if (!submitMutation.isPending) submitMutation.reset();
  };

  const summary = summaryQuery.data;
  const payments = paymentsQuery.data ?? [];
  const hasPendingPayment = payments.some((payment) => payment.status === 'PENDING');
  const submitPayment = async () => {
    const values = await form.validateFields();
    const upload = receiptFiles[0]?.originFileObj;
    if (!upload) {
      message.error(t('billing.receiptRequired'));
      return;
    }
    if (!ACCEPTED_RECEIPTS.includes(upload.type) || upload.size > MAX_RECEIPT_BYTES) {
      message.error(t('billing.receiptInvalid'));
      return;
    }

    const payload: SubmitTenantPaymentPayload = {
      paidAt: new Date().toISOString(),
      note: values.note?.trim() || undefined,
      receipt: {
        fileName: upload.name,
        mimeType: upload.type,
        base64: await readFileAsBase64(upload),
      },
    };
    submitMutation.mutate(payload);
  };

  const openReceipt = async (payment: TenantPayment) => {
    if (!payment.receiptMedia) return;
    setOpeningReceiptId(payment.receiptMedia.id);
    try {
      const blob = await BillingSeekApi.downloadMedia(payment.receiptMedia.id);
      const url = URL.createObjectURL(blob);
      setReceiptPreview({
        url,
        fileName: payment.receiptMedia.fileName,
        mimeType: payment.receiptMedia.mimeType,
        note: payment.note,
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('billing.receiptOpenError'));
    } finally {
      setOpeningReceiptId(null);
    }
  };

  const statusColor = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
  } as const;

  return (
    <section className="billing-page">
      <div className="page-head">
        <div>
          <h1>{t('billing.title')}</h1>
          <div className="sub">{t('billing.subtitle')}</div>
        </div>
        <Button
          type="primary"
          icon={<Receipt size={18} weight="duotone" />}
          disabled={!summary?.plan || hasPendingPayment}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          {hasPendingPayment ? t('billing.pendingButton') : t('billing.payButton')}
        </Button>
      </div>

      <div className="billing-summary">
        <div>
          <span>{t('billing.plan')}</span>
          <strong>{summary?.plan?.name ?? '—'}</strong>
        </div>
        <div>
          <span>{t('billing.monthlyPrice')}</span>
          <strong>{summary?.plan ? formatMoney(summary.plan.monthlyPriceUzs ?? 0) : '—'}</strong>
        </div>
        <div>
          <span>{t('billing.currentStatus')}</span>
          <strong>{summary ? t(`billing.storeStatus.${summary.status}`) : '—'}</strong>
        </div>
        <div>
          <span>{t('billing.nextDue')}</span>
          <strong>{formatClearDate(summary?.subscription?.nextPaymentDueAt ?? summary?.subscription?.trialEndsAt)}</strong>
        </div>
      </div>

      {hasPendingPayment ? (
        <div className="billing-notice" role="status">
          <WarningCircle size={20} weight="duotone" />
          <div>
            <strong>{t('billing.pendingTitle')}</strong>
            <span>{t('billing.pendingDescription')}</span>
          </div>
        </div>
      ) : null}

      <div className="billing-panel">
        <div className="billing-panel__header">
          <div>
            <h2>{t('billing.history')}</h2>
            <span>{t('billing.historyDescription')}</span>
          </div>
          <Button onClick={() => void refresh()}>{t('common.refresh')}</Button>
        </div>

        <Table<TenantPayment>
          rowKey="id"
          loading={paymentsQuery.isLoading}
          dataSource={payments}
          scroll={{ x: 800 }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          columns={[
            {
              title: t('billing.amount'),
              key: 'amount',
              width: 170,
              render: (_value, payment) => <strong>{formatMoney(payment.amount)}</strong>,
            },
            {
              title: t('common.status'),
              dataIndex: 'status',
              key: 'status',
              width: 150,
              render: (status: TenantPayment['status']) => (
                <Tag color={statusColor[status]}>{t(`billing.paymentStatus.${status}`)}</Tag>
              ),
            },
            {
              title: t('billing.period'),
              key: 'period',
              width: 230,
              render: (_value, payment) => `${formatDate(payment.periodStart)} – ${formatDate(payment.periodEnd)}`,
            },
            {
              title: t('billing.receipt'),
              key: 'receipt',
              width: 140,
              render: (_value, payment) =>
                payment.receiptMedia ? (
                  <Button
                    size="small"
                    icon={<Eye size={16} />}
                    loading={openingReceiptId === payment.receiptMedia.id}
                    onClick={() => void openReceipt(payment)}
                  >
                    {t('common.view')}
                  </Button>
                ) : '—',
            },
            {
              title: t('billing.result'),
              key: 'result',
              width: 260,
              render: (_value, payment) => (
                <div className="billing-result">
                  <span>{formatDate(payment.createdAt)}</span>
                  {payment.rejectionReason ? <strong>{payment.rejectionReason}</strong> : null}
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={receiptPreview?.fileName ?? t('billing.receipt')}
        open={Boolean(receiptPreview)}
        width={620}
        centered
        className="billing-receipt-modal"
        footer={
          <Button type="primary" onClick={() => setReceiptPreview(null)}>
            {t('common.close')}
          </Button>
        }
        onCancel={() => setReceiptPreview(null)}
      >
        <div className="billing-receipt-note">
          <span>{t('billing.note')}</span>
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
        title={t('billing.modalTitle')}
        open={modalOpen}
        okText={t('billing.submit')}
        cancelText={t('common.cancel')}
        confirmLoading={submitMutation.isPending}
        okButtonProps={{ disabled: receiptFiles.length === 0 }}
        onOk={() => void submitPayment()}
        onCancel={closePaymentModal}
        afterClose={resetPaymentModal}
        destroyOnHidden
        maskClosable
        keyboard
      >
        <Form<PaymentForm> form={form} layout="vertical">
          <div className="billing-modal-amount">
            <span>{t('billing.amountToPay')}</span>
            <strong>{formatMoney(summary?.plan?.monthlyPriceUzs ?? 0)}</strong>
          </div>
          <Form.Item label={t('billing.receipt')}>
            {selectedReceiptPreview ? (
              <div className="billing-receipt-preview">
                <div className="billing-receipt-preview__header">
                  <span title={selectedReceiptPreview.fileName}>{selectedReceiptPreview.fileName}</span>
                  <Button
                    type="text"
                    danger
                    htmlType="button"
                    icon={<X size={16} />}
                    onClick={clearReceiptSelection}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
                <div className="billing-receipt-preview__content">
                  {selectedReceiptPreview.mimeType === 'application/pdf' ? (
                    <iframe src={selectedReceiptPreview.url} title={selectedReceiptPreview.fileName} />
                  ) : (
                    <img src={selectedReceiptPreview.url} alt={selectedReceiptPreview.fileName} />
                  )}
                </div>
              </div>
            ) : (
              <Upload.Dragger
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                maxCount={1}
                fileList={receiptFiles}
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!ACCEPTED_RECEIPTS.includes(file.type) || file.size > MAX_RECEIPT_BYTES) {
                    message.error(t('billing.receiptInvalid'));
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                onChange={({ fileList }) => updateReceiptSelection(fileList)}
              >
                <FileArrowUp size={30} weight="duotone" />
                <p>{t('billing.receiptDrop')}</p>
                <span>{t('billing.receiptHint')}</span>
              </Upload.Dragger>
            )}
          </Form.Item>
          <Form.Item name="note" label={t('billing.note')}>
            <Input.TextArea rows={3} maxLength={500} placeholder={t('billing.notePlaceholder')} />
          </Form.Item>
          <Space className="billing-security-note" size={8}>
            <CheckCircle size={18} weight="duotone" />
            <span>{t('billing.securityNote')}</span>
          </Space>
        </Form>
      </Modal>
    </section>
  );
}
