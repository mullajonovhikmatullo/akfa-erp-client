import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreIconName } from '@store/store-shared/ui/store-icon'
import { Dropdown } from 'antd';

import { LoginForm, MavionBrand, languageOptions } from './view';
import type { LoginLanguage, LoginPanelProps } from './view';

export type { LoginLanguage, LoginPanelProps } from './view';

export function LoginPanel(props: LoginPanelProps) {
  //
  const introFeatures: Array<{ icon: StoreIconName; title: string; description: string }> = [
    { icon: 'chart-bar', title: props.t('login.featureAnalyticsTitle'), description: props.t('login.featureAnalyticsDescription') },
    { icon: 'building', title: props.t('login.featureManagementTitle'), description: props.t('login.featureManagementDescription') },
    { icon: 'lock', title: props.t('login.featureSecurityTitle'), description: props.t('login.featureSecurityDescription') },
  ];
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
    <main className="mavion-auth">
      <div className="mavion-auth__backdrop" aria-hidden="true" />
      <header className="mavion-auth__top">
        <MavionBrand asset compact />
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
            className="mavion-auth__language"
            type="button"
            aria-label={`${currentLanguage.short} — ${props.t('login.languageLabel')}`}
          >
            <StoreIcon name="globe" size={16} />
            <span>{currentLanguage.short}</span>
            <StoreIcon name="arrow-down" size={14} />
          </button>
        </Dropdown>
      </header>

      <div className="mavion-auth__grid">
        <section className="mavion-auth__intro" aria-label={props.t('login.showcaseAria')}>
          <span className="mavion-auth__eyebrow">{props.t('login.showcaseEyebrow')}</span>
          <h2>
            {props.t('login.showcaseTitle')}{' '}
            <span className="mavion-auth__accent">{props.t('login.showcaseTitleAccent')}</span>
          </h2>
          <p>{props.t('login.showcaseDescription')}</p>
          <ul className="mavion-auth__features">
            {introFeatures.map((feature) => (
              <li key={feature.icon}>
                <span className="mavion-auth__feature-icon"><StoreIcon name={feature.icon} size={20} /></span>
                <span><b>{feature.title}</b>{feature.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mavion-auth__card">
          <div className="mavion-auth__heading">
            <h1>{props.t('login.formTitle')}</h1>
            <p>{props.t('login.formDescription')}</p>
          </div>
          <LoginForm {...props} />
        </section>
      </div>

      <p className="mavion-auth__footer">{props.t('login.copyright')}</p>
    </main>
  );
}
