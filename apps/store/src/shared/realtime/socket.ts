import { io, type Socket } from 'socket.io-client';
import type { TransferStatus } from '@store/store-stub';
import { BASE_URL, tokenStore } from '@/shared/api/client';

export type TransferChangedPayload = {
  transferId: string;
  status: TransferStatus;
  fromBranchId: string;
  toBranchId: string;
};

let socket: Socket | null = null;

export function getSocket(): Socket {
  //
  if (!socket) {
    const apiBasePath = BASE_URL.replace(/\/$/, '');
    socket = io({
      path: `${apiBasePath}/socket.io`,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }

  return socket;
}

export function connectSocket(): Socket {
  //
  const instance = getSocket();
  instance.auth = { token: tokenStore.get() };
  if (!instance.connected) instance.connect();
  return instance;
}
