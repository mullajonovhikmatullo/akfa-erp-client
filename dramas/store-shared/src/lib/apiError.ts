export type ApiErrorTranslator = (key: string) => string

type ApiErrorShape = {
  code?: string
  message?: unknown
  response?: {
    status?: unknown
    data?: unknown
  }
}

function readMessage(error: unknown): string | null {
  const source = error as ApiErrorShape
  const payloads = [source.response?.data, error]

  for (const payload of payloads) {
    if (!payload || typeof payload !== 'object') continue
    const message = (payload as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message.trim()
  }

  return null
}

function messageKey(message: string | null): string | null {
  if (!message) return null
  const normalized = message.toLowerCase()

  if (normalized.includes('only the receiving branch')) return 'apiErrors.receivingBranchOnly'
  if (normalized.includes('subscription payment is required')) return 'apiErrors.paymentRequired'
  if (normalized.includes('insufficient stock')) return 'apiErrors.insufficientStock'
  if (normalized.includes('inactive')) return 'apiErrors.inactive'
  if (normalized.includes('not found')) return 'apiErrors.notFound'
  if (
    normalized.includes('already exists') ||
    normalized.includes('already in use') ||
    normalized.includes('already taken') ||
    normalized.includes('allaqachon mavjud') ||
    normalized.includes('nomi band')
  ) {
    return 'apiErrors.conflict'
  }

  return null
}

export function getLocalizedApiErrorMessage(
  error: unknown,
  t: ApiErrorTranslator,
  fallbackKey: string,
): string {
  const source = error as ApiErrorShape
  const specificKey = messageKey(readMessage(error))
  if (specificKey) return t(specificKey)

  const status = typeof source.response?.status === 'number' ? source.response.status : null
  if (status === 408 || status === 504 || source.code === 'ECONNABORTED' || source.code === 'ETIMEDOUT') {
    return t('apiErrors.timeout')
  }
  if (!status && source.response === undefined && source.code) return t('apiErrors.network')
  if (status === 401) return t('apiErrors.unauthorized')
  if (status === 402) return t('apiErrors.paymentRequired')
  if (status === 403) return t('apiErrors.permissionDenied')
  if (status === 404) return t('apiErrors.notFound')
  if (status === 409) return t('apiErrors.conflict')
  if (status === 400 || status === 413 || status === 422) return t('apiErrors.invalidRequest')
  if (status === 429) return t('apiErrors.rateLimit')
  if (status !== null && status >= 500) return t('apiErrors.server')

  return t(fallbackKey)
}
