import { ArrowLeftRight, BadgeCheck, Clock, Ellipsis, KeyRound, ShieldBan } from 'lucide-react';
import type { PlatformStore } from '@store/platform-stub';
import { Button } from '../../../shared/ui/button';
import { Menu } from '../../../shared/ui/overlay';
import type { MenuItem } from '../../../shared/ui/overlay';

export type StoreAction = 'status' | 'plan' | 'trial' | 'lifetime' | 'setup';

export function StoreActions({ store, onAction }: { store: PlatformStore; onAction: (action: StoreAction, store: PlatformStore) => void }) {
  //
  const blocked = store.status === 'SUSPENDED' || store.status === 'CANCELLED';
  const lifetime = Boolean(store.subscription?.lifetimeAccessAt);
  const items: Array<MenuItem | 'separator'> = [
    { label: 'Tarifni almashtirish', icon: <ArrowLeftRight />, onSelect: () => onAction('plan', store) },
    ...(store.status === 'PAST_DUE' && !lifetime
      ? [{ label: '14 kunlik sinovni yoqish', icon: <Clock />, onSelect: () => onAction('trial', store) }]
      : []),
    ...(!lifetime && !blocked
      ? [{ label: 'Doimiy yoqish (to‘lovsiz)', icon: <BadgeCheck />, onSelect: () => onAction('lifetime', store) }]
      : []),
    ...(store.ownerAccount?.mustChangePassword && store.ownerAccount.isActive && !blocked
      ? [{ label: 'Yangi setup havola', icon: <KeyRound />, onSelect: () => onAction('setup', store) }]
      : []),
    'separator',
    {
      label: 'Holatni o‘zgartirish',
      icon: <ShieldBan />,
      onSelect: () => onAction('status', store),
      disabled: store.allowedStatusTransitions.length === 0,
    },
  ];

  return (
    <Menu
      label={store.name}
      items={items}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`${store.name} amallari`}>
          <Ellipsis />
        </Button>
      }
    />
  );
}
