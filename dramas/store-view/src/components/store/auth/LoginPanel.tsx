import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Dropdown } from 'antd';

import { useGlassScale } from './hooks/useGlassScale';
import { LoginForm, MavionBrand, languageOptions } from './view';
import type { LoginLanguage, LoginPanelProps } from './view';

export type { LoginLanguage, LoginPanelProps } from './view';

export function LoginPanel(props: LoginPanelProps) {
  //
  const rootRef = useGlassScale<HTMLElement>();
  const currentLanguage = languageOptions.find((option) => option.value === props.language) ?? languageOptions[0]!;
  const languageMenuItems = languageOptions.map((option) => ({
    key: option.value,
    label: (
      <span className="mavion-login__language-option">
        {option.label}
        {option.value === props.language && <StoreIcon name="check" size={16} />}
      </span>
    ),
  }));

  return (
    <main className="mavion-glass" ref={rootRef}>
      <section className="mavion-glass__panel">
        <div className="mavion-glass__topbar">
          <span className="mavion-glass__brand"><MavionBrand asset compact /></span>
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
              className="mavion-glass__language"
              type="button"
              aria-label={`${props.t('login.languageLabel')}: ${currentLanguage.label}`}
            >
              <StoreIcon name="globe" size={16} />
              <span>{currentLanguage.short}</span>
              <StoreIcon name="arrow-down" size={14} />
            </button>
          </Dropdown>
        </div>
        <div className="mavion-glass__card">
          <div className="mavion-glass__heading">
            <h1>{props.t('login.formTitle')}</h1>
            <p>{props.t('login.formDescription')}</p>
          </div>
          <LoginForm {...props} />
        </div>
      </section>
      <p className="mavion-glass__footer">{props.t('login.copyright')}</p>
    </main>
  );
}
