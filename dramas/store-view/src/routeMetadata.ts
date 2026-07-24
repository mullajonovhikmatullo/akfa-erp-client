import type { StoreManagementDomain } from '@store/store-stub'

export interface AdminRouteMetadata {
  domain: StoreManagementDomain
  title: string
  permission?: string
}

export const createAdminRouteMetadata = (metadata: AdminRouteMetadata) => metadata
