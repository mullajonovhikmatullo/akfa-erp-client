import { Skeleton } from 'antd';

export function SkeletonPanel({ height, rows }: { height: number; rows: number }) {
  //
  return (
    <div className="card">
      <div className="card-head">
        <Skeleton.Input active size="small" style={{ width: 150 }} />
        <Skeleton.Input active size="small" style={{ width: 90 }} />
      </div>
      <div style={{ minHeight: height, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size={index === 0 ? 'default' : 'small'}
            style={{ width: `${Math.max(46, 86 - index * 9)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
