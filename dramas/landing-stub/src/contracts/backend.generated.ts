/* eslint-disable */
// Generated from backend OpenAPI. Do not edit manually.
// Run: pnpm contracts:sync

export type PlanCode = "START" | "BUSINESS" | "NETWORK"

export interface PlatformUser {
  "id": string
  "name": string
  "username": string
  "role": string
  "rawRole": string
  "storeId": string | null
  "branchId": string | null
}

export interface RegisterStorePayload {
  "storeName": string
  "ownerName": string
  "phone": string
  "email"?: string
  "username": string
  "password": string
  "planCode"?: PlanCode
}

export interface RegisterStoreResult {
  "accessToken": string
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
