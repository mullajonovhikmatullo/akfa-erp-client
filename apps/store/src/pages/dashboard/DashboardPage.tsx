import { useNavigate } from 'react-router-dom'
import { DashboardPanel } from '@store/store-view/dashboard'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { useT } from '@/shared/lib/i18n'

export function DashboardPage() {
  //
  const t = useT()
  const navigate = useNavigate()
  const { user, isSuper, branchId } = useCurrentUser()
  const lowStockThreshold = useUIStore((state) => state.lowStockThreshold)
  const scopedBranchId = !isSuper && branchId ? branchId : undefined
  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <DashboardPanel
      t={t}
      firstName={firstName}
      branchId={scopedBranchId}
      lowStockThreshold={lowStockThreshold}
      onNewSale={() => navigate(ROUTES.SALES)}
      onStockIn={() => navigate(ROUTES.PURCHASES)}
      onOpenAnalytics={() => navigate(ROUTES.ANALYTICS)}
      onManageProducts={() => navigate(ROUTES.PRODUCTS)}
      onOpenDebtors={() => navigate(`${ROUTES.CUSTOMERS}?balance=debt`)}
    />
  )
}
