import { Controller } from 'react-hook-form';
import { Form, Input, Button, Alert } from 'antd';
import {
  ClockIcon,
  LockIcon,
  UserCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useLoginForm } from '../model/useLoginForm';
import { useT } from '@/shared/lib/i18n';

export function LoginForm() {
  const t = useT();
  const { form, onSubmit, isLoading, clearCredentialErrors, sessionExpired } = useLoginForm();
  const {
    control,
    formState: { errors },
  } = form;

  const hasRootError = !!errors.root;
  const isCredentialError = errors.root?.type === 'credentials';

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
                onChange={(e) => { field.onChange(e); clearCredentialErrors(); }}
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
                onChange={(e) => { field.onChange(e); clearCredentialErrors(); }}
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
  );
}
