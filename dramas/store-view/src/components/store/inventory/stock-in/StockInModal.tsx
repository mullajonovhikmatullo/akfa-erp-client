import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { useStockInForm } from './useStockInForm'
import { StockInFormView } from './view/StockInFormView'

interface StockInModalProps {
  t: StoreTranslator
  open: boolean
  onClose: () => void
  isStoreOwner: boolean
  userBranchId?: string | null
  exchangeRate: number
}

export function StockInModal({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate }: StockInModalProps) {
  //
  const stockInForm = useStockInForm({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate })

  return (
    <AppModal
      title={t('stockIn.title')}
      open={open}
      onClose={onClose}
      width={920}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={stockInForm.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={stockInForm.isPending}
          disabled={!stockInForm.canSubmit}
          onClick={stockInForm.handleSubmit(stockInForm.submitStockIn)}
        >
          {t('stockIn.confirmBtn')} ({stockInForm.cart.length} {t('common.countSuffix')})
        </Button>,
      ]}
    >
      <StockInFormView
        t={t}
        control={stockInForm.control}
        isStoreOwner={isStoreOwner}
        branches={stockInForm.branches}
        branchesLoading={stockInForm.branchesLoading}
        products={stockInForm.products}
        productsLoading={stockInForm.productsLoading}
        selectedProductIds={stockInForm.selectedProductIds}
        cart={stockInForm.cart}
        totalCost={stockInForm.totalCost}
        onAddProduct={stockInForm.addProduct}
        onChangeQty={stockInForm.changeQty}
        onUpdateQty={stockInForm.updateQty}
        onUpdateItem={stockInForm.updateItem}
        onRemoveItem={stockInForm.removeItem}
      />
    </AppModal>
  )
}
