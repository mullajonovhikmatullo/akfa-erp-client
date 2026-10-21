import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Radio } from 'antd'

import { useStoreT, type StoreLocale } from '@store/store-i18n'
import type { Currency } from '@store/store-stub'
import { ExchangeRateModal, useExchangeRateSummary } from '../exchange-rate'
import { SectionTitle } from './view/SectionTitle'
import { ThemeChoice } from './view/ThemeChoice'

export type SettingsLang = StoreLocale
export type SettingsTheme = 'light' | 'dark' | 'system'

interface SettingsFormValues {
  displayCurrency: Currency
  lang: SettingsLang
  theme: SettingsTheme
}

export interface SettingsPanelProps extends SettingsFormValues {
  onDisplayCurrencyChange: (currency: Currency) => void
  onLangChange: (lang: SettingsLang) => void
  onThemeChange: (theme: SettingsTheme) => void
}

export function SettingsPanel({
  displayCurrency,
  lang,
  theme,
  onDisplayCurrencyChange,
  onLangChange,
  onThemeChange,
}: SettingsPanelProps) {
  //
  const t = useStoreT()
  const { data: exchangeRate } = useExchangeRateSummary()
  const [exchangeRateOpen, setExchangeRateOpen] = useState(false)
  const { control, reset } = useForm<SettingsFormValues>({
    defaultValues: {
      displayCurrency,
      lang,
      theme,
    },
  })

  useEffect(() => {
    //
    reset({
      displayCurrency,
      lang,
      theme,
    })
  }, [displayCurrency, lang, reset, theme])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('settings.title')}</h1>
          <div className="sub">{t('settings.subtitle')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <SectionTitle>{t('settings.currency')}</SectionTitle>
          <div className="col u-gap-12" >
            <div>
              <div className="u-text-muted u-fs-12 u-mb-6">{t('settings.displayCurrency')}</div>
              <Controller
                name="displayCurrency"
                control={control}
                render={({ field }) => (
                  <Radio.Group
                    value={field.value}
                    onChange={(event) => {
                      //
                      const value = event.target.value as Currency
                      field.onChange(value)
                      onDisplayCurrencyChange(value)
                    }}
                  >
                    <Radio.Button value="UZS">UZS</Radio.Button>
                    <Radio.Button value="USD">USD</Radio.Button>
                  </Radio.Group>
                )}
              />
              <div className="u-text-muted u-fs-12 u-mt-6">{t('settings.currencyNote')}</div>
            </div>
            <div>
              <div className="u-text-muted u-fs-12 u-mb-6">{t('settings.exchangeRate')}</div>
              <div className="u-flex u-items-center u-gap-10">
                <strong className="num">
                  {exchangeRate?.usdToUzsRate
                    ? `${exchangeRate.usdToUzsRate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${t('currency.UZS')}`
                    : t('exchangeRate.unavailable')}
                </strong>
                {exchangeRate ? (
                  <span className="tagpill info">{t(exchangeRate.mode === 'CBU' ? 'exchangeRate.modeCbu' : 'exchangeRate.modeManual')}</span>
                ) : null}
                <Button size="small" onClick={() => setExchangeRateOpen(true)}>{t('exchangeRate.change')}</Button>
              </div>
              <div className="u-text-muted u-fs-12 u-mt-6">{t('settings.exchangeRateNote')}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.localization')}</SectionTitle>
          <div>
            <div className="u-text-muted u-fs-12 u-mb-6">{t('settings.interfaceLang')}</div>
            <Controller
              name="lang"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  value={field.value}
                  onChange={(event) => {
                    //
                    const value = event.target.value as SettingsLang
                    field.onChange(value)
                    onLangChange(value)
                  }}
                >
                  <Radio.Button value="uz-cy">{t('settings.langUzCy')}</Radio.Button>
                  <Radio.Button value="uz-la">{t('settings.langUzLatn')}</Radio.Button>
                  <Radio.Button value="ru">{t('settings.langRu')}</Radio.Button>
                  <Radio.Button value="en">{t('settings.langEn')}</Radio.Button>
                </Radio.Group>
              )}
            />
          </div>
        </div>

        <div className="card settings-appearance-card">
          <SectionTitle>
            {t('settings.appearance')}
          </SectionTitle>
          <div className="settings-theme-field">
            <div className="settings-theme-field__label">{t('settings.theme')}</div>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => {
                //
                const selectedTheme = field.value === 'system' ? 'light' : field.value
                const selectTheme = (value: Exclude<SettingsTheme, 'system'>) => {
                  //
                  field.onChange(value)
                  onThemeChange(value)
                }

                return (
                  <div className="settings-theme-options" role="radiogroup" aria-label={t('settings.theme')}>
                    <ThemeChoice
                      value="light"
                      selected={selectedTheme === 'light'}
                      title={t('settings.themeLight')}
                      description={t('settings.themeLightDescription')}
                      icon={<StoreIcon name="sun" size={18} />}
                      onSelect={selectTheme}
                    />
                    <ThemeChoice
                      value="dark"
                      selected={selectedTheme === 'dark'}
                      title={t('settings.themeDark')}
                      description={t('settings.themeDarkDescription')}
                      icon={<StoreIcon name="moon" size={18} />}
                      onSelect={selectTheme}
                    />
                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>
      <ExchangeRateModal t={t} open={exchangeRateOpen} current={exchangeRate} onClose={() => setExchangeRateOpen(false)} />
    </>
  )
}
