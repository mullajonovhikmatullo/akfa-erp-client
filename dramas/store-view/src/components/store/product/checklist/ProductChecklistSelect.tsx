import type { StoreTranslator } from '@store/store-i18n'
import type { ReactNode } from 'react'
import { Checkbox, Select } from 'antd'

import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Product } from '@store/store-stub'
import { AuthenticatedProductImage } from '../images/AuthenticatedProductImage'

interface ProductChecklistSelectProps {
  t: StoreTranslator
  products: Product[]
  selectedIds: string[]
  placeholder: string
  loading?: boolean
  disabled?: boolean
  renderTrailing?: (product: Product) => ReactNode
  onAdd: (productId: string) => void
  onRemove: (productId: string) => void
}

export function ProductChecklistSelect({
  t,
  products,
  selectedIds,
  placeholder,
  loading = false,
  disabled = false,
  renderTrailing,
  onAdd,
  onRemove,
}: ProductChecklistSelectProps) {
  //
  const productById = new Map(products.map((product) => [product.id, product]))

  return (
    <Select<string[]>
      mode="multiple"
      value={selectedIds}
      showSearch={{ optionFilterProp: 'searchText', autoClearSearchValue: false }}
      placeholder={placeholder}
      className="product-checklist"
      classNames={{ popup: { root: 'product-checklist__popup' } }}
      loading={loading}
      disabled={disabled}
      maxTagCount={0}
      maxTagPlaceholder={(omitted) => (
        <span className="product-checklist__summary">
          {omitted.length} {t('productPicker.selectedSuffix')}
        </span>
      )}
      menuItemSelectedIcon={null}
      suffixIcon={loading ? undefined : <StoreIcon name="search" size={16} />}
      notFoundContent={loading ? <SelectLoadingContent /> : t('productPicker.empty')}
      onSelect={(productId) => onAdd(productId)}
      onDeselect={(productId) => onRemove(productId)}
      options={products.map((product) => ({
        value: product.id,
        label: product.name,
        searchText: [product.sku, product.name].filter(Boolean).join(' '),
      }))}
      optionRender={(option) => {
        //
        const product = productById.get(option.value as string)
        if (!product) return option.label
        return (
          <div className="product-checklist__option">
            <Checkbox checked={selectedIds.includes(product.id)} tabIndex={-1} className="product-checklist__check" />
            <AuthenticatedProductImage url={product.primaryThumbnailUrl ?? product.primaryImageUrl} alt={product.name} width={34} height={34} />
            <div className="u-flex-auto u-min-w-0">
              <div className="u-fw-600">
                <EllipsisText maxWidth="100%">{product.name}</EllipsisText>
              </div>
              {product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{product.sku}</div> : null}
            </div>
            {renderTrailing?.(product)}
          </div>
        )
      }}
    />
  )
}
