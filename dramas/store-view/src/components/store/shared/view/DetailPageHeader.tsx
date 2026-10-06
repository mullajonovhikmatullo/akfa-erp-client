import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import type { ReactNode } from 'react'
import { Button, Tooltip } from 'antd'

interface DetailPageHeaderProps {
  t: StoreTranslator
  backLabel: string
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  refreshing: boolean
  onBack: () => void
  onRefresh: () => void
}

export function DetailPageHeader({ t, backLabel, title, meta, actions, refreshing, onBack, onRefresh }: DetailPageHeaderProps) {
  //
  return (
    <div className="detail-page-head">
      <Button type="text" size="small" icon={<StoreIcon name="arrow-left" size={16} />} onClick={onBack} className="detail-page-head__back">
        {backLabel}
      </Button>
      <div className="detail-page-head__row">
        <div className="u-min-w-0">
          <h1>{title}</h1>
          {meta ? <div className="detail-page-head__meta">{meta}</div> : null}
        </div>
        <div className="u-flex u-flex-wrap u-gap-8">
          {actions}
          <Tooltip title={t('common.refresh')}>
            <Button icon={<StoreIcon name="reload" size={16} className={refreshing ? 'ph-icon-spin' : undefined} />} onClick={onRefresh} />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
