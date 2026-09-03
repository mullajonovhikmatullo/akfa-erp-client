import { AnalyticsWorkspace } from '@store/store-view/analytics'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function AnalyticsPage() {
  //
  const { scopedBranchId } = useBranchScope()

  return <AnalyticsWorkspace branchId={scopedBranchId} />
}
