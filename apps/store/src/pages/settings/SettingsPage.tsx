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
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const setExchangeRate = useUIStore((state) => state.setExchangeRate)

  return (
    <SettingsPanel
      displayCurrency={displayCurrency}
      exchangeRate={exchangeRate}
      lang={lang}
      theme={theme}
      onDisplayCurrencyChange={setDisplayCurrency}
      onExchangeRateChange={setExchangeRate}
      onLangChange={(value: SettingsLang) => setLang(value)}
      onThemeChange={(value: SettingsTheme) => setTheme(value)}
    />
  )
}
