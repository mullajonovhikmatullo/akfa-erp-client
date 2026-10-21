import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Form, InputNumber, Segmented } from 'antd'
import { getDiscountedPriceUzs } from '@store/store-shared/lib/product-pricing'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { ProductFormValues } from '../productSchema'

interface ProductPricingFieldsProps {
  t: StoreTranslator
  control: Control<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  currency: ProductFormValues['priceCurrency']
  retailUzs?: number
  wholesaleUzs?: number
  retailUsd?: number
  wholesaleUsd?: number
  discountPercent?: number
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
  discountPercent = 0,
  onCurrencyChange,
}: ProductPricingFieldsProps) {
  //
  const discountedPrices = currency === 'UZS'
    ? [
        { key: 'wholesale', label: t('products.colWholesale'), amount: getDiscountedPriceUzs(wholesaleUzs ?? 0, discountPercent), currency: 'UZS' as const },
        { key: 'retail', label: t('products.colRetail'), amount: getDiscountedPriceUzs(retailUzs ?? 0, discountPercent), currency: 'UZS' as const },
      ]
    : [
        { key: 'wholesale', label: t('products.colWholesale'), amount: Number(((wholesaleUsd ?? 0) * (1 - discountPercent / 100)).toFixed(4)), currency: 'USD' as const },
        { key: 'retail', label: t('products.colRetail'), amount: Number(((retailUsd ?? 0) * (1 - discountPercent / 100)).toFixed(4)), currency: 'USD' as const },
      ]

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

      <div className="u-grid u-gap-12 u-grid-cols-fit-150">
        <Controller
          name="discountPercent"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('productForm.labelDiscount')} tooltip={t('productForm.discountHint')} validateStatus={errors.discountPercent ? 'error' : undefined} help={errors.discountPercent?.message}>
              <InputNumber<number>
                value={field.value}
                onChange={(value) => field.onChange(value ?? 0)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="u-w-full"
                min={0}
                max={100}
                precision={0}
                step={1}
                suffix="%"
              />
            </Form.Item>
          )}
        />
        {discountPercent > 0 ? discountedPrices.map((price) => (
          <Form.Item key={price.key} label={`${price.label} · −${discountPercent.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%`}>
            <div className="num u-fs-16 u-fw-700 u-text-success">
              <MoneyDisplay amount={price.amount} currency={price.currency} noConvert />
            </div>
          </Form.Item>
        )) : null}
      </div>
    </>
  )
}
