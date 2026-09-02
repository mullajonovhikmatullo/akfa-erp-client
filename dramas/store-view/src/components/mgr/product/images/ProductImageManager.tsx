import { useEffect, useMemo, useState } from 'react'
import { Button, Popconfirm, Progress, Tooltip, Upload } from 'antd'
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon,
  TrashIcon,
} from '@phosphor-icons/react'
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
      <div
        key={image.id}
        style={{
          minWidth: 0,
          overflow: 'hidden',
          border: isPrimary ? '1px solid var(--warning)' : '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--surface-1)',
        }}
      >
        {replacement ? (
          <LocalFilePreview file={replacement} alt={`${productName} - ${index + 1}`} />
        ) : (
          <AuthenticatedProductImage
            url={image.thumbnailUrl}
            alt={`${productName} - ${index + 1}`}
            width="100%"
            height="auto"
            borderRadius={0}
            style={{ aspectRatio: '1 / 1', border: 0 }}
          />
        )}
        <div style={{ height: 72, padding: 6, boxSizing: 'border-box' }}>
          <div
            title={replacement?.name ?? image.originalFilename}
            style={{
              minHeight: 16,
              fontSize: 10.5,
              color: 'var(--ink-3)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {replacement?.name ?? image.originalFilename}
          </div>
          {isPrimary ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--warning)', fontSize: 10.5, fontWeight: 700 }}>
              <StarIcon size={11} weight="fill" />
              {t('productImages.primary')}
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => handlePrimary(image.id)}
              style={{
                minHeight: 16,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--primary)',
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('productImages.setPrimary')}
            </button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginTop: 4 }}>
            <Tooltip title={t('productImages.moveLeft')}>
              <Button
                type="text"
                size="small"
                aria-label={t('productImages.moveLeft')}
                icon={<ArrowLeftIcon size={14} />}
                disabled={uploading || index === 0}
                onClick={() => handleMove(index, -1)}
              />
            </Tooltip>
            <Tooltip title={t('productImages.moveRight')}>
              <Button
                type="text"
                size="small"
                aria-label={t('productImages.moveRight')}
                icon={<ArrowRightIcon size={14} />}
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
                  icon={<ArrowClockwiseIcon size={14} />}
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
                  icon={<TrashIcon size={14} />}
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
    <section style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{t('productImages.title')}</div>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
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
      {uploading ? <Progress percent={uploadProgress} size="small" style={{ marginTop: 10 }} /> : null}
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
    <div style={{ width: '100%', aspectRatio: '1 / 1', background: 'var(--surface-2)' }}>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={alt}
          draggable={false}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <ProductImageSkeleton borderRadius={0} />
      )}
    </div>
  )
}
