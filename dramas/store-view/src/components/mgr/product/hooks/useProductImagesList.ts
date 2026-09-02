import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'

export function getProductImagesListQuery(productId: string) {
  //
  return ProductSeekApi.fetch.findProductImages(productId)
}

export function useProductImagesList(productId: string | null | undefined) {
  //
  const query = getProductImagesListQuery(productId ?? '')

  return useQuery({ ...query, enabled: Boolean(productId) })
}
