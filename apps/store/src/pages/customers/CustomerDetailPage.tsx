import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CustomerDetailPanel } from '@store/store-view/customer'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function CustomerDetailPage() {
  //
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const { can, isStoreOwner, scopedBranchId } = useBranchScope()

  if (!customerId) return <Navigate to={ROUTES.CUSTOMERS} replace />

  return (
    <CustomerDetailPanel
      key={customerId}
      customerId={customerId}
      branchId={scopedBranchId}
      isStoreOwner={isStoreOwner}
      canManage={can('customers:create')}
      onBack={() => navigate(ROUTES.CUSTOMERS)}
    />
  )
}
