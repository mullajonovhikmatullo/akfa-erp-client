import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { PlatformStore, PlatformStorePlan, StoreStatus } from '@store/platform-stub';
import { billingTypeLabels, formatDateTime, formatPlanPrice, storeStatusLabels } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/button';
import { Field, Input, PasswordInput, Textarea } from '../../../shared/ui/form';
import { Dialog } from '../../../shared/ui/overlay';
import { Select } from '../../../shared/ui/select';
import type { SelectGroup } from '../../../shared/ui/select';

interface BaseProps {
  store: PlatformStore | null;
  onClose: () => void;
  pending: boolean;
}

export function planGroups(plans: PlatformStorePlan[], lifetimeOnly = false): SelectGroup[] {
  //
  return (['MONTHLY', 'LIFETIME'] as const)
    .filter((type) => !lifetimeOnly || type === 'LIFETIME')
    .map((type) => ({
      label: billingTypeLabels[type],
      options: plans
        .filter((plan) => plan.billingType === type)
        .map((plan) => ({
          value: plan.id,
          label: plan.name,
          hint: `${formatPlanPrice(plan)} · ${plan.maxBranches ?? '∞'} filial · ${plan.maxUsers ?? '∞'} user · ${plan.maxProducts ?? '∞'} mahsulot`,
        })),
    }))
    .filter((group) => group.options.length > 0);
}

export function StatusDialog({ store, onClose, pending, onSubmit }: BaseProps & {
  onSubmit: (input: { status: StoreStatus; note: string; confirmation: string; currentPassword?: string }) => void;
}) {
  //
  const [status, setStatus] = useState<StoreStatus | undefined>();
  const [note, setNote] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    //
    setStatus(undefined);
    setNote('');
    setConfirmation('');
    setPassword('');
  }, [store]);

  const needsReason = status === 'SUSPENDED' || status === 'CANCELLED';
  const restoringCancelled = store?.status === 'CANCELLED' && (status === 'ACTIVE' || status === 'TRIALING');
  const needsPassword = status === 'CANCELLED' || restoringCancelled;
  const confirmed = status !== 'CANCELLED' || [store?.name, store?.slug].includes(confirmation.trim());
  const ready = Boolean(status) && (!needsReason || note.trim().length >= 3) && confirmed && (!needsPassword || password.length > 0);

  return (
    <Dialog
      open={Boolean(store)}
      onOpenChange={(open) => !open && onClose()}
      title="Holatni o‘zgartirish"
      description={store ? <>Joriy holat: <span className="font-medium text-foreground">{storeStatusLabels[store.status]}</span></> : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button
            variant={status === 'CANCELLED' || status === 'SUSPENDED' ? 'danger' : 'primary'}
            disabled={!ready}
            loading={pending}
            onClick={() => status && onSubmit({ status, note, confirmation, currentPassword: needsPassword ? password : undefined })}
          >
            Tasdiqlash
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Yangi holat">
          {(id) => (
            <Select
              id={id}
              value={status}
              onValueChange={(value) => setStatus(value as StoreStatus)}
              placeholder="Holatni tanlang"
              options={(store?.allowedStatusTransitions ?? []).map((value) => ({ value, label: storeStatusLabels[value] }))}
            />
          )}
        </Field>
        <Field label={needsReason ? 'Sabab' : 'Izoh'} hint={needsReason ? 'Kamida 3 ta belgi, audit jurnalida saqlanadi' : 'Ixtiyoriy'}>
          {(id) => <Textarea id={id} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />}
        </Field>
        {status === 'CANCELLED' ? (
          <Field label={`Tasdiqlash uchun “${store?.name}” deb yozing`}>
            {(id) => <Input id={id} value={confirmation} maxLength={120} onChange={(event) => setConfirmation(event.target.value)} />}
          </Field>
        ) : null}
        {needsPassword ? (
          <Field label="Platform egasining paroli">
            {(id) => <PasswordInput id={id} value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />}
          </Field>
        ) : null}
      </div>
    </Dialog>
  );
}

export function PlanDialog({ store, onClose, pending, plans, onSubmit }: BaseProps & {
  plans: PlatformStorePlan[];
  onSubmit: (planId: string) => void;
}) {
  //
  const [planId, setPlanId] = useState<string | undefined>();
  const lifetime = Boolean(store?.subscription?.lifetimeAccessAt);

  useEffect(() => {
    //
    setPlanId(store?.plan?.id);
  }, [store]);

  return (
    <Dialog
      open={Boolean(store)}
      onOpenChange={(open) => !open && onClose()}
      title="Tarifni almashtirish"
      description={lifetime
        ? 'Doimiy litsenziyali do‘kon faqat bir martalik tariflar orasida almashadi.'
        : 'Yangi tarif limitlari do‘konning joriy foydalanishidan kam bo‘lmasligi kerak.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button variant="primary" loading={pending} disabled={!planId || planId === store?.plan?.id} onClick={() => planId && onSubmit(planId)}>
            Saqlash
          </Button>
        </>
      }
    >
      <Field label="Tarif">
        {(id) => <Select id={id} value={planId} onValueChange={setPlanId} placeholder="Tarifni tanlang" groups={planGroups(plans, lifetime)} />}
      </Field>
    </Dialog>
  );
}

