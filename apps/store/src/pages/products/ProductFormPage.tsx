import { useParams } from 'react-router-dom'
import { ProductFormPanel } from '@store/store-view/product'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useBackToList } from '@/shared/hooks/useListReturn'

export function ProductFormPage() {
  //
  const { productId } = useParams<{ productId: string }>()
  const backToList = useBackToList(ROUTES.PRODUCTS)
  const { isStoreOwner } = useBranchScope()

  return <ProductFormPanel key={productId ?? 'new'} productId={productId} isStoreOwner={isStoreOwner} onDone={backToList} />
}
