import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ManagedPlan, PlanBillingType, PlanMutationPayload } from '@store/platform-stub';
import { Button } from '../../../shared/ui/button';
import { Segmented } from '../../../shared/ui/display';
import { Field, Input, PasswordInput, Switch } from '../../../shared/ui/form';
import { Dialog } from '../../../shared/ui/overlay';

interface FormState {
  code: string;
  name: string;
  billingType: PlanBillingType;
  price: string;
  maxBranches: string;
  maxUsers: string;
  maxProducts: string;
  isActive: boolean;
  isPublic: boolean;
}

const emptyForm: FormState = {
  code: '', name: '', billingType: 'MONTHLY', price: '', maxBranches: '', maxUsers: '', maxProducts: '', isActive: true, isPublic: true,
};

const fromPlan = (plan: ManagedPlan): FormState => ({
  code: plan.code,
  name: plan.name,
  billingType: plan.billingType,
  price: String(plan.billingType === 'LIFETIME' ? plan.oneTimePriceUsd ?? '' : plan.monthlyPriceUzs),
  maxBranches: plan.maxBranches?.toString() ?? '',
  maxUsers: plan.maxUsers?.toString() ?? '',
  maxProducts: plan.maxProducts?.toString() ?? '',
  isActive: plan.isActive,
  isPublic: plan.isPublic,
});

const limitValue = (value: string) => (value.trim() === '' ? null : Number(value));

interface PlanFormDialogProps {
  open: boolean;
  plan: ManagedPlan | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: PlanMutationPayload) => void;
}

export function PlanFormDialog({ open, plan, pending, onOpenChange, onSubmit }: PlanFormDialogProps) {
  //
  const [form, setForm] = useState<FormState>(emptyForm);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const lifetime = form.billingType === 'LIFETIME';
  const typeLocked = Boolean(plan && (plan._count.stores > 0 || plan._count.subscriptions > 0));
  const price = Number(form.price);
  const limitsValid = [form.maxBranches, form.maxUsers, form.maxProducts].every((value) => value.trim() === '' || Number(value) >= 1);
  const valid = /^[A-Z][A-Z0-9_]{1,29}$/.test(form.code) && form.name.trim().length >= 2
    && Number.isFinite(price) && (lifetime ? price > 0 : price >= 0) && limitsValid;

  useEffect(() => {
    //
    if (open) setForm(plan ? fromPlan(plan) : emptyForm);
  }, [open, plan]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    //
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      code: form.code,
      name: form.name.trim(),
      billingType: form.billingType,
      monthlyPriceUzs: lifetime ? 0 : Math.round(price),
      oneTimePriceUsd: lifetime ? Math.round(price * 100) / 100 : null,
      maxBranches: limitValue(form.maxBranches),
      maxUsers: limitValue(form.maxUsers),
      maxProducts: limitValue(form.maxProducts),
      isActive: form.isActive,
      isPublic: !lifetime && form.isActive && form.isPublic,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={plan ? 'Tarifni tahrirlash' : 'Yangi tarif'}
      className="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button variant="primary" type="submit" form="plan-form" loading={pending} disabled={!valid}>{plan ? 'Saqlash' : 'Yaratish'}</Button>
        </>
      }
    >
      <form id="plan-form" className="grid gap-4" onSubmit={submit}>
        <Segmented<PlanBillingType>
          value={form.billingType}
          onValueChange={(value) => !typeLocked && set('billingType', value)}
          options={[{ value: 'MONTHLY', label: 'Oylik obuna' }, { value: 'LIFETIME', label: 'Bir martalik' }]}
          className="w-full [&>button]:flex-1 [&>button]:justify-center"
        />
        {typeLocked ? <p className="-mt-2 text-xs text-muted-foreground">Bu tarifni do‘konlar ishlatgani uchun turi o‘zgarmaydi.</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomi">
            {(id) => <Input id={id} value={form.name} maxLength={80} placeholder="Mega Business" onChange={(event) => set('name', event.target.value)} />}
          </Field>
          <Field label="Kodi">
            {(id) => (
              <Input
                id={id}
                value={form.code}
                maxLength={30}
                placeholder="MEGA_BUSINESS"
                className="font-mono text-[13px]"
                onChange={(event) => set('code', event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              />
            )}
          </Field>
        </div>
        <Field label={lifetime ? 'Bir martalik narx (USD)' : 'Oylik narx (so‘m)'}>
          {(id) => <Input id={id} value={form.price} inputMode="decimal" placeholder={lifetime ? '1000' : '599000'} onChange={(event) => set('price', event.target.value.replace(/[^0-9.]/g, ''))} />}
        </Field>
        <div className="grid grid-cols-3 gap-3">
          {(['maxBranches', 'maxUsers', 'maxProducts'] as const).map((key) => (
            <Field key={key} label={{ maxBranches: 'Filial', maxUsers: 'User', maxProducts: 'Mahsulot' }[key]} hint="Bo‘sh = ∞">
              {(id) => <Input id={id} value={form[key]} inputMode="numeric" onChange={(event) => set(key, event.target.value.replace(/\D/g, ''))} />}
            </Field>
          ))}
        </div>
        <div className="grid gap-2 rounded-xl border border-border p-3">
          <label className="flex items-center justify-between gap-4 text-[13px]">
            <span>Faol</span>
            <Switch checked={form.isActive} onCheckedChange={(checked) => set('isActive', checked)} />
          </label>
          <label className="flex items-center justify-between gap-4 text-[13px]">
            <span className="grid">
              Landingda ko‘rsatish
              {lifetime ? <span className="text-xs text-muted-foreground">Bir martalik tariflar landingda ko‘rinmaydi</span> : null}
            </span>
            <Switch checked={!lifetime && form.isActive && form.isPublic} disabled={lifetime || !form.isActive} onCheckedChange={(checked) => set('isPublic', checked)} />
          </label>
        </div>
      </form>
    </Dialog>
  );
}

export function DeletePlanDialog({ plan, pending, onClose, onSubmit }: {
  plan: ManagedPlan | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}) {
  //
  const [password, setPassword] = useState('');

  useEffect(() => {
    //
    setPassword('');
  }, [plan]);

  return (
    <Dialog
      open={Boolean(plan)}
      onOpenChange={(open) => !open && onClose()}
      title="Tarifni olib tashlash"
      description={plan ? <><span className="font-medium text-foreground">{plan.name}</span> ishlatilayotgan bo‘lsa arxivlanadi, aks holda butunlay o‘chiriladi.</> : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button variant="danger" loading={pending} disabled={!password} onClick={() => onSubmit(password)}>Olib tashlash</Button>
        </>
      }
    >
      <Field label="Platform egasining paroli">
        {(id) => <PasswordInput id={id} value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />}
      </Field>
    </Dialog>
  );
}
