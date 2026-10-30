import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppStoreProvider } from '@/store/AppStore.tsx'
import { App } from './App.tsx'
import './styles.css'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AppStoreProvider>
          <App />
        </AppStoreProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}
