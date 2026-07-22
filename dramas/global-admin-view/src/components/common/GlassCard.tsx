import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassCard = ({ children, className, interactive = false, ...props }: GlassCardProps) => (
  <section className={clsx('glass-card', interactive && 'glass-card--interactive', className)} {...props}>
    {children}
  </section>
);
