import { Dropdown } from 'antd';
import { CaretDownIcon, CheckIcon, GlobeIcon } from '@phosphor-icons/react';
import { LoginForm, LoginShowcase, MavionBrand, languageOptions } from './view';
import type { LoginLanguage, LoginPanelProps } from './view';

export type { LoginLanguage, LoginPanelProps } from './view';

export function LoginPanel(props: LoginPanelProps) {
  //
  const currentLanguage = languageOptions.find((option) => option.value === props.language) ?? languageOptions[0]!;
  const languageMenuItems = languageOptions.map((option) => ({
    key: option.value,
    label: (
      <span className="mavion-login__language-option">
        {option.label}
        {option.value === props.language && <CheckIcon size={14} weight="bold" aria-hidden="true" />}
      </span>
    ),
  }));

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
  );
}
