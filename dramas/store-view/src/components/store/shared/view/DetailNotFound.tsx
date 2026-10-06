import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Button } from 'antd'

interface DetailNotFoundProps {
  title: string
  hint: string
  backLabel: string
  onBack: () => void
}

export function DetailNotFound({ title, hint, backLabel, onBack }: DetailNotFoundProps) {
  //
  return (
    <div className="card detail-not-found">
      <StoreIcon name="warning" size={36} className="u-text-quiet" />
      <h2>{title}</h2>
      <p>{hint}</p>
      <Button icon={<StoreIcon name="arrow-left" size={16} />} onClick={onBack}>{backLabel}</Button>
    </div>
  )
}
