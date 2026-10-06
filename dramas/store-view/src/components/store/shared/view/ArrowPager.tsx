import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'

interface ArrowPagerProps {
  t: StoreTranslator
  page: number
  pageSize: number
  total: number
  loading?: boolean
  onChange: (page: number) => void
}

export function ArrowPager({ t, page, pageSize, total, loading = false, onChange }: ArrowPagerProps) {
  //
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="arrow-pager">
      <span className="arrow-pager__range num">
        {from}–{to} / {total}
      </span>
      <div className="arrow-pager__controls">
        <Button
          size="small"
          shape="circle"
          aria-label={t('common.prevPage')}
          icon={<StoreIcon name="chevron-left" size={14} />}
          disabled={page <= 1 || loading}
          onClick={() => onChange(page - 1)}
        />
        <span className="arrow-pager__page num">
          <strong>{page}</strong> / {lastPage}
        </span>
        <Button
          size="small"
          shape="circle"
          aria-label={t('common.nextPage')}
          icon={<StoreIcon name="chevron-right" size={14} />}
          disabled={page >= lastPage || loading}
          onClick={() => onChange(page + 1)}
        />
      </div>
    </div>
  )
}
