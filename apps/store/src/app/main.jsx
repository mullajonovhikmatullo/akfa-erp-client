import ReactDOM from 'react-dom/client'
import { App } from './App.jsx'
import './styles.css'

function mountApp() {
  //
  if (window.__store_mounted) {
    return
  }

  const rootElement = document.getElementById('root')

  if (!rootElement) {
    setTimeout(mountApp, 30)
    return
  }

  window.__store_mounted = true
  ReactDOM.createRoot(rootElement).render(<App />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp)
} else {
  mountApp()
}
