import { StoreIcon } from '@store/store-shared/ui/store-icon'

import { useProductImageObjectUrl } from '../hooks/useProductImageObjectUrl'
import { ProductImageSkeleton } from './ProductImageSkeleton'

interface AuthenticatedProductImageProps {
  url?: string | null
  alt: string
  width?: 34 | 40 | 42 | 44 | '100%'
  height?: 34 | 40 | 42 | 44 | 'auto' | '100%'
  borderRadius?: 0 | 6
  objectFit?: 'contain' | 'cover' | 'scale-down'
  className?: string
  discountPercent?: number
}

export function AuthenticatedProductImage({
  url,
  alt,
  width = 44,
  height = 44,
  borderRadius = 6,
  objectFit = 'cover',
  className = '',
  discountPercent = 0,
}: AuthenticatedProductImageProps) {
  //
  const { rootRef, visible, objectUrl, failed } = useProductImageObjectUrl(url)
  const preserveWholeImage = objectFit === 'contain' || objectFit === 'scale-down'
  const dimensionClass = `product-image-frame--${String(width).replace('%', 'pct')}-${String(height).replace('%', 'pct')}`

  const frame = (
    <div
      ref={rootRef}
      className={`product-image-frame ${dimensionClass} product-image-frame--radius-${borderRadius} ${className}`}
      role="img"
      aria-label={alt}
    >
      {objectUrl && !failed ? (
        <img
          src={objectUrl}
          alt={alt}
          draggable={false}
          className={`product-image-frame__image product-image-frame__image--${objectFit}${preserveWholeImage ? ' product-image-frame__image--preserve' : ''}`}
        />
      ) : visible && url && !failed ? (
        <ProductImageSkeleton borderRadius={borderRadius} />
      ) : (
        <StoreIcon name="image" size={16} className="product-image-frame__placeholder" />
      )}
    </div>
  )

  if (discountPercent <= 0) return frame
  return (
    <div className="product-image-discount">
      {frame}
      <ProductDiscountBadge percent={discountPercent} />
    </div>
  )
}

export function ProductDiscountBadge({ percent, large = false }: { percent: number; large?: boolean }) {
  //
  return (
    <span className={`product-image-discount__badge${large ? ' product-image-discount__badge--large' : ''}`}>
      −{percent.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%
    </span>
  )
}
