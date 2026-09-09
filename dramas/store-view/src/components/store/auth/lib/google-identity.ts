interface GoogleIdentityClient {
  initialize: (options: {
    client_id: string
    callback: (response: { credential: string }) => void
    auto_select: boolean
    ux_mode: 'popup'
    use_fedcm_for_button: boolean
    button_auto_select: boolean
  }) => void
  renderButton: (parent: HTMLElement, options: {
    type: 'standard'
    theme: 'outline'
    size: 'large'
    text: 'continue_with'
    shape: 'rectangular'
    logo_alignment: 'left'
    width: number
    locale: string
  }) => void
}

let identityPromise: Promise<GoogleIdentityClient> | null = null

function getGoogleIdentity() {
  //
  return (window as Window & { google?: { accounts?: { id?: GoogleIdentityClient } } }).google?.accounts?.id
}

export function loadGoogleIdentity(): Promise<GoogleIdentityClient> {
  //
  const existing = getGoogleIdentity()
  if (existing) return Promise.resolve(existing)
  if (identityPromise) return identityPromise

  identityPromise = new Promise<GoogleIdentityClient>((resolve, reject) => {
    //
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.referrerPolicy = 'strict-origin-when-cross-origin'
    const timer = window.setTimeout(() => finish(), 15_000)

    function finish() {
      //
      window.clearTimeout(timer)
      script.onload = null
      script.onerror = null
      const identity = getGoogleIdentity()
      if (identity) resolve(identity)
      else {
        script.remove()
        reject(new Error('Google sign-in could not load'))
      }
    }

    script.onload = finish
    script.onerror = finish
    document.head.append(script)
  }).catch((error: unknown) => {
    //
    identityPromise = null
    throw error
  })

  return identityPromise
}
