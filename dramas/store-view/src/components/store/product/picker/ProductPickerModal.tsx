import type { StoreTranslator } from '@store/store-i18n'
import { useMemo, useState } from 'react'
import { Button, Input, Modal, Select, Table } from 'antd'

import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { Product } from '@store/store-stub'
import { createProductPickerColumns } from './view/productPickerColumns'

interface ProductPickerModalProps {
  t: StoreTranslator
  open: boolean
  products: Product[]
  addedProductIds: Set<string>
  stockByProductId?: Map<string, number>
  requireStock?: boolean
  onClose: () => void
  onConfirm: (productIds: string[]) => void
}

const PAGE_SIZE = 8

export function ProductPickerModal({
  t,
  open,
  products,
  addedProductIds,
  stockByProductId,
  requireStock = false,
  onClose,
  onConfirm,
}: ProductPickerModalProps) {
  //
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    //
    const byId = new Map<string, string>()
    products.forEach((product) => {
      if (product.category) byId.set(product.category.id, product.category.name)
    })
    return [...byId].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label))
  }, [products])

  const rows = useMemo(() => {
    //
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      //
      if (categoryId && product.categoryId !== categoryId) return false
      if (!query) return true
      return [product.name, product.sku].some((value) => value?.toLowerCase().includes(query))
    })
  }, [categoryId, products, search])

  const isUnavailable = (product: Product) =>
    addedProductIds.has(product.id) || (requireStock && (stockByProductId?.get(product.id) ?? 0) <= 0)

  function reset() {
    //
    setSearch('')
    setCategoryId(undefined)
    setSelectedIds([])
    setPage(1)
  }

  function close() {
    //
    reset()
    onClose()
  }

  function confirm() {
    //
    if (selectedIds.length === 0) return
    onConfirm(selectedIds)
    reset()
    onClose()
  }

  function changeFilter(apply: () => void) {
    //
    apply()
    setPage(1)
  }

  return (
    <Modal
      title={t('productPicker.title')}
      open={open}
      onCancel={close}
      width={760}
      destroyOnHidden
      footer={
        <div className="product-picker__footer">
          <span className="product-picker__count">
            {selectedIds.length > 0 ? (
              <>
                <strong>{selectedIds.length}</strong> {t('productPicker.selectedSuffix')}
                <Button type="link" size="small" onClick={() => setSelectedIds([])}>
                  {t('productPicker.clearSelection')}
                </Button>
              </>
            ) : (
              t('productPicker.hint')
            )}
          </span>
          <div className="u-flex u-gap-8">
            <Button onClick={close}>{t('common.cancel')}</Button>
            <Button type="primary" icon={<StoreIcon name="plus" size={16} />} disabled={selectedIds.length === 0} onClick={confirm}>
              {t('productPicker.addSelected')}
              {selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
            </Button>
          </div>
        </div>
      }
    >
      <div className="product-picker__filters">
        <Input
          allowClear
          autoFocus
          value={search}
          onChange={(event) => changeFilter(() => setSearch(event.target.value))}
          placeholder={t('productPicker.searchPlaceholder')}
          prefix={<StoreIcon name="search" size={16} className="u-text-muted" />}
        />
        {categories.length > 0 ? (
          <Select
            allowClear
            value={categoryId}
            onChange={(value) => changeFilter(() => setCategoryId(value))}
            placeholder={t('productPicker.allCategories')}
            options={categories}
            className="product-picker__category"
          />
        ) : null}
      </div>
      <Table<Product>
        size="small"
        rowKey="id"
        dataSource={rows}
        columns={createProductPickerColumns({ t, stockByProductId, addedProductIds, requireStock })}
        rowSelection={{
          selectedRowKeys: selectedIds,
          preserveSelectedRowKeys: true,
          onChange: (keys) => setSelectedIds(keys as string[]),
          getCheckboxProps: (product) => ({ disabled: isUnavailable(product) }),
        }}
        onRow={(product) => ({
          onClick: () => {
            //
            if (isUnavailable(product)) return
            setSelectedIds((current) =>
              current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id],
            )
          },
          className: isUnavailable(product) ? 'product-picker__row--disabled' : 'clickable-row',
        })}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: rows.length,
          onChange: setPage,
          showSizeChanger: false,
          size: 'small',
          hideOnSinglePage: true,
        }}
        locale={{ emptyText: t('productPicker.empty') }}
      />
    </Modal>
  )
}
