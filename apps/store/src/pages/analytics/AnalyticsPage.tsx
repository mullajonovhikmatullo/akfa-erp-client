import { AnalyticsWorkspace } from '@store/store-view/analytics'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function AnalyticsPage() {
  //
  const t = useT()
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const { isStoreOwner, branchId } = useCurrentUser()
  const scopedBranchId = isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : branchId ?? undefined

  return <AnalyticsWorkspace t={t} branchId={scopedBranchId} />
}
