import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '../lib/cn';

const fieldClass = cn(
  'w-full rounded-lg border border-border bg-surface px-3 text-foreground placeholder:text-muted-foreground/70',
  'transition-[border-color,box-shadow] duration-150 outline-none',
  'focus:border-primary focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  //
  return <input ref={ref} className={cn(fieldClass, 'h-9', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  //
  return <textarea ref={ref} className={cn(fieldClass, 'min-h-20 resize-y py-2', className)} {...props} />;
});

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  //
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn('pr-9', props.className)} />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground hover:text-foreground [&_svg]:size-4"
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: (id: string) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className }: FieldProps) {
  //
  const id = useId();
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onCheckedChange, disabled, id }: SwitchProps) {
  //
  return (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150',
        'bg-border-strong data-[state=checked]:bg-primary disabled:opacity-50',
      )}
    >
      <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-150 data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}
