import { useEffect, useMemo, useState } from 'react';
import type { CreatePaymentPayload, PlatformPayment, PlatformStore } from '@store/platform-stub';
import { formatMoney, formatPlanPrice } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/button';
import { Field, Textarea } from '../../../shared/ui/form';
import { Dialog } from '../../../shared/ui/overlay';
import { Select } from '../../../shared/ui/select';

export interface ReceiptPreview {
  url: string;
  fileName: string;
  mimeType: string;
  payment: PlatformPayment;
}

export function ReceiptDialog({ preview, onClose }: { preview: ReceiptPreview | null; onClose: () => void }) {
  //
  return (
    <Dialog
      open={Boolean(preview)}
      onOpenChange={(open) => !open && onClose()}
      title={preview ? `Chek · ${preview.payment.store.name}` : 'Chek'}
      description={preview ? `${formatMoney(preview.payment.amount, preview.payment.currency)}${preview.payment.note ? ` · ${preview.payment.note}` : ''}` : undefined}
      className="max-w-3xl"
      footer={preview ? (
        <a href={preview.url} download={preview.fileName} className="text-[13px] font-medium text-primary hover:underline">
          Yuklab olish
        </a>
      ) : undefined}
    >
      {preview ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
          {preview.mimeType === 'application/pdf' ? (
            <iframe title={preview.fileName} src={preview.url} className="h-[65vh] w-full" />
          ) : (
            <img src={preview.url} alt={preview.fileName} className="mx-auto max-h-[65vh] object-contain" />
          )}
        </div>
      ) : null}
    </Dialog>
  );
}

export function RejectDialog({ payment, onClose, pending, onSubmit }: {
  payment: PlatformPayment | null;
  onClose: () => void;
  pending: boolean;
  onSubmit: (note: string) => void;
}) {
  //
  const [note, setNote] = useState('');

  useEffect(() => {
    //
    setNote('');
  }, [payment]);

  return (
    <Dialog
      open={Boolean(payment)}
      onOpenChange={(open) => !open && onClose()}
      title="To‘lovni rad etish"
      description={payment ? `${payment.store.name} · ${formatMoney(payment.amount, payment.currency)}. Sabab do‘kon egasiga ko‘rinadi.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
          <Button variant="danger" loading={pending} disabled={note.trim().length < 3} onClick={() => onSubmit(note.trim())}>Rad etish</Button>
        </>
      }
    >
      <Field label="Sabab" hint="Kamida 3 ta belgi">
        {(id) => <Textarea id={id} value={note} maxLength={500} autoFocus onChange={(event) => setNote(event.target.value)} />}
      </Field>
    </Dialog>
  );
}

const billable = (store: PlatformStore) =>
  store.status !== 'SUSPENDED' && store.status !== 'CANCELLED' && Boolean(store.plan) && (
    store.plan?.billingType === 'LIFETIME'
      ? Number(store.plan.oneTimePriceUsd) > 0 && !store.subscription?.lifetimeAccessAt
      : Number(store.plan?.monthlyPriceUzs) > 0
  );

export function CreatePaymentDialog({ open, onOpenChange, stores, pending, onSubmit }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: PlatformStore[];
  pending: boolean;
  onSubmit: (payload: CreatePaymentPayload) => void;
}) {
  //
  const [storeId, setStoreId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const options = useMemo(() => stores.filter(billable), [stores]);
  const store = options.find((item) => item.id === storeId);
  const lifetime = store?.plan?.billingType === 'LIFETIME';
  const amount = lifetime ? store?.plan?.oneTimePriceUsd ?? 0 : store?.plan?.monthlyPriceUzs ?? 0;

  useEffect(() => {
    //
    if (open) {
      setStoreId(undefined);
      setNote('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="To‘lovni qayd etish"
      description="Summa do‘kon tarifidan olinadi. Qayd etilgach, to‘lovni tasdiqlaganingizda muddat uzaytiriladi."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button
            variant="primary"
            loading={pending}
            disabled={!store}
            onClick={() => store && onSubmit({ storeId: store.id, amount, currency: lifetime ? 'USD' : 'UZS', note: note.trim() || undefined })}
          >
            Qayd etish
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Do‘kon">
          {(id) => (
            <Select
              id={id}
              value={storeId}
              onValueChange={setStoreId}
              placeholder={options.length ? 'Do‘konni tanlang' : 'To‘lov olinadigan do‘kon yo‘q'}
              options={options.map((item) => ({
                value: item.id,
                label: item.name,
                hint: item.plan ? `${item.plan.name} · ${formatPlanPrice(item.plan)}` : undefined,
              }))}
            />
          )}
        </Field>
        {store ? (
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
            <span className="text-[13px] text-muted-foreground">{lifetime ? 'Bir martalik litsenziya' : '1 oylik obuna'}</span>
            <span className="tabular text-lg font-semibold">{formatMoney(amount, lifetime ? 'USD' : 'UZS')}</span>
          </div>
        ) : null}
        <Field label="Izoh" hint="Masalan: Click chek raqami">
          {(id) => <Textarea id={id} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />}
        </Field>
      </div>
    </Dialog>
  );
}
