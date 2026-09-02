import type { CSSProperties } from 'react'
import { ImageSquareIcon } from '@phosphor-icons/react'
import { useProductImageObjectUrl } from '../hooks/useProductImageObjectUrl'
import { ProductImageSkeleton } from './ProductImageSkeleton'

interface AuthenticatedProductImageProps {
  url?: string | null
  alt: string
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  borderRadius?: number
  objectFit?: CSSProperties['objectFit']
  style?: CSSProperties
}

export function AuthenticatedProductImage({
  url,
  alt,
  width = 44,
  height = 44,
  borderRadius = 6,
  objectFit = 'cover',
  style,
}: AuthenticatedProductImageProps) {
  //
  const { rootRef, visible, objectUrl, failed } = useProductImageObjectUrl(url)

  const frameStyle: CSSProperties = {
    width,
    height,
    flex: '0 0 auto',
    overflow: 'hidden',
    borderRadius,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--ink-4)',
    ...style,
  }
  const preserveWholeImage = objectFit === 'contain' || objectFit === 'scale-down'

  return (
    <div ref={rootRef} style={frameStyle} role="img" aria-label={alt}>
      {objectUrl && !failed ? (
        <img
          src={objectUrl}
          alt={alt}
          draggable={false}
          style={{
            display: 'block',
            width: preserveWholeImage ? 'auto' : '100%',
            height: preserveWholeImage ? 'auto' : '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit,
            objectPosition: 'center',
          }}
        />
      ) : visible && url && !failed ? (
        <ProductImageSkeleton borderRadius={borderRadius} />
      ) : (
        <ImageSquareIcon size={Math.min(typeof width === 'number' ? width * 0.48 : 28, 30)} weight="duotone" aria-hidden />
      )}
    </div>
  )
}
