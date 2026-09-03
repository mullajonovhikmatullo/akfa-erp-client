
import { MavionBrand } from './MavionBrand';
import type { TFunc } from './types';

export function LoginShowcase({ t }: { t: TFunc }) {
  //
  return (
    <aside className="mavion-login__showcase" aria-label={t('login.showcaseAria')}>
      <div className="mavion-login__showcase-grid" aria-hidden="true" />
      <div className="mavion-login__orbit mavion-login__orbit--large" aria-hidden="true" />
      <div className="mavion-login__orbit mavion-login__orbit--small" aria-hidden="true" />
      <div className="mavion-login__glass-card mavion-login__glass-card--top" aria-hidden="true"><i /><i /><i /></div>
      <div className="mavion-login__glass-card mavion-login__glass-card--bottom" aria-hidden="true"><i /><i /><i /></div>
      <div className="mavion-login__floating-icon mavion-login__floating-icon--chart" aria-hidden="true"><i className="icons-chart-bar icon-size-29" /></div>
      <div className="mavion-login__floating-icon mavion-login__floating-icon--user" aria-hidden="true"><i className="icons-user-circle icon-size-28" /></div>

      <div className="mavion-login__hero-card">
        <MavionBrand inverted />
        <h2>Mavion ERP</h2>
        <strong>{t('login.showcaseEyebrow')}</strong>
        <p>{t('login.showcaseDescription')}</p>
      </div>
    </aside>
  );
}
