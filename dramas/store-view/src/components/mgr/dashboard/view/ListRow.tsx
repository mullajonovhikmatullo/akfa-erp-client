import type { ReactNode } from 'react';

export function ListRow({ icon, title, meta, right }: { icon: ReactNode; title: string; meta: string; right: ReactNode }) {
  //
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center', padding: '9px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta}</div>
      </div>
      <div className="num" style={{ fontWeight: 700 }}>{right}</div>
    </div>
  );
}
