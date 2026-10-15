import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'icon' | 'icon-sm';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110 shadow-sm',
  secondary: 'bg-surface-2 text-foreground hover:bg-border',
  outline: 'border border-border bg-surface text-foreground hover:bg-surface-2',
  ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
  danger: 'bg-danger text-white hover:brightness-110 shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 gap-2',
  icon: 'size-9',
  'icon-sm': 'size-8',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, className, children, disabled, type = 'button', ...props },
  ref,
) {
  //
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-lg font-medium whitespace-nowrap',
        'transition-[background-color,filter,color] duration-150 disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" /> : null}
      {children}
    </button>
  );
});
