export const platformDomains = ['auth', 'dashboard', 'store', 'payment'] as const

export type PlatformDomain = (typeof platformDomains)[number]

export interface PlatformEndpointDescriptor {
  domain: PlatformDomain
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  ownerOnly?: boolean
}
