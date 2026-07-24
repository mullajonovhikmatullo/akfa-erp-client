import { AnalyticsWorkspace } from '@store/store-view/analytics'
import { useUIStore } from '@/app/stores/ui.store'
import { useT } from '@/shared/lib/i18n'

export function AnalyticsPage() {
  //
  const t = useT()
  const lowStockThreshold = useUIStore((state) => state.lowStockThreshold)

  return <AnalyticsWorkspace t={t} lowStockThreshold={lowStockThreshold} />
}