export function TrialDialog({ store, onClose, pending, onSubmit }: BaseProps & { onSubmit: () => void }) {
  //
  return (
    <Dialog
      open={Boolean(store)}
      onOpenChange={(open) => !open && onClose()}
      title="14 kunlik sinovni yoqish"
      description={<><span className="font-medium text-foreground">{store?.name}</span> bugundan 14 kun to‘liq ishlaydi. Muddat tugagach, to‘lov tasdiqlanmaguncha yana faqat ko‘rish rejimiga o‘tadi.</>}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button variant="primary" loading={pending} onClick={onSubmit}>Sinovni yoqish</Button>
        </>
      }
    />
  );
}

export function LifetimeDialog({ store, onClose, pending, plans, onSubmit }: BaseProps & {
  plans: PlatformStorePlan[];
  onSubmit: (input: { planId: string; note: string; currentPassword: string }) => void;
}) {
  //
  const [planId, setPlanId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    //
    setPlanId(store?.plan?.billingType === 'LIFETIME' ? store.plan.id : undefined);
    setNote('');
    setPassword('');
  }, [store]);

  return (
    <Dialog
      open={Boolean(store)}
      onOpenChange={(open) => !open && onClose()}
      title="Doimiy yoqish (to‘lovsiz)"
      description="Do‘kon tanlangan bir martalik tarifga o‘tadi va muddatsiz ishlaydi. To‘lov yozuvi yaratilmaydi, sabab audit jurnalida qoladi."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button
            variant="primary"
            loading={pending}
            disabled={!planId || note.trim().length < 3 || !password}
            onClick={() => planId && onSubmit({ planId, note: note.trim(), currentPassword: password })}
          >
            Doimiy yoqish
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Bir martalik tarif">
          {(id) => <Select id={id} value={planId} onValueChange={setPlanId} placeholder="Tarifni tanlang" groups={planGroups(plans, true)} />}
        </Field>
        <Field label="Sabab" hint="Masalan: birinchi mijozlarga sovg‘a, naqd kelishilgan">
          {(id) => <Textarea id={id} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />}
        </Field>
        <Field label="Platform egasining paroli">
          {(id) => <PasswordInput id={id} value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />}
        </Field>
      </div>
    </Dialog>
  );
}

export function SetupLinkDialog({ store, onClose, pending, onSubmit }: BaseProps & { onSubmit: (currentPassword: string) => void }) {
  //
  const [password, setPassword] = useState('');

  useEffect(() => {
    //
    setPassword('');
  }, [store]);

  return (
    <Dialog
      open={Boolean(store)}
      onOpenChange={(open) => !open && onClose()}
      title="Yangi setup havola"
      description="Avvalgi ishlatilmagan havolalar bekor bo‘ladi. Do‘kon egasi yangi havola orqali o‘z parolini o‘rnatadi."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button variant="primary" loading={pending} disabled={!password} onClick={() => onSubmit(password)}>Havola yaratish</Button>
        </>
      }
    >
      <Field label="Platform egasining paroli">
        {(id) => <PasswordInput id={id} value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />}
      </Field>
    </Dialog>
  );
}

export interface SetupResult {
  storeName: string;
  username: string;
  url: string;
  expiresAt: string;
}

export function SetupResultDialog({ result, onClose }: { result: SetupResult | null; onClose: () => void }) {
  //
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    //
    setCopied(false);
  }, [result]);

  const copy = async () => {
    //
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
  };

  return (
    <Dialog
      open={Boolean(result)}
      onOpenChange={(open) => !open && onClose()}
      title="Do‘kon egasi uchun setup havola"
      description="Havolani egasiga yuboring: u ochib o‘z parolini o‘rnatadi va tizimga kiradi."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Yopish</Button>
          <Button variant="primary" onClick={() => void copy()}>
            {copied ? <Check /> : <Copy />} {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
          </Button>
        </>
      }
    >
      {result ? (
        <div className="grid gap-3">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-xl bg-surface-2 p-3 text-[13px]">
            <dt className="text-muted-foreground">Do‘kon</dt><dd className="font-medium">{result.storeName}</dd>
            <dt className="text-muted-foreground">Login</dt><dd className="font-medium">{result.username}</dd>
            <dt className="text-muted-foreground">Amal qiladi</dt><dd>{formatDateTime(result.expiresAt)} gacha</dd>
          </dl>
          <Input readOnly value={result.url} onFocus={(event) => event.currentTarget.select()} className="font-mono text-xs" />
        </div>
      ) : null}
    </Dialog>
  );
}
