import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analyticsKeys } from '@store/store-view/analytics';
import { inventoryKeys } from '@store/store-view/inventory';
import { transferKeys } from '@store/store-view/transfer';
import { useAuthStore } from '@/entities/user';
import { connectSocket, getSocket, type TransferChangedPayload } from '@/shared/realtime/socket';
import { useT } from '@/shared/lib/i18n';

export function RealtimeProvider({ children }: { children: ReactNode }) {
  //
  const t = useT();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    //
    const socket = getSocket();

    if (!user) {
      socket.disconnect();
      return undefined;
    }

    const handleTransferChanged = (payload: TransferChangedPayload) => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      queryClient.refetchQueries({ queryKey: transferKeys.all, type: 'active' });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });

      if (payload.status === 'PENDING' && user.branchId === payload.toBranchId) {
        toast.info(t('transfers.newTransferNotification'), {
          description: t('transfers.newTransferNotificationDesc'),
        });
      }
    };

    socket.on('transfer:changed', handleTransferChanged);
    connectSocket();

    return () => {
      //
      socket.off('transfer:changed', handleTransferChanged);
    };
  }, [queryClient, t, user]);

  return children;
}
