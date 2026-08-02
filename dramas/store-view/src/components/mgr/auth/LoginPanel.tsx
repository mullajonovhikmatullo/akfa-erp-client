import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Alert, Dropdown } from 'antd'
import {
  ArrowRightIcon,
  CaretDownIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeIcon,
  LockIcon,
  UserCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import type { LoginResponse } from '@store/store-stub'
import { LoginShowcase } from './LoginShowcase'
import { MavionBrand } from './MavionBrand'
import { useLoginForm } from './useLoginForm'

type TFunc = (key: string) => string

export type LoginLanguage = 'uz-cy' | 'uz-la' | 'ru' | 'en'

export interface LoginPanelProps {
  t: TFunc
  language: LoginLanguage
  sessionExpired: boolean
  externalError?: string | null
  onLanguageChange: (language: LoginLanguage) => void
  onAuthenticated: (response: LoginResponse) => void
}

const rememberedUsernameKey = 'mavion-remembered-username'
const languageOptions: Array<{ value: LoginLanguage; label: string }> = [
  { value: 'uz-la', label: "O'z" },
  { value: 'uz-cy', label: 'Ўз' },
  { value: 'ru', label: 'Рус' },
  { value: 'en', label: 'Eng' },
]

function readRememberedUsername() {
  return globalThis.localStorage?.getItem(rememberedUsernameKey) ?? ''
}

export function LoginPanel(props: LoginPanelProps) {
  const currentLanguage = languageOptions.find((option) => option.value === props.language) ?? languageOptions[0]!
  const languageMenuItems = languageOptions.map((option) => ({
    key: option.value,
    label: (
      <span className="mavion-login__language-option">
        {option.label}
        {option.value === props.language && <CheckIcon size={14} weight="bold" aria-hidden="true" />}
      </span>
    ),
  }))

  return (
    <main className="mavion-login">
      <section className="mavion-login__form-panel">
        <div className="mavion-login__form-content">
          <div className="mavion-login__form-topbar">
            <MavionBrand compact />
            <Dropdown
              menu={{
                items: languageMenuItems,
                selectable: true,
                selectedKeys: [props.language],
                onClick: ({ key }) => props.onLanguageChange(key as LoginLanguage),
              }}
              trigger={['click']}
              placement="bottomRight"
              autoAdjustOverflow={false}
              overlayClassName="mavion-login__language-menu"
            >
              <button
                className="mavion-login__language-selector"
                type="button"
                aria-label={`${props.t('login.languageLabel')}: ${currentLanguage.label}`}
              >
                <GlobeIcon size={17} weight="duotone" aria-hidden="true" />
                <span>{currentLanguage.label}</span>
                <CaretDownIcon className="mavion-login__language-caret" size={13} aria-hidden="true" />
              </button>
            </Dropdown>
          </div>
          <div className="mavion-login__auth-card">
            <div className="mavion-login__heading">
              <h1>{props.t('login.formTitle')}</h1>
              <p>{props.t('login.formDescription')}</p>
            </div>
            <LoginForm {...props} />
          </div>
        </div>

        <p className="mavion-login__form-footer">{props.t('login.copyright')}</p>
      </section>
      <LoginShowcase t={props.t} />
    </main>
  )
}

function LoginForm({ t, sessionExpired, externalError, onAuthenticated }: LoginPanelProps) {
  const rememberedUsername = readRememberedUsername()
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername))
  const [passwordVisible, setPasswordVisible] = useState(false)
  const { form, onSubmit, isLoading, clearCredentialErrors } = useLoginForm({
    t,
    onAuthenticated,
    initialUsername: rememberedUsername,
    onBeforeSubmit: ({ username }) => {
      if (rememberMe) globalThis.localStorage?.setItem(rememberedUsernameKey, username)
      else globalThis.localStorage?.removeItem(rememberedUsernameKey)
    },
  })
  const {
    control,
    formState: { errors },
  } = form

  const hasRootError = Boolean(errors.root)
  const isCredentialError = errors.root?.type === 'credentials'

  return (
    <form className="mavion-login__form" onSubmit={onSubmit} noValidate>
      {sessionExpired && !hasRootError && (
        <Alert icon={<ClockIcon size={18} weight="duotone" />} type="warning" title={t('login.sessionExpired')} showIcon />
      )}
      {externalError && !hasRootError && (
        <Alert icon={<WarningIcon size={18} weight="duotone" />} type="error" title={externalError} showIcon />
      )}
      {hasRootError && (
        <Alert icon={<WarningIcon size={18} weight="duotone" />} type="error" title={errors.root!.message} showIcon />
      )}

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <div className={`mavion-field${errors.username || isCredentialError ? ' mavion-field--error' : ''}`}>
            <label className="mavion-field__label" htmlFor="mavion-login-username">{t('login.usernameLabel')}</label>
            <span className="mavion-field__control">
              <UserCircleIcon size={21} aria-hidden="true" />
              <input
                {...field}
                id="mavion-login-username"
                type="text"
                placeholder={t('login.usernamePlaceholder')}
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                aria-invalid={Boolean(errors.username || isCredentialError)}
                aria-describedby={errors.username?.message ? 'login-username-error' : undefined}
                onChange={(event) => {
                  field.onChange(event)
                  clearCredentialErrors()
                }}
              />
            </span>
            {errors.username?.message && (
              <small className="mavion-field__error" id="login-username-error">{errors.username.message}</small>
            )}
          </div>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <div className={`mavion-field${errors.password || isCredentialError ? ' mavion-field--error' : ''}`}>
            <label className="mavion-field__label" htmlFor="mavion-login-password">{t('login.passwordLabel')}</label>
            <span className="mavion-field__control">
              <LockIcon size={21} aria-hidden="true" />
              <input
                {...field}
                id="mavion-login-password"
                type={passwordVisible ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={Boolean(errors.password || isCredentialError)}
                aria-describedby={errors.password?.message ? 'login-password-error' : undefined}
                onChange={(event) => {
                  field.onChange(event)
                  clearCredentialErrors()
                }}
              />
              <button
                className="mavion-field__visibility"
                type="button"
                aria-label={passwordVisible ? t('login.hidePassword') : t('login.showPassword')}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                {passwordVisible ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </span>
            {errors.password?.message && (
              <small className="mavion-field__error" id="login-password-error">{errors.password.message}</small>
            )}
          </div>
        )}
      />

      <div className="mavion-login__form-options">
        <label className="mavion-checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span aria-hidden="true" />
          {t('login.rememberMe')}
        </label>
        <a href="mailto:hello@storemanager.uz?subject=Parolni%20tiklash">{t('login.forgotPassword')}</a>
      </div>

      <button className="mavion-login__submit" type="submit" disabled={isLoading}>
        <span>{isLoading ? t('login.signingIn') : t('login.signIn')}</span>
        <ArrowRightIcon size={20} aria-hidden="true" />
      </button>

      <div className="mavion-login__divider">
        <span>{t('login.or')}</span>
      </div>

      <div className="mavion-login__socials" aria-label={t('login.otherSignInMethods')}>
        <button type="button" className="mavion-login__social-button" aria-disabled="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.32 2.98-7.39Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.53l3.35-2.61Z" />
            <path fill="#EA4335" d="M12 5.95c1.47 0 2.78.5 3.82 1.5l2.88-2.88A9.66 9.66 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z" />
          </svg>
          {t('login.googleSignIn')}
        </button>
        <button type="button" className="mavion-login__social-button" aria-disabled="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#229ED9" d="M21.84 4.59a1.54 1.54 0 0 0-1.72-.24L3.2 10.88c-1.16.45-1.14 1.1-.21 1.38l4.34 1.36 1.67 5.1c.2.56.1.78.68.78.45 0 .65-.2.9-.45l2.08-2.02 4.33 3.2c.8.44 1.37.21 1.57-.74l2.85-13.43c.29-1.17-.45-1.7-1.57-1.47ZM8.01 13.31l9.78-6.17c.49-.3.94-.14.57.19l-8.08 7.29-.31 3.36-1.96-4.67Z" />
          </svg>
          {t('login.telegramSignIn')}
        </button>
      </div>

    </form>
  )
}
