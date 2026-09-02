import type { ReactNode } from 'react';

export function ListPanel({ title, action, onAction, empty, emptyText, children }: { title: string; action?: string; onAction?: () => void; empty: boolean; emptyText: string; children: ReactNode }) {
  //
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {action && (
          <button
            onClick={onAction}
            style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {action}
          </button>
        )}
      </div>
      {empty ? (
        <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--ink-3)', border: '1px dashed var(--border)', borderRadius: 8 }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
      )}
    </div>
  );
}
