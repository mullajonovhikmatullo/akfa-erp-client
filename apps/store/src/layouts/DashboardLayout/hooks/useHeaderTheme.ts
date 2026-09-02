import { useUIStore, type Theme } from '@/app/stores/ui.store'

function isDarkTheme(theme: Theme) {
  //
  return theme === 'dark'
    || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export function useHeaderTheme() {
  //
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const isDarkActive = isDarkTheme(theme)

  function toggleTheme() {
    //
    setTheme(isDarkActive ? 'light' : 'dark')
  }

  return { isDarkActive, toggleTheme }
}
