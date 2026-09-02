import { AnalyticsWorkspace } from '@store/store-view/analytics'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function AnalyticsPage() {
  //
  const t = useT()
  const { scopedBranchId } = useBranchScope()

  return <AnalyticsWorkspace t={t} branchId={scopedBranchId} />
}
