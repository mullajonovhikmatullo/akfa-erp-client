import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthFlowPanel, getSafeAuthRedirect } from '@store/store-view/auth'
import type { LoginResponse } from '@store/store-stub'
import { queryClient } from '@/app/providers/query/queryClient'
import { useUIStore } from '@/app/stores/ui.store'
import { useAuthStore } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'

export function LoginPage() {
  //
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const language = useUIStore((state) => state.lang)
  const setLanguage = useUIStore((state) => state.setLang)
  const redirectTo = getSafeAuthRedirect(searchParams.get('from'), ROUTES.LOGIN, ROUTES.DASHBOARD)
  const sessionExpired = searchParams.get('reason') === 'expired'

  const handleAuthenticated = useCallback(async ({ user, accessToken }: LoginResponse) => {
    //
    await queryClient.cancelQueries()
    queryClient.clear()
    login(user, accessToken)
    navigate(redirectTo, { replace: true })
  }, [login, navigate, redirectTo])

  return (
    <AuthFlowPanel
      language={language}
      sessionExpired={sessionExpired}
      onLanguageChange={setLanguage}
      onAuthenticated={handleAuthenticated}
    />
  )
}
