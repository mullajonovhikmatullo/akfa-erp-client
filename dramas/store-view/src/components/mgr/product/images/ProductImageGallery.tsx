import { useEffect, useMemo, useState } from 'react'
import { ImageSquareIcon, StarIcon } from '@phosphor-icons/react'
import type { ProductImage } from '@store/store-stub'
import { AuthenticatedProductImage } from './AuthenticatedProductImage'
import type { Translate } from './image-utils'
import { ProductImageSkeleton } from './ProductImageSkeleton'

interface ProductImageGalleryProps {
  images?: ProductImage[]
  productName: string
  t: Translate
  loading?: boolean
}

const MAX_PRODUCT_IMAGES = 5

export function ProductImageGallery({
  images = [],
  productName,
  t,
  loading = false,
}: ProductImageGalleryProps) {
  //
  const orderedImages = useMemo(
    () => [...images].sort((left, right) => left.sortOrder - right.sortOrder).slice(0, MAX_PRODUCT_IMAGES),
    [images],
  )
  const primaryId = orderedImages.find((image) => image.isPrimary)?.id ?? orderedImages[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(primaryId)

  useEffect(() => setSelectedId(primaryId), [primaryId])

  const selected = orderedImages.find((image) => image.id === selectedId) ?? orderedImages[0]

  return (
    <div style={{ padding: '16px 24px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--surface-1)',
          color: 'var(--ink-3)',
        }}
      >
        {loading ? (
          <ProductImageSkeleton borderRadius={0} />
        ) : selected ? (
          <AuthenticatedProductImage
            url={selected.url}
            alt={productName}
            width="100%"
            height="100%"
            borderRadius={0}
            objectFit="contain"
            style={{ border: 0, background: 'var(--surface-1)' }}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <ImageSquareIcon size={36} weight="duotone" />
            <div style={{ marginTop: 5, fontSize: 12 }}>{t('productImages.empty')}</div>
          </div>
        )}
        {!loading && selected?.isPrimary ? (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 7px',
              borderRadius: 5,
              background: 'rgba(0, 0, 0, 0.68)',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 700,
            }}
          >
            <StarIcon size={11} weight="fill" />
            {t('productImages.primary')}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${MAX_PRODUCT_IMAGES}, minmax(0, 1fr))`,
          gap: 8,
          marginTop: 8,
        }}
      >
        {Array.from({ length: MAX_PRODUCT_IMAGES }, (_, index) => {
          //
          if (loading) {
            return (
              <div key={`loading-${index}`} style={{ aspectRatio: '1', minWidth: 0 }}>
                <ProductImageSkeleton />
              </div>
            )
          }

          const image = orderedImages[index]
          if (!image) {
            return (
              <div
                key={`empty-${index}`}
                aria-hidden
                style={{
                  aspectRatio: '1',
                  minWidth: 0,
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px dashed var(--border)',
                  borderRadius: 6,
                  background: 'var(--surface-1)',
                  color: 'var(--ink-4)',
                }}
              >
                <ImageSquareIcon size={20} weight="duotone" />
              </div>
            )
          }

          return (
            <button
              key={image.id}
              type="button"
              aria-label={`${productName} ${index + 1}`}
              aria-pressed={image.id === selected?.id}
              onClick={() => setSelectedId(image.id)}
              style={{
                aspectRatio: '1',
                minWidth: 0,
                padding: 0,
                overflow: 'hidden',
                border: image.id === selected?.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--surface-1)',
                cursor: 'pointer',
              }}
            >
              <AuthenticatedProductImage
                url={image.thumbnailUrl}
                alt={`${productName} ${index + 1}`}
                width="100%"
                height="100%"
                borderRadius={0}
                style={{ border: 0 }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
