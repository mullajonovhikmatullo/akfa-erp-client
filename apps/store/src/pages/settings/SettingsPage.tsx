import { message } from 'antd'
import { SettingsPanel } from '@store/store-view/settings'
import type { SettingsLang, SettingsTheme } from '@store/store-view/settings'
import { useUIStore } from '@/app/stores/ui.store'
import { useT } from '@/shared/lib/i18n'

export function SettingsPage() {
  //
  const t = useT()
  const lang = useUIStore((state) => state.lang)
  const setLang = useUIStore((state) => state.setLang)
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const displayCurrency = useUIStore((state) => state.displayCurrency)
  const setDisplayCurrency = useUIStore((state) => state.setDisplayCurrency)
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const setExchangeRate = useUIStore((state) => state.setExchangeRate)
  const lowStockThreshold = useUIStore((state) => state.lowStockThreshold)
  const setLowStockThreshold = useUIStore((state) => state.setLowStockThreshold)

  return (
    <SettingsPanel
      t={t}
      displayCurrency={displayCurrency}
      exchangeRate={exchangeRate}
      lowStockThreshold={lowStockThreshold}
      lang={lang}
      theme={theme}
      onDisplayCurrencyChange={setDisplayCurrency}
      onExchangeRateChange={setExchangeRate}
      onLowStockThresholdChange={setLowStockThreshold}
      onLangChange={(value: SettingsLang) => setLang(value)}
      onThemeChange={(value: SettingsTheme) => setTheme(value)}
      onResetData={() => {
        //
        setDisplayCurrency('UZS')
        setExchangeRate(12_650)
        setLowStockThreshold(50)
        setLang('uz-cy')
        setTheme('light')
        message.info(t('settings.resetSuccess'))
      }}
    />
  )
}
