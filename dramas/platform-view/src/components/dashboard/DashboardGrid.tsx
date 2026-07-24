import type { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
}

export const DashboardGrid = ({ children }: DashboardGridProps) => (
  <div className="dashboard-grid">{children}</div>
);
