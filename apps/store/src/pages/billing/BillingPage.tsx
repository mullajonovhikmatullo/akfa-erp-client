import { useEffect, useRef, useState } from 'react';
import {
  App as AntdApp,
  Button,
  Form,
  Input,
  Modal,
  Popover,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  ArrowClockwiseIcon,
  CheckCircle,
  CreditCardIcon,
  Crown,
  Eye,
  FileArrowUp,
  InfoIcon,
  Sparkle,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BillingFlowApi,
  BillingSeekApi,
  type PublicBillingPlan,
  type SubmitTenantPaymentPayload,
  type StoreStatus,
  type TenantPayment,
} from '@store/store-stub';
import { useT } from '@/shared/lib/i18n';

const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;
const ACCEPTED_RECEIPTS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function getApiErrorMessage(error: unknown, fallback: string) {
  const source = error as {
    response?: { data?: unknown };
    data?: unknown;
    message?: unknown;
  };
  const payloads = [source.response?.data, source.data, error];

  for (const payload of payloads) {
    if (!payload || typeof payload !== 'object') continue;
    const record = payload as { message?: unknown; errors?: unknown };
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim();
    }

    if (Array.isArray(record.errors)) {
      const messages = record.errors
        .map((item) =>
          item && typeof item === 'object' && 'message' in item
            ? (item as { message?: unknown }).message
            : item,
        )
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      if (messages.length > 0) return messages.join(' ');
    }

    if (record.errors && typeof record.errors === 'object') {
      const messages = Object.values(record.errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      if (messages.length > 0) return messages.join(' ');
    }
  }

  return typeof source.message === 'string' && source.message.trim() ? source.message : fallback;
}

const formatMoney = (amount: number, currency: 'UZS' | 'USD' = 'UZS') =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatTableDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatClearDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
};

type PlanFeatureSource = {
  code?: string | null;
  name?: string | null;
  maxBranches?: number | null;
  maxUsers?: number | null;
  maxProducts?: number | null;
};

const normalizePlanCode = (code?: string | null) => code?.trim().toUpperCase() ?? '';

