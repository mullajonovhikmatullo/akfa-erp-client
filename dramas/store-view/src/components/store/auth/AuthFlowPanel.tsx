import { useStoreT } from '@store/store-i18n'
import type { LoginResponse } from '@store/store-stub'
import { LoginPanel } from './LoginPanel'
import { useAuthFlow } from './hooks/useAuthFlow'
import type { LoginLanguage } from './view/types'
import { AccountSetupView } from './view/AccountSetupView'

export interface AuthFlowPanelProps {
  language: LoginLanguage
  onAuthenticated: (response: LoginResponse) => void
  onLanguageChange: (language: LoginLanguage) => void
  sessionExpired: boolean
}

export function AuthFlowPanel({
  language,
  onAuthenticated,
  onLanguageChange,
  sessionExpired,
}: AuthFlowPanelProps) {
  //
  const t = useStoreT()
  const authFlow = useAuthFlow({ t, onAuthenticated })
  if (authFlow.setupCode) {
    return (
      <AccountSetupView
        newPassword={authFlow.newPassword}
        confirmPassword={authFlow.confirmPassword}
        error={authFlow.authError}
        pending={authFlow.completeAccountSetup.isPending}
        t={t}
        onNewPasswordChange={authFlow.setNewPassword}
        onConfirmPasswordChange={authFlow.setConfirmPassword}
        onSubmit={authFlow.submitAccountSetup}
      />
    )
  }

  return (
    <LoginPanel
      t={t}
      language={language}
      sessionExpired={sessionExpired}
      externalError={authFlow.authError}
      onLanguageChange={onLanguageChange}
      onAuthenticated={onAuthenticated}
    />
  )
}
