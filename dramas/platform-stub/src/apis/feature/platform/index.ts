import { createHttpClient, createTokenStore } from '@store/store-shared'
import type { ApiResponse } from '@store/store-shared'
import type {
  CreatePaymentPayload,
  ListStoresParams,
  PaymentStatus,
  PlatformDashboardResponse,
  PlatformLoginPayload,
  PlatformLoginResponse,
  PlatformPayment,
  PlatformStore,
  PlatformStoresResponse,
  StoreStatus,
} from '../../../models/domain/platform'

export const PLATFORM_TOKEN_KEY = 'global_admin_access_token'
export const PLATFORM_USER_KEY = 'global_admin_user'

export const platformTokenStore = createTokenStore({ tokenKey: PLATFORM_TOKEN_KEY })

export const platformHttp = createHttpClient({
  tokenKey: PLATFORM_TOKEN_KEY,
  onUnauthorized: () => {
    platformTokenStore.clear()
    globalThis.localStorage?.removeItem(PLATFORM_USER_KEY)
  },
})

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data

const login = (payload: PlatformLoginPayload) =>
  platformHttp.post<ApiResponse<PlatformLoginResponse>>('/auth/login', payload).then(unwrap)

const dashboard = () => platformHttp.get<ApiResponse<PlatformDashboardResponse>>('/platform/dashboard').then(unwrap)

const listStores = (params: ListStoresParams = {}) =>
  platformHttp.get<ApiResponse<PlatformStoresResponse>>('/platform/stores', { params }).then(unwrap)

const updateStoreStatus = ({ storeId, status, note }: { storeId: string; status: StoreStatus; note?: string }) =>
  platformHttp
    .patch<ApiResponse<PlatformStore>>(`/platform/stores/${storeId}/status`, {
      status,
      note: note?.trim() || undefined,
    })
    .then(unwrap)

const listPayments = (status?: PaymentStatus) =>
  platformHttp.get<ApiResponse<PlatformPayment[]>>('/platform/payments', { params: { status } }).then(unwrap)

const createPayment = (payload: CreatePaymentPayload) =>
  platformHttp
    .post<ApiResponse<PlatformPayment>>('/platform/payments', {
      ...payload,
      note: payload.note?.trim() || undefined,
    })
    .then(unwrap)

const approvePayment = (paymentId: string) =>
  platformHttp.patch<ApiResponse<PlatformPayment>>(`/platform/payments/${paymentId}/approve`).then(unwrap)

const rejectPayment = ({ paymentId, note }: { paymentId: string; note?: string }) =>
  platformHttp
    .patch<ApiResponse<PlatformPayment>>(`/platform/payments/${paymentId}/reject`, {
      note: note?.trim() || undefined,
    })
    .then(unwrap)

export const PlatformSeekApi = {
  dashboard,
  listStores,
  listPayments,
  fetch: {
    dashboard: () => ({
      queryKey: ['dashboard'] as const,
      queryFn: dashboard,
    }),
    listStores: (params: ListStoresParams = {}) => ({
      queryKey: ['platform-stores', params] as const,
      queryFn: () => listStores(params),
    }),
    listPayments: (status?: PaymentStatus) => ({
      queryKey: ['platform-payments', status] as const,
      queryFn: () => listPayments(status),
    }),
  },
}

export const PlatformFlowApi = {
  login,
  updateStoreStatus,
  createPayment,
  approvePayment,
  rejectPayment,
}

export const platformApi = {
  dashboard,
  listStores,
  updateStoreStatus: (storeId: string, status: StoreStatus, note?: string) =>
    updateStoreStatus({ storeId, status, note }),
  listPayments,
  createPayment,
  approvePayment,
  rejectPayment: (paymentId: string, note?: string) => rejectPayment({ paymentId, note }),
  login,
}
