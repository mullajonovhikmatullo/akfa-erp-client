import type { ReactNode } from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlatformStore } from '@store/platform-stub';
import { formatNumber } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/button';
import { EmptyState, Skeleton, tableClass } from '../../../shared/ui/display';
import { StoreActions } from './StoreActions';
import type { StoreAction } from './StoreActions';
import { PlanCell, StatusBadge, TermCell, UsageCell } from './storeDisplay';

interface CompaniesListProps {
  stores: PlatformStore[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onAction: (action: StoreAction, store: PlatformStore) => void;
  emptyAction?: ReactNode;
}

function Identity({ store }: { store: PlatformStore }) {
  //
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-semibold text-muted-foreground">
        {store.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="grid min-w-0">
        <span className="truncate font-medium">{store.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {[store.ownerName, store.phone].filter(Boolean).join(' · ') || store.slug}
        </span>
      </div>
    </div>
  );
}

export function CompaniesList({ stores, loading, total, page, pageSize, onPageChange, onAction, emptyAction }: CompaniesListProps) {
  //
  if (loading && stores.length === 0) {
    return (
      <div className="grid gap-2 p-5">
        {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12" />)}
      </div>
    );
  }

  if (stores.length === 0) {
    return <EmptyState icon={<Building2 />} title="Kompaniya topilmadi" description="Filtr yoki qidiruvni o‘zgartirib ko‘ring." action={emptyAction} />;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <>
      <div className={`${tableClass.wrap} hidden md:block`}>
        <table className={tableClass.table}>
          <thead>
            <tr>
              <th className={tableClass.th}>Kompaniya</th>
              <th className={tableClass.th}>Tarif</th>
              <th className={tableClass.th}>Foydalanish</th>
              <th className={tableClass.th}>Holat</th>
              <th className={tableClass.th}>Muddat</th>
              <th className={`${tableClass.th} w-12`}><span className="sr-only">Amallar</span></th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className={tableClass.row}>
                <td className={`${tableClass.td} max-w-64`}><Identity store={store} /></td>
                <td className={tableClass.td}><PlanCell store={store} /></td>
                <td className={tableClass.td}><UsageCell store={store} /></td>
                <td className={tableClass.td}><StatusBadge status={store.status} /></td>
                <td className={tableClass.td}><TermCell store={store} /></td>
                <td className={`${tableClass.td} text-right`}><StoreActions store={store} onAction={onAction} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {stores.map((store) => (
          <li key={store.id} className="grid gap-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Identity store={store} />
              <StoreActions store={store} onAction={onAction} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={store.status} />
              <TermCell store={store} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <PlanCell store={store} />
              <UsageCell store={store} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <span className="tabular">{formatNumber(from)}–{formatNumber(to)} / {formatNumber(total)}</span>
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" aria-label="Oldingi sahifa" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Keyingi sahifa" disabled={to >= total} onClick={() => onPageChange(page + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </>
  );
}
