import { Navigate, useParams } from 'react-router-dom'
import { ReceiptDetailPanel } from '@store/store-view/purchase'
import { ROUTES } from '@/shared/config/routes'
import { useBackToList } from '@/shared/hooks/useListReturn'

export function PurchaseDetailPage() {
  //
  const { receiptId } = useParams<{ receiptId: string }>()
  const backToList = useBackToList(ROUTES.PURCHASES)

  if (!receiptId) return <Navigate to={ROUTES.PURCHASES} replace />

  return <ReceiptDetailPanel key={receiptId} receiptId={receiptId} onBack={backToList} />
}
