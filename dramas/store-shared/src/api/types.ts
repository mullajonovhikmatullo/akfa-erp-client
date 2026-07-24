export type FirstParameter<F extends (...args: any[]) => any> = Parameters<F>[0]

export interface FailureMessage {
  exceptionName?: string
  exceptionMessage?: string
  exceptionCode?: string
  message?: string
}

export interface CommandResponse {
  entityIds?: string[]
  requestFailed?: boolean
  failureMessage?: FailureMessage
}

export interface Offset<T = any> {
  offset: number
  limit: number
  totalCount?: number
  previous?: boolean
  next?: boolean
  sortDirection?: 'ASCENDING' | 'DESCENDING'
  sortingField?: keyof T | string
}

export interface FetchResponse<T = any> {
  fetchResult: T
  requestFailed?: boolean
  failureMessage?: FailureMessage
  offset?: Offset<T extends Array<infer U> ? U : T>
}

export interface QueryResponse<T = any> {
  queryResult: T
  requestFailed?: boolean
  failureMessage?: FailureMessage
  offset?: Offset<T extends Array<infer U> ? U : T>
}

export interface FetchRequest<T = any> {
  offset?: Offset<T extends Array<infer U> ? U : T>
}

export interface QueryRequest<T = any> {
  offset?: Offset<T extends Array<infer U> ? U : T>
}

export type OffsetFetchRequest<T = any> = FetchRequest<T>
export type OffsetQueryRequest<T = any> = QueryRequest<T>
export interface CommandRequest {}

export interface NameValue<T = any> {
  name: keyof T | string
  value: unknown
}

export interface NameValueList<T = any> {
  nameValues: NameValue<T>[]
}

export interface IdName {
  id: string
  name: string
  [key: string]: unknown
}

export interface DomainEntity {
  id: string
  entityVersion?: number
  registeredBy?: string
  registeredOn?: number | string
  modifiedBy?: string
  modifiedOn?: number | string
}

export interface StageEntity extends DomainEntity {
  tenantId?: string
  shopId?: string
}

export interface CreationDataObject {
  additionalAttributes?: NameValueList
}

export type LangStrings =
  | string
  | {
      defaultLangCode: string
      langStringMap: Record<string, string>
    }

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
}

export interface DateRangeParams {
  from?: string
  to?: string
}
