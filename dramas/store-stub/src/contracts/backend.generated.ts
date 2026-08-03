/* eslint-disable */
// Generated from backend OpenAPI. Do not edit manually.
// Run: pnpm contracts:sync

export interface AddPaymentRequest {
  "amountUzs"?: number
  "amountUsd"?: number
  "usdToUzsRate"?: number
  "paymentMethod": PaymentMethod
  "note"?: string
}

export type PaymentMethod = "CASH_UZS" | "CASH_USD" | "CARD" | "TRANSFER" | "MIXED" | "CREDIT"

export interface AdjustmentRequest {
  "branchId"?: string
  "productId": string
  "newQuantity": number
  "reason": string
}

export interface AdminResponse {
  "id"?: string
  "fullName"?: string
  "username"?: string
  "role"?: string
  "isActive"?: boolean
  "branchId"?: string | null
  "branch"?: {
  "id"?: string
  "name"?: string
}
  "createdAt"?: string
  "updatedAt"?: string
}

export type AnalyticsPeriod = "day" | "week" | "month"

export interface CategoryResponse {
  "id"?: string
  "name"?: string
  "description"?: string | null
  "isActive"?: boolean
  "createdAt"?: string
}

export interface CreateAdminRequest {
  "fullName": string
  "username": string
  "password": string
  "branchId": string
}

export interface CreateBranchDto {
  "name": string
  "address"?: string
  "phone"?: string
}

export interface CreateCategoryRequest {
  "name": string
  "description"?: string
}

export interface CreateCustomerRequest {
  "branchId"?: string
  "fullName": string
  "phone"?: string
  "address"?: string
  "balance"?: number
}

export interface CreateExpenseCategoryRequest {
  "name": string
  "description"?: string
}

export interface CreateExpenseRequest {
  "branchId"?: string
  "categoryId": string
  "amount": number
  "currency"?: "UZS" | "USD"
  "amountUsd"?: number
  "usdToUzsRate"?: number
  "description"?: string
  "expenseDate"?: string
}

export interface CreateProductRequest {
  "name": string
  "description"?: string
  "sku"?: string
  "unit": ProductUnit
  "categoryId"?: string
  "branchId"?: string
  "costPriceUzs": number
  "retailPriceUzs": number
  "wholesalePriceUzs": number
  "costPriceUsd"?: number
  "retailPriceUsd"?: number
  "wholesalePriceUsd"?: number
}

export type ProductUnit = "KG" | "PIECE"

export interface CreateSaleRequest {
  "branchId"?: string
  "customerId"?: string
  "saleType": SaleType
  "items": SaleItemRequest[]
  "paidAmountUzs"?: number
  "paidAmountUsd"?: number
  "usdToUzsRate"?: number
  "paymentMethod": PaymentMethod
  "note"?: string
}

export type SaleType = "RETAIL" | "WHOLESALE"

export interface SaleItemRequest {
  "productId": string
  "quantity": number
}

export interface CreateTransferRequest {
  "fromBranchId"?: string
  "toBranchId": string
  "items": TransferItem[]
  "note"?: string
}

export interface TransferItem {
  "productId"?: string
  "quantity"?: number
  "unitCostUzs"?: number
}

export interface CustomerResponse {
  "id"?: string
  "fullName"?: string
  "phone"?: string | null
  "address"?: string | null
  "balance"?: string
  "isActive"?: boolean
  "branch"?: {
  "id"?: string
  "name"?: string
}
}

export interface ExpenseCategory {
  "id"?: string
  "name"?: string
  "description"?: string | null
  "isActive"?: boolean
  "_count"?: {
  "expenses"?: number
}
}

export interface InventoryRecord {
  "id"?: string
  "quantity"?: string
  "updatedAt"?: string
  "branch"?: {
  "id"?: string
  "name"?: string
}
  "product"?: {
  "id"?: string
  "name"?: string
  "sku"?: string
  "unit"?: string
  "lowStockThreshold"?: string | null
}
}

export interface LoginRequest {
  "username": string
  "password": string
}

export interface LoginResponse {
  "accessToken": string
  "user": {
  "id": string
  "name": string
  "username": string
  "role": string
  "rawRole": string
  "storeId": string | null
  "branchId": string | null
}
}

