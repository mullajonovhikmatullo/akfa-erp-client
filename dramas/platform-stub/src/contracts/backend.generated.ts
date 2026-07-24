/* eslint-disable */
// Generated from backend OpenAPI. Do not edit manually.
// Run: pnpm contracts:sync

export type StoreStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED"

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED"

export type PaymentCurrency = "UZS" | "USD"

export interface PlatformUser {
  "id": string
  "name": string
  "username": string
  "role": string
  "rawRole": string
  "storeId": string | null
  "branchId": string | null
}

export interface PlatformLoginPayload {
  "username": string
  "password": string
}

export interface PlatformLoginResponse {
  "accessToken": string
  "user": PlatformUser
}

export interface PlatformDashboardResponse {
  "storesByStatus": Record<string, number>
  "activeStores": number
  "overdueStores": number
  "pendingPayments": number
  "renewalsDueSoon": number
}

export interface PlatformStore {
  "id": string
  "name": string
  "slug": string
  "ownerName": string | null
  "phone": string | null
  "email": string | null
  "status": StoreStatus
  "trialEndsAt": string | null
  "activatedAt": string | null
  "suspendedAt": string | null
  "createdAt": string
  "updatedAt": string
  "plan": (PlatformStorePlan) | null
  "subscription": (PlatformStoreSubscription) | null
  "_count": PlatformStoreCounts
}

export interface PlatformStorePlan {
  "id": string
  "code": string
  "name": string
  "monthlyPriceUzs": number
}

export interface PlatformStoreSubscription {
  "id": string
  "status": string
  "trialEndsAt": string | null
  "currentPeriodStart": string | null
  "currentPeriodEnd": string | null
  "nextPaymentDueAt": string | null
  "lastPaymentAt": string | null
}

export interface PlatformStoreCounts {
  "branches": number
  "users": number
  "products": number
}

export interface PlatformStoresResponse {
  "items": PlatformStore[]
  "total": number
  "page": number
  "pageSize": number
}

export interface ListStoresParams {
  "status"?: StoreStatus
  "search"?: string
  "page"?: number
  "pageSize"?: number
}

export interface UpdateStoreStatusPayload {
  "status": StoreStatus
  "note"?: string
}

export interface PlatformPayment {
  "id": string
  "amount": number
  "currency": PaymentCurrency
  "status": PaymentStatus
  "periodStart": string | null
  "periodEnd": string | null
  "paidAt": string | null
  "approvedAt": string | null
  "rejectedAt": string | null
  "note": string | null
  "createdAt": string
  "store": PlatformPaymentStore
  "approvedBy": (PlatformPaymentApprover) | null
}

export interface PlatformPaymentStore {
  "id": string
  "name": string
  "slug": string
  "status": StoreStatus
}

export interface PlatformPaymentApprover {
  "id": string
  "fullName": string
  "username": string
}

export interface CreatePaymentPayload {
  "storeId": string
  "amount": number
  "currency"?: PaymentCurrency
  "paidAt"?: string
  "periodStart"?: string
  "periodEnd"?: string
  "note"?: string
}

export interface RejectPaymentPayload {
  "note"?: string
}
