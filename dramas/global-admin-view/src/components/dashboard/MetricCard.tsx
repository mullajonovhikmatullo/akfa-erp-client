import clsx from 'clsx';
import { TrendUp } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { GlassCard } from '../common/GlassCard';
import { CircularMetric } from '../common/CircularMetric';
import { formatPercent } from '../../lib/formatters';
import type { AccentTone, AppIconComponent } from '../../types/dashboard';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  accent: AccentTone;
  icon: AppIconComponent;
  change?: number;
  changeLabel?: string;
  progress?: number;
  className?: string;
  children?: ReactNode;
}

export const MetricCard = ({
  title,
  value,
  description,
  accent,
  icon: Icon,
  change,
  changeLabel,
  progress,
  className,
  children,
}: MetricCardProps) => (
  <GlassCard
    className={clsx('metric-card', typeof progress === 'number' && 'metric-card--progress', className)}
    data-accent={accent}
  >
    <div className="metric-card__heading">
      <div className="metric-card__icon" aria-hidden="true">
        <Icon size={21} weight="duotone" />
      </div>
      <span className="metric-card__title">{title}</span>
    </div>
    {typeof progress === 'number' ? (
      <div className="metric-card__progress">
        <CircularMetric value={progress} label={title} accent={accent} centerLabel={value} />
      </div>
    ) : (
      <div className="metric-card__body">
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
    )}
    {typeof change === 'number' ? (
      <div className="metric-card__change">
        <TrendUp size={16} weight="bold" aria-hidden="true" />
        <span>{formatPercent(change)}</span>
        {changeLabel ? <small>{changeLabel}</small> : null}
      </div>
    ) : typeof progress === 'number' ? (
      <p className="metric-card__description">{description}</p>
    ) : null}
    {children}
  </GlassCard>
);
