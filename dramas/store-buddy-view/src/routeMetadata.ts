import type { StoreManagementDomain } from '@erp/store-buddy-stub'

export interface AdminRouteMetadata {
  domain: StoreManagementDomain
  title: string
  permission?: string
}

export const createAdminRouteMetadata = (metadata: AdminRouteMetadata) => metadata
