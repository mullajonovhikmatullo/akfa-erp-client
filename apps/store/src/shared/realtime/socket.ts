import { io, type Socket } from 'socket.io-client';
import type { TransferStatus } from '@store/store-stub';
import { BASE_URL, tokenStore } from '@/shared/api/client';

export type TransferChangedPayload = {
  storeId: string;
  transferId: string;
  status: TransferStatus;
  fromBranchId: string;
  toBranchId: string;
};

let socket: Socket | null = null;
let socketToken: string | null = null;

export function getSocket(): Socket {
  //
  if (!socket) {
    const apiUrl = new URL(BASE_URL, window.location.origin);
    socket = io(apiUrl.origin, {
      path: `${apiUrl.pathname.replace(/\/$/, '')}/socket.io`,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }

  return socket;
}

export function connectSocket(): Socket {
  //
  const instance = getSocket();
  const token = tokenStore.get();
  if (socketToken !== token) instance.disconnect();
  socketToken = token;
  instance.auth = { token };
  if (!token) return instance;
  if (!instance.connected) instance.connect();
  return instance;
}
