import { useEffect, useRef, useState } from 'react'
import { ProductSeekApi } from '@store/store-stub'

export function useProductImageObjectUrl(url?: string | null) {
  //
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

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
    setObjectUrl(null)
    setFailed(false)
    if (!visible || !url) return

    let active = true
    let nextObjectUrl: string | null = null
    ProductSeekApi.downloadProductImage(url)
      .then((blob) => {
        //
        if (!active) return
        nextObjectUrl = URL.createObjectURL(blob)
        setObjectUrl(nextObjectUrl)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      //
      active = false
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl)
    }
  }, [url, visible])

  return { rootRef, visible, objectUrl, failed }
}
