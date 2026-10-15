import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Dialog as DialogPrimitive, DropdownMenu } from 'radix-ui';
import { cn } from '../lib/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  //
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'gap-4 overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-soft animate-in outline-none',
            className,
          )}
        >
          <div className="grid gap-1 pr-8">
            <DialogPrimitive.Title className="text-base font-semibold tracking-tight">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          {children}
          {footer ? <div className="flex flex-wrap justify-end gap-2 pt-1">{footer}</div> : null}
          <DialogPrimitive.Close
            aria-label="Yopish"
            className="absolute top-4 right-4 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground [&_svg]:size-4"
          >
            <X />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface SheetProps extends DialogProps {
  width?: string;
}

export function Sheet({ open, onOpenChange, title, description, children, footer, width = 'max-w-lg' }: SheetProps) {
  //
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-surface shadow-soft animate-slide-in outline-none',
            width,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="grid gap-1">
              <DialogPrimitive.Title className="text-base font-semibold tracking-tight">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className={description ? 'text-[13px] text-muted-foreground' : 'sr-only'}>
                {description ?? title}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Yopish"
              className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground [&_svg]:size-4"
            >
              <X />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface MenuProps {
  trigger: ReactNode;
  items: Array<MenuItem | 'separator'>;
  label?: string;
}

export function Menu({ trigger, items, label }: MenuProps) {
  //
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-52 rounded-xl border border-border bg-surface p-1 shadow-soft animate-in"
        >
          {label ? <DropdownMenu.Label className="px-2.5 py-1.5 text-xs text-muted-foreground">{label}</DropdownMenu.Label> : null}
          {items.map((item, index) =>
            item === 'separator' ? (
              <DropdownMenu.Separator key={`separator-${index}`} className="my-1 h-px bg-border" />
            ) : (
              <DropdownMenu.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  'flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none select-none',
                  'data-[highlighted]:bg-surface-2 data-[disabled]:opacity-40 [&_svg]:size-4 [&_svg]:text-muted-foreground',
                  item.tone === 'danger' && 'text-danger [&_svg]:text-danger',
                )}
              >
                {item.icon}
                {item.label}
              </DropdownMenu.Item>
            ),
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
