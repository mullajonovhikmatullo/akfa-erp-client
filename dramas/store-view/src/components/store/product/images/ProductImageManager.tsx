import { useEffect, useMemo, useState } from 'react'
import { Button, Popconfirm, Progress, Tooltip, Upload } from 'antd'

import { toast } from 'sonner'
import { useProductImagesList } from '../hooks/useProductImagesList'
import { AuthenticatedProductImage } from './AuthenticatedProductImage'
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_COUNT,
  type Translate,
  validateProductImageFile,
} from './image-utils'
import { PendingProductImages } from './PendingProductImages'
import { ProductImageSkeleton } from './ProductImageSkeleton'
import type { ProductImageChanges } from './product-image-changes'

interface ProductImageManagerProps {
  productId: string
  productName: string
  t: Translate
  pendingFiles: File[]
  onPendingFilesChange: (files: File[]) => void
  changes: ProductImageChanges
  onChangesChange: (changes: ProductImageChanges) => void
  uploading: boolean
  uploadProgress: number
}

export function ProductImageManager({
  productId,
  productName,
  t,
  pendingFiles,
  onPendingFilesChange,
  changes,
  onChangesChange,
  uploading,
  uploadProgress,
}: ProductImageManagerProps) {
  //
  const { data: images = [], isLoading } = useProductImagesList(productId)

  const baseImages = useMemo(
    () => [...images].sort((left, right) => left.sortOrder - right.sortOrder),
    [images],
  )
  const deletedIds = useMemo(() => new Set(changes.deletedImageIds), [changes.deletedImageIds])
  const replacements = useMemo(
    () => new Map(changes.replacements.map((replacement) => [replacement.imageId, replacement.file])),
    [changes.replacements],
  )
  const visibleImages = useMemo(() => {
    //
    const active = baseImages.filter((image) => !deletedIds.has(image.id))
    if (!changes.orderedImageIds) return active

    const byId = new Map(active.map((image) => [image.id, image]))
    const ordered = changes.orderedImageIds
      .map((id) => byId.get(id))
      .filter((image): image is (typeof active)[number] => Boolean(image))
    const orderedIds = new Set(ordered.map((image) => image.id))
    return [...ordered, ...active.filter((image) => !orderedIds.has(image.id))]
  }, [baseImages, changes.orderedImageIds, deletedIds])

  const effectivePrimaryId =
    changes.primaryImageId ??
    visibleImages.find((image) => image.isPrimary)?.id ??
    visibleImages[0]?.id ??
    null

  const handlePrimary = (imageId: string) => {
    //
    onChangesChange({ ...changes, primaryImageId: imageId })
  }

  const handleDelete = (imageId: string) => {
    //
    const nextImages = visibleImages.filter((image) => image.id !== imageId)
    const deletingPrimary = effectivePrimaryId === imageId
    onChangesChange({
      ...changes,
      deletedImageIds: [...new Set([...changes.deletedImageIds, imageId])],
      replacements: changes.replacements.filter((replacement) => replacement.imageId !== imageId),
      orderedImageIds: nextImages.map((image) => image.id),
      primaryImageId: deletingPrimary
        ? nextImages[0]?.id
        : changes.primaryImageId,
    })
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    //
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= visibleImages.length) return
    const orderedIds = visibleImages.map((image) => image.id)
    ;[orderedIds[index], orderedIds[targetIndex]] = [orderedIds[targetIndex]!, orderedIds[index]!]
    onChangesChange({ ...changes, orderedImageIds: orderedIds })
  }

  const handleReplace = (imageId: string, file: File) => {
    //
    const validationError = validateProductImageFile(file, t)
    if (validationError) {
      toast.error(validationError)
      return
    }

    onChangesChange({
      ...changes,
      replacements: [
        ...changes.replacements.filter((replacement) => replacement.imageId !== imageId),
        { imageId, file },
      ],
    })
  }

  const remaining = Math.max(0, PRODUCT_IMAGE_MAX_COUNT - visibleImages.length)
  const existingSlots = visibleImages.map((image, index) => {
    //
    const replacement = replacements.get(image.id)
    const isPrimary = effectivePrimaryId === image.id

    return (
      <div key={image.id} className={`product-image-tile${isPrimary ? ' product-image-tile--primary' : ''}`}>
        {replacement ? (
          <LocalFilePreview file={replacement} alt={`${productName} - ${index + 1}`} />
        ) : (
          <AuthenticatedProductImage
            url={image.thumbnailUrl}
            alt={`${productName} - ${index + 1}`}
            width="100%"
            height="auto"
            borderRadius={0}
            className="u-aspect-square u-border-0"
          />
        )}
        <div className="u-box-border u-h-72 u-p-6">
          <div
            title={replacement?.name ?? image.originalFilename}
            className="u-text-muted u-fs-10-5 u-min-h-16 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap"
          >
            {replacement?.name ?? image.originalFilename}
          </div>
          {isPrimary ? (
            <div className="u-items-center u-text-warning u-flex u-fs-10-5 u-fw-700 u-gap-3">
              <i className="icons-favourite icon-size-11" />
              {t('productImages.primary')}
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => handlePrimary(image.id)}
              className="u-bg-transparent u-border-0 u-text-primary u-cursor-pointer u-fs-10-5 u-fw-600 u-min-h-16 u-p-0"
            >
              {t('productImages.setPrimary')}
            </button>
          )}
          <div className="u-grid u-gap-1 u-grid-cols-4 u-mt-4">
            <Tooltip title={t('productImages.moveLeft')}>
              <Button
                type="text"
                size="small"
                aria-label={t('productImages.moveLeft')}
                icon={<i className="icons-arrow-left icon-size-14" />}
                disabled={uploading || index === 0}
                onClick={() => handleMove(index, -1)}
              />
            </Tooltip>
            <Tooltip title={t('productImages.moveRight')}>
              <Button
                type="text"
                size="small"
                aria-label={t('productImages.moveRight')}
                icon={<i className="icons-arrow-right icon-size-14" />}
                disabled={uploading || index === visibleImages.length - 1}
                onClick={() => handleMove(index, 1)}
              />
            </Tooltip>
            <Upload
              accept={PRODUCT_IMAGE_ACCEPT}
              maxCount={1}
              showUploadList={false}
              disabled={uploading}
              beforeUpload={(file) => {
                //
                handleReplace(image.id, file)
                return Upload.LIST_IGNORE
              }}
            >
              <Tooltip title={t('productImages.replace')}>
                <Button
                  type="text"
                  size="small"
                  aria-label={t('productImages.replace')}
                  icon={<i className="icons-reload icon-size-14" />}
                  disabled={uploading}
                />
              </Tooltip>
            </Upload>
            <Popconfirm
              title={t('productImages.deleteConfirm')}
              okText={t('common.yesDelete')}
              cancelText={t('common.cancel')}
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(image.id)}
            >
              <Tooltip title={t('productImages.delete')}>
                <Button
                  type="text"
                  size="small"
                  danger
                  aria-label={t('productImages.delete')}
                  icon={<i className="icons-trash icon-size-14" />}
                  disabled={uploading}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      </div>
    )
  })

  return (
    <section className="u-border-t-default u-mt-6 u-pt-16">
      <div className="u-items-baseline u-flex u-gap-12 u-justify-between u-mb-10">
        <div className="u-fs-13 u-fw-700">{t('productImages.title')}</div>
        <span className="u-text-muted u-fs-11-5 u-numeric-tabular">
          {isLoading ? '-' : visibleImages.length + pendingFiles.length}/{PRODUCT_IMAGE_MAX_COUNT}
        </span>
      </div>

      <PendingProductImages
        t={t}
        files={pendingFiles}
        onChange={onPendingFilesChange}
        maximum={isLoading ? 0 : remaining}
        totalSlots={PRODUCT_IMAGE_MAX_COUNT}
        leadingSlots={existingSlots}
        loading={isLoading}
        disabled={uploading}
        markFirstPrimary={!effectivePrimaryId}
      />
      {uploading ? <Progress percent={uploadProgress} size="small" className="u-mt-10" /> : null}
    </section>
  )
}

function LocalFilePreview({ file, alt }: { file: File; alt: string }) {
  //
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    //
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="u-aspect-square u-bg-surface-2 u-w-full">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={alt}
          draggable={false}
          className="u-block u-h-full u-object-contain u-w-full"
        />
      ) : (
        <ProductImageSkeleton borderRadius={0} />
      )}
    </div>
  )
}
