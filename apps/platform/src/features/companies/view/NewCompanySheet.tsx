import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { PlatformStorePlan, ProvisionStorePayload } from '@store/platform-stub';
import { Button } from '../../../shared/ui/button';
import { Field, Input, Switch } from '../../../shared/ui/form';
import { Sheet } from '../../../shared/ui/overlay';
import { Select } from '../../../shared/ui/select';
import { planGroups } from './StoreDialogs';

const emptyForm = { storeName: '', ownerName: '', phone: '', email: '', username: '', planCode: '', startTrial: false };

interface NewCompanySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: PlatformStorePlan[];
  pending: boolean;
  onSubmit: (payload: ProvisionStorePayload) => void;
}

export function NewCompanySheet({ open, onOpenChange, plans, pending, onSubmit }: NewCompanySheetProps) {
  //
  const [form, setForm] = useState(emptyForm);
  const set = (key: keyof typeof emptyForm) => (value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const usernameValid = /^[a-zA-Z0-9_]{3,50}$/.test(form.username);
  const valid = form.storeName.trim().length >= 2 && form.ownerName.trim().length >= 2
    && form.phone.trim().length >= 7 && usernameValid && Boolean(form.planCode);
  const planOptions = planGroups(plans).map((group) => ({
    ...group,
    options: group.options.map((option) => ({ ...option, value: plans.find((plan) => plan.id === option.value)?.code ?? option.value })),
  }));

  useEffect(() => {
    //
    if (open) setForm(emptyForm);
  }, [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    //
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      storeName: form.storeName.trim(),
      ownerName: form.ownerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      username: form.username.trim(),
      planCode: form.planCode,
      startTrial: form.startTrial,
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Yangi kompaniya"
      description="Do‘kon, asosiy filial va egasi yaratiladi. Egasi setup havola orqali o‘z parolini o‘rnatadi."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button variant="primary" type="submit" form="new-company" loading={pending} disabled={!valid}>Yaratish</Button>
        </>
      }
    >
      <form id="new-company" className="grid gap-5" onSubmit={submit}>
        <section className="grid gap-4">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Do‘kon</h3>
          <Field label="Nomi">
            {(id) => <Input id={id} value={form.storeName} maxLength={120} autoFocus onChange={(event) => set('storeName')(event.target.value)} />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Egasi">
              {(id) => <Input id={id} value={form.ownerName} maxLength={100} onChange={(event) => set('ownerName')(event.target.value)} />}
            </Field>
            <Field label="Telefon">
              {(id) => <Input id={id} value={form.phone} maxLength={30} inputMode="tel" placeholder="+998 90 123 45 67" onChange={(event) => set('phone')(event.target.value)} />}
            </Field>
          </div>
          <Field label="Email" hint="Ixtiyoriy">
            {(id) => <Input id={id} type="email" value={form.email} maxLength={120} onChange={(event) => set('email')(event.target.value)} />}
          </Field>
        </section>

        <section className="grid gap-4 border-t border-border pt-5">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Kirish va tarif</h3>
          <Field
            label="Egasining logini"
            error={form.username && !usernameValid ? 'Faqat lotin harflari, raqam va _ (3–50 belgi)' : null}
          >
            {(id) => <Input id={id} value={form.username} maxLength={50} autoComplete="off" onChange={(event) => set('username')(event.target.value)} />}
          </Field>
          <Field label="Tarif">
            {(id) => <Select id={id} value={form.planCode || undefined} onValueChange={set('planCode')} placeholder="Tarifni tanlang" groups={planOptions} />}
          </Field>
          <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
            <span className="grid gap-0.5">
              <span className="text-[13px] font-medium">14 kunlik sinov</span>
              <span className="text-xs text-muted-foreground">
                O‘chiq bo‘lsa do‘kon to‘lov tasdiqlanguncha faqat ko‘rish rejimida ochiladi.
              </span>
            </span>
            <Switch checked={form.startTrial} onCheckedChange={set('startTrial')} />
          </label>
        </section>
      </form>
    </Sheet>
  );
}
