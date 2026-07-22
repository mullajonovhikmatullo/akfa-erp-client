import { EllipsisText } from '../EllipsisText/EllipsisText'
import { StatusBadge } from '../StatusBadge/StatusBadge'

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'muted'

interface BranchNameProps {
  name: string
  maxWidth?: number | string
  tone?: Tone
  as?: 'text' | 'badge'
}

const DEFAULT_BRANCH_NAME_MAX_WIDTH = 132

export function BranchName({ name, maxWidth = DEFAULT_BRANCH_NAME_MAX_WIDTH, tone = 'info', as = 'text' }: BranchNameProps) {
  //
  const content = <EllipsisText maxWidth={maxWidth}>{name}</EllipsisText>

  return as === 'badge' ? <StatusBadge tone={tone}>{content}</StatusBadge> : content
}
