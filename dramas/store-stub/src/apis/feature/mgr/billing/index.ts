import { http } from '@store/store-shared'
import type { ApiResponse } from '@store/store-shared'
import type {
  PaymentStatus,
  PublicBillingPlan,
  SubmitTenantPaymentPayload,
  TenantBillingSummary,
  TenantPayment,
} from '../../../../models/domain/billing'

const unwrap = <T>(response: { data: ApiResponse<T> }) => {
  if (!response.data.success) {
    const error = new Error(response.data.message ?? 'Billing request failed')
    Object.assign(error, { response: { data: response.data } })
    throw error
  }

  return response.data.data
}

const summary = () =>
  http.get<ApiResponse<TenantBillingSummary>>('/billing').then(unwrap)

const listPublicPlans = () =>
  http.get<ApiResponse<PublicBillingPlan[]>>('/public/plans').then(unwrap)

const listPayments = (status?: PaymentStatus) =>
  http
    .get<ApiResponse<TenantPayment[]>>('/billing/payments', { params: { status } })
    .then(unwrap)

const submitPayment = (payload: SubmitTenantPaymentPayload) =>
  http
    .post<ApiResponse<TenantPayment>>('/billing/payments', payload)
    .then(unwrap)

const downloadMedia = (mediaId: string) =>
  http
    .get<Blob>(`/media/${mediaId}`, { responseType: 'blob' })
    .then((response) => response.data)

export const BillingSeekApi = {
  summary,
  listPublicPlans,
  listPayments,
  downloadMedia,
  fetch: {
    summary: () => ({
      queryKey: ['tenant-billing', 'summary'] as const,
      queryFn: summary,
    }),
    listPublicPlans: () => ({
      queryKey: ['tenant-billing', 'public-plans'] as const,
      queryFn: listPublicPlans,
    }),
    listPayments: (status?: PaymentStatus) => ({
      queryKey: ['tenant-billing', 'payments', status] as const,
      queryFn: () => listPayments(status),
    }),
  },
}

export const BillingFlowApi = {
  submitPayment,
}
