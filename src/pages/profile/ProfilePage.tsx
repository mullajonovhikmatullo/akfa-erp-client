import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Divider, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  SafetyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { useAuthStore } from '@/entities/user';
import { useUpdateProfile, useChangePassword } from '@/entities/user';
import { useT } from '@/shared/lib/i18n';

export function ProfilePage() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [profileEditing, setProfileEditing] = useState(false);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileSchema = z.object({
    fullName: z.string().min(2, t('pwd.minLen')).max(100),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/),
  });

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6).max(100),
      confirmPassword: z.string().min(1),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t('profile.passwordMismatch'),
      path: ['confirmPassword'],
    });

  type ProfileFormValues = z.infer<typeof profileSchema>;
  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      username: user?.username ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!profileEditing) {
      profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' });
    }
  }, [user?.name, user?.username]);

  function startEditing() {
    profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' });
    setProfileEditing(true);
  }

  function cancelEditing() {
    profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' });
    setProfileEditing(false);
  }

  async function handleProfileSave(values: ProfileFormValues) {
    const changed: Record<string, string> = {};
    if (values.fullName !== user?.name) changed.fullName = values.fullName;
    if (values.username !== user?.username) changed.username = values.username;

    if (Object.keys(changed).length === 0) {
      setProfileEditing(false);
      return;
    }

    updateProfile.mutate(changed, {
      onSuccess: () => {
        toast.success(t('profile.updateSuccess'));
        setProfileEditing(false);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg ?? t('profile.updateError'));
      },
    });
  }

  async function handlePasswordSave(values: PasswordFormValues) {
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.success(t('profile.passwordSuccess'));
        passwordForm.reset();
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        if (msg?.includes("noto'g'ri") || msg?.toLowerCase().includes('incorrect')) {
          passwordForm.setError('currentPassword', { message: t('profile.passwordWrong') });
        } else {
          toast.error(msg ?? t('profile.passwordError'));
        }
      },
    });
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  const roleLabel =
    user?.role === 'super_admin' ? t('role.super_admin') : t('role.branch_admin');

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>{t('profile.title')}</h1>
          <div className="sub">{t('profile.subtitle')}</div>
        </div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e4dd8, #1e4dd8cc)',
              color: '#fff',
              fontSize: 24,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
              @{user?.username} · {roleLabel}
            </div>
          </div>
        </div>

        <Divider style={{ margin: '0 0 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: 'var(--ink-3)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t('profile.basicInfo')}</span>
          </div>
          {!profileEditing && (
            <Button size="small" icon={<EditOutlined />} onClick={startEditing}>
              {t('profile.edit')}
            </Button>
          )}
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label={t('profile.fullName')} error={profileForm.formState.errors.fullName?.message}>
              <Controller
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={!profileEditing}
                    placeholder={t('profile.fullNamePlaceholder')}
                    size="middle"
                    autoComplete="off"
                    status={profileForm.formState.errors.fullName ? 'error' : undefined}
                  />
                )}
              />
            </Field>

            <Field label={t('profile.username')} error={profileForm.formState.errors.username?.message}>
              <Controller
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={!profileEditing}
                    placeholder={t('profile.usernamePlaceholder')}
                    prefix={<span style={{ color: 'var(--ink-4)' }}>@</span>}
                    size="middle"
                    autoComplete="off"
                    status={profileForm.formState.errors.username ? 'error' : undefined}
                  />
                )}
              />
            </Field>
          </div>

          {profileEditing && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckOutlined />}
                loading={updateProfile.isPending}
              >
                {t('profile.save')}
              </Button>
              <Button icon={<CloseOutlined />} onClick={cancelEditing} disabled={updateProfile.isPending}>
                {t('profile.cancel')}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Change password card */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <LockOutlined style={{ color: 'var(--ink-3)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t('profile.changePassword')}</span>
        </div>

        <Alert
          type="info"
          icon={<SafetyOutlined />}
          showIcon
          message={t('profile.passwordHint')}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />

        <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} autoComplete="off">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field
              label={t('profile.currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
              required
            >
              <Controller
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    placeholder={t('profile.currentPasswordPlaceholder')}
                    status={passwordForm.formState.errors.currentPassword ? 'error' : undefined}
                  />
                )}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field
                label={t('profile.newPassword')}
                error={passwordForm.formState.errors.newPassword?.message}
                required
              >
                <Controller
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <MaskedInput
                      {...field}
                      placeholder={t('profile.newPasswordPlaceholder')}
                      status={passwordForm.formState.errors.newPassword ? 'error' : undefined}
                    />
                  )}
                />
              </Field>

              <Field
                label={t('profile.confirmPassword')}
                error={passwordForm.formState.errors.confirmPassword?.message}
                required
              >
                <Controller
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <MaskedInput
                      {...field}
                      placeholder={t('profile.confirmPasswordPlaceholder')}
                      status={passwordForm.formState.errors.confirmPassword ? 'error' : undefined}
                    />
                  )}
                />
              </Field>
            </div>

            <PasswordStrength password={passwordForm.watch('newPassword') ?? ''} t={t} />

            <div>
              <Button
                type="primary"
                htmlType="submit"
                icon={<LockOutlined />}
                loading={changePassword.isPending}
                danger
              >
                {t('profile.changePasswordBtn')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--ink-2)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

interface MaskedInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  status?: 'error' | undefined;
}

function MaskedInput({ value, onChange, onBlur, placeholder, status }: MaskedInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete="off"
      prefix={<LockOutlined style={{ color: 'var(--ink-4)' }} />}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-3)', display: 'flex', alignItems: 'center' }}
          tabIndex={-1}
        >
          {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      }
      status={status}
      style={visible ? {} : ({ WebkitTextSecurity: 'disc', fontFamily: 'monospace' } as React.CSSProperties)}
    />
  );
}

function PasswordStrength({ password, t }: { password: string; t: (k: string) => string }) {
  if (!password) return null;

  const checks = [
    { label: t('pwd.minLen'), pass: password.length >= 6 },
    { label: t('pwd.hasNum'), pass: /\d/.test(password) },
    { label: t('pwd.hasLetter'), pass: /[a-zA-Z]/.test(password) },
    { label: t('pwd.maxLen'), pass: password.length <= 100 },
  ];

  const score = checks.filter((c) => c.pass).length;
  const color = score <= 1 ? '#ef4444' : score === 2 ? '#f97316' : score === 3 ? '#eab308' : '#22c55e';
  const label = score <= 1 ? t('pwd.veryWeak') : score === 2 ? t('pwd.weak') : score === 3 ? t('pwd.medium') : t('pwd.strong');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= score ? color : 'var(--surface-2, #e2e8f0)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 60, textAlign: 'right' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {checks.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: 11,
              color: c.pass ? '#16a34a' : 'var(--ink-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span>{c.pass ? '✓' : '○'}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
