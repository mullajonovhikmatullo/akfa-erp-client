import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui.tsx'

export const RestTimer = ({ seconds, nextLabel, onClose }: { seconds: number; nextLabel?: string; onClose: () => void }) => {
  //
  const [total, setTotal] = useState(seconds)
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000)
  const [left, setLeft] = useState(seconds)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setLeft(remaining)
      if (remaining === 0) {
        window.clearInterval(id)
        if ('vibrate' in navigator) navigator.vibrate?.([120, 80, 120])
        closeRef.current()
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [endsAt])

  const adjust = (delta: number) => {
    setEndsAt((current) => Math.max(Date.now() + 1000, current + delta * 1000))
    setTotal((current) => Math.max(5, current + delta))
  }

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = total === 0 ? 0 : left / total

  return (
    <div className="fixed inset-x-0 top-0 z-40 animate-rise px-3 pt-3" role="region" aria-label="Dam olish taymeri">
      <div className="glass mx-auto flex max-w-md items-center gap-4 rounded-3xl p-4 shadow-glow">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#rest-g)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-300 ease-linear"
            />
            <defs>
              <linearGradient id="rest-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a855f7" />
                <stop offset="1" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold tabular-nums" aria-live="off">
              {left}
            </span>
            <span className="text-[10px] tracking-widest text-fog uppercase">soniya</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-widest text-volt-3 uppercase">Dam oling</div>
          {nextLabel ? <div className="mt-1 truncate text-sm text-mist">Keyingi: {nextLabel}</div> : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => adjust(-15)}>
              −15 s
            </Button>
            <Button variant="secondary" size="sm" onClick={() => adjust(15)}>
              +15 s
            </Button>
          </div>
          <Button size="sm" className="mt-2 w-full" onClick={onClose}>
            Dam olishni tugatish
          </Button>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {left % 15 === 0 || left <= 5 ? `${left} soniya qoldi` : ''}
      </span>
    </div>
  )
}
