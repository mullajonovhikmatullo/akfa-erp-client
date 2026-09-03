import type { StoreTranslator } from '@store/store-i18n'
import { Alert, Progress } from 'antd'
import type { Product } from '@store/store-stub'
import { PendingProductImages } from '../../images/PendingProductImages'
import { ProductImageManager } from '../../images/ProductImageManager'
import { PRODUCT_IMAGE_MAX_COUNT } from '../../images/image-utils'
import type { ProductImageChanges } from '../../images/product-image-changes'

interface ProductImagesSectionProps {
  t: StoreTranslator
  product?: Product | null
  files: File[]
  changes: ProductImageChanges
  isEdit: boolean
  isPending: boolean
  isUploading: boolean
  uploadProgress: number
  uploadError: string | null
  onFilesChange: (files: File[]) => void
  onChangesChange: (changes: ProductImageChanges) => void
}

export function ProductImagesSection({
  t,
  product,
  files,
  changes,
  isEdit,
  isPending,
  isUploading,
  uploadProgress,
  uploadError,
  onFilesChange,
  onChangesChange,
}: ProductImagesSectionProps) {
  //
  if (isEdit && product) {
    return (
      <>
        {uploadError ? (
          <Alert type="error" showIcon title={t('productImages.uploadError')} description={uploadError} className="u-mb-10" />
        ) : null}
        <ProductImageManager
          productId={product.id}
          productName={product.name}
          t={t}
          pendingFiles={files}
          onPendingFilesChange={onFilesChange}
          changes={changes}
          onChangesChange={onChangesChange}
          uploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </>
    )
  }

  return (
    <section className="u-border-t-default u-mt-6 u-pt-16">
      <div className="u-items-baseline u-flex u-gap-12 u-justify-between u-mb-10">
        <div className="u-fs-13 u-fw-700">{t('productImages.title')}</div>
        <span className="u-text-muted u-fs-11-5 u-numeric-tabular">
          {files.length}/{PRODUCT_IMAGE_MAX_COUNT}
        </span>
      </div>
      {uploadError ? (
        <Alert type="error" showIcon title={t('productImages.createdUploadRetry')} description={uploadError} className="u-mb-10" />
      ) : null}
      <PendingProductImages t={t} files={files} onChange={onFilesChange} disabled={isPending} />
      {isUploading ? <Progress percent={uploadProgress} size="small" className="u-mt-10" /> : null}
    </section>
  )
}
