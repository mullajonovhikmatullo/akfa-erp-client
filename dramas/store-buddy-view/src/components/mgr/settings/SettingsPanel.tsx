import { useEffect, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, InputNumber, Popconfirm, Radio } from 'antd'
import { LightbulbIcon } from '@phosphor-icons/react'
import type { Currency } from '@erp/erp-shared/core'

type TFunc = (key: string) => string
export type SettingsLang = 'uz-cy' | 'uz-la' | 'ru' | 'en'
export type SettingsTheme = 'light' | 'dark' | 'system'

interface SettingsFormValues {
  displayCurrency: Currency
  exchangeRate: number
  lowStockThreshold: number
  lang: SettingsLang
  theme: SettingsTheme
}

export interface SettingsPanelProps extends SettingsFormValues {
  t: TFunc
  onDisplayCurrencyChange: (currency: Currency) => void
  onExchangeRateChange: (rate: number) => void
  onLowStockThresholdChange: (threshold: number) => void
  onLangChange: (lang: SettingsLang) => void
  onThemeChange: (theme: SettingsTheme) => void
  onResetData: () => void
}

export function SettingsPanel({
  t,
  displayCurrency,
  exchangeRate,
  lowStockThreshold,
  lang,
  theme,
  onDisplayCurrencyChange,
  onExchangeRateChange,
  onLowStockThresholdChange,
  onLangChange,
  onThemeChange,
  onResetData,
}: SettingsPanelProps) {
  //
  const { control, reset } = useForm<SettingsFormValues>({
    defaultValues: {
      displayCurrency,
      exchangeRate,
      lowStockThreshold,
      lang,
      theme,
    },
  })

  useEffect(() => {
    //
    reset({
      displayCurrency,
      exchangeRate,
      lowStockThreshold,
      lang,
      theme,
    })
  }, [displayCurrency, exchangeRate, lang, lowStockThreshold, reset, theme])

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
          <div className="col" style={{ gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{t('settings.displayCurrency')}</div>
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
                    <Radio.Button value="UZS">UZS so'm</Radio.Button>
                    <Radio.Button value="USD">USD $</Radio.Button>
                  </Radio.Group>
                )}
              />
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{t('settings.currencyNote')}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{t('settings.exchangeRate')}</div>
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
                    style={{ width: 220 }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    addonAfter="so'm"
                  />
                )}
              />
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{t('settings.exchangeRateNote')}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.threshold')}</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{t('settings.lowStockThreshold')}</div>
            <Controller
              name="lowStockThreshold"
              control={control}
              render={({ field }) => (
                <InputNumber
                  value={field.value}
                  min={1}
                  onChange={(nextValue) => {
                    //
                    const value = Number(nextValue) || 0
                    field.onChange(value)
                    onLowStockThresholdChange(value)
                  }}
                  style={{ width: 180 }}
                  addonAfter={t('settings.units')}
                />
              )}
            />
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{t('settings.thresholdNote')}</div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.localization')}</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{t('settings.interfaceLang')}</div>
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
                  <Radio.Button value="uz-cy">O'z (Кирил)</Radio.Button>
                  <Radio.Button value="uz-la">O'z (Lotin)</Radio.Button>
                  <Radio.Button value="ru">Русский</Radio.Button>
                  <Radio.Button value="en">English</Radio.Button>
                </Radio.Group>
              )}
            />
          </div>
        </div>

        <div className="card">
          <SectionTitle>
            <LightbulbIcon size={18} weight="duotone" style={{ marginRight: 6 }} />
            {t('settings.appearance')}
          </SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{t('settings.theme')}</div>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  value={field.value}
                  onChange={(event) => {
                    //
                    const value = event.target.value as SettingsTheme
                    field.onChange(value)
                    onThemeChange(value)
                  }}
                >
                  <Radio.Button value="light">{t('settings.themeLight')}</Radio.Button>
                  <Radio.Button value="dark">{t('settings.themeDark')}</Radio.Button>
                  <Radio.Button value="system">{t('settings.themeSystem')}</Radio.Button>
                </Radio.Group>
              )}
            />
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.dangerZone')}</SectionTitle>
          <Popconfirm title={t('settings.resetConfirm')} onConfirm={onResetData}>
            <Button danger>{t('settings.resetData')}</Button>
          </Popconfirm>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>{t('settings.resetNote')}</div>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px' }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {children}
      </h3>
    </div>
  )
}
