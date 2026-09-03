import type { StoreTranslator } from '@store/store-i18n'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form } from 'antd'
import { AppModal } from '@store/store-shared/ui/app-modal'
import type { Branch, Product } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useCategoriesList } from '../../category/hooks/useCategoriesList'
import { createEmptyProductImageChanges } from '../images/product-image-changes'
import { useProductForm } from './useProductForm'
import { FormSection } from './view/FormSection'
import { ProductBasicFields } from './view/ProductBasicFields'
import { ProductImagesSection } from './view/ProductImagesSection'
import { ProductPricingFields } from './view/ProductPricingFields'

interface ProductFormModalProps {
  t: StoreTranslator
  open: boolean
  product?: Product | null
  onClose: () => void
  onSaved?: () => void
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

export function ProductFormModal({ t, open, product, onClose, onSaved, isStoreOwner }: ProductFormModalProps) {
  //
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageChanges, setImageChanges] = useState(createEmptyProductImageChanges)
  const handleSuccess = useCallback(() => {
    //
    setImageFiles([])
    setImageChanges(createEmptyProductImageChanges())
    onSaved?.()
    onClose()
  }, [onClose, onSaved])
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
    open,
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
  const unit = watch('unit')
  const branchId = watch('branchId')
  const defaultBranchId = useMemo(() => findDefaultBranch(branches), [branches])

  useEffect(() => {
    //
    if (open && !isEdit && isStoreOwner && defaultBranchId && !branchId) {
      setValue('branchId', defaultBranchId, { shouldValidate: false })
    }
  }, [open, isEdit, isStoreOwner, defaultBranchId, branchId, setValue])

  useEffect(() => {
    //
    setImageFiles([])
    setImageChanges(createEmptyProductImageChanges())
    if (!open) resetFlow()
  }, [open, product?.id, resetFlow])

  function handleClose() {
    //
    if (isPending) return
    setImageFiles([])
    setImageChanges(createEmptyProductImageChanges())
    resetFlow()
    onClose()
  }

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
      <Form layout="vertical" component="div" className="u-mt-4">
        <FormSection>
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
          <ProductPricingFields
            t={t}
            control={control}
            errors={errors}
            currency={priceCurrency}
            retailUzs={retailUzs}
            wholesaleUzs={wholesaleUzs}
            retailUsd={retailUsd}
            wholesaleUsd={wholesaleUsd}
            onCurrencyChange={handleCurrencyChange}
          />
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
        </FormSection>
      </Form>
    </AppModal>
  )
}
