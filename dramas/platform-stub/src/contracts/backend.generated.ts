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
  "mustChangePassword": boolean
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
  "billingVersion": number
  "trialEndsAt": string | null
  "activatedAt": string | null
  "suspendedAt": string | null
  "createdAt": string
  "updatedAt": string
  "plan": (PlatformStorePlan) | null
  "subscription": (PlatformStoreSubscription) | null
  "ownerAccount": (PlatformStoreOwnerAccount) | null
  "allowedStatusTransitions": StoreStatus[]
  "_count": PlatformStoreCounts
}

export interface PlatformStorePlan {
  "id": string
  "code": string
  "name": string
  "monthlyPriceUzs": number
  "maxBranches": number | null
  "maxUsers": number | null
  "maxProducts": number | null
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

export interface PlatformStoreOwnerAccount {
  "id": string
  "username": string
  "fullName": string
  "isActive": boolean
  "mustChangePassword": boolean
}

export interface PlatformStoreCounts {
  "branches": number
  "users": number
  "products": number
}

export interface ManagedPlan {
  "id": string
  "code": string
  "name": string
  "monthlyPriceUzs": number
  "maxBranches": number | null
  "maxUsers": number | null
  "maxProducts": number | null
  "isPublic": boolean
  "isActive": boolean
  "version": number
  "createdAt": string
  "updatedAt": string
  "_count": {
  "stores": number
  "subscriptions": number
}
}

export interface PlanMutationPayload {
  "code": string
  "name": string
  "monthlyPriceUzs": number
  "maxBranches": number | null
  "maxUsers": number | null
  "maxProducts": number | null
  "isPublic": boolean
  "isActive": boolean
}

export type UpdatePlanPayload = (PlanMutationPayload) & ({
  "expectedVersion": number
})

export interface DeletePlanPayload {
  "expectedVersion": number
  "currentPassword": string
}

export interface DeletePlanResult {
  "deleted": boolean
  "archived": boolean
  "plan": (ManagedPlan) | null
}

export interface PlatformStoresResponse {
  "items": PlatformStore[]
  "total": number
  "page": number
  "pageSize": number
}

export interface ProvisionStorePayload {
  "storeName": string
  "ownerName": string
  "phone": string
  "email"?: string
  "username": string
  "planCode": PlanCode
  "trialDays"?: number
}

export type PlanCode = string

export interface ProvisionStoreResult {
  "store": PlatformStore
  "owner": PlatformUser
  "setupCode": string
  "setupExpiresAt": string
}

export interface OwnerSetupResult {
  "owner": {
  "id": string
  "username": string
}
  "setupCode": string
  "setupExpiresAt": string
}

export interface RegenerateOwnerSetupPayload {
  "currentPassword": string
}

export interface ListStoresParams {
  "status"?: StoreStatus
  "search"?: string
  "page"?: number
  "pageSize"?: number
}

export interface UpdateStoreStatusPayload {
  "status": StoreStatus
  "expectedVersion": number
  "note"?: string
  "confirmation"?: string
  "currentPassword"?: string
}

export interface UpdateStorePlanPayload {
  "planId": string
  "expectedVersion": number
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
  "rejectionReason": string | null
  "note": string | null
  "createdAt": string
  "store": PlatformPaymentStore
  "approvedBy": (PlatformPaymentApprover) | null
  "branch": (PaymentBranch) | null
  "submittedBy": (PlatformPaymentApprover) | null
  "receiptMedia": (PaymentReceiptMedia) | null
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

export interface PaymentBranch {
  "id": string
  "name": string
}

export interface PaymentReceiptMedia {
  "id": string
  "fileName": string
  "mimeType": string
  "sizeBytes": number
}

export interface CreatePaymentPayload {
  "storeId": string
  "amount": number
  "currency"?: "UZS"
  "paidAt"?: string
  "note"?: string
}

export interface RejectPaymentPayload {
  "note": string
}
