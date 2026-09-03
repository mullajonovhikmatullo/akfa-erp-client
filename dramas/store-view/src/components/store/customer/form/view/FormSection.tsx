import type { ReactNode } from 'react'

export function FormSection({ children }: { children: ReactNode }) {
  //
  return <div className="u-flex u-flex-col u-gap-12">{children}</div>
}
