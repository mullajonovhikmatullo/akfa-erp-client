import { Alert, Button, Form, Input } from 'antd'
import { LockIcon, WarningIcon } from '@phosphor-icons/react'
import type { TFunc } from './types'

interface AccountSetupViewProps {
  newPassword: string
  confirmPassword: string
  error: string | null
  pending: boolean
  t: TFunc
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: () => void
}

export function AccountSetupView({
  newPassword,
  confirmPassword,
  error,
  pending,
  t,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: AccountSetupViewProps) {
  //
  return (
    <div className="login-shell">
      <div className="login-art">
        <div className="stack">
          <img className="login-brand-logo" src={`${import.meta.env.BASE_URL}mavion-logo.svg`} alt="MAVION" />
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
        {error ? (
          <Alert
            icon={<WarningIcon size={18} weight="duotone" />}
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        ) : null}
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item label={t('login.newPassword')} required>
            <Input.Password
              size="large"
              prefix={<LockIcon size={18} style={{ color: 'var(--ink-4)' }} />}
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
              autoComplete="new-password"
              maxLength={100}
              disabled={pending}
            />
          </Form.Item>
          <Form.Item label={t('login.confirmPassword')} required>
            <Input.Password
              size="large"
              prefix={<LockIcon size={18} style={{ color: 'var(--ink-4)' }} />}
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              autoComplete="new-password"
              maxLength={100}
              disabled={pending}
            />
          </Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            block
            loading={pending}
            style={{ height: 44, fontWeight: 600 }}
          >
            {t('login.activateAccount')}
          </Button>
        </Form>
      </div>
    </div>
  )
}
