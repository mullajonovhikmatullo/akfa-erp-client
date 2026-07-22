import type { ReactNode } from 'react'

interface ProfileFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function ProfileField({ label, error, required, children }: ProfileFieldProps) {
  //
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--ink-2)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}
