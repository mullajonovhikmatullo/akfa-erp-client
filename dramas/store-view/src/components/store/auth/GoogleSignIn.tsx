import { toast } from 'sonner'
import { useGoogleIdentityButton } from './hooks/useGoogleIdentityButton'
import { useGoogleSignInConfigDetail } from './hooks/useGoogleSignInConfigDetail'
import { GoogleSignInView } from './view/GoogleSignInView'
import type { LoginLanguage, TFunc } from './view/types'

const GOOGLE_SIGN_IN_ENABLED = false

interface GoogleSignInProps {
  t: TFunc
  language: LoginLanguage
  disabled: boolean
  pending: boolean
  onCredential: (credential: string) => void
}

export function GoogleSignIn(props: GoogleSignInProps) {
  //
  return GOOGLE_SIGN_IN_ENABLED ? <GoogleSignInLive {...props} /> : <GoogleSignInComingSoon t={props.t} disabled={props.disabled} />
}

function GoogleSignInComingSoon({ t, disabled }: Pick<GoogleSignInProps, 't' | 'disabled'>) {
  //
  return (
    <GoogleSignInView
      t={t}
      ready={false}
      disabled={disabled}
      pending={false}
      unavailable={false}
      failed={false}
      retrying={false}
      onRetry={() => {}}
      onPlaceholderClick={() => toast.info(t('login.googleComingSoon'))}
    />
  )
}

function GoogleSignInLive({ t, language, disabled, pending, onCredential }: GoogleSignInProps) {
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
    if (config.isError || unavailable) void config.refetch()
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
      retrying={config.isFetching}
      onRetry={retry}
    />
  )
}
