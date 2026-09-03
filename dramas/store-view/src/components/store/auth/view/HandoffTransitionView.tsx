import { Alert, Button, Spin } from 'antd'

import type { TFunc } from './types'

interface HandoffTransitionViewProps {
  pending: boolean
  error: string | null
  t: TFunc
  onRetry: () => void
}

export function HandoffTransitionView({ pending, error, t, onRetry }: HandoffTransitionViewProps) {
  //
  return (
    <div className="login-shell login-transition">
      <div className="login-transition-content">
        {pending ? (
          <>
            <Spin size="large" />
            <strong>{t('login.secureLogin')}</strong>
          </>
        ) : (
          <>
            <Alert
              icon={<i className="icons-warning icon-size-18" />}
              type="warning"
              message={error}
              showIcon
            />
            <Button type="primary" onClick={onRetry}>{t('login.retryLink')}</Button>
          </>
        )}
      </div>
    </div>
  )
}
