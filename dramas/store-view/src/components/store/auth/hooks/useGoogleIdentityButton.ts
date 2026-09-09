import { useEffect, useRef, useState } from 'react'
import { loadGoogleIdentity } from '../lib/google-identity'

interface UseGoogleIdentityButtonOptions {
  clientId: string | null | undefined
  locale: string
  disabled: boolean
  onCredential: (credential: string) => void
}

export function useGoogleIdentityButton({ clientId, locale, disabled, onCredential }: UseGoogleIdentityButtonOptions) {
  //
  const buttonRef = useRef<HTMLDivElement>(null)
  const current = useRef({ disabled, onCredential })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    //
    current.current = { disabled, onCredential }
  }, [disabled, onCredential])

  useEffect(() => {
    //
    const element = buttonRef.current
    setReady(false)
    setFailed(false)
    if (!clientId || !element) return

    let active = true
    let observer: ResizeObserver | undefined
    let frame = 0
    let previousWidth = 0
    loadGoogleIdentity().then((identity) => {
      //
      if (!active) return
      identity.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          //
          if (active && !current.current.disabled && credential) current.current.onCredential(credential)
        },
        auto_select: false,
        ux_mode: 'popup',
        use_fedcm_for_button: true,
        button_auto_select: false,
      })
      const render = () => {
        //
        if (!active) return
        const width = Math.min(400, Math.floor(element.getBoundingClientRect().width))
        if (!width || width === previousWidth) return
        previousWidth = width
        element.replaceChildren()
        identity.renderButton(element, {
          type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
          shape: 'rectangular', logo_alignment: 'left', width, locale,
        })
        setReady(true)
      }
      render()
      observer = new ResizeObserver(() => {
        //
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(render)
      })
      observer.observe(element)
    }).catch(() => {
      //
      if (active) setFailed(true)
    })

    return () => {
      //
      active = false
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
      element.replaceChildren()
    }
  }, [clientId, locale, attempt])

  return { buttonRef, ready, failed, retry: () => setAttempt((value) => value + 1) }
}
