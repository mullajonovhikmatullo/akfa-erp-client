import {
  ChartBarIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  StorefrontIcon,
  TrendUpIcon,
} from '@phosphor-icons/react'

type TFunc = (key: string) => string

const featureKeys = [
  {
    icon: ChartBarIcon,
    titleKey: 'login.featureAnalyticsTitle',
    descriptionKey: 'login.featureAnalyticsDescription',
  },
  {
    icon: ShareNetworkIcon,
    titleKey: 'login.featureManagementTitle',
    descriptionKey: 'login.featureManagementDescription',
  },
  {
    icon: ShieldCheckIcon,
    titleKey: 'login.featureSecurityTitle',
    descriptionKey: 'login.featureSecurityDescription',
  },
]

export function LoginShowcase({ t }: { t: TFunc }) {
  return (
    <aside className="mavion-login__showcase" aria-label={t('login.showcaseAria')}>
      <div className="mavion-login__orb" aria-hidden="true" />
      <div className="mavion-login__showcase-grid" aria-hidden="true" />

      <div className="mavion-login__showcase-content">
        <div className="mavion-login__showcase-top">
          <p className="mavion-login__eyebrow">{t('login.showcaseEyebrow')}</p>
          <div className="mavion-login__live-status">
            <i aria-hidden="true" />
            {t('login.showcaseOnline')}
          </div>
        </div>

        <div className="mavion-login__visual">
          <div className="mavion-login__visual-glow" aria-hidden="true" />
          <img
            className="mavion-login__illustration"
            src={`${import.meta.env.BASE_URL}mavion-login-illustration-v2.png`}
            alt={t('login.showcaseImageAlt')}
          />

          <div className="mavion-login__metric mavion-login__metric--sales">
            <span className="mavion-login__metric-icon">
              <TrendUpIcon size={19} weight="bold" aria-hidden="true" />
            </span>
            <span>
              <small>{t('login.showcaseSalesToday')}</small>
              <strong>124.5 mln</strong>
            </span>
            <em>+12.5%</em>
          </div>

          <div className="mavion-login__metric mavion-login__metric--branches">
            <span className="mavion-login__metric-icon">
              <StorefrontIcon size={19} weight="duotone" aria-hidden="true" />
            </span>
            <span>
              <small>{t('login.showcaseActiveBranches')}</small>
              <strong>{t('login.showcaseBranchesOnline')}</strong>
            </span>
          </div>
        </div>

        <div className="mavion-login__showcase-copy">
          <h2>
            {t('login.showcaseTitle')} <span>{t('login.showcaseTitleAccent')}</span>
          </h2>
          <p className="mavion-login__description">{t('login.showcaseDescription')}</p>

          <div className="mavion-login__features">
            {featureKeys.map(({ icon: Icon, titleKey, descriptionKey }) => (
              <div className="mavion-login__feature" key={titleKey}>
                <span className="mavion-login__feature-icon">
                  <Icon size={21} weight="duotone" />
                </span>
                <span>
                  <strong>{t(titleKey)}</strong>
                  <small>{t(descriptionKey)}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