export interface ProductResponse {
  "id"?: string
  "name"?: string
  "description"?: string | null
  "sku"?: string | null
  "unit"?: ProductUnit
  "costPriceUzs"?: string
  "retailPriceUzs"?: string
  "wholesalePriceUzs"?: string
  "costPriceUsd"?: string | null
  "retailPriceUsd"?: string | null
  "wholesalePriceUsd"?: string | null
  "isActive"?: boolean
  "primaryImageUrl"?: string | null
  "primaryThumbnailUrl"?: string | null
  "imageCount"?: number
  "images"?: ProductImageResponse[]
  "category"?: {
  "id"?: string
  "name"?: string
}
  "createdAt"?: string
  "updatedAt"?: string
}

export interface ProductImageResponse {
  "id": string
  "productId": string
  "url": string
  "thumbnailUrl": string
  "originalFilename": string
  "mimeType": "image/webp"
  "fileSize": number
  "width": number
  "height": number
  "isPrimary": boolean
  "sortOrder": number
  "createdAt": string
  "updatedAt": string
}

export interface ReorderProductImagesRequest {
  "imageIds": string[]
}

export interface SaleResponse {
  "id"?: string
  "saleType"?: SaleType
  "totalAmountUzs"?: string
  "paidAmountUzs"?: string
  "debtAmountUzs"?: string
  "branch"?: Record<string, unknown>
  "customer"?: Record<string, unknown> | null
  "soldBy"?: Record<string, unknown>
  "items"?: unknown[]
  "payments"?: unknown[]
  "createdAt"?: string
}

export interface StockInRequest {
  "branchId"?: string
  "productId": string
  "quantity": number
  "costPriceUzs": number
  "costPriceUsd"?: number
  "supplierNote"?: string
}

export interface StockMovement {
  "id"?: string
  "type"?: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT"
  "quantity"?: string
  "balanceAfter"?: string
  "note"?: string | null
  "createdAt"?: string
  "product"?: Record<string, unknown>
  "branch"?: Record<string, unknown>
  "createdBy"?: Record<string, unknown>
}

export type TransferStatus = "PENDING" | "COMPLETED" | "CANCELLED"

export interface UpdateAdminRequest {
  "fullName"?: string
  "branchId"?: string | null
  "isActive"?: boolean
}

export interface UpdateCategoryRequest {
  "name"?: string
  "description"?: string
  "isActive"?: boolean
}

export interface UpdateCustomerRequest {
  "fullName"?: string
  "phone"?: string
  "address"?: string
  "isActive"?: boolean
}

export interface UpdateExpenseCategoryRequest {
  "name"?: string
  "description"?: string | null
  "isActive"?: boolean
}

export interface UpdateProductRequest {
  "name"?: string
  "description"?: string
  "sku"?: string
  "unit"?: ProductUnit
  "categoryId"?: string
  "costPriceUzs"?: number
  "retailPriceUzs"?: number
  "wholesalePriceUzs"?: number
  "costPriceUsd"?: number
  "retailPriceUsd"?: number
  "wholesalePriceUsd"?: number
  "isActive"?: boolean
}

export type StoreStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED"

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED"

export type PaymentCurrency = "UZS" | "USD"

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

export interface TenantPayment {
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
  "branch": (PaymentBranch) | null
  "receiptMedia": (PaymentReceiptMedia) | null
}

export interface TenantBillingSummary {
  "id": string
  "name": string
  "status": StoreStatus
  "trialEndsAt": string
  "plan": {
  "code"?: PlanCode
  "name"?: string
  "monthlyPriceUzs"?: number
  "maxBranches"?: number | null
  "maxUsers"?: number | null
  "maxProducts"?: number | null
} | null
  "subscription": {
  "status"?: string
  "trialEndsAt"?: string
  "currentPeriodStart"?: string | null
  "currentPeriodEnd"?: string | null
  "nextPaymentDueAt"?: string | null
} | null
  "branches": PaymentBranch[]
}

export type PlanCode = string

export interface SubmitTenantPaymentPayload {
  "paidAt"?: string
  "note"?: string
  "receipt": {
  "fileName": string
  "mimeType": string
  "base64": string
}
}
