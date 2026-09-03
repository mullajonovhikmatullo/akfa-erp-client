import { useEffect, useState, type ReactNode } from 'react'
import { Button, Tooltip, Upload } from 'antd'

import { toast } from 'sonner'
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_COUNT,
  productImageFileKey,
  type Translate,
  validateProductImageFile,
} from './image-utils'
import { ProductImageSkeleton } from './ProductImageSkeleton'

interface PendingProductImagesProps {
  t: Translate
  files: File[]
  onChange: (files: File[]) => void
  maximum?: number
  totalSlots?: number
  leadingSlots?: ReactNode[]
  loading?: boolean
  disabled?: boolean
  markFirstPrimary?: boolean
}

export function PendingProductImages({
  t,
  files,
  onChange,
  maximum = PRODUCT_IMAGE_MAX_COUNT,
  totalSlots = PRODUCT_IMAGE_MAX_COUNT,
  leadingSlots = [],
  loading = false,
  disabled = false,
  markFirstPrimary = true,
}: PendingProductImagesProps) {
  //
  const addFiles = (incoming: File[]) => {
    //
    const known = new Set(files.map(productImageFileKey))
    const valid: File[] = []

    for (const file of incoming) {
      const validationError = validateProductImageFile(file, t)
      if (validationError) {
        toast.error(validationError)
        continue
      }
      const key = productImageFileKey(file)
      if (!known.has(key)) {
        known.add(key)
        valid.push(file)
      }
    }

    const available = Math.max(0, maximum - files.length)
    if (valid.length > available) toast.error(t('productImages.maxCount'))
    if (available > 0) onChange([...files, ...valid.slice(0, available)])
  }

  const move = (index: number, direction: -1 | 1) => {
    //
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= files.length) return
    const next = [...files]
    ;[next[index], next[nextIndex]] = [next[nextIndex]!, next[index]!]
    onChange(next)
  }

  const occupiedSlots = leadingSlots.length + files.length
  const emptySlots = Math.max(0, totalSlots - occupiedSlots)
  const canAddFiles = !loading && !disabled && files.length < maximum

  return (
    <div>
      <div className={`pending-product-images pending-product-images--slots-${totalSlots}`}>
        {loading
          ? Array.from({ length: totalSlots }, (_, index) => (
              <ProductImageLoadingSlot key={`image-loading-${index}`} />
            ))
          : (
            <>
              {leadingSlots}
              {files.map((file, index) => (
                <PendingImageTile
                  key={productImageFileKey(file)}
                  file={file}
                  index={index}
                  total={files.length}
                  t={t}
                  disabled={disabled}
                  isPrimary={markFirstPrimary && index === 0}
                  onMove={move}
                  onDelete={() => onChange(files.filter((candidate) => candidate !== file))}
                />
              ))}
              {Array.from({ length: emptySlots }, (_, index) => (
                <EmptyProductImageSlot key={`image-empty-${index}`} />
              ))}
            </>
          )}
      </div>

      {!loading && maximum > files.length ? (
        <Upload.Dragger
          accept={PRODUCT_IMAGE_ACCEPT}
          multiple
          disabled={!canAddFiles}
          showUploadList={false}
          beforeUpload={(file, fileList) => {
            //
            if (file.uid === fileList[0]?.uid) addFiles([...fileList])
            return Upload.LIST_IGNORE
          }}
          className="u-bg-surface-2 u-mt-10 u-p-4-8"
        >
          <i className="icons-upload icon-size-24 u-text-primary" />
          <div className="u-fs-13 u-fw-600 u-mt-5">{t('productImages.add')}</div>
          <div className="u-text-muted u-fs-11-5 u-mt-2">{t('productImages.hint')}</div>
        </Upload.Dragger>
      ) : null}
    </div>
  )
}

function ProductImageLoadingSlot() {
  //
  return (
    <div
      className="u-bg-surface-1 u-rounded-6 u-border-default u-min-w-0 u-overflow-hidden"
    >
      <div className="u-aspect-square u-w-full">
        <ProductImageSkeleton borderRadius={0} />
      </div>
      <div className="u-box-border u-grid u-gap-6 u-h-72 u-p-6">
        <div className="u-h-12">
          <ProductImageSkeleton borderRadius={3} />
        </div>
        <div className="u-h-11 u-w-62pct">
          <ProductImageSkeleton borderRadius={3} />
        </div>
        <div className="u-h-24">
          <ProductImageSkeleton borderRadius={4} />
        </div>
      </div>
    </div>
  )
}

function EmptyProductImageSlot() {
  //
  return (
    <div
      aria-hidden
      className="u-bg-surface-1 u-rounded-6 u-border-dashed u-text-quiet u-min-w-0 u-overflow-hidden"
    >
      <div
        className="u-aspect-square u-bg-surface-2 u-grid u-place-center u-w-full"
      >
        <i className="icons-image icon-size-28" />
      </div>
      <div className="u-h-72" />
    </div>
  )
}

function PendingImageTile({
  file,
  index,
  total,
  t,
  disabled,
  isPrimary,
  onMove,
  onDelete,
}: {
  file: File
  index: number
  total: number
  t: Translate
  disabled: boolean
  isPrimary: boolean
  onMove: (index: number, direction: -1 | 1) => void
  onDelete: () => void
}) {
  //
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    //
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className={`product-image-tile${isPrimary ? ' product-image-tile--primary' : ''}`}>
      <div className="u-aspect-square u-bg-surface-2 u-grid u-place-center">
        {previewUrl ? (
          <img src={previewUrl} alt={file.name} className="u-h-full u-object-contain u-w-full" />
        ) : (
          <i className="icons-image icon-size-30" />
        )}
      </div>
      <div className="u-box-border u-h-72 u-p-6">
        <div title={file.name} className="u-fs-11 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">
          {file.name}
        </div>
        <div className="u-min-h-16">
          {isPrimary ? (
            <div className="u-items-center u-text-warning u-flex u-fs-10-5 u-fw-600 u-gap-3 u-mt-3">
              <i className="icons-favourite icon-size-11" />
              {t('productImages.primary')}
            </div>
          ) : null}
        </div>
        <div className="u-flex u-gap-2 u-justify-between u-mt-4">
          <Tooltip title={t('productImages.moveLeft')}>
            <Button
              type="text"
              size="small"
              aria-label={t('productImages.moveLeft')}
              icon={<i className="icons-arrow-left icon-size-15" />}
              disabled={disabled || index === 0}
              onClick={() => onMove(index, -1)}
            />
          </Tooltip>
          <Tooltip title={t('productImages.moveRight')}>
            <Button
              type="text"
              size="small"
              aria-label={t('productImages.moveRight')}
              icon={<i className="icons-arrow-right icon-size-15" />}
              disabled={disabled || index === total - 1}
              onClick={() => onMove(index, 1)}
            />
          </Tooltip>
          <Tooltip title={t('productImages.delete')}>
            <Button
              type="text"
              size="small"
              danger
              aria-label={t('productImages.delete')}
              icon={<i className="icons-trash icon-size-15" />}
              disabled={disabled}
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
