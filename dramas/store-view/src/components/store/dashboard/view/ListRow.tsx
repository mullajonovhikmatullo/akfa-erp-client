import type { ReactNode } from 'react';

export function ListRow({ icon, title, meta, right }: { icon: ReactNode; title: string; meta: string; right: ReactNode }) {
  //
  return (
    <div className="u-items-center u-rounded-8 u-border-default u-grid u-gap-10 u-grid-cols-avatar-content-actions u-p-9-10">
      <span className="u-items-center u-bg-surface-2 u-rounded-8 u-inline-flex u-h-28 u-justify-center u-w-28">{icon}</span>
      <div className="u-min-w-0">
        <div className="u-fw-650 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{title}</div>
        <div className="u-text-muted u-fs-12 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{meta}</div>
      </div>
      <div className="num u-fw-700" >{right}</div>
    </div>
  );
}
