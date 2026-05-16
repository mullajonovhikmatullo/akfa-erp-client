import { LoginForm } from '@/features/auth-login';
import { useT } from '@/shared/lib/i18n';

export function LoginPage() {
  const t = useT();

  return (
    <div className="login-shell">
      <div className="login-art">
        <div className="stack">
          <span className="brandmark" style={{ color: '#fff' }}>
            <span className="logo" />
            <span style={{ fontSize: 16, letterSpacing: '-0.01em' }}>
              AKFA <span style={{ color: '#94a3b8', fontWeight: 500 }}>ERP</span>
            </span>
          </span>
        </div>
        <div className="stack">
          <div style={{ fontSize: 12, letterSpacing: '.18em', color: '#94a3b8', textTransform: 'uppercase' }}>
            {t('login.systemName')}
          </div>
          <h2>{t('login.tagline')}</h2>
          <p>{t('login.description')}</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: '#64748b', fontSize: 12 }}>
          © AKFA ERP
        </div>
      </div>

      <div className="login-form">
        <h1>{t('login.formTitle')}</h1>
        <p className="lead">{t('login.formLead')}</p>
        <LoginForm />
      </div>
    </div>
  );
}
