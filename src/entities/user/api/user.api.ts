import { apiClient } from '@/shared/api/client';
import type { ApiResponse, User } from '@/shared/types';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export const userApi = {
  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<LoginResponse>>('/auth/login', payload)
      .then((r) => r.data.data),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
};
