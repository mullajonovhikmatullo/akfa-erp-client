import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { analyticsKeys } from '@store/store-view/analytics'
import { inventoryKeys } from '@store/store-view/inventory'
import { transferKeys } from '@store/store-view/transfer'
import { sessionDetailQueryOptions, useAuthStore } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { withAppBasePath } from '@/shared/lib/app-path'
import { useStoreT } from '@store/store-i18n'
import { connectSocket, getSocket, type TransferChangedPayload } from '@/shared/realtime/socket'

export function useRealtimeConnection() {
  //
  const t = useStoreT()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    //
    const socket = getSocket()
    let checkingSession = false

    if (!user) {
      socket.disconnect()
      return undefined
    }

    const handleTransferChanged = (payload: TransferChangedPayload) => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.refetchQueries({ queryKey: transferKeys.all, type: 'active' })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })

      if (payload.status === 'PENDING' && user.branchId === payload.toBranchId) {
        toast.info(t('transfers.newTransferNotification'), {
          description: t('transfers.newTransferNotificationDesc'),
        })
      }
    }

    const handleDisconnect = (reason: string) => {
      //
      if (reason !== 'io server disconnect' || checkingSession) return
      checkingSession = true

      void queryClient.fetchQuery({ ...sessionDetailQueryOptions(user.id), staleTime: 0 })
        .then((currentUser) => {
          //
          setUser(currentUser)
          connectSocket()
        })
        .catch(() => queryClient.cancelQueries().finally(() => {
          //
          queryClient.clear()
          logout()
          globalThis.window?.location.assign(withAppBasePath(`${ROUTES.LOGIN}?reason=expired`))
        }))
        .finally(() => {
          checkingSession = false
        })
    }

    socket.on('transfer:changed', handleTransferChanged)
    socket.on('disconnect', handleDisconnect)
    connectSocket()

    return () => {
      //
      socket.off('transfer:changed', handleTransferChanged)
      socket.off('disconnect', handleDisconnect)
    }
  }, [logout, queryClient, setUser, t, user])
}
