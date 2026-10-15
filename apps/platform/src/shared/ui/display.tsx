import type { HTMLAttributes, ReactNode } from 'react';
import { ToggleGroup } from 'radix-ui';
import { cn } from '../lib/cn';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'gold';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted-foreground',
  primary: 'bg-primary/12 text-primary',
  success: 'bg-success/14 text-success',
  warning: 'bg-warning/18 text-[color-mix(in_oklch,var(--warning),black_25%)] dark:text-warning',
  danger: 'bg-danger/12 text-danger',
  gold: 'bg-[oklch(0.8_0.13_85/0.18)] text-[oklch(0.55_0.12_75)] dark:text-[oklch(0.82_0.12_85)]',
};

export function Badge({ tone = 'neutral', dot = false, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  //
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap',
        toneClass[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  //
  return <div className={cn('rounded-2xl border border-border bg-surface', className)} {...props} />;
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  //
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
      <div className="grid gap-0.5">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  //
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} />;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  //
  return (
    <div className="grid place-items-center gap-3 px-6 py-14 text-center">
      <div className="grid size-11 place-items-center rounded-xl bg-surface-2 text-muted-foreground [&_svg]:size-5">{icon}</div>
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="max-w-sm text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  //
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-2 px-1 font-sans text-[11px] text-muted-foreground">
      {children}
    </kbd>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentOption<T>[];
  className?: string;
}

export function Segmented<T extends string>({ value, onValueChange, options, className }: SegmentedProps<T>) {
  //
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cn('inline-flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-surface-2 p-0.5', className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] whitespace-nowrap text-muted-foreground transition-colors',
            'hover:text-foreground data-[state=on]:bg-surface data-[state=on]:text-foreground data-[state=on]:shadow-sm',
          )}
        >
          {option.label}
          {option.count !== undefined ? <span className="tabular text-xs text-muted-foreground">{option.count}</span> : null}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  //
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export const tableClass = {
  wrap: 'overflow-x-auto',
  table: 'w-full min-w-[760px] border-collapse text-left',
  th: 'h-10 border-b border-border px-4 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5',
  td: 'border-b border-border px-4 py-3 align-middle first:pl-5 last:pr-5',
  row: 'transition-colors hover:bg-surface-2/60 [&:last-child>td]:border-b-0',
};
