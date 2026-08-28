import { createHttpClient, createTokenStore } from '@store/store-shared'
import type { ApiResponse } from '@store/store-shared'
import type {
  CreatePaymentPayload,
  DeletePlanPayload,
  DeletePlanResult,
  ListStoresParams,
  PaymentStatus,
  ManagedPlan,
  PlanMutationPayload,
  OwnerSetupResult,
  PlatformStorePlan,
  PlatformDashboardResponse,
  PlatformLoginPayload,
  PlatformLoginResponse,
  PlatformPayment,
  ProvisionStorePayload,
  ProvisionStoreResult,
  PlatformStore,
  PlatformStoresResponse,
  StoreStatus,
  UpdatePlanPayload,
  UpdateStorePlanPayload,
} from '../../../models/domain/platform'

export const PLATFORM_TOKEN_KEY = 'global_admin_access_token'
export const PLATFORM_USER_KEY = 'global_admin_user'

export const platformTokenStore = createTokenStore({ tokenKey: PLATFORM_TOKEN_KEY })

export const platformHttp = createHttpClient({
  tokenKey: PLATFORM_TOKEN_KEY,
  onUnauthorized: () => {
    platformTokenStore.clear()
    globalThis.localStorage?.removeItem(PLATFORM_USER_KEY)
    if (globalThis.window?.location) {
      const env = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
      const base = (env?.BASE_URL ?? '/').replace(/\/?$/, '/')
      globalThis.window.location.href = `${base}auth/login?reason=expired`
    }
  },
})

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data

const login = (payload: PlatformLoginPayload) =>
  platformHttp.post<ApiResponse<PlatformLoginResponse>>('/platform/auth/login', payload).then(unwrap)

const me = () => platformHttp.get<ApiResponse<PlatformLoginResponse['user']>>('/platform/auth/me').then(unwrap)

const dashboard = () => platformHttp.get<ApiResponse<PlatformDashboardResponse>>('/platform/dashboard').then(unwrap)

const listPlans = () =>
  platformHttp.get<ApiResponse<PlatformStorePlan[]>>('/platform/plans').then(unwrap)

const listManagedPlans = () =>
  platformHttp.get<ApiResponse<ManagedPlan[]>>('/platform/plans/manage').then(unwrap)

const createPlan = (payload: PlanMutationPayload) =>
  platformHttp.post<ApiResponse<ManagedPlan>>('/platform/plans', payload).then(unwrap)

const updatePlan = ({ planId, payload }: { planId: string; payload: UpdatePlanPayload }) =>
  platformHttp.patch<ApiResponse<ManagedPlan>>(`/platform/plans/${planId}`, payload).then(unwrap)

const deletePlan = ({ planId, payload }: { planId: string; payload: DeletePlanPayload }) =>
  platformHttp
    .delete<ApiResponse<DeletePlanResult>>(`/platform/plans/${planId}`, { data: payload })
    .then(unwrap)

const listStores = (params: ListStoresParams = {}) =>
  platformHttp.get<ApiResponse<PlatformStoresResponse>>('/platform/stores', { params }).then(unwrap)

const findStoreById = (storeId: string) =>
  platformHttp.get<ApiResponse<PlatformStore>>(`/platform/stores/${storeId}`).then(unwrap)

const provisionStore = (payload: ProvisionStorePayload) =>
  platformHttp.post<ApiResponse<ProvisionStoreResult>>('/platform/stores', payload).then(unwrap)

const updateStoreStatus = ({
  storeId,
  status,
  expectedVersion,
  note,
  confirmation,
  currentPassword,
}: {
  storeId: string
  status: StoreStatus
  expectedVersion: number
  note?: string
  confirmation?: string
  currentPassword?: string
}) =>
  platformHttp
    .patch<ApiResponse<PlatformStore>>(`/platform/stores/${storeId}/status`, {
      status,
      expectedVersion,
      note: note?.trim() || undefined,
      confirmation: confirmation?.trim() || undefined,
      currentPassword,
    })
    .then(unwrap)

const updateStorePlan = ({
  storeId,
  payload,
}: {
  storeId: string
  payload: UpdateStorePlanPayload
}) =>
  platformHttp
    .patch<ApiResponse<PlatformStore>>(`/platform/stores/${storeId}/plan`, payload)
    .then(unwrap)

const regenerateOwnerSetup = (storeId: string, currentPassword: string) =>
  platformHttp
    .post<ApiResponse<OwnerSetupResult>>(
      `/platform/stores/${storeId}/owner/setup-link`,
      { currentPassword },
    )
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

const rejectPayment = ({ paymentId, note }: { paymentId: string; note: string }) =>
  platformHttp
    .patch<ApiResponse<PlatformPayment>>(`/platform/payments/${paymentId}/reject`, {
      note: note?.trim() || undefined,
    })
    .then(unwrap)

const downloadMedia = (mediaId: string) =>
  platformHttp
    .get<Blob>(`/media/${mediaId}`, { responseType: 'blob' })
    .then((response) => response.data)

export const PlatformSeekApi = {
  dashboard,
  me,
  listPlans,
  listManagedPlans,
  listStores,
  findStoreById,
  listPayments,
  downloadMedia,
  fetch: {
    dashboard: () => ({
      queryKey: ['platform-dashboard', 'metrics'] as const,
      queryFn: dashboard,
    }),
    listPlans: () => ({
      queryKey: ['platform-plans'] as const,
      queryFn: listPlans,
    }),
    listManagedPlans: () => ({
      queryKey: ['platform-plans', 'manage'] as const,
      queryFn: listManagedPlans,
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
  provisionStore,
  createPlan,
  updatePlan,
  deletePlan,
  updateStoreStatus,
  updateStorePlan,
  regenerateOwnerSetup,
  createPayment,
  approvePayment,
  rejectPayment,
}

export const platformApi = {
  dashboard,
  listPlans,
  listManagedPlans,
  listStores,
  me,
  findStoreById,
  provisionStore,
  createPlan,
  updatePlan,
  deletePlan,
  updateStoreStatus: (
    storeId: string,
    status: StoreStatus,
    expectedVersion: number,
    note?: string,
    confirmation?: string,
    currentPassword?: string,
  ) => updateStoreStatus({
    storeId,
    status,
    expectedVersion,
    note,
    confirmation,
    currentPassword,
  }),
  updateStorePlan: (
    storeId: string,
    planId: string,
    expectedVersion: number,
  ) => updateStorePlan({ storeId, payload: { planId, expectedVersion } }),
  regenerateOwnerSetup,
  listPayments,
  downloadMedia,
  createPayment,
  approvePayment,
  rejectPayment: (paymentId: string, note: string) => rejectPayment({ paymentId, note }),
  login,
}
