import type { StoreTranslator } from '@store/store-i18n'
import { CustomerFormModal } from '../../customer/form/CustomerFormModal'
import { useNewSaleForm } from './useNewSaleForm'
import { SaleCartView } from './view/SaleCartView'
import { SaleSetupView } from './view/SaleSetupView'
import { SaleSummaryView } from './view/SaleSummaryView'

interface NewSaleFormProps {
  t: StoreTranslator
  isStoreOwner: boolean
  userBranchId?: string | null
  exchangeRate: number
  onSuccess?: () => void
}

export function NewSaleForm({ t, isStoreOwner, userBranchId, exchangeRate, onSuccess }: NewSaleFormProps) {
  //
  const saleForm = useNewSaleForm({ t, userBranchId, exchangeRate, onSuccess })

  return (
    <>
      <div className="u-items-start u-grid u-gap-12 u-grid-cols-content-340">
        <div className="card">
          <SaleSetupView
            t={t}
            control={saleForm.control}
            customerOptions={saleForm.customerOptions}
            selectedCustomerId={saleForm.selectedCustomerId}
            customersLoading={saleForm.customersLoading}
            onCustomerChange={saleForm.selectCustomer}
            onCreateCustomer={saleForm.openCustomerForm}
          />
          <SaleCartView
            t={t}
            control={saleForm.control}
            productSelectKey={saleForm.productSelectKey}
            productSelectLoading={saleForm.productSelectLoading}
            sellableProducts={saleForm.sellableProducts}
            selectedProductIds={saleForm.selectedProductIds}
            stockByProductId={saleForm.stockByProductId}
            addToCart={saleForm.addToCart}
            cart={saleForm.cart}
            saleType={saleForm.saleType}
            unitPrice={saleForm.unitPrice}
            changeQty={saleForm.changeQty}
            updateQty={saleForm.updateQty}
            removeItem={saleForm.removeItem}
          />
        </div>

        <SaleSummaryView
          t={t}
          control={saleForm.control}
          handleSubmit={saleForm.handleSubmit}
          setValue={saleForm.setValue}
          paymentOptions={saleForm.paymentOptions}
          cart={saleForm.cart}
          isUsdPayment={saleForm.isUsdPayment}
          paidAmount={saleForm.paidAmount}
          paidAmountError={saleForm.paidAmountError}
          onPaidAmountChange={saleForm.handlePaidAmountChange}
          fullPaidAmount={saleForm.fullPaidAmount}
          subtotal={saleForm.subtotal}
          debtAmount={saleForm.debtAmount}
          needsCustomer={saleForm.needsCustomer}
          customerId={saleForm.customerId}
          isPending={saleForm.isPending}
          canSubmit={saleForm.canSubmit}
          onSubmit={saleForm.submitSale}
        />
      </div>

      <CustomerFormModal
        t={t}
        open={saleForm.creatingCustomer}
        customer={null}
        onClose={saleForm.closeCustomerForm}
        onCreated={saleForm.handleCustomerCreated}
        isStoreOwner={isStoreOwner}
        branchId={userBranchId}
        branches={saleForm.branches}
        branchesLoading={saleForm.branchesLoading}
      />
    </>
  )
}
