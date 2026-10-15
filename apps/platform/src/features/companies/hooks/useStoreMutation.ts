import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlatformFlowApi } from '@store/platform-stub';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { paymentKeys } from '../../payments/hooks/paymentKeys';
import { dashboardKeys, storeKeys } from './storeKeys';

export function useStoreMutation() {
  //
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: storeKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
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

  const provisionStore = useMutation({
    mutationFn: PlatformFlowApi.provisionStore,
    ...handlers('Kompaniya yaratildi', 'Kompaniyani yaratib bo‘lmadi'),
  });
  const updateStoreStatus = useMutation({
    mutationFn: PlatformFlowApi.updateStoreStatus,
    ...handlers('Holat yangilandi', 'Holatni o‘zgartirib bo‘lmadi'),
  });
  const updateStorePlan = useMutation({
    mutationFn: PlatformFlowApi.updateStorePlan,
    ...handlers('Tarif almashtirildi', 'Tarifni almashtirib bo‘lmadi'),
  });
  const grantTrial = useMutation({
    mutationFn: PlatformFlowApi.grantTrial,
    ...handlers('14 kunlik sinov yoqildi', 'Sinovni yoqib bo‘lmadi'),
  });
  const grantLifetime = useMutation({
    mutationFn: PlatformFlowApi.grantLifetime,
    ...handlers('Doimiy litsenziya yoqildi', 'Litsenziyani yoqib bo‘lmadi'),
  });
  const regenerateOwnerSetup = useMutation({
    mutationFn: ({ storeId, currentPassword }: { storeId: string; currentPassword: string }) =>
      PlatformFlowApi.regenerateOwnerSetup(storeId, currentPassword),
    onError: (error: unknown) => {
      //
      toast.error(apiErrorMessage(error, 'Setup havolasini yaratib bo‘lmadi'));
    },
  });

  return { provisionStore, updateStoreStatus, updateStorePlan, grantTrial, grantLifetime, regenerateOwnerSetup };
}
