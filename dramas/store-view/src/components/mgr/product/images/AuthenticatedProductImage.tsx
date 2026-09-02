import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ImageSquareIcon } from '@phosphor-icons/react'
import { ProductSeekApi } from '@store/store-stub'
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
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root || !url) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [url])

  useEffect(() => {
    setBlobUrl(null)
    setFailed(false)
    if (!visible || !url) return

    let active = true
    let objectUrl: string | null = null
    ProductSeekApi.downloadProductImage(url)
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url, visible])

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
      {blobUrl && !failed ? (
        <img
          src={blobUrl}
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
