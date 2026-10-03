import { useNavigate } from 'react-router-dom'
import { CustomersList } from '@store/store-view/customer'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function CustomersPage() {
  //
  const navigate = useNavigate()
  const { can, isStoreOwner, scopedBranchId } = useBranchScope()

  return (
    <CustomersList
      canManage={can('customers:create')}
      isStoreOwner={isStoreOwner}
      branchId={scopedBranchId}
      onOpenCustomer={(customer) => navigate(ROUTES.CUSTOMER_DETAIL.replace(':customerId', customer.id))}
    />
  )
}
