import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { Alert, Button, Form, Input, InputNumber, Progress, Segmented, Select, Switch } from 'antd'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product, ProductUnit } from '@store/store-stub'
import { useBranches } from '../../branch/hooks/useBranches'
import { useCategories } from '../../category/hooks/useCategories'
import { PendingProductImages } from '../images/PendingProductImages'
import { ProductImageManager } from '../images/ProductImageManager'
import { PRODUCT_IMAGE_MAX_COUNT } from '../images/image-utils'
import { createEmptyProductImageChanges } from '../images/product-image-changes'
import { useProductForm } from './useProductForm'

interface ProductFormModalProps {
  t: (key: string) => string
  open: boolean
  product?: Product | null
  onClose: () => void
  isStoreOwner: boolean
}

function findDefaultBranch(branches: Branch[]) {
  //
  const mainBranch = branches.find((branch) => /main|asosiy|глав/i.test(branch.name))
  const firstBranch = [...branches].sort((a, b) => {
    //
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return aTime - bTime
  })[0]
  return mainBranch?.id ?? firstBranch?.id
}

export function ProductFormModal({ t, open, product, onClose, isStoreOwner }: ProductFormModalProps) {
  //
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageChanges, setImageChanges] = useState(createEmptyProductImageChanges)
  const unitOptions: { value: ProductUnit; label: string }[] = [
    { value: 'KG', label: t('units.KG') },
    { value: 'PIECE', label: t('units.PIECE') },
  ]
  const handleSuccess = useCallback(() => {
    setImageFiles([])
    setImageChanges(createEmptyProductImageChanges())
    onClose()
  }, [onClose])
  const {
    form,
    onSubmit,
    isPending,
    isEdit,
    isUploading,
    uploadProgress,
    imageUploadError,
    isAwaitingImageRetry,
    resetFlow,
  } = useProductForm({
    t,
    product,
    imageFiles,
    onImageFilesChange: setImageFiles,
    imageChanges,
    onImageChangesChange: setImageChanges,
    onSuccess: handleSuccess,
  })
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = form

  const { data: categories = [], isLoading: categoriesLoading } = useCategories(true)
  const { data: branches = [], isLoading: branchesLoading } = useBranches()

  const priceCurrency = watch('priceCurrency')
  const retailUzs = watch('retailPriceUzs')
  const wholesaleUzs = watch('wholesalePriceUzs')
  const retailUsd = watch('retailPriceUsd')
  const wholesaleUsd = watch('wholesalePriceUsd')
  const branchId = watch('branchId')

  const defaultBranchId = useMemo(() => findDefaultBranch(branches), [branches])

  useEffect(() => {
    //
    if (open && !isEdit && isStoreOwner && defaultBranchId && !branchId) {
      setValue('branchId', defaultBranchId, { shouldValidate: true })
    }
  }, [open, isEdit, isStoreOwner, defaultBranchId, branchId, setValue])

  useEffect(() => {
    setImageFiles([])
    setImageChanges(createEmptyProductImageChanges())
    if (!open) resetFlow()
  }, [open, product?.id, resetFlow])

  const handleClose = () => {
    if (isPending) return
    setImageFiles([])
    setImageChanges(createEmptyProductImageChanges())
    resetFlow()
    onClose()
  }

  const handleCurrencyChange = (value: string | number) => {
    //
    const currency = value as 'UZS' | 'USD'
    setValue('priceCurrency', currency, { shouldValidate: false })
    if (currency === 'UZS') {
      setValue('costPriceUsd', undefined)
      setValue('retailPriceUsd', undefined)
      setValue('wholesalePriceUsd', undefined)
      return
    }

    setValue('costPriceUzs', undefined)
    setValue('retailPriceUzs', undefined)
    setValue('wholesalePriceUzs', undefined)
  }

  return (
    <AppModal
      title={isEdit ? `${t('common.edit')} · ${product?.sku ?? product?.name}` : t('productForm.titleCreate')}
      open={open}
      onClose={handleClose}
      width={760}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={isPending} onClick={() => onSubmit()}>
          {isAwaitingImageRetry
            ? t('productImages.retry')
            : isUploading
              ? t('productImages.uploading')
              : isEdit
                ? t('common.save')
                : t('common.add')}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                <Input {...field} {...blockAutofill('store-product-sku')} placeholder={t('productForm.skuPlaceholder')} style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            )}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

        <Form.Item style={{ marginBottom: 8 }}>
          <Controller
            name="priceCurrency"
            control={control}
            render={({ field }) => (
              <Segmented
                value={field.value}
                onChange={handleCurrencyChange}
                options={[
                  { label: t('productForm.tabSom'), value: 'UZS' },
                  { label: t('productForm.tabDollar'), value: 'USD' },
                ]}
                block
              />
            )}
          />
        </Form.Item>

        {priceCurrency === 'UZS' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <Controller
              name="costPriceUzs"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('productForm.labelCostUzs')}
                  required
                  validateStatus={errors.costPriceUzs ? 'error' : undefined}
                  help={errors.costPriceUzs?.message}
                >
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    min={0}
                    max={wholesaleUzs || undefined}
                    step={1000}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="wholesalePriceUzs"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('productForm.labelWholesaleUzs')}
                  required
                  validateStatus={errors.wholesalePriceUzs ? 'error' : undefined}
                  help={errors.wholesalePriceUzs?.message}
                >
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    min={0}
                    max={retailUzs || undefined}
                    step={1000}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="retailPriceUzs"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('productForm.labelRetailUzs')}
                  required
                  validateStatus={errors.retailPriceUzs ? 'error' : undefined}
                  help={errors.retailPriceUzs?.message}
                >
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    min={0}
                    step={1000}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
                  />
                </Form.Item>
              )}
            />
          </div>
        ) : null}

        {priceCurrency === 'USD' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <Controller
              name="costPriceUsd"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('productForm.labelCostUsd')}
                  required
                  validateStatus={errors.costPriceUsd ? 'error' : undefined}
                  help={errors.costPriceUsd?.message}
                >
                  <InputNumber
                    {...field}
                    value={field.value ?? undefined}
                    style={{ width: '100%' }}
                    min={0}
                    max={wholesaleUsd || undefined}
                    step={0.5}
                    precision={2}
                    prefix="$"
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="wholesalePriceUsd"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('productForm.labelWholesaleUsd')}
                  required
                  validateStatus={errors.wholesalePriceUsd ? 'error' : undefined}
                  help={errors.wholesalePriceUsd?.message}
                >
                  <InputNumber
                    {...field}
                    value={field.value ?? undefined}
                    style={{ width: '100%' }}
                    min={0}
                    max={retailUsd || undefined}
                    step={0.5}
                    precision={2}
                    prefix="$"
                  />
                </Form.Item>
              )}
            />
            <Controller
              name="retailPriceUsd"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('productForm.labelRetailUsd')}
                  required
                  validateStatus={errors.retailPriceUsd ? 'error' : undefined}
                  help={errors.retailPriceUsd?.message}
                >
                  <InputNumber {...field} value={field.value ?? undefined} style={{ width: '100%' }} min={0} step={0.5} precision={2} prefix="$" />
                </Form.Item>
              )}
            />
          </div>
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
                <Switch checked={field.value} onChange={field.onChange} checkedChildren={t('common.active')} unCheckedChildren={t('common.inactive')} />
              </Form.Item>
            )}
          />
        ) : null}

        {isEdit && product ? (
          <>
            {imageUploadError ? (
              <Alert
                type="error"
                showIcon
                title={t('productImages.uploadError')}
                description={imageUploadError}
                style={{ marginBottom: 10 }}
              />
            ) : null}
            <ProductImageManager
              productId={product.id}
              productName={product.name}
              t={t}
              pendingFiles={imageFiles}
              onPendingFilesChange={setImageFiles}
              changes={imageChanges}
              onChangesChange={setImageChanges}
              uploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </>
        ) : (
          <section style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t('productImages.title')}</div>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
                {imageFiles.length}/{PRODUCT_IMAGE_MAX_COUNT}
              </span>
            </div>
            {imageUploadError ? (
              <Alert
                type="error"
                showIcon
                title={t('productImages.createdUploadRetry')}
                description={imageUploadError}
                style={{ marginBottom: 10 }}
              />
            ) : null}
            <PendingProductImages
              t={t}
              files={imageFiles}
              onChange={setImageFiles}
              disabled={isPending}
            />
            {isUploading ? <Progress percent={uploadProgress} size="small" style={{ marginTop: 10 }} /> : null}
          </section>
        )}
      </Form>
    </AppModal>
  )
}
