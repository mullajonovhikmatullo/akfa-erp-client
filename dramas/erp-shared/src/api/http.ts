import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const DEFAULT_TOKEN_KEY = 'akfa_access_token'

export interface TokenStore {
  get: () => string | null
  set: (token: string) => void
  clear: () => void
}

export interface HttpClientOptions {
  baseURL?: string
  tokenKey?: string
  timeout?: number
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  onUnauthorized?: () => void
}

const resolveEnvBaseUrl = () => {
  //
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  return meta.env?.VITE_API_URL
}

export const createTokenStore = ({
  tokenKey = DEFAULT_TOKEN_KEY,
  storage = globalThis.localStorage,
}: Pick<HttpClientOptions, 'tokenKey' | 'storage'> = {}): TokenStore => ({
  get: () => storage?.getItem(tokenKey) ?? null,
  set: (token: string) => storage?.setItem(tokenKey, token),
  clear: () => storage?.removeItem(tokenKey),
})

export const createHttpClient = ({
  baseURL = resolveEnvBaseUrl() ?? 'http://localhost:3000',
  timeout = 60_000,
  onUnauthorized,
  ...tokenOptions
}: HttpClientOptions = {}): AxiosInstance => {
  //
  const tokenStore = createTokenStore(tokenOptions)
  const storage = tokenOptions.storage ?? globalThis.localStorage
  const client = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use((config) => {
    //
    const token = tokenStore.get()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      //
      const url = error?.config?.url ?? ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/me')

      if (error?.response?.status === 401 && !isAuthEndpoint) {
        if (onUnauthorized) {
          onUnauthorized()
        } else if (tokenStore.get()) {
          tokenStore.clear()
          storage?.removeItem('akfa-auth')
          if (globalThis.window?.location) {
            globalThis.window.location.href = '/auth/login?reason=expired'
          }
        }
      }

      return Promise.reject(error)
    },
  )

  return client
}

export const http = createHttpClient()
export type HttpRequestConfig = AxiosRequestConfig
