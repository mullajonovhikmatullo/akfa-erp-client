import { Skeleton } from 'antd';

export function SkeletonPanel({ height, rows }: { height: number; rows: number }) {
  //
  return (
    <div className="card">
      <div className="card-head">
        <Skeleton.Input active size="small" className="u-w-150" />
        <Skeleton.Input active size="small" className="u-w-90" />
      </div>
      <div className={`dashboard-skeleton-panel dashboard-skeleton-panel--${height}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size={index === 0 ? 'default' : 'small'}
            className={`u-w-pct-${Math.max(46, 86 - index * 9)}`}
          />
        ))}
      </div>
    </div>
  );
}
