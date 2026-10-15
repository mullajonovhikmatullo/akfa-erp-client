import { useQuery } from '@tanstack/react-query';
import { PlatformSeekApi } from '@store/platform-stub';

export function useManagedPlansList() {
  //
  return useQuery(PlatformSeekApi.fetch.listManagedPlans());
}
