/* eslint-disable */
// Generated from backend OpenAPI. Do not edit manually.
// Run: pnpm contracts:sync

export type PlanCode = string

export interface PlatformUser {
  "id": string
  "name": string
  "username": string
  "role": string
  "rawRole": string
  "storeId": string | null
  "branchId": string | null
  "mustChangePassword": boolean
}

export interface RegisterStorePayload {
  "storeName": string
  "ownerName": string
  "phone": string
  "email"?: string
  "username": string
  "password": string
  "confirmPassword": string
  "planCode"?: PublicPlanCode
}

export type PublicPlanCode = string

export interface RegisterStoreResult {
  "handoffCode": string
  "handoffExpiresAt": string
  "user": PlatformUser
  "store": RegisteredStore
  "branch": RegisteredBranch
  "subscription": RegisteredSubscription
}

export interface RegisteredStore {
  "id": string
  "name": string
  "slug": string
  "status": StoreStatus
  "billingVersion": number
  "trialEndsAt": string
}

export type StoreStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED"

export interface RegisteredBranch {
  "id": string
  "name": string
}

export interface RegisteredSubscription {
  "id": string
  "status": string
  "trialEndsAt": string
  "nextPaymentDueAt": string
}

export interface ExchangeHandoffPayload {
  "handoffCode": string
}

export interface CompleteAccountSetupPayload {
  "setupCode": string
  "newPassword": string
  "confirmPassword": string
}

export interface PublicPlan {
  "code": PublicPlanCode
  "name": string
  "monthlyPriceUzs": number
  "maxBranches": number | null
  "maxUsers": number | null
  "maxProducts": number | null
}
