import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'

const IMAGE_CACHE_TIME = 1000 * 60 * 30

export function useProductImageObjectUrl(url?: string | null) {
  //
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const { queryKey, queryFn } = ProductSeekApi.fetch.downloadProductImage(url ?? '')
  const image = useQuery({
    queryKey,
    queryFn,
    enabled: visible && Boolean(url),
    staleTime: Infinity,
    gcTime: IMAGE_CACHE_TIME,
  })
  const blob = url ? image.data : undefined

  useEffect(() => {
    //
    const root = rootRef.current
    if (!root || !url) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        //
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { rootMargin: '160px' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [url])

  useEffect(() => {
    //
    if (!blob) {
      setObjectUrl(null)
      return
    }
    const nextObjectUrl = URL.createObjectURL(blob)
    setObjectUrl(nextObjectUrl)
    return () => URL.revokeObjectURL(nextObjectUrl)
  }, [blob])

  return { rootRef, visible: visible || Boolean(blob), objectUrl, failed: Boolean(url) && image.isError }
}
