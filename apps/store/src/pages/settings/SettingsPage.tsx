import { SettingsPanel } from '@store/store-view/settings'
import type { SettingsLang, SettingsTheme } from '@store/store-view/settings'
import { useUIStore } from '@/app/stores/ui.store'

export function SettingsPage() {
  //
  const lang = useUIStore((state) => state.lang)
  const setLang = useUIStore((state) => state.setLang)
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const displayCurrency = useUIStore((state) => state.displayCurrency)
  const setDisplayCurrency = useUIStore((state) => state.setDisplayCurrency)

  return (
    <SettingsPanel
      displayCurrency={displayCurrency}
      lang={lang}
      theme={theme}
      onDisplayCurrencyChange={setDisplayCurrency}
      onLangChange={(value: SettingsLang) => setLang(value)}
      onThemeChange={(value: SettingsTheme) => setTheme(value)}
    />
  )
}
