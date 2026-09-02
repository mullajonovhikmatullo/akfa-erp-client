export function getSafeAuthRedirect(value: string | null, loginPath: string, fallbackPath: string) {
  //
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith(loginPath)) {
    return fallbackPath
  }
  return value
}

export function readAndClearAuthFragment() {
  //
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const handoffCode = params.get('handoff')
  const setupCode = params.get('setup')

  if (handoffCode || setupCode) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  return { handoffCode, setupCode }
}

export function isTransientAuthError(error: unknown) {
  //
  const status = (error as { response?: { status?: unknown } }).response?.status
  return typeof status !== 'number' || status === 429 || status >= 500
}
