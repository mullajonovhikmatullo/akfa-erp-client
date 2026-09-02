import { Toaster } from 'sonner'
import { useUIStore } from '../stores/ui.store.ts'

export function AppToaster() {
  //
  const theme = useUIStore((state) => state.theme)

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      visibleToasts={4}
      gap={10}
      offset={18}
      mobileOffset={12}
      duration={3200}
      toastOptions={{ className: 'mavion-toast' }}
    />
  )
}
