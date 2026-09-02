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
      <label className="u-text-secondary u-block u-fs-12 u-fw-600 u-tracking-medium u-mb-6 u-text-uppercase">
        {label}{required ? <span className="u-text-danger-bright u-ml-2">*</span> : null}
      </label>
      {children}
      {error ? <div className="u-text-danger-bright u-fs-12 u-mt-4">{error}</div> : null}
    </div>
  )
}
