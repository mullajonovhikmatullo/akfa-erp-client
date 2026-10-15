import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import type { PlatformStore, ProvisionStorePayload, StoreStatus } from '@store/platform-stub';
import { createOwnerSetupUrl } from '../../shared/lib/ownerSetupUrl';
import { storeStatusLabels } from '../../shared/lib/format';
import { Button } from '../../shared/ui/button';
import { Card, PageHeader, Segmented } from '../../shared/ui/display';
import { Input } from '../../shared/ui/form';
import { usePlatformDashboardSummary } from '../overview/hooks/usePlatformDashboardSummary';
import { usePlansList } from '../plans/hooks/usePlansList';
import { usePlatformStoresPage } from './hooks/usePlatformStoresPage';
import { useStoreMutation } from './hooks/useStoreMutation';
import { CompaniesList } from './view/CompaniesList';
import { NewCompanySheet } from './view/NewCompanySheet';
import type { StoreAction } from './view/StoreActions';
import {
  LifetimeDialog,
  PlanDialog,
  SetupLinkDialog,
  SetupResultDialog,
  StatusDialog,
  TrialDialog,
} from './view/StoreDialogs';
import type { SetupResult } from './view/StoreDialogs';

type Filter = 'ALL' | StoreStatus;
const PAGE_SIZE = 20;
const filters: Filter[] = ['ALL', 'ACTIVE', 'TRIALING', 'PAST_DUE', 'SUSPENDED', 'CANCELLED'];

export function CompaniesPage() {
  //
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (filters.includes(searchParams.get('status') as Filter) ? searchParams.get('status') : 'ALL') as Filter;
  const query = searchParams.get('q') ?? '';
  const [searchText, setSearchText] = useState(query);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<{ kind: StoreAction; store: PlatformStore } | null>(null);
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: query || undefined, status: filter === 'ALL' ? undefined : filter }),
    [filter, page, query],
  );
  const storesQuery = usePlatformStoresPage(params);
  const summaryQuery = usePlatformDashboardSummary();
  const plansQuery = usePlansList();
  const mutations = useStoreMutation();
  const plans = plansQuery.data ?? [];
  const byStatus = summaryQuery.data?.storesByStatus ?? {};
  const totalAll = Object.values(byStatus).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    //
    setSearchText(query);
  }, [query]);

  useEffect(() => {
    //
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    //
    const timer = window.setTimeout(() => {
      //
      if (searchText.trim() === query) return;
      setSearchParams((current) => {
        //
        const next = new URLSearchParams(current);
        if (searchText.trim()) next.set('q', searchText.trim());
        else next.delete('q');
        return next;
      }, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, searchText, setSearchParams]);

  const updateParam = (key: string, value: string | null) => {
    //
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  };

  const closeAction = () => setAction(null);
  const target = (kind: StoreAction) => (action?.kind === kind ? action.store : null);
  const showSetup = (storeName: string, username: string, setupCode: string, expiresAt: string) =>
    setSetupResult({ storeName, username, url: createOwnerSetupUrl(setupCode), expiresAt });

  const provision = (payload: ProvisionStorePayload) => {
    //
    mutations.provisionStore.mutate(payload, {
      onSuccess: (result) => {
        //
        updateParam('new', null);
        showSetup(result.store.name, result.owner.username, result.setupCode, result.setupExpiresAt);
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Kompaniyalar"
        description="Mijoz do‘konlari, tariflari va kirish holati"
        actions={
          <Button variant="primary" onClick={() => updateParam('new', '1')}>
            <Plus /> Yangi kompaniya
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented<Filter>
            value={filter}
            onValueChange={(value) => updateParam('status', value === 'ALL' ? null : value)}
            options={filters.map((value) => ({
              value,
              label: value === 'ALL' ? 'Barchasi' : storeStatusLabels[value],
              count: value === 'ALL' ? totalAll : byStatus[value] ?? 0,
            }))}
          />
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Nomi, egasi yoki telefon"
              className="pl-9"
            />
          </div>
        </div>
        <CompaniesList
          stores={storesQuery.data?.items ?? []}
          loading={storesQuery.isLoading}
          total={storesQuery.data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onAction={(kind, store) => setAction({ kind, store })}
          emptyAction={!query && filter === 'ALL' ? (
            <Button variant="primary" size="sm" onClick={() => updateParam('new', '1')}><Plus /> Birinchi kompaniyani qo‘shish</Button>
          ) : undefined}
        />
      </Card>

      <NewCompanySheet
        open={searchParams.get('new') === '1'}
        onOpenChange={(open) => updateParam('new', open ? '1' : null)}
        plans={plans}
        pending={mutations.provisionStore.isPending}
        onSubmit={provision}
      />

      <StatusDialog
        store={target('status')}
        onClose={closeAction}
        pending={mutations.updateStoreStatus.isPending}
        onSubmit={(input) => action && mutations.updateStoreStatus.mutate(
          { storeId: action.store.id, expectedVersion: action.store.billingVersion, ...input },
          { onSuccess: closeAction },
        )}
      />
      <PlanDialog
        store={target('plan')}
        onClose={closeAction}
        pending={mutations.updateStorePlan.isPending}
        plans={plans}
        onSubmit={(planId) => action && mutations.updateStorePlan.mutate(
          { storeId: action.store.id, payload: { planId, expectedVersion: action.store.billingVersion } },
          { onSuccess: closeAction },
        )}
      />
      <TrialDialog
        store={target('trial')}
        onClose={closeAction}
        pending={mutations.grantTrial.isPending}
        onSubmit={() => action && mutations.grantTrial.mutate(
          { storeId: action.store.id, payload: { expectedVersion: action.store.billingVersion } },
          { onSuccess: closeAction },
        )}
      />
      <LifetimeDialog
        store={target('lifetime')}
        onClose={closeAction}
        pending={mutations.grantLifetime.isPending}
        plans={plans}
        onSubmit={(input) => action && mutations.grantLifetime.mutate(
          { storeId: action.store.id, payload: { ...input, expectedVersion: action.store.billingVersion } },
          { onSuccess: closeAction },
        )}
      />
      <SetupLinkDialog
        store={target('setup')}
        onClose={closeAction}
        pending={mutations.regenerateOwnerSetup.isPending}
        onSubmit={(currentPassword) => {
          if (!action) return;
          const store = action.store;
          mutations.regenerateOwnerSetup.mutate({ storeId: store.id, currentPassword }, {
            onSuccess: (result) => {
              //
              closeAction();
              showSetup(store.name, result.owner.username, result.setupCode, result.setupExpiresAt);
            },
          });
        }}
      />
      <SetupResultDialog result={setupResult} onClose={() => setSetupResult(null)} />
    </>
  );
}
