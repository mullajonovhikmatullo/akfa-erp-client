import { useEffect, useMemo, useState } from 'react'

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
    <div className="u-bg-surface-2 u-border-b-default u-p-16-24-14">
      <div
        className="u-aspect-4-3 u-bg-surface-1 u-rounded-6 u-border-default u-text-muted u-grid u-overflow-hidden u-place-center u-relative u-w-full"
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
            className="u-bg-surface-1 u-border-0"
          />
        ) : (
          <div className="u-text-center">
            <i className="icons-image icon-size-36" />
            <div className="u-fs-12 u-mt-5">{t('productImages.empty')}</div>
          </div>
        )}
        {!loading && selected?.isPrimary ? (
          <div
            className="u-items-center u-bg-overlay u-rounded-5 u-text-white u-flex u-fs-10-5 u-fw-700 u-gap-4 u-left-8 u-p-4-7 u-absolute u-top-8"
          >
            <i className="icons-favourite icon-size-11" />
            {t('productImages.primary')}
          </div>
        ) : null}
      </div>

      <div className="product-image-gallery__thumbnails">
        {Array.from({ length: MAX_PRODUCT_IMAGES }, (_, index) => {
          //
          if (loading) {
            return (
              <div key={`loading-${index}`} className="u-aspect-square u-min-w-0">
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
                className="u-aspect-square u-bg-surface-1 u-rounded-6 u-border-dashed u-text-quiet u-grid u-min-w-0 u-place-center"
              >
                <i className="icons-image icon-size-20" />
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
              className={`product-image-gallery__thumbnail${image.id === selected?.id ? ' product-image-gallery__thumbnail--selected' : ''}`}
            >
              <AuthenticatedProductImage
                url={image.thumbnailUrl}
                alt={`${productName} ${index + 1}`}
                width="100%"
                height="100%"
                borderRadius={0}
                className="u-border-0"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
