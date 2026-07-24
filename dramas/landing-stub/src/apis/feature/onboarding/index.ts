import type { RegisterStorePayload, RegisterStoreResult } from '../../../models/domain/onboarding'

export const LANDING_TOKEN_KEY = 'store_access_token'
export const LANDING_AUTH_STORE_KEY = 'store-auth'

type LandingImportMetaEnv = {
  VITE_API_URL?: string
  VITE_ADMIN_URL?: string
  DEV?: boolean
}

const getEnv = () => (import.meta as ImportMeta & { env?: LandingImportMetaEnv }).env

const getApiBaseUrl = () => getEnv()?.VITE_API_URL ?? 'http://localhost:3000'

export const getAdminUrl = () =>
  getEnv()?.VITE_ADMIN_URL ?? (getEnv()?.DEV ? 'http://127.0.0.1:5173/auth/login' : '/auth/login')

interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
}

export class OnboardingApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OnboardingApiError'
  }
}

export function persistAdminSession(result: RegisterStoreResult) {
  globalThis.localStorage?.setItem(LANDING_TOKEN_KEY, result.accessToken)
  globalThis.localStorage?.setItem(
    LANDING_AUTH_STORE_KEY,
    JSON.stringify({
      state: { user: result.user },
      version: 0,
    }),
  )
}

export async function registerStore(payload: RegisterStorePayload): Promise<RegisterStoreResult> {
  const response = await fetch(`${getApiBaseUrl()}/public/stores/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = (await response.json().catch(() => null)) as ApiEnvelope<RegisterStoreResult> | null

  if (!response.ok || !body?.success) {
    throw new OnboardingApiError(body?.message ?? 'Admin ochish so‘rovini yuborib bo‘lmadi')
  }

  return body.data
}

export const LandingFlowApi = {
  getAdminUrl,
  persistAdminSession,
  registerStore,
}

export const onboardingApi = LandingFlowApi
