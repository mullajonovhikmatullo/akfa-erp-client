import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { ProductPickerModal } from '../../product/picker/ProductPickerModal'
import { useNewTransferForm } from './useNewTransferForm'
import { TransferFormView } from './view/TransferFormView'

interface NewTransferModalProps {
  t: StoreTranslator
  open: boolean
  onClose: () => void
  isStoreOwner: boolean
  userBranchId?: string | null
  exchangeRate: number
}

export function NewTransferModal({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate }: NewTransferModalProps) {
  //
  const transferForm = useNewTransferForm({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate })

  return (
    <AppModal
      title={t('transferModal.title')}
      open={open}
      onClose={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={transferForm.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={transferForm.isPending}
          disabled={!transferForm.canSubmit}
          onClick={transferForm.handleSubmit(transferForm.submitTransfer)}
        >
          {t('transferModal.submitBtn')} ({transferForm.cart.length} {t('common.countSuffix')})
        </Button>,
      ]}
    >
      <TransferFormView
        t={t}
        control={transferForm.control}
        branches={transferForm.branches}
        branchesLoading={transferForm.branchesLoading}
        availableBranches={transferForm.availableBranches}
        sourceBranchId={transferForm.sourceBranchId}
        cart={transferForm.cart}
        stockByProductId={transferForm.stockByProductId}
        transferableProducts={transferForm.transferableProducts}
        productSelectLoading={transferForm.productSelectLoading}
        insufficientStockItems={transferForm.insufficientStockItems}
        totalCost={transferForm.totalCost}
        onAddProduct={transferForm.addProduct}
        onOpenPicker={() => transferForm.setPickerOpen(true)}
        selectedCartKeys={transferForm.selectedCartKeys}
        onSelectCartKeys={transferForm.setSelectedCartKeys}
        onRemoveSelected={transferForm.removeSelectedItems}
        onChangeQty={transferForm.changeQty}
        onUpdateQty={transferForm.updateQty}
        onUpdateItem={transferForm.updateItem}
        onRemoveItem={transferForm.removeItem}
      />
      <ProductPickerModal
        t={t}
        open={transferForm.pickerOpen}
        products={transferForm.transferableProducts}
        addedProductIds={new Set(transferForm.cart.map((item) => item.productId))}
        stockByProductId={transferForm.stockByProductId}
        requireStock
        onClose={() => transferForm.setPickerOpen(false)}
        onConfirm={transferForm.addProducts}
      />
    </AppModal>
  )
}
