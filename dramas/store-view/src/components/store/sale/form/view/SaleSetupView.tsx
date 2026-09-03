import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control } from 'react-hook-form'
import { Button, Radio, Select } from 'antd'

import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { Label } from './index'
import type { SaleFormValues } from './types'

interface CustomerOption {
  value: string
  label: string
}

interface SaleSetupViewProps {
  t: StoreTranslator
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
    <div className="u-grid u-gap-12 u-grid-cols-2 u-mb-16">
      <div>
        <Label>{t('newSale.typeLabel')}</Label>
        <Controller
          name="saleType"
          control={control}
          render={({ field }) => (
            <Radio.Group value={field.value} onChange={(event) => field.onChange(event.target.value)} className="u-flex">
              <Radio.Button value="RETAIL" className="u-flex-1 u-text-center">
                {t('sales.typeRetail')}
              </Radio.Button>
              <Radio.Button value="WHOLESALE" className="u-flex-1 u-text-center">
                {t('sales.typeWholesale')}
              </Radio.Button>
            </Radio.Group>
          )}
        />
      </div>
      <div>
        <Label>{t('newSale.customerOptional')}</Label>
        <div className="u-grid u-gap-8 u-grid-cols-content-auto">
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
                className="u-w-full"
                loading={customersLoading}
                notFoundContent={customersLoading ? <SelectLoadingContent /> : undefined}
                options={customerOptions}
              />
            )}
          />
          <Button icon={<i className="icons-plus icon-size-13" />} onClick={onCreateCustomer}>
            {t('customers.newCustomer')}
          </Button>
        </div>
      </div>
    </div>
  )
}
