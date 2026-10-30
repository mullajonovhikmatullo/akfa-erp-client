import { useEffect, useSyncExternalStore } from 'react'
import { useAppStore } from '@/store/AppStore.tsx'

const QUERY = '(prefers-reduced-motion: reduce)'

const subscribe = (callback: () => void) => {
  //
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

const systemPrefersReduced = () => window.matchMedia(QUERY).matches

export const useReducedMotion = (): boolean => {
  //
  const { state } = useAppStore()
  const system = useSyncExternalStore(subscribe, systemPrefersReduced, () => false)
  if (state.settings.motion === 'reduce') return true
  if (state.settings.motion === 'full') return false
  return system
}

export const useMotionAttribute = () => {
  //
  const reduce = useReducedMotion()
  useEffect(() => {
    document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'
  }, [reduce])
}
