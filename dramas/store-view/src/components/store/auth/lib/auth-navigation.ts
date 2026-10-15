export function getSafeAuthRedirect(value: string | null, loginPath: string, fallbackPath: string) {
  //
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith(loginPath)) {
    return fallbackPath
  }
  return value
}

export function readAndClearSetupCode() {
  //
  const setupCode = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('setup')

  if (setupCode) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  return setupCode
}
