import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { PlatformSeekApi } from '@store/platform-stub';
import type { ListStoresParams } from '@store/platform-stub';

export function usePlatformStoresPage(params: ListStoresParams, options: { enabled?: boolean } = {}) {
  //
  return useQuery({
    ...PlatformSeekApi.fetch.listStores(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
