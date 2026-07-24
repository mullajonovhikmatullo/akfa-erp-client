export type LandingDomain = 'onboarding'

export interface LandingEndpointDescriptor {
  method: 'POST'
  path: string
  public: boolean
}

export const landingEndpoints: Record<LandingDomain, LandingEndpointDescriptor[]> = {
  onboarding: [
    {
      method: 'POST',
      path: '/public/stores/register',
      public: true,
    },
  ],
}
