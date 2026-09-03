import { useCallback, useState } from 'react'
import { App as AntdApp, Form } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useStoreT } from '@store/store-i18n'
import type { SubmitTenantPaymentPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { isValidReceipt, readReceiptAsBase64 } from './lib/billing-receipt'
import { billingKeys } from './hooks/billingKeys'
import { useBillingMutation } from './hooks/useBillingMutation'
import { useBillingPaymentsList } from './hooks/useBillingPaymentsList'
import { useBillingPlansList } from './hooks/useBillingPlansList'
import { useBillingReceiptPreview } from './hooks/useBillingReceiptPreview'
import { useBillingSummary } from './hooks/useBillingSummary'
import { useReceiptSelection } from './hooks/useReceiptSelection'
import {
  BillingHistory,
  BillingPageHeader,
  BillingPendingNotice,
  BillingPlanCards,
  BillingSummary,
  PaymentSubmissionModal,
  ReceiptPreviewModal,
  type PaymentFormValues,
} from './view'

export function BillingPanel() {
  //
  const t = useStoreT()
  const { message: messageApi } = AntdApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<PaymentFormValues>()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const summaryQuery = useBillingSummary()
  const plansQuery = useBillingPlansList()
  const paymentsQuery = useBillingPaymentsList()
  const { submitPayment } = useBillingMutation()
  const receiptSelection = useReceiptSelection()
  const handleReceiptError = useCallback(
    (error: unknown) => messageApi.error(getLocalizedApiErrorMessage(error, t, 'billing.receiptOpenError')),
    [messageApi, t],
  )
  const receiptDetail = useBillingReceiptPreview(handleReceiptError)

  const summary = summaryQuery.data
  const payments = paymentsQuery.data ?? []
  const hasPendingPayment = payments.some((payment) => payment.status === 'PENDING')
  const billingFetching = summaryQuery.isFetching || plansQuery.isFetching || paymentsQuery.isFetching
  const planCardsLoading = summaryQuery.isLoading || plansQuery.isLoading

  const refreshBilling = () => queryClient.invalidateQueries({ queryKey: billingKeys.all })

  const resetPaymentModal = () => {
    //
    receiptSelection.clear()
    form.resetFields()
    if (!submitPayment.isPending) submitPayment.reset()
  }

  const handleSubmitPayment = async () => {
    //
    const values = await form.validateFields()
    const receipt = receiptSelection.files[0]?.originFileObj

    if (!receipt) {
      messageApi.error(t('billing.receiptRequired'))
      return
    }
    if (!isValidReceipt(receipt)) {
      messageApi.error(t('billing.receiptInvalid'))
      return
    }

    try {
      const payload: SubmitTenantPaymentPayload = {
        paidAt: new Date().toISOString(),
        note: values.note?.trim() || undefined,
        receipt: {
          fileName: receipt.name,
          mimeType: receipt.type,
          base64: await readReceiptAsBase64(receipt),
        },
      }

      await submitPayment.mutateAsync(payload)
      messageApi.success(t('billing.submitSuccess'))
      setPaymentModalOpen(false)
      void refreshBilling()
    } catch (error) {
      messageApi.error(getLocalizedApiErrorMessage(error, t, 'billing.submitError'))
      await queryClient.refetchQueries({ queryKey: billingKeys.payments, type: 'active' }).catch(() => undefined)
      if ((error as { response?: unknown })?.response) setPaymentModalOpen(false)
    }
  }

  return (
    <section className="billing-page">
      <BillingPageHeader
        t={t}
        fetching={billingFetching}
        hasPlan={Boolean(summary?.plan)}
        hasPendingPayment={hasPendingPayment}
        onPay={() => setPaymentModalOpen(true)}
        onRefresh={() => void refreshBilling()}
      />
      <BillingSummary summary={summary} t={t} />
      {hasPendingPayment ? <BillingPendingNotice t={t} /> : null}
      <BillingPlanCards
        summary={summary}
        publicPlans={plansQuery.data ?? []}
        loading={planCardsLoading}
        t={t}
      />
      <BillingHistory
        payments={payments}
        loading={paymentsQuery.isLoading}
        openingReceiptId={receiptDetail.openingReceiptId}
        t={t}
        onOpenReceipt={(payment) => void receiptDetail.openReceipt(payment)}
      />
      <ReceiptPreviewModal preview={receiptDetail.preview} t={t} onClose={receiptDetail.closePreview} />
      <PaymentSubmissionModal
        open={paymentModalOpen}
        pending={submitPayment.isPending}
        amount={summary?.plan?.monthlyPriceUzs ?? 0}
        form={form}
        files={receiptSelection.files}
        preview={receiptSelection.preview}
        t={t}
        onClose={() => setPaymentModalOpen(false)}
        onAfterClose={resetPaymentModal}
        onSubmit={() => void handleSubmitPayment()}
        onFilesChange={receiptSelection.updateFiles}
        onClearReceipt={receiptSelection.clear}
        onInvalidReceipt={() => messageApi.error(t('billing.receiptInvalid'))}
      />
    </section>
  )
}
