import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Button, Popconfirm } from 'antd'

interface CartBulkBarProps {
  t: StoreTranslator
  count: number
  onClearSelection: () => void
  onRemove: () => void
}

export function CartBulkBar({ t, count, onClearSelection, onRemove }: CartBulkBarProps) {
  //
  if (count === 0) return null

  return (
    <div className="cart-bulk-bar" role="status">
      <span>
        <strong>{count}</strong> {t('productPicker.selectedSuffix')}
      </span>
      <div className="u-flex u-gap-8">
        <Button size="small" type="text" onClick={onClearSelection}>
          {t('productPicker.clearSelection')}
        </Button>
        <Popconfirm
          title={t('productPicker.removeSelectedTitle')}
          okText={t('common.delete')}
          cancelText={t('common.cancel')}
          okButtonProps={{ danger: true }}
          onConfirm={onRemove}
        >
          <Button size="small" danger icon={<StoreIcon name="trash" size={14} />}>
            {t('productPicker.removeSelected')}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
