import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control } from 'react-hook-form'
import { Form, Input, InputNumber, Radio } from 'antd'
import { formatDate, formatDateTime } from '@store/store-shared/lib/formatters'
import type { ExchangeRate } from '@store/store-stub'
import type { ExchangeRateFormValues } from '../useExchangeRateForm'

interface ExchangeRateFormFieldsProps {
  t: StoreTranslator
  control: Control<ExchangeRateFormValues>
  current?: ExchangeRate
  mode: ExchangeRateFormValues['mode']
  hasCbuRate: boolean
  minRate: number
}

function formatRate(rate: number) {
  //
  return rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 }).replace(/,(?=\d{3})/g, ' ')
}

export function ExchangeRateFormFields({ t, control, current, mode, hasCbuRate, minRate }: ExchangeRateFormFieldsProps) {
  //
  return (
    <Form layout="vertical" component="div" className="u-mt-4">
      <Controller
        name="mode"
        control={control}
        render={({ field }) => (
          <Radio.Group value={field.value} onChange={(event) => field.onChange(event.target.value)} className="u-flex u-flex-col u-gap-10 u-mb-14">
            <Radio value="CBU" disabled={!hasCbuRate}>
              <div className="u-fw-600">{t('exchangeRate.modeCbu')}</div>
              <div className="u-text-muted u-fs-12">
                {current?.cbu
                  ? t('exchangeRate.cbuLine', { rate: formatRate(current.cbu.rate), date: formatDate(current.cbu.rateDate) })
                  : t('exchangeRate.cbuUnavailable')}
              </div>
            </Radio>
            <Radio value="MANUAL">
              <div className="u-fw-600">{t('exchangeRate.modeManual')}</div>
            </Radio>
          </Radio.Group>
        )}
      />
      {mode === 'MANUAL' ? (
        <Form.Item label={t('exchangeRate.manualRateLabel')}>
          <Controller
            name="rate"
            control={control}
            render={({ field }) => (
              <InputNumber<number>
                value={field.value}
                onChange={(value) => field.onChange(value)}
                className="u-w-full"
                min={minRate}
                step={10}
                precision={2}
                addonAfter={t('currency.UZS')}
                formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                parser={(value) => Number(value?.replace(/\s/g, '') || 0)}
              />
            )}
          />
        </Form.Item>
      ) : null}
      <Form.Item label={t('exchangeRate.ownerPassword')} extra={t('exchangeRate.ownerPasswordHint')}>
        <Controller
          name="ownerPassword"
          control={control}
          render={({ field }) => (
            <Input.Password value={field.value} onChange={field.onChange} autoComplete="off" name="store-owner-password" />
          )}
        />
      </Form.Item>
      {current?.changedAt && current.changedBy ? (
        <div className="u-text-muted u-fs-12">
          {t('exchangeRate.lastChanged', { name: current.changedBy.fullName, date: formatDateTime(current.changedAt) })}
        </div>
      ) : null}
    </Form>
  )
}
