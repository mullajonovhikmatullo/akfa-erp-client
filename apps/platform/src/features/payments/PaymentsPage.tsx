import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PlatformSeekApi } from '@store/platform-stub';
import type { PaymentStatus, PlatformPayment } from '@store/platform-stub';
import { apiErrorMessage } from '../../shared/lib/apiError';
import { paymentStatusLabels } from '../../shared/lib/format';
import { Button } from '../../shared/ui/button';
import { Card, PageHeader, Segmented } from '../../shared/ui/display';
import { usePlatformStoresPage } from '../companies/hooks/usePlatformStoresPage';
import { usePaymentMutation } from './hooks/usePaymentMutation';
import { usePaymentsList } from './hooks/usePaymentsList';
import { CreatePaymentDialog, ReceiptDialog, RejectDialog } from './view/PaymentDialogs';
import type { ReceiptPreview } from './view/PaymentDialogs';
import { PaymentsList } from './view/PaymentsList';

type Filter = PaymentStatus | 'ALL';
const filters: Filter[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export function PaymentsPage() {
  //
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PlatformPayment | null>(null);
  const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptPreview | null>(null);
  const creating = searchParams.get('new') === '1';

  const paymentsQuery = usePaymentsList(filter === 'ALL' ? undefined : filter);
  const pendingQuery = usePaymentsList('PENDING');
  const storesQuery = usePlatformStoresPage({ page: 1, pageSize: 100 }, { enabled: creating });
  const { createPayment, approvePayment, rejectPayment } = usePaymentMutation();

  useEffect(() => () => {
    if (receipt) URL.revokeObjectURL(receipt.url);
  }, [receipt]);

  const setCreating = (open: boolean) => {
    //
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current);
      if (open) next.set('new', '1');
      else next.delete('new');
      return next;
    }, { replace: true });
  };

  const approve = (payment: PlatformPayment) => {
    //
    setBusyId(payment.id);
    approvePayment.mutate(payment.id, { onSettled: () => setBusyId(null) });
  };

  const openReceipt = async (payment: PlatformPayment) => {
    //
    if (!payment.receiptMedia) return;
    setOpeningReceiptId(payment.receiptMedia.id);
    try {
      const blob = await PlatformSeekApi.downloadMedia(payment.receiptMedia.id);
      setReceipt({
        url: URL.createObjectURL(blob),
        fileName: payment.receiptMedia.fileName,
        mimeType: payment.receiptMedia.mimeType,
        payment,
      });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Chekni ochib bo‘lmadi'));
    } finally {
      setOpeningReceiptId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="To‘lovlar"
        description="Do‘konlar yuborgan cheklar va qo‘lda qayd etilgan to‘lovlar"
        actions={<Button variant="primary" onClick={() => setCreating(true)}><Plus /> To‘lovni qayd etish</Button>}
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-3">
          <Segmented<Filter>
            value={filter}
            onValueChange={setFilter}
            options={filters.map((value) => ({
              value,
              label: value === 'ALL' ? 'Barchasi' : paymentStatusLabels[value],
              count: value === 'PENDING' ? pendingQuery.data?.length : undefined,
            }))}
          />
        </div>
        <PaymentsList
          payments={paymentsQuery.data ?? []}
          loading={paymentsQuery.isLoading}
          busyId={busyId}
          openingReceiptId={openingReceiptId}
          onApprove={approve}
          onReject={setRejectTarget}
          onOpenReceipt={(payment) => void openReceipt(payment)}
        />
      </Card>

      <CreatePaymentDialog
        open={creating}
        onOpenChange={setCreating}
        stores={storesQuery.data?.items ?? []}
        pending={createPayment.isPending}
        onSubmit={(payload) => createPayment.mutate(payload, { onSuccess: () => setCreating(false) })}
      />
      <RejectDialog
        payment={rejectTarget}
        onClose={() => setRejectTarget(null)}
        pending={rejectPayment.isPending}
        onSubmit={(note) => rejectTarget && rejectPayment.mutate(
          { paymentId: rejectTarget.id, note },
          { onSuccess: () => setRejectTarget(null) },
        )}
      />
      <ReceiptDialog preview={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
