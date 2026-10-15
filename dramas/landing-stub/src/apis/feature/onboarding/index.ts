import type { PublicPlan } from '~/contracts/backend.generated'

type LandingImportMetaEnv = {
  VITE_API_URL?: string
  VITE_STORE_LOGIN_URL?: string
  DEV?: boolean
}

const getEnv = () => (import.meta as ImportMeta & { env?: LandingImportMetaEnv }).env

const getApiBaseUrl = () => getEnv()?.VITE_API_URL ?? '/api'

export const getAdminUrl = () => {
  const env = getEnv()
  const url = new URL(
    env?.VITE_STORE_LOGIN_URL ?? '/store/auth/login',
    globalThis.location?.origin ?? 'http://localhost',
  )
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_STORE_LOGIN_URL must use http or https')
  }
  if (url.pathname === '/' || url.pathname === '') {
    url.pathname = '/store/auth/login'
  }
  url.username = ''
  url.password = ''
  url.search = ''
  return url.toString()
}

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

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!response.ok || !body?.success) {
    throw new OnboardingApiError(body?.message ?? fallbackMessage)
  }
  return body.data
}

export async function listPublicPlans(): Promise<PublicPlan[]> {
  const response = await fetch(`${getApiBaseUrl()}/public/plans`)
  return parseResponse(response, 'Tariflarni yuklab bo‘lmadi')
}

export const LandingFlowApi = {
  getAdminUrl,
}

export const LandingSeekApi = {
  listPublicPlans,
}

export const onboardingApi = {
  ...LandingFlowApi,
  ...LandingSeekApi,
}
