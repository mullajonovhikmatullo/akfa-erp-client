import type { AppIconName } from '../../types/dashboard';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: AppIconName;
}

export const EmptyState = ({ title, description, icon }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">
      <i className={`icons-${icon} icon-size-24`} />
    </div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);
