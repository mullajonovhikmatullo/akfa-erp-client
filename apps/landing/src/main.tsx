import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

function LandingShell() {
  //
  return (
    <main className="shell">
      <section className="panel" aria-labelledby="landing-title">
        <img src="/favicon.svg" alt="" className="mark" />
        <div>
          <p className="eyebrow">AKFA ERP</p>
          <h1 id="landing-title">Landing shell</h1>
          <p className="copy">
            Public storefront and onboarding routes can be mounted here without touching the admin app.
          </p>
        </div>
      </section>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingShell />
  </React.StrictMode>,
)
