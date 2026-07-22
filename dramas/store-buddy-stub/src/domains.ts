export const storeManagementDomains = [
  'analytics',
  'branch',
  'customer',
  'expense',
  'inventory',
  'product',
  'sale',
  'transfer',
  'user',
] as const

export type StoreManagementDomain = (typeof storeManagementDomains)[number]

export interface RestEndpointDescriptor {
  domain: StoreManagementDomain
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  permission?: string
}
