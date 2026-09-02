import { Skeleton } from 'antd';
import { SkeletonPanel } from './SkeletonPanel';

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="kpi" style={{ minHeight: 126 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <Skeleton.Input active size="small" style={{ width: 110 }} />
              <Skeleton.Avatar active size={24} shape="square" />
            </div>
            <div style={{ marginTop: 18 }}>
              <Skeleton.Input active size="default" style={{ width: 150 }} />
            </div>
            <div style={{ marginTop: 10 }}>
              <Skeleton.Input active size="small" style={{ width: 120 }} />
            </div>
            <div className="accent" />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <SkeletonPanel height={310} rows={3} />
        <SkeletonPanel height={220} rows={5} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card" style={{ padding: '14px 16px' }}>
            <Skeleton.Input active size="small" style={{ width: 120 }} />
            <div style={{ marginTop: 10 }}>
              <Skeleton.Input active size="default" style={{ width: 145 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <SkeletonPanel height={260} rows={2} />
        <SkeletonPanel height={260} rows={5} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <SkeletonPanel height={220} rows={4} />
        <SkeletonPanel height={220} rows={4} />
      </div>
    </div>
  );
}
