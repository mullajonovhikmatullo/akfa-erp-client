import { InventoryPanel } from '@store/store-view/inventory'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function InventoryPage() {
  //
  const { scopedBranchId } = useBranchScope()

  return <InventoryPanel branchId={scopedBranchId} />
}
