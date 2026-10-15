import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlatformFlowApi } from '@store/platform-stub';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { dashboardKeys, storeKeys } from '../../companies/hooks/storeKeys';
import { planKeys } from './planKeys';

export function usePlanMutation() {
  //
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: planKeys.all }),
    queryClient.invalidateQueries({ queryKey: storeKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);
  const onError = (failure: string) => (error: unknown) => {
    //
    toast.error(apiErrorMessage(error, failure));
    void refresh();
  };

  const createPlan = useMutation({
    mutationFn: PlatformFlowApi.createPlan,
    onSuccess: async () => {
      //
      toast.success('Tarif yaratildi');
      await refresh();
    },
    onError: onError('Tarifni yaratib bo‘lmadi'),
  });
  const updatePlan = useMutation({
    mutationFn: PlatformFlowApi.updatePlan,
    onSuccess: async () => {
      //
      toast.success('Tarif saqlandi');
      await refresh();
    },
    onError: onError('Tarifni saqlab bo‘lmadi'),
  });
  const deletePlan = useMutation({
    mutationFn: PlatformFlowApi.deletePlan,
    onSuccess: async (result) => {
      //
      toast.success(result.archived ? 'Ishlatilayotgan tarif arxivlandi' : 'Tarif o‘chirildi');
      await refresh();
    },
    onError: onError('Tarifni olib tashlab bo‘lmadi'),
  });

  return { createPlan, updatePlan, deletePlan };
}
