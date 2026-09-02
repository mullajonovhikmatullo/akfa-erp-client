import { Tooltip } from 'antd'
import type { ReactNode } from 'react'

interface EllipsisTextProps {
  children: ReactNode
  title?: ReactNode
  maxWidth?: 132 | 180 | 190 | '100%'
}

export function EllipsisText({ children, title, maxWidth = 180 }: EllipsisTextProps) {
  //
  const content = (
    <span className={`ellipsis-text ellipsis-text--${maxWidth === '100%' ? 'full' : maxWidth}`}>
      {children}
    </span>
  )

  return (
    <Tooltip title={title ?? children} mouseEnterDelay={0.4}>
      {content}
    </Tooltip>
  )
}
