import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Form, Input, InputNumber, Select, Switch } from 'antd'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Category, ProductUnit } from '@store/store-stub'
import type { ProductFormValues } from '../productSchema'

interface ProductBasicFieldsProps {
  t: (key: string) => string
  control: Control<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  categories: Category[]
  categoriesLoading: boolean
  branches: Branch[]
  branchesLoading: boolean
  unit: ProductUnit
  isEdit: boolean
  isStoreOwner: boolean
}

export function ProductBasicFields({
  t,
  control,
  errors,
  categories,
  categoriesLoading,
  branches,
  branchesLoading,
  unit,
  isEdit,
  isStoreOwner,
}: ProductBasicFieldsProps) {
  //
  const unitOptions: { value: ProductUnit; label: string }[] = [
    { value: 'KG', label: t('units.KG') },
    { value: 'PIECE', label: t('units.PIECE') },
  ]

  return (
    <>
      <div className="u-grid u-gap-12 u-grid-cols-2">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('common.name')} required validateStatus={errors.name ? 'error' : undefined} help={errors.name?.message}>
              <Input {...field} {...blockAutofill('store-product-name')} placeholder={t('productForm.namePlaceholder')} />
            </Form.Item>
          )}
        />
        <Controller
          name="sku"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('productForm.labelSku')} validateStatus={errors.sku ? 'error' : undefined} help={errors.sku?.message}>
              <Input
                {...field}
                {...blockAutofill('store-product-sku')}
                placeholder={t('productForm.skuPlaceholder')}
                className="u-font-mono"
              />
            </Form.Item>
          )}
        />
      </div>

      <div className="u-grid u-gap-12 u-grid-cols-2">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('productForm.labelCategory')}
              validateStatus={errors.categoryId ? 'error' : undefined}
              help={errors.categoryId?.message}
            >
              <Select
                {...field}
                loading={categoriesLoading}
                notFoundContent={categoriesLoading ? <SelectLoadingContent /> : undefined}
                options={categories.map((category) => ({ value: category.id, label: category.name }))}
                placeholder={t('productForm.placeholderCategory')}
              />
            </Form.Item>
          )}
        />
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('productForm.labelUnit')} required validateStatus={errors.unit ? 'error' : undefined} help={errors.unit?.message}>
              <Select {...field} options={unitOptions} />
            </Form.Item>
          )}
        />
      </div>

      <Controller
        name="lowStockThreshold"
        control={control}
        render={({ field }) => (
          <Form.Item label={t('productForm.lowStockThreshold')} extra={t('productForm.lowStockThresholdNote')}>
            <InputNumber
              value={field.value ?? undefined}
              min={0}
              step={unit === 'KG' ? 0.1 : 1}
              precision={unit === 'KG' ? 4 : 0}
              onChange={(value) => field.onChange(value ?? undefined)}
              className="u-w-220"
              addonAfter={t(`units.${unit}`)}
              placeholder="—"
            />
          </Form.Item>
        )}
      />

      {!isEdit && isStoreOwner ? (
        <Controller
          name="branchId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('productForm.labelBranch')}
              required
              validateStatus={errors.branchId ? 'error' : undefined}
              help={errors.branchId?.message}
            >
              <Select
                {...field}
                loading={branchesLoading}
                notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
                placeholder={t('productForm.placeholderBranch')}
              />
            </Form.Item>
          )}
        />
      ) : null}

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Form.Item label={t('productForm.labelDescription')}>
            <Input.TextArea
              {...field}
              {...blockAutofill('store-product-description')}
              rows={2}
              maxLength={500}
              showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
              placeholder={t('productForm.placeholderDescription')}
            />
          </Form.Item>
        )}
      />

      {isEdit ? (
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('common.status')}>
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren={t('common.active')}
                unCheckedChildren={t('common.inactive')}
              />
            </Form.Item>
          )}
        />
      ) : null}
    </>
  )
}
