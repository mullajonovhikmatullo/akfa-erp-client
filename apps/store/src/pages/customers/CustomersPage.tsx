import { CustomersList } from '@store/store-view/customer'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useOpenFromList } from '@/shared/hooks/useListReturn'

export function CustomersPage() {
  //
  const openFromList = useOpenFromList()
  const { can, isStoreOwner, scopedBranchId } = useBranchScope()

  return (
    <CustomersList
      canManage={can('customers:create')}
      isStoreOwner={isStoreOwner}
      branchId={scopedBranchId}
      onOpenCustomer={(customer) => openFromList(ROUTES.CUSTOMER_DETAIL.replace(':customerId', customer.id))}
    />
  )
}
