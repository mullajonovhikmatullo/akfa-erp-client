import { AppRouter } from '../routes/index.tsx'
import { AppProviders } from './providers/index.tsx'
import { AppToaster } from './view/AppToaster.jsx'

export function App() {
  //
  return (
    <AppProviders>
      <AppRouter />
      <AppToaster />
    </AppProviders>
  )
}
