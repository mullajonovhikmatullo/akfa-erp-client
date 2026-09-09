import type { User } from '@store/store-shared'
import type { CreateAdminRequest, LoginRequest, UpdateAdminRequest } from '../../../contracts/backend.generated'

export type { User }

export type LoginPayload = LoginRequest

export interface LoginResponse {
  user: User
  accessToken: string
}

export interface GoogleSignInConfig {
  clientId: string | null
}

export interface GoogleLoginPayload {
  credential: string
  account?: LoginPayload
}

export type GoogleLoginResponse =
  | { status: 'authenticated'; session: LoginResponse }
  | { status: 'link_required'; email: string }

export type CreateAdminPayload = CreateAdminRequest

export type UpdateAdminPayload = UpdateAdminRequest

export interface UpdateProfilePayload {
  fullName?: string
  username?: string
}

export interface UpdateProfilePhotoPayload {
  base64Photo: string
  thumbnailPhoto: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ExchangeHandoffPayload {
  handoffCode: string
}

export interface CompleteAccountSetupPayload {
  setupCode: string
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
