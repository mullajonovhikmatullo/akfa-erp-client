import { Controller, type Control } from 'react-hook-form'
import { Button, Radio, Select } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { Label } from './index'
import type { SaleFormValues } from './types'

interface CustomerOption {
  value: string
  label: string
}

interface SaleSetupViewProps {
  t: (key: string) => string
  control: Control<SaleFormValues>
  customerOptions: CustomerOption[]
  selectedCustomerId?: string
  customersLoading: boolean
  onCustomerChange: (value?: string) => void
  onCreateCustomer: () => void
}

export function SaleSetupView({
  t,
  control,
  customerOptions,
  selectedCustomerId,
  customersLoading,
  onCustomerChange,
  onCreateCustomer,
}: SaleSetupViewProps) {
  //
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      <div>
        <Label>{t('newSale.typeLabel')}</Label>
        <Controller
          name="saleType"
          control={control}
          render={({ field }) => (
            <Radio.Group value={field.value} onChange={(event) => field.onChange(event.target.value)} style={{ display: 'flex' }}>
              <Radio.Button value="RETAIL" style={{ flex: 1, textAlign: 'center' }}>
                {t('sales.typeRetail')}
              </Radio.Button>
              <Radio.Button value="WHOLESALE" style={{ flex: 1, textAlign: 'center' }}>
                {t('sales.typeWholesale')}
              </Radio.Button>
            </Radio.Group>
          )}
        />
      </div>
      <div>
        <Label>{t('newSale.customerOptional')}</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
          <Controller
            name="customerId"
            control={control}
            render={() => (
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                value={selectedCustomerId}
                onChange={onCustomerChange}
                placeholder={t('newSale.customerPlaceholder')}
                style={{ width: '100%' }}
                loading={customersLoading}
                notFoundContent={customersLoading ? <SelectLoadingContent /> : undefined}
                options={customerOptions}
              />
            )}
          />
          <Button icon={<PlusIcon size={13} />} onClick={onCreateCustomer}>
            {t('customers.newCustomer')}
          </Button>
        </div>
      </div>
    </div>
  )
}
