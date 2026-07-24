import { Controller } from 'react-hook-form'
import { Alert, Button, Form, Input } from 'antd'
import { ClockIcon, LockIcon, UserCircleIcon, WarningIcon } from '@phosphor-icons/react'
import type { LoginResponse } from '@store/store-stub'
import { useLoginForm } from './useLoginForm'

type TFunc = (key: string) => string

export interface LoginPanelProps {
  t: TFunc
  sessionExpired: boolean
  onAuthenticated: (response: LoginResponse) => void
}

export function LoginPanel({ t, sessionExpired, onAuthenticated }: LoginPanelProps) {
  //
  return (
    <div className="login-shell">
      <div className="login-art">
        <div className="stack">
          <span className="brandmark" style={{ color: '#fff' }}>
            <span className="logo" />
            <span style={{ fontSize: 16, letterSpacing: '-0.01em' }}>
              Store <span style={{ color: '#94a3b8', fontWeight: 500 }}>Manager</span>
            </span>
          </span>
        </div>
        <div className="stack">
          <div style={{ fontSize: 12, letterSpacing: '.18em', color: '#94a3b8', textTransform: 'uppercase' }}>
            {t('login.systemName')}
          </div>
          <h2>{t('login.tagline')}</h2>
          <p>{t('login.description')}</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: '#64748b', fontSize: 12 }}>© Store Manager</div>
      </div>

      <div className="login-form">
        <h1>{t('login.formTitle')}</h1>
        <p className="lead">{t('login.formLead')}</p>
        <LoginForm t={t} sessionExpired={sessionExpired} onAuthenticated={onAuthenticated} />
      </div>
    </div>
  )
}

function LoginForm({ t, sessionExpired, onAuthenticated }: LoginPanelProps) {
  //
  const { form, onSubmit, isLoading, clearCredentialErrors } = useLoginForm({ t, onAuthenticated })
  const {
    control,
    formState: { errors },
  } = form

  const hasRootError = Boolean(errors.root)
  const isCredentialError = errors.root?.type === 'credentials'

  return (
    <form onSubmit={onSubmit} noValidate style={{ width: '100%' }}>
      {sessionExpired && !hasRootError && (
        <Alert
          icon={<ClockIcon size={18} weight="duotone" />}
          type="warning"
          message={t('login.sessionExpired')}
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {hasRootError && (
        <Alert
          icon={<WarningIcon size={18} weight="duotone" />}
          type="error"
          message={errors.root!.message}
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Form layout="vertical" component="div">
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('login.usernameLabel')}
              required
              validateStatus={errors.username || isCredentialError ? 'error' : undefined}
              help={errors.username?.message || undefined}
              style={{ marginBottom: 16 }}
            >
              <Input
                {...field}
                size="large"
                prefix={<UserCircleIcon size={18} color="currentColor" style={{ color: 'var(--ink-4)' }} />}
                placeholder={t('login.usernamePlaceholder')}
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                onChange={(event) => {
                  //
                  field.onChange(event)
                  clearCredentialErrors()
                }}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('login.passwordLabel')}
              required
              validateStatus={errors.password || isCredentialError ? 'error' : undefined}
              help={errors.password?.message || undefined}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                {...field}
                size="large"
                prefix={<LockIcon size={18} color="currentColor" style={{ color: 'var(--ink-4)' }} />}
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
                disabled={isLoading}
                onChange={(event) => {
                  //
                  field.onChange(event)
                  clearCredentialErrors()
                }}
              />
            </Form.Item>
          )}
        />
      </Form>

      <Button
        type="primary"
        size="large"
        htmlType="submit"
        block
        loading={isLoading}
        style={{ marginTop: 8, height: 44, fontWeight: 600, fontSize: 15 }}
      >
        {isLoading ? t('login.signingIn') : t('login.signIn')}
      </Button>
    </form>
  )
}
