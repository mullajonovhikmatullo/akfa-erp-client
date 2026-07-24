import type { User } from '@store/store-shared'
import type { CreateAdminRequest, LoginRequest, UpdateAdminRequest } from '../../../contracts/backend.generated'

export type { User }

export type LoginPayload = LoginRequest

export interface LoginResponse {
  user: User
  accessToken: string
}

export type CreateAdminPayload = CreateAdminRequest

export type UpdateAdminPayload = UpdateAdminRequest

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
