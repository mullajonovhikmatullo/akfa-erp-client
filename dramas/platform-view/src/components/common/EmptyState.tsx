import type { AppIconComponent } from '../../types/dashboard';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: AppIconComponent;
}

export const EmptyState = ({ title, description, icon: Icon }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">
      <Icon size={24} weight="duotone" />
    </div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);
