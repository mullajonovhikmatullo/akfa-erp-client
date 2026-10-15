import { useQuery } from '@tanstack/react-query';
import { PlatformSeekApi } from '@store/platform-stub';
import type { PaymentStatus } from '@store/platform-stub';

export function usePaymentsList(status?: PaymentStatus) {
  //
  return useQuery(PlatformSeekApi.fetch.listPayments(status));
}
