import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Plus } from 'lucide-react';
import type { ManagedPlan, PlanMutationPayload } from '@store/platform-stub';
import { billingTypeLabels } from '../../shared/lib/format';
import { Button } from '../../shared/ui/button';
import { EmptyState, PageHeader, Skeleton } from '../../shared/ui/display';
import { useManagedPlansList } from './hooks/useManagedPlansList';
import { usePlanMutation } from './hooks/usePlanMutation';
import { PlanCard } from './view/PlanCard';
import { DeletePlanDialog, PlanFormDialog } from './view/PlanDialogs';

export function PlansPage() {
  //
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<ManagedPlan | null>(null);
  const [deleting, setDeleting] = useState<ManagedPlan | null>(null);
  const plansQuery = useManagedPlansList();
  const { createPlan, updatePlan, deletePlan } = usePlanMutation();
  const plans = plansQuery.data ?? [];
  const formOpen = searchParams.get('new') === '1' || Boolean(editing);

  const setFormOpen = (open: boolean) => {
    //
    if (!open) setEditing(null);
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current);
      if (open && !editing) next.set('new', '1');
      else next.delete('new');
      return next;
    }, { replace: true });
  };

  const save = (payload: PlanMutationPayload) => {
    //
    const options = { onSuccess: () => setFormOpen(false) };
    if (editing) updatePlan.mutate({ planId: editing.id, payload: { ...payload, expectedVersion: editing.version } }, options);
    else createPlan.mutate(payload, options);
  };

  return (
    <>
      <PageHeader
        title="Tariflar"
        description="Oylik obunalar landingda ko‘rinadi, bir martalik litsenziyalarni o‘zingiz taklif qilasiz"
        actions={<Button variant="primary" onClick={() => setFormOpen(true)}><Plus /> Yangi tarif</Button>}
      />

      {plansQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-56 rounded-2xl" />)}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState icon={<Layers />} title="Tarif yo‘q" description="Birinchi tarifni yarating." />
      ) : (
        (['MONTHLY', 'LIFETIME'] as const).map((type) => {
          const group = plans.filter((plan) => plan.billingType === type);
          return group.length ? (
            <section key={type} className="grid gap-3">
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{billingTypeLabels[type]} · {group.length}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEdit={() => setEditing(plan)} onDelete={() => setDeleting(plan)} />
                ))}
              </div>
            </section>
          ) : null;
        })
      )}

      <PlanFormDialog
        open={formOpen}
        plan={editing}
        pending={createPlan.isPending || updatePlan.isPending}
        onOpenChange={setFormOpen}
        onSubmit={save}
      />
      <DeletePlanDialog
        plan={deleting}
        pending={deletePlan.isPending}
        onClose={() => setDeleting(null)}
        onSubmit={(currentPassword) => deleting && deletePlan.mutate(
          { planId: deleting.id, payload: { expectedVersion: deleting.version, currentPassword } },
          { onSuccess: () => setDeleting(null) },
        )}
      />
    </>
  );
}
