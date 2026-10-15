import type { ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import { cn } from '../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  hint?: ReactNode;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  id?: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  disabled?: boolean;
  className?: string;
}

function Option({ option }: { option: SelectOption }) {
  //
  return (
    <SelectPrimitive.Item
      value={option.value}
      className="relative flex cursor-default items-center gap-2 rounded-lg py-2 pr-8 pl-2.5 text-[13px] outline-none select-none data-[highlighted]:bg-surface-2 data-[disabled]:opacity-40"
    >
      <div className="grid min-w-0">
        <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
        {option.hint ? <span className="truncate text-xs text-muted-foreground">{option.hint}</span> : null}
      </div>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5 text-primary [&_svg]:size-4">
        <Check />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export function Select({ id, value, onValueChange, placeholder, options, groups, disabled, className }: SelectProps) {
  //
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-left',
          'outline-none focus:border-primary focus:ring-4 focus:ring-ring disabled:opacity-60',
          'data-[placeholder]:text-muted-foreground/80 [&_svg]:size-4 [&_svg]:text-muted-foreground',
          className,
        )}
      >
        <span className="truncate"><SelectPrimitive.Value placeholder={placeholder} /></span>
        <SelectPrimitive.Icon>
          <ChevronDown />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-80 w-[var(--radix-select-trigger-width)] min-w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-soft animate-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options?.map((option) => <Option key={option.value} option={option} />)}
            {groups?.map((group) => (
              <SelectPrimitive.Group key={group.label}>
                <SelectPrimitive.Label className="px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </SelectPrimitive.Label>
                {group.options.map((option) => <Option key={option.value} option={option} />)}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
