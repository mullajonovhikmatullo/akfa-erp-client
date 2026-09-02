import type { ReactNode } from 'react';

export function Row({ label, value }: { label: string; value: ReactNode }) {
  //
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
