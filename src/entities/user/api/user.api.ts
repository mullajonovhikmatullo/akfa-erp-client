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

export interface CreateAdminPayload {
  fullName: string;
  username: string;
  password: string;
  branchId: string;
}

export interface UpdateAdminPayload {
  fullName?: string;
  branchId?: string | null;
  isActive?: boolean;
}

const normalizeRole = (role: unknown): 'super_admin' | 'branch_admin' =>
  role === 'SUPER_ADMIN' || role === 'super_admin' ? 'super_admin' : 'branch_admin';

const normalizeUser = (u: Record<string, unknown>): User => ({
  ...u,
  name: (u.fullName ?? u.name) as string,
  role: normalizeRole(u.role),
}) as User;

const parseUsers = (r: { data: unknown }) => {
  const body = r.data as Record<string, unknown>;
  const arr = (Array.isArray(body) ? body : body.data) as Record<string, unknown>[];
  return arr.map(normalizeUser);
};

const parseUser = (r: { data: unknown }) => {
  const body = r.data as Record<string, unknown>;
  const raw = (body.data ?? body) as Record<string, unknown>;
  return normalizeUser(raw);
};

export const userApi = {
  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<LoginResponse>>('/auth/login', payload)
      .then((r) => r.data.data),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),

  list: () =>
    apiClient.get('/admins').then(parseUsers),

  create: (payload: CreateAdminPayload) =>
    apiClient.post('/admins', payload).then(parseUser),

  update: (id: string, payload: UpdateAdminPayload) =>
    apiClient.patch(`/admins/${id}`, payload).then(parseUser),

  delete: (id: string) =>
    apiClient.delete(`/admins/${id}`),

  assignBranch: (userId: string, branchId: string | null) =>
    apiClient
      .patch(`/admins/${userId}`, { branchId })
      .then(parseUser),
};
