import { Globe, Pencil, Trash2 } from 'lucide-react';
import type { ManagedPlan } from '@store/platform-stub';
import { cn } from '../../../shared/lib/cn';
import { formatMoney, formatNumber } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/button';
import { Badge, Card } from '../../../shared/ui/display';

const limit = (value: number | null) => (value === null ? '∞' : formatNumber(value));

export function PlanCard({ plan, onEdit, onDelete }: { plan: ManagedPlan; onEdit: () => void; onDelete: () => void }) {
  //
  const lifetime = plan.billingType === 'LIFETIME';
  return (
    <Card className={cn('group flex flex-col gap-4 p-5 transition-shadow hover:shadow-soft', !plan.isActive && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="font-semibold tracking-tight">{plan.name}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{plan.code}</span>
        </div>
        <div className="flex gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <Button size="icon-sm" variant="ghost" aria-label="Tahrirlash" onClick={onEdit}><Pencil /></Button>
          <Button size="icon-sm" variant="ghost" aria-label="Olib tashlash" className="hover:text-danger" onClick={onDelete}><Trash2 /></Button>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="tabular text-2xl font-semibold tracking-tight">
          {lifetime ? formatMoney(plan.oneTimePriceUsd ?? 0, 'USD') : formatMoney(plan.monthlyPriceUzs)}
        </span>
        <span className="text-[13px] text-muted-foreground">{lifetime ? 'bir marta' : '/ oy'}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
        {[
          ['Filial', plan.maxBranches],
          ['User', plan.maxUsers],
          ['Mahsulot', plan.maxProducts],
        ].map(([label, value]) => (
          <div key={label as string} className="grid gap-0.5">
            <span className="tabular text-sm font-semibold">{limit(value as number | null)}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {!plan.isActive ? <Badge>Arxiv</Badge> : null}
        {plan.isPublic ? <Badge tone="primary"><Globe className="size-3" /> Landingda</Badge> : null}
        <span className="ml-auto text-xs text-muted-foreground">{plan._count.stores} do‘kon</span>
      </div>
    </Card>
  );
}
