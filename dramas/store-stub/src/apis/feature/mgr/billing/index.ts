import { http } from '@store/store-shared'
import type { ApiResponse } from '@store/store-shared'
import type {
  PaymentStatus,
  SubmitTenantPaymentPayload,
  TenantBillingSummary,
  TenantPayment,
} from '../../../../models/domain/billing'

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data

const summary = () =>
  http.get<ApiResponse<TenantBillingSummary>>('/billing').then(unwrap)

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
  listPayments,
  downloadMedia,
  fetch: {
    summary: () => ({
      queryKey: ['tenant-billing', 'summary'] as const,
      queryFn: summary,
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
