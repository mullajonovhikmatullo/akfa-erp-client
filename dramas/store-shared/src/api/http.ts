import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const DEFAULT_TOKEN_KEY = 'store_access_token'

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

const resolveAppBasePath = () => {
  //
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  return meta.env?.BASE_URL ?? '/'
}

const withAppBasePath = (path: string) => {
  //
  const base = resolveAppBasePath().replace(/\/?$/, '/')
  return `${base}${path.replace(/^\//, '')}`
}

export const createTokenStore = ({
  tokenKey = DEFAULT_TOKEN_KEY,
  storage = globalThis.sessionStorage,
}: Pick<HttpClientOptions, 'tokenKey' | 'storage'> = {}): TokenStore => {
  //
  const notify = () => globalThis.window?.dispatchEvent(new Event('store-session-changed'))
  return {
    get: () => storage?.getItem(tokenKey) ?? null,
    set: (token: string) => {
      //
      storage?.setItem(tokenKey, token)
      notify()
    },
    clear: () => {
      //
      storage?.removeItem(tokenKey)
      notify()
    },
  }
}

export const createHttpClient = ({
  baseURL = resolveEnvBaseUrl() ?? '/api',
  timeout = 60_000,
  onUnauthorized,
  ...tokenOptions
}: HttpClientOptions = {}): AxiosInstance => {
  //
  const tokenStore = createTokenStore(tokenOptions)
  const storage = tokenOptions.storage ?? globalThis.sessionStorage
  const requestTokens = new WeakMap<object, string | null>()
  const client = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use((config) => {
    //
    const token = tokenStore.get()
    requestTokens.set(config, token)
    if (token) config.headers.Authorization = `Bearer ${token}`
    else config.headers.delete('Authorization')
    return config
  })

  client.interceptors.response.use(
    (response) => {
      //
      if (requestTokens.get(response.config) !== tokenStore.get()) throw new axios.CanceledError('Session changed')
      return response
    },
    (error) => {
      //
      const url = error?.config?.url ?? ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/me') || url.includes('/auth/google')

      if (error?.config && requestTokens.has(error.config) && requestTokens.get(error.config) !== tokenStore.get()) {
        return Promise.reject(new axios.CanceledError('Session changed'))
      }

      if (error?.response?.status === 401 && !isAuthEndpoint) {
        if (onUnauthorized) {
          onUnauthorized()
        } else if (tokenStore.get()) {
          tokenStore.clear()
          storage?.removeItem('store-auth')
          if (globalThis.window?.location) {
            globalThis.window.location.href = withAppBasePath('/auth/login?reason=expired')
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
