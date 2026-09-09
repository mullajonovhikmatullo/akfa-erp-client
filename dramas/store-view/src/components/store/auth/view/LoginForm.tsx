import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert } from 'antd';

import { useLoginForm } from '../useLoginForm';
import { GoogleSignIn } from '../GoogleSignIn';
import { readRememberedUsername, rememberedUsernameKey } from './login-utils';
import type { LoginFormProps } from './types';

export function LoginForm({ t, language, sessionExpired, externalError, onAuthenticated }: LoginFormProps) {
  //
  const rememberedUsername = readRememberedUsername();
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    form, onSubmit, isLoading, clearCredentialErrors,
    googleLinkEmail, cancelGoogleLink, handleGoogleCredential, isGooglePending,
  } = useLoginForm({
    t,
    onAuthenticated,
    initialUsername: rememberedUsername,
    onBeforeSubmit: ({ username }) => {
      //
      if (rememberMe) globalThis.localStorage?.setItem(rememberedUsernameKey, username);
      else globalThis.localStorage?.removeItem(rememberedUsernameKey);
    },
  });
  const {
    control,
    formState: { errors },
  } = form;

  const hasRootError = Boolean(errors.root);
  const isCredentialError = errors.root?.type === 'credentials';
  const isFormSubmitting = isLoading && (!isGooglePending || Boolean(googleLinkEmail));

  return (
    <form className="mavion-login__form" onSubmit={onSubmit} noValidate>
      {sessionExpired && !hasRootError && (
        <Alert icon={<i className="icons-clock icon-size-18" />} type="warning" title={t('login.sessionExpired')} showIcon />
      )}
      {externalError && !hasRootError && (
        <Alert icon={<i className="icons-warning icon-size-18" />} type="error" title={externalError} showIcon />
      )}
      {hasRootError && (
        <Alert icon={<i className="icons-warning icon-size-18" />} type="error" title={errors.root!.message} showIcon />
      )}

      {googleLinkEmail && (
        <div className="mavion-google-link" role="status">
          <strong>{googleLinkEmail}</strong>
          <p>{t('login.googleLinkDescription')}</p>
          <button type="button" onClick={cancelGoogleLink} disabled={isLoading}>{t('login.googleLinkCancel')}</button>
        </div>
      )}

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <div className={`mavion-field${errors.username || isCredentialError ? ' mavion-field--error' : ''}`}>
            <label className="mavion-field__label" htmlFor="mavion-login-username">{t('login.usernameLabel')}</label>
            <span className="mavion-field__control">
              <i className="icons-user-circle icon-size-21" aria-hidden="true" />
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
                  //
                  field.onChange(event);
                  clearCredentialErrors();
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
              <i className="icons-lock icon-size-21" aria-hidden="true" />
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
                  //
                  field.onChange(event);
                  clearCredentialErrors();
                }}
              />
              <button
                className="mavion-field__visibility"
                type="button"
                aria-label={passwordVisible ? t('login.hidePassword') : t('login.showPassword')}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                {passwordVisible ? <i className="icons-hide icon-size-20" /> : <i className="icons-eye icon-size-20" />}
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
        <span>{t(isFormSubmitting ? 'login.signingIn' : googleLinkEmail ? 'login.googleLinkSubmit' : 'login.signIn')}</span>
        {isFormSubmitting ? <i className="icons-reload mavion-login__submit-spinner" aria-hidden="true" /> : (
          <svg className="mavion-login__submit-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3.75 10h11.5m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="1.75"/>
          </svg>
        )}
      </button>

      {!googleLinkEmail && (
        <>
          <div className="mavion-login__divider"><span>{t('login.or')}</span></div>
          <GoogleSignIn t={t} language={language} disabled={isLoading} pending={isGooglePending} onCredential={handleGoogleCredential} />
        </>
      )}
    </form>
  );
}
