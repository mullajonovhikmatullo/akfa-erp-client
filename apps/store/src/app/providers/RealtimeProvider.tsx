import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analyticsKeys } from '@store/store-view/analytics';
import { inventoryKeys } from '@store/store-view/inventory';
import { transferKeys } from '@store/store-view/transfer';
import { UserFlowApi } from '@store/store-stub';
import { useAuthStore } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { connectSocket, getSocket, type TransferChangedPayload } from '@/shared/realtime/socket';
import { useT } from '@/shared/lib/i18n';

export function RealtimeProvider({ children }: { children: ReactNode }) {
  //
  const t = useT();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    //
    const socket = getSocket();
    let checkingSession = false;

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

    const handleDisconnect = (reason: string) => {
      if (reason !== 'io server disconnect' || checkingSession) return;
      checkingSession = true;

      void UserFlowApi.me()
        .then((currentUser) => {
          setUser(currentUser);
          connectSocket();
        })
        .catch(() =>
          queryClient.cancelQueries().finally(() => {
            queryClient.clear();
            logout();
            globalThis.window?.location.assign(`${ROUTES.LOGIN}?reason=expired`);
          }),
        )
        .finally(() => {
          checkingSession = false;
        });
    };

    socket.on('transfer:changed', handleTransferChanged);
    socket.on('disconnect', handleDisconnect);
    connectSocket();

    return () => {
      //
      socket.off('transfer:changed', handleTransferChanged);
      socket.off('disconnect', handleDisconnect);
    };
  }, [logout, queryClient, setUser, t, user]);

  return children;
}
