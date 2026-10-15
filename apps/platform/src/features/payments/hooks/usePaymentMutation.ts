import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlatformFlowApi } from '@store/platform-stub';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { dashboardKeys, storeKeys } from '../../companies/hooks/storeKeys';
import { paymentKeys } from './paymentKeys';

export function usePaymentMutation() {
  //
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
    queryClient.invalidateQueries({ queryKey: storeKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);
  const handlers = (success: string, failure: string) => ({
    onSuccess: async () => {
      //
      toast.success(success);
      await refresh();
    },
    onError: (error: unknown) => {
      //
      toast.error(apiErrorMessage(error, failure));
      void refresh();
    },
  });

  const createPayment = useMutation({
    mutationFn: PlatformFlowApi.createPayment,
    ...handlers('To‘lov qayd etildi', 'To‘lovni qayd etib bo‘lmadi'),
  });
  const approvePayment = useMutation({
    mutationFn: PlatformFlowApi.approvePayment,
    ...handlers('To‘lov tasdiqlandi', 'To‘lovni tasdiqlab bo‘lmadi'),
  });
  const rejectPayment = useMutation({
    mutationFn: PlatformFlowApi.rejectPayment,
    ...handlers('To‘lov rad etildi', 'To‘lovni rad etib bo‘lmadi'),
  });

  return { createPayment, approvePayment, rejectPayment };
}
