import { useEffect, useState } from 'react'
import { Button, Empty, Form, Skeleton } from 'antd'
import { useStoreT } from '@store/store-i18n'
import type { Branch } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useCategoriesList } from '../../category/hooks/useCategoriesList'
import { useProductDetail } from '../hooks/useProductDetail'
import { createEmptyProductImageChanges } from '../images/product-image-changes'
import { useProductForm } from './useProductForm'
import { ProductBasicFields } from './view/ProductBasicFields'
import { ProductFormHeader } from './view/ProductFormHeader'
import { ProductImagesSection } from './view/ProductImagesSection'
import { ProductPricingFields } from './view/ProductPricingFields'

export interface ProductFormPanelProps {
  productId?: string | null
  isStoreOwner: boolean
  onDone: () => void
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

export function ProductFormPanel({ productId, isStoreOwner, onDone }: ProductFormPanelProps) {
  //
  const t = useStoreT()
  const isEdit = Boolean(productId)
  const { data: product, isLoading: productLoading } = useProductDetail(productId ?? null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageChanges, setImageChanges] = useState(createEmptyProductImageChanges)
  const {
    form,
    onSubmit,
    isPending,
    isUploading,
    uploadProgress,
    imageUploadError,
    isAwaitingImageRetry,
  } = useProductForm({
    t,
    open: !isEdit || Boolean(product),
    product: product ?? null,
    imageFiles,
    onImageFilesChange: setImageFiles,
    imageChanges,
    onImageChangesChange: setImageChanges,
    onSuccess: onDone,
  })
  const {
    control,
    formState: { errors },
    watch,
    clearErrors,
    setValue,
  } = form
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesList(true)
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()
  const priceCurrency = watch('priceCurrency')
  const retailUzs = watch('retailPriceUzs')
  const wholesaleUzs = watch('wholesalePriceUzs')
  const retailUsd = watch('retailPriceUsd')
  const wholesaleUsd = watch('wholesalePriceUsd')
  const discountPercent = watch('discountPercent')
  const unit = watch('unit')
  const branchId = watch('branchId')
  const defaultBranchId = findDefaultBranch(branches)

  useEffect(() => {
    //
    if (!isEdit && isStoreOwner && defaultBranchId && !branchId) {
      setValue('branchId', defaultBranchId, { shouldValidate: false })
    }
  }, [isEdit, isStoreOwner, defaultBranchId, branchId, setValue])

  function handleCurrencyChange(value: string | number) {
    //
    const currency = value as 'UZS' | 'USD'
    clearErrors([
      'costPriceUzs',
      'retailPriceUzs',
      'wholesalePriceUzs',
      'costPriceUsd',
      'retailPriceUsd',
      'wholesalePriceUsd',
    ])
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

  const submitLabel = isAwaitingImageRetry
    ? t('productImages.retry')
    : isUploading
      ? t('productImages.uploading')
      : isEdit
        ? t('common.save')
        : t('common.add')

  if (isEdit && (productLoading || !product)) {
    return (
      <>
        <ProductFormHeader
          t={t}
          title={t('common.edit')}
          subtitle={t('productForm.subtitleEdit')}
          submitLabel={submitLabel}
          isPending={false}
          canSubmit={false}
          onBack={onDone}
          onSubmit={() => undefined}
        />
        {productLoading ? (
          <div className="card"><Skeleton active paragraph={{ rows: 8 }} /></div>
        ) : (
          <div className="card">
            <Empty description={t('productForm.notFound')}>
              <Button onClick={onDone}>{t('productForm.backToList')}</Button>
            </Empty>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <ProductFormHeader
        t={t}
        title={product ? product.name : t('productForm.titleCreate')}
        subtitle={t(isEdit ? 'productForm.subtitleEdit' : 'productForm.subtitleCreate')}
        submitLabel={submitLabel}
        isPending={isPending}
        canSubmit
        onBack={onDone}
        onSubmit={() => onSubmit()}
      />
      <Form layout="vertical" component="div" className="product-form-page">
        <div className="product-form-page__grid">
          <div className="product-form-page__column">
            <section className="card product-form-page__card">
              <h2 className="product-form-page__title">{t('productForm.sectionBasic')}</h2>
              <ProductBasicFields
                t={t}
                control={control}
                errors={errors}
                categories={categories}
                categoriesLoading={categoriesLoading}
                branches={branches}
                branchesLoading={branchesLoading}
                unit={unit}
                isEdit={isEdit}
                isStoreOwner={isStoreOwner}
              />
            </section>
            <section className="card product-form-page__card">
              <h2 className="product-form-page__title">{t('productForm.sectionPricing')}</h2>
              <ProductPricingFields
                t={t}
                control={control}
                errors={errors}
                currency={priceCurrency}
                retailUzs={retailUzs}
                wholesaleUzs={wholesaleUzs}
                retailUsd={retailUsd}
                wholesaleUsd={wholesaleUsd}
                discountPercent={discountPercent}
                onCurrencyChange={handleCurrencyChange}
              />
            </section>
          </div>
          <section className="card product-form-page__card product-form-page__images">
            <ProductImagesSection
              t={t}
              product={product}
              files={imageFiles}
              changes={imageChanges}
              isEdit={isEdit}
              isPending={isPending}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadError={imageUploadError}
              onFilesChange={setImageFiles}
              onChangesChange={setImageChanges}
            />
          </section>
        </div>
      </Form>
    </>
  )
}
