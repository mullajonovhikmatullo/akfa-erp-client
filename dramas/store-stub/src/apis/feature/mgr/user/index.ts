import { createTokenStore, http } from '@store/store-shared'
import type { ApiResponse } from '@store/store-shared'
import type {
  AdminPage,
  AdminPageQuery,
  ChangePasswordPayload,
  CompleteAccountSetupPayload,
  CreateAdminPayload,
  ExchangeHandoffPayload,
  LoginPayload,
  LoginResponse,
  UpdateAdminPayload,
  UpdateProfilePhotoPayload,
  UpdateProfilePayload,
  User,
} from '../../../../models/domain/user'

const storeTokenStore = createTokenStore()

const normalizeRole = (role: unknown): User['role'] =>
  role === 'STORE_OWNER' || role === 'store_owner' ? 'store_owner' : 'branch_admin'

const normalizeUser = (u: Record<string, unknown>): User =>
  ({
    ...u,
    name: (u.fullName ?? u.name) as string,
    role: normalizeRole(u.role),
  }) as User

const parseUsers = (r: { data: unknown }) => {
  //
  const body = r.data as Record<string, unknown>
  const arr = (Array.isArray(body) ? body : body.data) as Record<string, unknown>[]
  return arr.map(normalizeUser)
}

const parseUser = (r: { data: unknown }) => {
  //
  const body = r.data as Record<string, unknown>
  const raw = (body.data ?? body) as Record<string, unknown>
  return normalizeUser(raw)
}

const login = (payload: LoginPayload) =>
  http.post<ApiResponse<LoginResponse>>('/auth/login', payload).then((r) => r.data.data)

const exchangeHandoff = (payload: ExchangeHandoffPayload) =>
  http.post<ApiResponse<LoginResponse>>('/auth/handoff/exchange', payload).then((r) => r.data.data)

const completeAccountSetup = (payload: CompleteAccountSetupPayload) =>
  http.post<ApiResponse<LoginResponse>>('/auth/setup/complete', payload).then((r) => r.data.data)

const me = () => http.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data)

const findUsers = () => http.get('/admins').then(parseUsers)

const findAdminsPage = (params: AdminPageQuery): Promise<AdminPage> =>
  http
    .get<ApiResponse<{ items: Record<string, unknown>[]; total: number; totalAssigned: number; totalUnassigned: number }>>(
      '/admins',
      { params },
    )
    .then((r) => ({
      items: r.data.data.items.map(normalizeUser),
      total: r.data.data.total,
      totalAssigned: r.data.data.totalAssigned,
      totalUnassigned: r.data.data.totalUnassigned,
    }))

const createAdmin = (payload: CreateAdminPayload) => http.post('/admins', payload).then(parseUser)

const updateAdmin = ({ id, data }: { id: string; data: UpdateAdminPayload }) =>
  http.patch(`/admins/${id}`, data).then(parseUser)

const deleteAdmin = (id: string) => http.delete(`/admins/${id}`)

const assignBranch = ({ userId, branchId }: { userId: string; branchId: string | null }) =>
  http.patch(`/admins/${userId}`, { branchId }).then(parseUser)

const updateProfile = (payload: UpdateProfilePayload) =>
  http.patch<ApiResponse<User>>('/auth/profile', payload).then((r) => r.data.data)

const updateProfilePhoto = (payload: UpdateProfilePhotoPayload) =>
  http.put<ApiResponse<User>>('/auth/profile/photo', payload).then((r) => r.data.data)

const deleteProfilePhoto = () =>
  http.delete<ApiResponse<User>>('/auth/profile/photo').then((r) => r.data.data)

const changePassword = (payload: ChangePasswordPayload) =>
  http
    .post<ApiResponse<{ message: string; accessToken: string }>>('/auth/change-password', payload)
    .then((r) => {
      storeTokenStore.set(r.data.data.accessToken)
      return r.data
    })

export const UserSeekApi = {
  findUsers,
  findAdminsPage,
  fetch: {
    findUsers: () => ({
      queryKey: ['users', 'findUsers'] as const,
      queryFn: findUsers,
    }),
    findAdminsPage: (params: AdminPageQuery) => ({
      queryKey: ['users', 'findUsers', 'paginated', params.page, params.pageSize] as const,
      queryFn: () => findAdminsPage(params),
    }),
  },
}

export const UserFlowApi = {
  login,
  exchangeHandoff,
  completeAccountSetup,
  me,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  assignBranch,
  updateProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  changePassword,
}

export const userApi = {
  login,
  exchangeHandoff,
  completeAccountSetup,
  me,
  list: findUsers,
  listPaginated: findAdminsPage,
  create: createAdmin,
  update: (id: string, data: UpdateAdminPayload) => updateAdmin({ id, data }),
  delete: deleteAdmin,
  assignBranch: (userId: string, branchId: string | null) => assignBranch({ userId, branchId }),
  updateProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  changePassword,
}
