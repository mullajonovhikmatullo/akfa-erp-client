import { Check, FileText, ReceiptText, X } from 'lucide-react';
import type { PaymentStatus, PlatformPayment } from '@store/platform-stub';
import { formatDate, formatDateTime, formatMoney, paymentStatusLabels } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/button';
import { Badge, EmptyState, Skeleton, tableClass } from '../../../shared/ui/display';
import type { Tone } from '../../../shared/ui/display';

const statusTone: Record<PaymentStatus, Tone> = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

interface PaymentsListProps {
  payments: PlatformPayment[];
  loading: boolean;
  busyId: string | null;
  openingReceiptId: string | null;
  onApprove: (payment: PlatformPayment) => void;
  onReject: (payment: PlatformPayment) => void;
  onOpenReceipt: (payment: PlatformPayment) => void;
}

const period = (payment: PlatformPayment) =>
  payment.periodEnd ? `${formatDate(payment.periodStart)} – ${formatDate(payment.periodEnd)}` : 'Doimiy litsenziya';

function Actions({ payment, busyId, openingReceiptId, onApprove, onReject, onOpenReceipt }: Omit<PaymentsListProps, 'payments' | 'loading'> & { payment: PlatformPayment }) {
  //
  return (
    <div className="flex items-center justify-end gap-1">
      {payment.receiptMedia ? (
        <Button size="icon-sm" variant="ghost" aria-label="Chekni ko‘rish" title="Chekni ko‘rish" loading={openingReceiptId === payment.receiptMedia.id} onClick={() => onOpenReceipt(payment)}>
          {openingReceiptId === payment.receiptMedia.id ? null : <FileText />}
        </Button>
      ) : null}
      {payment.status === 'PENDING' ? (
        <>
          <Button size="sm" variant="ghost" className="text-danger hover:text-danger" onClick={() => onReject(payment)}>
            <X /> Rad etish
          </Button>
          <Button size="sm" variant="primary" loading={busyId === payment.id} onClick={() => onApprove(payment)}>
            <Check /> Tasdiqlash
          </Button>
        </>
      ) : null}
    </div>
  );
}

export function PaymentsList(props: PaymentsListProps) {
  //
  const { payments, loading } = props;

  if (loading) {
    return <div className="grid gap-2 p-5">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-12" />)}</div>;
  }
  if (payments.length === 0) {
    return <EmptyState icon={<ReceiptText />} title="To‘lov yo‘q" description="Bu filtr bo‘yicha to‘lov topilmadi." />;
  }

  return (
    <>
      <div className={`${tableClass.wrap} hidden md:block`}>
        <table className={tableClass.table}>
          <thead>
            <tr>
              <th className={tableClass.th}>Do‘kon</th>
              <th className={tableClass.th}>Summa</th>
              <th className={tableClass.th}>Davr</th>
              <th className={tableClass.th}>Holat</th>
              <th className={tableClass.th}>Yuborilgan</th>
              <th className={tableClass.th}><span className="sr-only">Amallar</span></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className={tableClass.row}>
                <td className={tableClass.td}>
                  <div className="grid">
                    <span className="font-medium">{payment.store.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {payment.submittedBy ? `${payment.submittedBy.fullName} yubordi` : 'Platform qayd etdi'}
                      {payment.note ? ` · ${payment.note}` : ''}
                    </span>
                  </div>
                </td>
                <td className={`${tableClass.td} tabular font-semibold whitespace-nowrap`}>{formatMoney(payment.amount, payment.currency)}</td>
                <td className={`${tableClass.td} text-xs whitespace-nowrap`}>{period(payment)}</td>
                <td className={tableClass.td}>
                  <div className="grid gap-1">
                    <Badge tone={statusTone[payment.status]} dot>{paymentStatusLabels[payment.status]}</Badge>
                    {payment.rejectionReason ? <span className="max-w-48 truncate text-xs text-muted-foreground" title={payment.rejectionReason}>{payment.rejectionReason}</span> : null}
                  </div>
                </td>
                <td className={`${tableClass.td} text-xs whitespace-nowrap text-muted-foreground`}>{formatDateTime(payment.createdAt)}</td>
                <td className={tableClass.td}><Actions {...props} payment={payment} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {payments.map((payment) => (
          <li key={payment.id} className="grid gap-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="grid min-w-0">
                <span className="truncate font-medium">{payment.store.name}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(payment.createdAt)} · {period(payment)}</span>
              </div>
              <span className="tabular font-semibold">{formatMoney(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Badge tone={statusTone[payment.status]} dot>{paymentStatusLabels[payment.status]}</Badge>
              <Actions {...props} payment={payment} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
