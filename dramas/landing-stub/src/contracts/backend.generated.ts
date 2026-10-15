/* eslint-disable */
// Generated from backend OpenAPI. Do not edit manually.
// Run: pnpm contracts:sync

export type PlanCode = string

export interface PublicPlan {
  "code": PublicPlanCode
  "name": string
  "monthlyPriceUzs": number
  "maxBranches": number | null
  "maxUsers": number | null
  "maxProducts": number | null
}

export type PublicPlanCode = string
