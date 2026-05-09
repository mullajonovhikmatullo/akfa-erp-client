import clsx from 'clsx';

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'muted';

interface StatusBadgeProps {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}

export function StatusBadge({ tone = 'muted', dot, children }: StatusBadgeProps) {
  return (
    <span className={clsx('tagpill', tone)}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
