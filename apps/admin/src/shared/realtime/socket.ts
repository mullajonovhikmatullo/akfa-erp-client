import { io, type Socket } from 'socket.io-client';
import { BASE_URL, tokenStore } from '@/shared/api/client';

export type TransferChangedPayload = {
  transferId: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  fromBranchId: string;
  toBranchId: string;
};

let socket: Socket | null = null;

export function getSocket(): Socket {
  //
  if (!socket) {
    socket = io(BASE_URL, {
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
