import { Alert, Progress } from 'antd'
import type { Product } from '@store/store-stub'
import { PendingProductImages } from '../../images/PendingProductImages'
import { ProductImageManager } from '../../images/ProductImageManager'
import { PRODUCT_IMAGE_MAX_COUNT } from '../../images/image-utils'
import type { ProductImageChanges } from '../../images/product-image-changes'

interface ProductImagesSectionProps {
  t: (key: string) => string
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
          <Alert type="error" showIcon title={t('productImages.uploadError')} description={uploadError} style={{ marginBottom: 10 }} />
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
    <section style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{t('productImages.title')}</div>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
          {files.length}/{PRODUCT_IMAGE_MAX_COUNT}
        </span>
      </div>
      {uploadError ? (
        <Alert type="error" showIcon title={t('productImages.createdUploadRetry')} description={uploadError} style={{ marginBottom: 10 }} />
      ) : null}
      <PendingProductImages t={t} files={files} onChange={onFilesChange} disabled={isPending} />
      {isUploading ? <Progress percent={uploadProgress} size="small" style={{ marginTop: 10 }} /> : null}
    </section>
  )
}
