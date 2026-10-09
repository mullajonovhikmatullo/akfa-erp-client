import { useEffect, useRef } from 'react'

const DESIGN_WIDTH = 1672
const DESIGN_HEIGHT = 844
const MIN_SCALE = 0.8
const MAX_SCALE = 2.2
const COMPACT_WIDTH = 600

export function useGlassScale<T extends HTMLElement>() {
  //
  const ref = useRef<T>(null)

  useEffect(() => {
    //
    const node = ref.current
    if (!node) return undefined
    const update = () => {
      //
      const cover = Math.max(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT)
      const scale = window.innerWidth <= COMPACT_WIDTH ? 1 : Math.min(MAX_SCALE, Math.max(MIN_SCALE, cover))
      node.style.setProperty('--k', String(scale))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return ref
}
