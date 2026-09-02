import { useCallback, useRef, useState } from 'react'

export function useAccordionHeight(isOpen: boolean) {
  //
  const [height, setHeight] = useState(0)
  const observerRef = useRef<ResizeObserver | null>(null)

  const ref = useCallback((element: HTMLDivElement | null) => {
    //
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!element) return

    const measure = () => setHeight(element.scrollHeight)
    measure()
    observerRef.current = new ResizeObserver(measure)
    observerRef.current.observe(element)
  }, [])

  return { ref, style: { height: isOpen ? height : 0 } }
}
