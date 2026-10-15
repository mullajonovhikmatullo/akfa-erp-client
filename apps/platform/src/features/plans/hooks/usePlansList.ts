import { useQuery } from '@tanstack/react-query';
import { PlatformSeekApi } from '@store/platform-stub';

export function usePlansList() {
  //
  return useQuery(PlatformSeekApi.fetch.listPlans());
}
