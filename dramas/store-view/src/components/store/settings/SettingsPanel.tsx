import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { InputNumber, Radio } from 'antd'

import { useStoreT, type StoreLocale } from '@store/store-i18n'
import type { Currency } from '@store/store-stub'
import { SectionTitle } from './view/SectionTitle'
import { ThemeChoice } from './view/ThemeChoice'

export type SettingsLang = StoreLocale
export type SettingsTheme = 'light' | 'dark' | 'system'

interface SettingsFormValues {
  displayCurrency: Currency
  exchangeRate: number
  lang: SettingsLang
  theme: SettingsTheme
}

export interface SettingsPanelProps extends SettingsFormValues {
  onDisplayCurrencyChange: (currency: Currency) => void
  onExchangeRateChange: (rate: number) => void
  onLangChange: (lang: SettingsLang) => void
  onThemeChange: (theme: SettingsTheme) => void
}

export function SettingsPanel({
  displayCurrency,
  exchangeRate,
  lang,
  theme,
  onDisplayCurrencyChange,
  onExchangeRateChange,
  onLangChange,
  onThemeChange,
}: SettingsPanelProps) {
  //
  const t = useStoreT()
  const { control, reset } = useForm<SettingsFormValues>({
    defaultValues: {
      displayCurrency,
      exchangeRate,
      lang,
      theme,
    },
  })

  useEffect(() => {
    //
    reset({
      displayCurrency,
      exchangeRate,
      lang,
      theme,
    })
  }, [displayCurrency, exchangeRate, lang, reset, theme])

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
              <Controller
                name="exchangeRate"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    value={field.value}
                    step={50}
                    min={1000}
                    onChange={(nextValue) => {
                      //
                      const value = Number(nextValue) || 0
                      field.onChange(value)
                      onExchangeRateChange(value)
                    }}
                    className="u-w-220"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    addonAfter={t('currency.UZS')}
                  />
                )}
              />
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
                      icon={<i className="icons-sun icon-size-18" />}
                      onSelect={selectTheme}
                    />
                    <ThemeChoice
                      value="dark"
                      selected={selectedTheme === 'dark'}
                      title={t('settings.themeDark')}
                      description={t('settings.themeDarkDescription')}
                      icon={<i className="icons-moon icon-size-18" />}
                      onSelect={selectTheme}
                    />
                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
