import { Controller } from 'react-hook-form';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined, WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useLoginForm } from '../model/useLoginForm';

export function LoginForm() {
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
          icon={<ClockCircleOutlined />}
          type="warning"
          message="Sessiya muddati tugadi. Qayta kiring."
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {hasRootError && (
        <Alert
          icon={<WarningOutlined />}
          type="error"
          message={errors.root!.message}
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      {/* Shared Form context keeps label column width identical for both fields */}
      <Form layout="vertical" component="div">

        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Username"
              required
              validateStatus={errors.username || isCredentialError ? 'error' : undefined}
              help={errors.username?.message || undefined}
              style={{ marginBottom: 16 }}
            >
              <Input
                {...field}
                size="large"
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Foydalanuvchi nomi"
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
              label="Parol"
              required
              validateStatus={errors.password || isCredentialError ? 'error' : undefined}
              help={errors.password?.message || undefined}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                {...field}
                size="large"
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Parolni kiriting"
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
        {isLoading ? 'Kirish...' : 'Kirish'}
      </Button>
    </form>
  );
}
