import { useEffect, useState, type ReactNode } from 'react'
import { Button, Tooltip, Upload } from 'antd'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImageSquareIcon,
  StarIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react'
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
  const addFiles = (incoming: File[]) => {
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${totalSlots}, minmax(112px, 1fr))`,
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 2,
        }}
      >
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
            if (file.uid === fileList[0]?.uid) addFiles(fileList as unknown as File[])
            return Upload.LIST_IGNORE
          }}
          style={{ marginTop: 10, padding: '4px 8px', background: 'var(--surface-2)' }}
        >
          <UploadSimpleIcon size={24} weight="duotone" style={{ color: 'var(--primary)' }} />
          <div style={{ marginTop: 5, fontSize: 13, fontWeight: 600 }}>{t('productImages.add')}</div>
          <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--ink-3)' }}>{t('productImages.hint')}</div>
        </Upload.Dragger>
      ) : null}
    </div>
  )
}

function ProductImageLoadingSlot() {
  return (
    <div
      style={{
        minWidth: 0,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: 6,
        background: 'var(--surface-1)',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
        <ProductImageSkeleton borderRadius={0} />
      </div>
      <div style={{ height: 72, padding: 6, boxSizing: 'border-box', display: 'grid', gap: 6 }}>
        <div style={{ height: 12 }}>
          <ProductImageSkeleton borderRadius={3} />
        </div>
        <div style={{ width: '62%', height: 11 }}>
          <ProductImageSkeleton borderRadius={3} />
        </div>
        <div style={{ height: 24 }}>
          <ProductImageSkeleton borderRadius={4} />
        </div>
      </div>
    </div>
  )
}

function EmptyProductImageSlot() {
  return (
    <div
      aria-hidden
      style={{
        minWidth: 0,
        overflow: 'hidden',
        border: '1px dashed var(--border)',
        borderRadius: 6,
        background: 'var(--surface-1)',
        color: 'var(--ink-4)',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--surface-2)',
        }}
      >
        <ImageSquareIcon size={28} weight="duotone" />
      </div>
      <div style={{ height: 72 }} />
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div
      style={{
        minWidth: 0,
        overflow: 'hidden',
        border: isPrimary ? '1px solid var(--warning)' : '1px solid var(--border)',
        borderRadius: 6,
        background: 'var(--surface-1)',
      }}
    >
      <div style={{ aspectRatio: '1 / 1', background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
        {previewUrl ? (
          <img src={previewUrl} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <ImageSquareIcon size={30} weight="duotone" />
        )}
      </div>
      <div style={{ height: 72, padding: 6, boxSizing: 'border-box' }}>
        <div title={file.name} style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        <div style={{ minHeight: 16 }}>
          {isPrimary ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3, color: 'var(--warning)', fontSize: 10.5, fontWeight: 600 }}>
              <StarIcon size={11} weight="fill" />
              {t('productImages.primary')}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 2, marginTop: 4 }}>
          <Tooltip title={t('productImages.moveLeft')}>
            <Button
              type="text"
              size="small"
              aria-label={t('productImages.moveLeft')}
              icon={<ArrowLeftIcon size={15} />}
              disabled={disabled || index === 0}
              onClick={() => onMove(index, -1)}
            />
          </Tooltip>
          <Tooltip title={t('productImages.moveRight')}>
            <Button
              type="text"
              size="small"
              aria-label={t('productImages.moveRight')}
              icon={<ArrowRightIcon size={15} />}
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
              icon={<TrashIcon size={15} />}
              disabled={disabled}
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
