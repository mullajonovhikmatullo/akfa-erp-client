import type { ReactNode } from 'react';

export function Row({ label, value }: { label: string; value: ReactNode }) {
  //
  return (
    <div className="u-flex u-fs-13 u-justify-between">
      <span className="u-text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
