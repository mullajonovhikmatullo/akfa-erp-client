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
            Internal control panel
          </div>
          <h2>Run every branch from one cockpit.</h2>
          <p>
            Track stock down to the batch, watch sales hit the ledger in real time,
            settle debts in two currencies, and rebalance inventory between branches
            without leaving your dashboard.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: '#64748b', fontSize: 12 }}>
          © AKFA ERP
        </div>
      </div>

      <div className="login-form">
        <h1>Sign in</h1>
        <p className="lead">Access your branch management panel.</p>
        <LoginForm />
      </div>
    </div>
  );
}
