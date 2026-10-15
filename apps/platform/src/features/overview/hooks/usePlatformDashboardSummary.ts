import { useQuery } from '@tanstack/react-query';
import { PlatformSeekApi } from '@store/platform-stub';

export function usePlatformDashboardSummary() {
  //
  return useQuery(PlatformSeekApi.fetch.dashboard());
}
