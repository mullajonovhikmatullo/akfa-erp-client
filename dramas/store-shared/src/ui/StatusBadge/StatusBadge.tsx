import clsx from 'clsx'
import type { ReactNode } from 'react'

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'muted'

interface StatusBadgeProps {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}

export function StatusBadge({ tone = 'muted', dot, children }: StatusBadgeProps) {
  //
  return (
    <span className={clsx('tagpill', tone)}>
      {dot && (
        <span
          className="u-bg-current u-rounded-full u-inline-block u-h-6 u-w-6"
        />
      )}
      {children}
    </span>
  )
}