const getPlanFeatures = (plan: PlanFeatureSource, t: (key: string) => string) => {
  const planCode = normalizePlanCode(plan.code ?? plan.name);

  return [
    plan.maxBranches === null
      ? t('billing.featureUnlimitedBranches')
      : typeof plan.maxBranches === 'number'
        ? t('billing.featureBranches').replace('{count}', String(Math.max(plan.maxBranches - 1, 0)))
        : null,
    plan.maxUsers === null
      ? t('billing.featureUnlimitedUsers')
      : typeof plan.maxUsers === 'number'
        ? t('billing.featureUsers').replace('{count}', String(plan.maxUsers))
        : null,
    plan.maxProducts === null
      ? t('billing.featureUnlimitedProducts')
      : typeof plan.maxProducts === 'number'
        ? t('billing.featureProducts').replace('{count}', String(plan.maxProducts))
        : null,
    planCode === 'START' ? t('billing.featureBasicReports') : t('billing.featureAdvancedReports'),
    ...(planCode === 'START'
      ? [t('billing.featureEmailSupport')]
      : planCode === 'BUSINESS'
        ? [t('billing.featureTransfers'), t('billing.featurePrioritySupport')]
        : [
            t('billing.featureIndividual'),
            t('billing.featureIntegrations'),
            t('billing.featureManager'),
            t('billing.featureCustomSupport'),
          ]),
  ].filter((feature): feature is string => Boolean(feature));
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
  const { message: messageApi } = AntdApp.useApp();
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
          note: null,
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
  const publicPlansQuery = useQuery({
    ...BillingSeekApi.fetch.listPublicPlans(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const paymentsQuery = useQuery({
    ...BillingSeekApi.fetch.listPayments(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  const billingFetching =
    summaryQuery.isFetching || publicPlansQuery.isFetching || paymentsQuery.isFetching;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tenant-billing'] });
  };

  const submitMutation = useMutation({ mutationFn: BillingFlowApi.submitPayment });

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
  const plan = summary?.plan;
  const currentPlanCode = normalizePlanCode(plan?.code ?? plan?.name);
  const publicPlanForCurrent = (publicPlansQuery.data ?? []).find(
    (candidate) =>
      normalizePlanCode(candidate.code) === normalizePlanCode(plan?.code) ||
      normalizePlanCode(candidate.name) === normalizePlanCode(plan?.name),
  );
  const currentPlanFallback: PublicBillingPlan | null = plan && !publicPlanForCurrent
    ? {
        code: plan.code ?? 'CURRENT',
        name: plan.name ?? '—',
        monthlyPriceUzs: plan.monthlyPriceUzs ?? 0,
        maxBranches: plan.maxBranches ?? null,
        maxUsers: plan.maxUsers ?? null,
        maxProducts: plan.maxProducts ?? null,
      }
    : null;
  const publicPlanCards = [
    ...(currentPlanFallback ? [currentPlanFallback] : []),
    ...(publicPlansQuery.data ?? []),
  ].sort((left, right) => left.monthlyPriceUzs - right.monthlyPriceUzs);
  const isCurrentPlan = (candidate: PublicBillingPlan) =>
    Boolean(plan) &&
    (normalizePlanCode(candidate.code) === currentPlanCode ||
      normalizePlanCode(candidate.name) === normalizePlanCode(plan?.name));
  const isUpgradePlan = (candidate: PublicBillingPlan) =>
    !isCurrentPlan(candidate) &&
    typeof plan?.monthlyPriceUzs === 'number' &&
    candidate.monthlyPriceUzs > plan.monthlyPriceUzs;
  const planCardsLoading = summaryQuery.isLoading || publicPlansQuery.isLoading;
  const createUpgradeRequestHref = (targetPlan: Pick<PublicBillingPlan, 'name'>) => {
    const subject = `Mavion tarifini yangilash: ${targetPlan.name}`;
    const body = [
      'Assalomu alaykum,',
      '',
      'Akkauntim uchun quyidagi tarifga o‘tish bo‘yicha yordam kerak:',
      `Do‘kon: ${summary?.name ?? '—'}`,
      `Joriy tarif: ${plan?.name ?? '—'}`,
      `Tanlangan tarif: ${targetPlan.name}`,
      '',
      'Rahmat.',
    ].join('\n');
    return `https://t.me/mullajonovhikmatullo?text=${encodeURIComponent(`${subject}\n\n${body}`)}`;
  };

  const renderPublicPlanCard = (candidate: PublicBillingPlan) => {
    const isCurrent = isCurrentPlan(candidate);
    const isUpgrade = isUpgradePlan(candidate);
    const cardClassName = [
      'billing-plan-card',
      isCurrent ? 'billing-plan-card--current' : null,
      isUpgrade ? 'billing-plan-card--upgrade' : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <article className={cardClassName} key={candidate.code}>
        <div className="billing-plan-card__head">
          <span className="billing-plan-card__icon">
            {isCurrent ? (
              <Crown size={20} weight="duotone" />
            ) : isUpgrade ? (
              <Sparkle size={20} weight="duotone" />
            ) : (
              <CreditCardIcon size={20} weight="duotone" />
            )}
          </span>
          <div>
            <span className="billing-plan-card__eyebrow">
              {isCurrent ? t('billing.currentPlanLabel') : t('billing.plan')}
            </span>
            <h2>{candidate.name}</h2>
          </div>
          {isCurrent ? <Tag color="blue">{t('billing.currentPlanLabel')}</Tag> : null}
          {isUpgrade ? <Tag color="gold">{t('billing.upgradeTitle')}</Tag> : null}
        </div>
        <div className="billing-plan-card__price">
          <strong>{formatMoney(candidate.monthlyPriceUzs)}</strong>
          <span>/ oy</span>
        </div>
        <p className="billing-plan-card__description">
          {isUpgrade ? t('billing.upgradeDescription') : t('billing.featuresDescription')}
        </p>
        <ul className="billing-plan-card__features">
          {getPlanFeatures(candidate, t).map((feature) => (
            <li key={feature}>
              <CheckCircle size={16} weight="duotone" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {isUpgrade ? (
          <Button
            className="billing-plan-action billing-plan-action--upgrade"
            type="primary"
            block
            href={createUpgradeRequestHref(candidate)}
            target="_blank"
            rel="noreferrer"
          >
            {t('billing.upgradeButton')}
          </Button>
        ) : null}
      </article>
    );
  };

  const submitPayment = async () => {
    const values = await form.validateFields();
    const upload = receiptFiles[0]?.originFileObj;
    if (!upload) {
      messageApi.error(t('billing.receiptRequired'));
      return;
    }
    if (!ACCEPTED_RECEIPTS.includes(upload.type) || upload.size > MAX_RECEIPT_BYTES) {
      messageApi.error(t('billing.receiptInvalid'));
      return;
    }

    try {
      const payload: SubmitTenantPaymentPayload = {
        paidAt: new Date().toISOString(),
        note: values.note?.trim() || undefined,
        receipt: {
          fileName: upload.name,
          mimeType: upload.type,
          base64: await readFileAsBase64(upload),
        },
      };

      await submitMutation.mutateAsync(payload);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, t('billing.submitError'));
      messageApi.error(errorMessage);
      await queryClient
        .refetchQueries({ queryKey: ['tenant-billing', 'payments'], type: 'active' })
        .catch(() => undefined);
      if ((error as { response?: unknown })?.response) setModalOpen(false);
      return;
    }

    messageApi.success(t('billing.submitSuccess'));
    setModalOpen(false);
    void refresh();
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
      messageApi.error(error instanceof Error ? error.message : t('billing.receiptOpenError'));
    } finally {
      setOpeningReceiptId(null);
    }
  };

  const statusColor = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
  } as const;
  const storeStatusColor: Record<StoreStatus, string> = {
    TRIALING: 'blue',
    ACTIVE: 'green',
    PAST_DUE: 'orange',
    SUSPENDED: 'red',
    CANCELLED: 'default',
  };

  const renderPaymentDetails = (payment: TenantPayment) => {
    const rejectionReason = payment.rejectionReason?.trim();
    const note = payment.note?.trim();
    const hasDetails = Boolean(rejectionReason || note || payment.status === 'REJECTED');

    if (!hasDetails) return <span className="billing-table-empty">—</span>;

    return (
      <Popover
        title={
          payment.status === 'REJECTED'
            ? t('billing.rejectionReasonTitle')
            : t('billing.paymentDetails')
        }
        trigger="click"
        placement="topRight"
        content={
          <div className="billing-payment-details-popover">
            {payment.status === 'REJECTED' ? (
              <div className="billing-payment-details-popover__item billing-payment-details-popover__item--danger">
                <span>{t('billing.rejectionReason')}</span>
                <p>{rejectionReason || t('billing.noRejectionReason')}</p>
              </div>
            ) : null}
            {note ? (
              <div className="billing-payment-details-popover__item">
                <span>{t('billing.note')}</span>
                <p>{note}</p>
              </div>
            ) : null}
          </div>
        }
      >
        <Button
          type="text"
          shape="circle"
          className="billing-payment-details-button"
          aria-label={
            payment.status === 'REJECTED'
              ? t('billing.rejectionReason')
              : t('billing.paymentDetails')
          }
          icon={<InfoIcon size={18} weight="duotone" />}
        />
      </Popover>
    );
  };

  return (
    <section className="billing-page">
      <div className="page-head">
        <div>
          <h1>{t('billing.title')}</h1>
          <div className="sub">{t('billing.subtitle')}</div>
        </div>
        <div className="billing-page__actions">
          <Button
            type="primary"
            icon={<CreditCardIcon size={18} weight="duotone" />}
            disabled={!summary?.plan || hasPendingPayment}
            onClick={() => {
              setModalOpen(true);
            }}
          >
            {hasPendingPayment ? t('billing.pendingButton') : t('billing.payButton')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button
              aria-label={t('common.refresh')}
              icon={
                <ArrowClockwiseIcon
                  size={18}
                  className={billingFetching ? 'ph-icon-spin' : undefined}
                />
              }
              onClick={() => void refresh()}
            />
          </Tooltip>
        </div>
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
          {summary ? (
            <Tag className="billing-summary-status" color={storeStatusColor[summary.status]}>
              {t(`billing.storeStatus.${summary.status}`)}
            </Tag>
          ) : (
            <strong>—</strong>
          )}
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

      {planCardsLoading ? (
        <div className="billing-plan-cards billing-plan-cards--loading" aria-busy="true">
          {[0, 1, 2].map((card) => (
            <article className="billing-plan-card billing-plan-card--skeleton" key={card}>
              <Skeleton active title={{ width: card === 1 ? '54%' : '46%' }} paragraph={{ rows: 5 }} />
            </article>
          ))}
        </div>
      ) : plan ? (
        <div className="billing-plan-cards">
          {publicPlanCards.map(renderPublicPlanCard)}
        </div>
      ) : null}

      <div className="billing-panel">
        <div className="billing-panel__header">
          <div>
            <h2>{t('billing.history')}</h2>
            <span>{t('billing.historyDescription')}</span>
          </div>
        </div>

        <Table<TenantPayment>
          rowKey="id"
          className="billing-payments-table"
          size="middle"
          loading={paymentsQuery.isLoading}
          dataSource={payments}
          locale={{ emptyText: t('common.noData') }}
          scroll={{ x: 1020 }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          columns={[
            {
              title: t('billing.submittedAt'),
              key: 'submittedAt',
              width: 175,
              render: (_value, payment) => (
                <span className="billing-table-date">{formatTableDateTime(payment.createdAt)}</span>
              ),
            },
            {
              title: t('billing.branch'),
              key: 'branch',
              width: 150,
              render: (_value, payment) => (
                <span className="billing-table-branch">{payment.branch?.name ?? '—'}</span>
              ),
            },
            {
              title: t('billing.amount'),
              key: 'amount',
              width: 155,
              render: (_value, payment) => (
                <div className="billing-table-amount">
                  <strong>{formatMoney(payment.amount, payment.currency)}</strong>
                  <span>{payment.currency}</span>
                </div>
              ),
            },
            {
              title: t('billing.period'),
              key: 'period',
              width: 220,
              render: (_value, payment) => (
                <div className="billing-table-period">
                  <strong>{formatClearDate(payment.periodStart)}</strong>
                  <span>→ {formatClearDate(payment.periodEnd)}</span>
                </div>
              ),
            },
            {
              title: t('common.status'),
              dataIndex: 'status',
              key: 'status',
              width: 140,
              render: (status: TenantPayment['status']) => (
                <Tag color={statusColor[status]}>{t(`billing.paymentStatus.${status}`)}</Tag>
              ),
            },
            {
              title: t('billing.receipt'),
              key: 'receipt',
              width: 100,
              render: (_value, payment) =>
                payment.receiptMedia ? (
                  <Tooltip title={t('common.view')}>
                    <Button
                      type="text"
                      shape="circle"
                      aria-label={t('common.view')}
                      icon={<Eye size={18} />}
                      loading={openingReceiptId === payment.receiptMedia.id}
                      onClick={() => void openReceipt(payment)}
                    />
                  </Tooltip>
                ) : <span className="billing-table-empty">—</span>,
            },
            {
              title: t('billing.details'),
              key: 'details',
              width: 95,
              align: 'center',
              render: (_value, payment) => renderPaymentDetails(payment),
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
                    messageApi.error(t('billing.receiptInvalid'));
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
