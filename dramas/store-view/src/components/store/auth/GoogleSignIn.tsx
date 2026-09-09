import { useGoogleIdentityButton } from './hooks/useGoogleIdentityButton'
import { useGoogleSignInConfigDetail } from './hooks/useGoogleSignInConfigDetail'
import { GoogleSignInView } from './view/GoogleSignInView'
import type { LoginLanguage, TFunc } from './view/types'

interface GoogleSignInProps {
  t: TFunc
  language: LoginLanguage
  disabled: boolean
  pending: boolean
  onCredential: (credential: string) => void
}

export function GoogleSignIn({ t, language, disabled, pending, onCredential }: GoogleSignInProps) {
  //
  const config = useGoogleSignInConfigDetail()
  const identity = useGoogleIdentityButton({
    clientId: config.data?.clientId,
    locale: language.startsWith('uz') ? 'uz' : language,
    disabled,
    onCredential,
  })
  const unavailable = !config.isPending && !config.isError && !config.data?.clientId
  const failed = config.isError || identity.failed
  const retry = () => {
    //
    if (config.isError) void config.refetch()
    else identity.retry()
  }

  return (
    <GoogleSignInView
      t={t}
      buttonRef={identity.buttonRef}
      ready={identity.ready}
      disabled={disabled}
      pending={pending}
      unavailable={unavailable}
      failed={failed}
      onRetry={retry}
    />
  )
}
