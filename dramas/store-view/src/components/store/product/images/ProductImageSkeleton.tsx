import { Skeleton } from 'antd'

interface ProductImageSkeletonProps {
  borderRadius?: 0 | 3 | 4 | 6
}

export function ProductImageSkeleton({ borderRadius = 6 }: ProductImageSkeletonProps) {
  //
  return (
    <Skeleton.Node active className={`product-image-skeleton product-image-skeleton--radius-${borderRadius}`} />
  )
}
