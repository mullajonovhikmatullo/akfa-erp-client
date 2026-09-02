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
            className="u-bg-none u-border-none u-text-primary u-cursor-pointer u-fs-12"
          >
            {action}
          </button>
        )}
      </div>
      {empty ? (
        <div className="u-rounded-8 u-border-dashed u-text-muted u-p-28-12 u-text-center">
          {emptyText}
        </div>
      ) : (
        <div className="u-flex u-flex-col u-gap-8">{children}</div>
      )}
    </div>
  );
}
