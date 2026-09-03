import { useNavigate } from 'react-router-dom'
import { DashboardPanel } from '@store/store-view/dashboard'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function DashboardPage() {
  //
  const navigate = useNavigate()
  const { user, scopedBranchId } = useBranchScope()
  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <DashboardPanel
      firstName={firstName}
      branchId={scopedBranchId}
      onNewSale={() => navigate(ROUTES.SALES)}
      onStockIn={() => navigate(ROUTES.PURCHASES)}
      onOpenAnalytics={() => navigate(ROUTES.ANALYTICS)}
      onManageProducts={() => navigate(ROUTES.PRODUCTS)}
      onOpenDebtors={() => navigate(`${ROUTES.CUSTOMERS}?balance=debt`)}
    />
  )
}
