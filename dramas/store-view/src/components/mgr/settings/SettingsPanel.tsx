import { useEffect, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { InputNumber, Radio } from 'antd'
import { CheckIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'
import type { Currency } from '@store/store-shared/core'

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
          <div className="col" style={{ gap: 12 }}>
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
                const selectedTheme = field.value === 'system' ? 'light' : field.value
                const selectTheme = (value: Exclude<SettingsTheme, 'system'>) => {
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
                      icon={<SunIcon size={18} weight="duotone" />}
                      onSelect={selectTheme}
                    />
                    <ThemeChoice
                      value="dark"
                      selected={selectedTheme === 'dark'}
                      title={t('settings.themeDark')}
                      description={t('settings.themeDarkDescription')}
                      icon={<MoonIcon size={18} weight="duotone" />}
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

function ThemeChoice({
  value,
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  value: 'light' | 'dark'
  selected: boolean
  title: string
  description: string
  icon: ReactNode
  onSelect: (value: 'light' | 'dark') => void
}) {
  return (
    <button
      type="button"
      className={`settings-theme-choice settings-theme-choice--${value}${selected ? ' is-selected' : ''}`}
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
    >
      <span className="settings-theme-choice__preview" aria-hidden="true">
        <i className="settings-theme-choice__sidebar" />
        <i className="settings-theme-choice__header" />
        <i className="settings-theme-choice__card settings-theme-choice__card--one" />
        <i className="settings-theme-choice__card settings-theme-choice__card--two" />
      </span>
      <span className="settings-theme-choice__copy">
        <span className="settings-theme-choice__icon">{icon}</span>
        <span><strong>{title}</strong><small>{description}</small></span>
      </span>
      <span className="settings-theme-choice__check" aria-hidden="true"><CheckIcon size={12} weight="bold" /></span>
    </button>
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
