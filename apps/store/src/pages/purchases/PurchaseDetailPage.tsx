import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ReceiptDetailPanel } from '@store/store-view/purchase'
import { ROUTES } from '@/shared/config/routes'

export function PurchaseDetailPage() {
  //
  const { receiptId } = useParams<{ receiptId: string }>()
  const navigate = useNavigate()

  if (!receiptId) return <Navigate to={ROUTES.PURCHASES} replace />

  return <ReceiptDetailPanel key={receiptId} receiptId={receiptId} onBack={() => navigate(ROUTES.PURCHASES)} />
}
