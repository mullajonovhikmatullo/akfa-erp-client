import { useEffect, useState } from 'react'
import { Button, InputNumber, Radio } from 'antd'

import type { StoreTranslator } from '@store/store-i18n'
import type { SaleSettings } from '@store/store-stub'
import { SectionTitle } from './SectionTitle'

interface SaleSettingsCardProps {
  t: StoreTranslator
  settings: SaleSettings | undefined
  canManage: boolean
  saving: boolean
  onSave: (settings: SaleSettings) => void
}

export function SaleSettingsCard({ t, settings, canManage, saving, onSave }: SaleSettingsCardProps) {
  //
  const [discountEnabled, setDiscountEnabled] = useState(true)
  const [defaultDiscountPercent, setDefaultDiscountPercent] = useState(0)

  useEffect(() => {
    //
    if (!settings) return
    setDiscountEnabled(settings.discountEnabled)
    setDefaultDiscountPercent(settings.defaultDiscountPercent)
  }, [settings])

  const changed = Boolean(settings) && (
    discountEnabled !== settings?.discountEnabled
    || (discountEnabled && defaultDiscountPercent !== settings?.defaultDiscountPercent)
  )
  const disabled = !canManage || !settings

  return (
    <div className="card">
      <SectionTitle>{t('settings.sale')}</SectionTitle>
      <div className="u-text-muted u-fs-12 u-mb-6">{t('settings.discountMode')}</div>
      <Radio.Group
        value={discountEnabled}
        disabled={disabled}
        onChange={(event) => setDiscountEnabled(event.target.value)}
        buttonStyle="solid"
      >
        <Radio.Button value={false}>{t('settings.discountOff')}</Radio.Button>
        <Radio.Button value={true}>{t('settings.discountOn')}</Radio.Button>
      </Radio.Group>
      {discountEnabled ? (
        <div className="u-mt-12">
          <div className="u-text-muted u-fs-12 u-mb-6">{t('settings.defaultDiscount')}</div>
          <InputNumber<number>
            value={defaultDiscountPercent}
            min={0}
            max={100}
            precision={2}
            suffix="%"
            disabled={disabled}
            onChange={(value) => setDefaultDiscountPercent(value ?? 0)}
            className="u-w-120"
          />
        </div>
      ) : null}
      <div className="u-text-muted u-fs-12 u-mt-6">
        {t(discountEnabled ? 'settings.discountOnNote' : 'settings.discountOffNote')}
      </div>
      {canManage ? (
        <Button
          type="primary"
          size="small"
          className="u-mt-12"
          disabled={!changed}
          loading={saving}
          onClick={() => onSave({ discountEnabled, defaultDiscountPercent: discountEnabled ? defaultDiscountPercent : 0 })}
        >
          {t('settings.saleSave')}
        </Button>
      ) : (
        <div className="u-text-muted u-fs-12 u-mt-6">{t('settings.saleOwnerOnly')}</div>
      )}
    </div>
  )
}
