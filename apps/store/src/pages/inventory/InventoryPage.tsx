import { InventoryPanel } from '@store/store-view/inventory'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function InventoryPage() {
  //
  const t = useT()
  const { scopedBranchId } = useBranchScope()

  return <InventoryPanel branchId={scopedBranchId} t={t} />
}
