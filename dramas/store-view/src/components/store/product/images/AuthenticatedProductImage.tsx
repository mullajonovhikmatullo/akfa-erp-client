
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
}

export function AuthenticatedProductImage({
  url,
  alt,
  width = 44,
  height = 44,
  borderRadius = 6,
  objectFit = 'cover',
  className = '',
}: AuthenticatedProductImageProps) {
  //
  const { rootRef, visible, objectUrl, failed } = useProductImageObjectUrl(url)
  const preserveWholeImage = objectFit === 'contain' || objectFit === 'scale-down'
  const dimensionClass = `product-image-frame--${String(width).replace('%', 'pct')}-${String(height).replace('%', 'pct')}`

  return (
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
        <i className="icons-image product-image-frame__placeholder" aria-hidden />
      )}
    </div>
  )
}
