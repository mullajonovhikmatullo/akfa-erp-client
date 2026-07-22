import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginPanel } from '@erp/store-buddy-view/auth'
import type { LoginResponse } from '@erp/store-buddy-stub'
import { useAuthStore } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { useT } from '@/shared/lib/i18n'

export function LoginPage() {
  //
  const t = useT()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const redirectTo = searchParams.get('from') ?? ROUTES.DASHBOARD
  const sessionExpired = searchParams.get('reason') === 'expired'

  const handleAuthenticated = useCallback(
    ({ user, accessToken }: LoginResponse) => {
      //
      login(user, accessToken)
      navigate(redirectTo, { replace: true })
    },
    [login, navigate, redirectTo],
  )

  return <LoginPanel t={t} sessionExpired={sessionExpired} onAuthenticated={handleAuthenticated} />
}
