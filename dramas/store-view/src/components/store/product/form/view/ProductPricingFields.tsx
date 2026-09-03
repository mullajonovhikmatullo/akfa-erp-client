import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Form, InputNumber, Segmented } from 'antd'
import type { ProductFormValues } from '../productSchema'

interface ProductPricingFieldsProps {
  t: (key: string) => string
  control: Control<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  currency: ProductFormValues['priceCurrency']
  retailUzs?: number
  wholesaleUzs?: number
  retailUsd?: number
  wholesaleUsd?: number
  onCurrencyChange: (value: string | number) => void
}

const formatUzsPrice = (value: string | number | undefined) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const parseUzsPrice = (value: string | undefined) => Number(value?.replace(/\s/g, ''))

export function ProductPricingFields({
  t,
  control,
  errors,
  currency,
  retailUzs,
  wholesaleUzs,
  retailUsd,
  wholesaleUsd,
  onCurrencyChange,
}: ProductPricingFieldsProps) {
  //
  return (
    <>
      <Form.Item className="u-mb-8">
        <Controller
          name="priceCurrency"
          control={control}
          render={({ field }) => (
            <Segmented
              value={field.value}
              onChange={onCurrencyChange}
              options={[
                { label: t('productForm.tabSom'), value: 'UZS' },
                { label: t('productForm.tabDollar'), value: 'USD' },
              ]}
              block
            />
          )}
        />
      </Form.Item>

      {currency === 'UZS' ? (
        <div className="u-grid u-gap-12 u-grid-cols-fit-150">
          <Controller
            name="costPriceUzs"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('productForm.labelCostUzs')} required validateStatus={errors.costPriceUzs ? 'error' : undefined} help={errors.costPriceUzs?.message}>
                <InputNumber<number>
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="u-w-full"
                  min={0}
                  max={wholesaleUzs || undefined}
                  step={1000}
                  formatter={formatUzsPrice}
                  parser={parseUzsPrice}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="wholesalePriceUzs"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('productForm.labelWholesaleUzs')} required validateStatus={errors.wholesalePriceUzs ? 'error' : undefined} help={errors.wholesalePriceUzs?.message}>
                <InputNumber<number>
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="u-w-full"
                  min={0}
                  max={retailUzs || undefined}
                  step={1000}
                  formatter={formatUzsPrice}
                  parser={parseUzsPrice}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="retailPriceUzs"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('productForm.labelRetailUzs')} required validateStatus={errors.retailPriceUzs ? 'error' : undefined} help={errors.retailPriceUzs?.message}>
                <InputNumber<number>
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="u-w-full"
                  min={0}
                  step={1000}
                  formatter={formatUzsPrice}
                  parser={parseUzsPrice}
                />
              </Form.Item>
            )}
          />
        </div>
      ) : (
        <div className="u-grid u-gap-12 u-grid-cols-fit-150">
          <Controller
            name="costPriceUsd"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('productForm.labelCostUsd')} required validateStatus={errors.costPriceUsd ? 'error' : undefined} help={errors.costPriceUsd?.message}>
                <InputNumber {...field} value={field.value ?? undefined} className="u-w-full" min={0} max={wholesaleUsd || undefined} step={0.5} precision={2} prefix="$" />
              </Form.Item>
            )}
          />
          <Controller
            name="wholesalePriceUsd"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('productForm.labelWholesaleUsd')} required validateStatus={errors.wholesalePriceUsd ? 'error' : undefined} help={errors.wholesalePriceUsd?.message}>
                <InputNumber {...field} value={field.value ?? undefined} className="u-w-full" min={0} max={retailUsd || undefined} step={0.5} precision={2} prefix="$" />
              </Form.Item>
            )}
          />
          <Controller
            name="retailPriceUsd"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('productForm.labelRetailUsd')} required validateStatus={errors.retailPriceUsd ? 'error' : undefined} help={errors.retailPriceUsd?.message}>
                <InputNumber {...field} value={field.value ?? undefined} className="u-w-full" min={0} step={0.5} precision={2} prefix="$" />
              </Form.Item>
            )}
          />
        </div>
      )}
    </>
  )
}
