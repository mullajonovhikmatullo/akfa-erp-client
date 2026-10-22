import { flushSync } from 'react-dom'

const SWITCHING_CLASS = 'theme-switching'

export function runThemeTransition(update: () => void) {
  //
  if (typeof document === 'undefined') {
    update()
    return
  }

  const root = document.documentElement
  const apply = () => {
    //
    root.classList.add(SWITCHING_CLASS)
    flushSync(update)
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove(SWITCHING_CLASS)))
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion || typeof document.startViewTransition !== 'function') {
    apply()
    return
  }

  document.startViewTransition(apply)
}
