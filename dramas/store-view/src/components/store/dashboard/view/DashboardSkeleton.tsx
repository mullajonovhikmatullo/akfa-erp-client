import { Skeleton } from 'antd';
import { SkeletonPanel } from './SkeletonPanel';

export function DashboardSkeleton() {
  //
  return (
    <div className="u-flex u-flex-col u-gap-12">
      <div className="u-grid u-gap-12 u-grid-cols-fit-220">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="kpi u-min-h-126" >
            <div className="u-items-start u-flex u-gap-10 u-justify-between">
              <Skeleton.Input active size="small" className="u-w-110" />
              <Skeleton.Avatar active size={24} shape="square" />
            </div>
            <div className="u-mt-18">
              <Skeleton.Input active size="default" className="u-w-150" />
            </div>
            <div className="u-mt-10">
              <Skeleton.Input active size="small" className="u-w-120" />
            </div>
            <div className="accent" />
          </div>
        ))}
      </div>

      <div className="u-grid u-gap-12 u-grid-cols-fit-280">
        <SkeletonPanel height={310} rows={3} />
        <SkeletonPanel height={220} rows={5} />
      </div>

      <div className="u-grid u-gap-12 u-grid-cols-fit-180">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card u-p-14-16" >
            <Skeleton.Input active size="small" className="u-w-120" />
            <div className="u-mt-10">
              <Skeleton.Input active size="default" className="u-w-145" />
            </div>
          </div>
        ))}
      </div>

      <div className="u-grid u-gap-12 u-grid-cols-fit-280">
        <SkeletonPanel height={260} rows={2} />
        <SkeletonPanel height={260} rows={5} />
      </div>

      <div className="u-grid u-gap-12 u-grid-cols-fit-280">
        <SkeletonPanel height={220} rows={4} />
        <SkeletonPanel height={220} rows={4} />
      </div>
    </div>
  );
}
