import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, Form, Input, Spin } from 'antd'
import { LockIcon, WarningIcon } from '@phosphor-icons/react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginPanel } from '@store/store-view/auth'
import { UserFlowApi, type LoginResponse } from '@store/store-stub'
import { queryClient } from '@/app/providers'
import { useUIStore } from '@/app/stores/ui.store'
import { useAuthStore } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { useT } from '@/shared/lib/i18n'

function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith(ROUTES.LOGIN)) {
    return ROUTES.DASHBOARD
  }
  return value
}

function readAndClearAuthFragment() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const handoffCode = params.get('handoff')
  const setupCode = params.get('setup')

  if (handoffCode || setupCode) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  return { handoffCode, setupCode }
}

function getApiMessage(error: unknown): string | null {
  const response = (error as { response?: { data?: { message?: unknown } } }).response
  return typeof response?.data?.message === 'string' ? response.data.message : null
}

function isTransientAuthError(error: unknown): boolean {
  const status = (error as { response?: { status?: unknown } }).response?.status
  return typeof status !== 'number' || status === 429 || status >= 500
}

export function LoginPage() {
  const t = useT()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const language = useUIStore((state) => state.lang)
  const setLanguage = useUIStore((state) => state.setLang)
  const redirectTo = safeRedirect(searchParams.get('from'))
  const sessionExpired = searchParams.get('reason') === 'expired'
  const fragmentHandled = useRef(false)
  const [handoffCode, setHandoffCode] = useState<string | null>(null)
  const [handoffPending, setHandoffPending] = useState(false)
  const [handoffRetryable, setHandoffRetryable] = useState(false)
  const [setupCode, setSetupCode] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const handleAuthenticated = useCallback(
    async ({ user, accessToken }: LoginResponse) => {
      await queryClient.cancelQueries()
      queryClient.clear()
      login(user, accessToken)
      navigate(redirectTo, { replace: true })
    },
    [login, navigate, redirectTo],
  )

  const exchangeHandoff = useCallback(
    (code: string) => {
      setAuthError(null)
      setHandoffRetryable(false)
      setHandoffPending(true)
      UserFlowApi.exchangeHandoff({ handoffCode: code })
        .then(handleAuthenticated)
        .catch((error) => {
          if (isTransientAuthError(error)) {
            setHandoffRetryable(true)
            setAuthError(t('login.linkTemporary'))
            return
          }
          setHandoffCode(null)
          setAuthError(t('login.linkInvalid'))
        })
        .finally(() => setHandoffPending(false))
    },
    [handleAuthenticated, t],
  )

  useEffect(() => {
    if (fragmentHandled.current) return
    fragmentHandled.current = true

    const fragment = readAndClearAuthFragment()
    if (fragment.handoffCode && fragment.setupCode) {
      setAuthError(t('login.linkInvalid'))
      return
    }
    if (fragment.setupCode) {
      setSetupCode(fragment.setupCode)
      return
    }
    if (!fragment.handoffCode) return

    setHandoffCode(fragment.handoffCode)
    exchangeHandoff(fragment.handoffCode)
  }, [exchangeHandoff, t])

  const setupMutation = useMutation({
    mutationFn: UserFlowApi.completeAccountSetup,
    onSuccess: handleAuthenticated,
    onError: (error) => {
      const message = getApiMessage(error)
      setAuthError(message?.toLowerCase().includes('password') ? message : t('login.setupInvalid'))
    },
  })

  const submitSetup = () => {
    setAuthError(null)
    if (newPassword.length < 6) {
      setAuthError(t('login.passwordMin6'))
      return
    }
    if (newPassword !== confirmPassword) {
      setAuthError(t('login.passwordMismatch'))
      return
    }
    if (!setupCode) return

    setupMutation.mutate({ setupCode, newPassword, confirmPassword })
  }

  if (handoffPending) {
    return (
      <div className="login-shell login-transition">
        <div className="login-transition-content">
          <Spin size="large" />
          <strong>{t('login.secureLogin')}</strong>
        </div>
      </div>
    )
  }

  if (handoffCode && handoffRetryable) {
    return (
      <div className="login-shell login-transition">
        <div className="login-transition-content">
          <Alert
            icon={<WarningIcon size={18} weight="duotone" />}
            type="warning"
            message={authError}
            showIcon
          />
          <Button type="primary" onClick={() => exchangeHandoff(handoffCode)}>
            {t('login.retryLink')}
          </Button>
        </div>
      </div>
    )
  }

  if (setupCode) {
    return (
      <div className="login-shell">
        <div className="login-art">
          <div className="stack">
            <img
              className="login-brand-logo"
              src={`${import.meta.env.BASE_URL}mavion-logo.svg`}
              alt="MAVION"
            />
          </div>
          <div className="stack">
            <div className="login-art-kicker">{t('login.systemName')}</div>
            <h2>{t('login.setupArtTitle')}</h2>
            <p>{t('login.setupArtLead')}</p>
          </div>
          <div className="login-art-footer">© MAVION</div>
        </div>

        <div className="login-form">
          <h1>{t('login.setupTitle')}</h1>
          <p className="lead">{t('login.setupLead')}</p>

          {authError && (
            <Alert
              icon={<WarningIcon size={18} weight="duotone" />}
              type="error"
              message={authError}
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form layout="vertical" onFinish={submitSetup}>
            <Form.Item label={t('login.newPassword')} required>
              <Input.Password
                size="large"
                prefix={<LockIcon size={18} style={{ color: 'var(--ink-4)' }} />}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                maxLength={100}
                disabled={setupMutation.isPending}
              />
            </Form.Item>
            <Form.Item label={t('login.confirmPassword')} required>
              <Input.Password
                size="large"
                prefix={<LockIcon size={18} style={{ color: 'var(--ink-4)' }} />}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                maxLength={100}
                disabled={setupMutation.isPending}
              />
            </Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              block
              loading={setupMutation.isPending}
              style={{ height: 44, fontWeight: 600 }}
            >
              {t('login.activateAccount')}
            </Button>
          </Form>
        </div>
      </div>
    )
  }

  return (
    <LoginPanel
      t={t}
      language={language}
      sessionExpired={sessionExpired}
      externalError={authError}
      onLanguageChange={setLanguage}
      onAuthenticated={handleAuthenticated}
    />
  )
}
