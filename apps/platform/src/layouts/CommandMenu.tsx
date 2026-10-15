import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Building2, CornerDownLeft, LogOut, Moon, Plus, ReceiptText, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { routes } from '../config/routes';
import { useUIStore } from '../app/stores/uiStore';
import { storeStatusLabels } from '../shared/lib/format';
import { usePlatformStoresPage } from '../features/companies/hooks/usePlatformStoresPage';
import { navItems } from './navigation';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useDebounced(value: string, delay = 250) {
  //
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    //
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);
  return debounced;
}

function Item({ icon, children, hint, onSelect, value }: { icon: ReactNode; children: ReactNode; hint?: ReactNode; onSelect: () => void; value?: string }) {
  //
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] select-none data-[selected=true]:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted-foreground"
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </Command.Item>
  );
}

const groupClass = '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase';

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  //
  const navigate = useNavigate();
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const askSignOut = useUIStore((state) => state.setSignOutConfirmOpen);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search.trim());
  const storesQuery = usePlatformStoresPage(
    { search: debouncedSearch, page: 1, pageSize: 6 },
    { enabled: open && debouncedSearch.length >= 2 },
  );
  const stores = debouncedSearch.length >= 2 ? storesQuery.data?.items ?? [] : [];

  useEffect(() => {
    //
    if (!open) setSearch('');
  }, [open]);

  const run = (action: () => void) => {
    //
    onOpenChange(false);
    action();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in" />
        <DialogPrimitive.Content className="fixed top-[14vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft animate-in outline-none">
          <DialogPrimitive.Title className="sr-only">Buyruqlar</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Sahifa, amal yoki kompaniyani tanlang</DialogPrimitive.Description>
          <Command loop shouldFilter={stores.length === 0} className="flex max-h-[min(70vh,520px)] flex-col">
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="size-4 text-muted-foreground" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Sahifa, amal yoki kompaniya nomi…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <Command.List className="overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-8 text-center text-[13px] text-muted-foreground">Hech narsa topilmadi</Command.Empty>
              {stores.length > 0 ? (
                <Command.Group heading="Kompaniyalar" className={groupClass}>
                  {stores.map((store) => (
                    <Item
                      key={store.id}
                      value={`store-${store.id}`}
                      icon={<Building2 />}
                      hint={storeStatusLabels[store.status]}
                      onSelect={() => run(() => navigate(`${routes.companies}?q=${encodeURIComponent(store.name)}`))}
                    >
                      {store.name}
                    </Item>
                  ))}
                </Command.Group>
              ) : null}
              <Command.Group heading="Sahifalar" className={groupClass}>
                {navItems.map((item) => (
                  <Item key={item.path} icon={<item.icon />} hint={`G ${item.shortcut}`} onSelect={() => run(() => navigate(item.path))}>
                    {item.label}
                  </Item>
                ))}
              </Command.Group>
              <Command.Group heading="Amallar" className={groupClass}>
                <Item icon={<Plus />} onSelect={() => run(() => navigate(`${routes.companies}?new=1`))}>Yangi kompaniya</Item>
                <Item icon={<ReceiptText />} onSelect={() => run(() => navigate(`${routes.payments}?new=1`))}>To‘lovni qayd etish</Item>
                <Item icon={<Plus />} onSelect={() => run(() => navigate(`${routes.plans}?new=1`))}>Yangi tarif</Item>
                <Item icon={<Moon />} onSelect={() => run(toggleTheme)}>Rejimni almashtirish</Item>
                <Item icon={<LogOut />} onSelect={() => run(() => askSignOut(true))}>Chiqish</Item>
              </Command.Group>
            </Command.List>
            <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CornerDownLeft className="size-3" /> tanlash</span>
              <span>esc yopish</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
