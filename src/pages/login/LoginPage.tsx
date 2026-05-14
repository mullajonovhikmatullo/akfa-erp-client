import { LoginForm } from '@/features/auth-login';

export function LoginPage() {
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
            Корпоратив бошқарув тизими
          </div>
          <h2>Барча филиалларни бир панелдан назорат қилинг.</h2>
          <p>
            Партия даражасида омборни кузатинг, сотувларни реал вақтда кўринг,
            икки валютада қарзларни ҳисобланг ва филиаллар ўртасида
            захираларни осонгина тенгланг.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: '#64748b', fontSize: 12 }}>
          © AKFA ERP
        </div>
      </div>

      <div className="login-form">
        <h1>Тизимга кириш</h1>
        <p className="lead">Филиал бошқарув панелига кириш.</p>
        <LoginForm />
      </div>
    </div>
  );
}
