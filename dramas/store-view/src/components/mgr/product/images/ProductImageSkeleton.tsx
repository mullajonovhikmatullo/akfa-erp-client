import { Skeleton } from 'antd'

interface ProductImageSkeletonProps {
  borderRadius?: number
}

export function ProductImageSkeleton({ borderRadius = 6 }: ProductImageSkeletonProps) {
  return (
    <Skeleton.Node
      active
      styles={{
        root: {
          display: 'block',
          width: '100%',
          height: '100%',
        },
        content: {
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          borderRadius,
        },
      }}
    />
  )
}
