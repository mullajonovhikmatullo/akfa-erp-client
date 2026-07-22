import type { User } from '@erp/erp-shared'

export type { User }

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
}

export interface CreateAdminPayload {
  fullName: string
  username: string
  password: string
  branchId: string
}

export interface UpdateAdminPayload {
  fullName?: string
  branchId?: string | null
  isActive?: boolean
}

export interface UpdateProfilePayload {
  fullName?: string
  username?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AdminPage {
  items: User[]
  total: number
  totalAssigned: number
  totalUnassigned: number
}

export interface AdminPageQuery {
  page: number
  pageSize: number
}
