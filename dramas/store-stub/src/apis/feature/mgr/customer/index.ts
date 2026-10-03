import { http } from '@store/store-shared'
import type {
  CreateCustomerPayload,
  Customer,
  CustomerDetail,
  CustomerFilters,
  CustomerPhoneCheckResult,
  CustomerPhoneMatch,
  RecentSale,
  UpdateCustomerPayload,
} from '../../../../models/domain/customer'

const parseCustomer = (raw: Record<string, unknown>): Customer => ({
  ...(raw as unknown as Customer),
  balance: Number(raw.balance),
})

const parsePhoneMatch = (raw: Record<string, unknown>): CustomerPhoneMatch => {
  //
  const { id, fullName, phone, branch } = raw as unknown as CustomerPhoneMatch
  return { id, fullName, phone, branch }
}

const parseDetail = (raw: Record<string, unknown>): CustomerDetail => ({
  ...parseCustomer(raw),
  recentSales: ((raw.recentSales as Record<string, unknown>[]) ?? []).map((sale) => ({
    ...(sale as unknown as RecentSale),
    totalAmountUzs: Number(sale.totalAmountUzs),
    paidAmountUzs: Number(sale.paidAmountUzs),
    debtAmountUzs: Number(sale.debtAmountUzs),
  })),
})

const findCustomers = (params?: CustomerFilters) =>
  http.get('/customers', { params }).then((response) => (response.data.data as Record<string, unknown>[]).map(parseCustomer))

const findCustomer = (id: string) => http.get(`/customers/${id}`).then((response) => parseDetail(response.data.data))

const createCustomer = (payload: CreateCustomerPayload) =>
  http.post('/customers', payload).then((response) => parseCustomer(response.data.data))

const updateCustomer = ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
  http.patch(`/customers/${id}`, payload).then((response) => parseCustomer(response.data.data))

const deleteCustomer = (id: string) => http.delete(`/customers/${id}`)

const checkCustomerPhone = (phone: string, branchId?: string): Promise<CustomerPhoneCheckResult> =>
  http.get('/customers/check-phone', { params: { phone, branchId } }).then((response): CustomerPhoneCheckResult => {
    //
    const data = response.data.data as { customer: Record<string, unknown> | null; linkedToBranch: boolean; normalizedPhone: string | null }
    const { normalizedPhone } = data
    if (!data.customer) return { customer: null, linkedToBranch: false, normalizedPhone }
    if (data.linkedToBranch) return { customer: parseCustomer(data.customer), linkedToBranch: true, normalizedPhone }
    return { customer: parsePhoneMatch(data.customer), linkedToBranch: false, normalizedPhone }
  })

const linkCustomerBranch = (id: string, branchId?: string) =>
  http.post(`/customers/${id}/branches`, { branchId }).then((response) => parseCustomer(response.data.data))

export const CustomerSeekApi = {
  findCustomers,
  findCustomer,
  fetch: {
    findCustomers: (params?: CustomerFilters) => ({
      queryKey: ['customers', 'findCustomers', params] as const,
      queryFn: () => findCustomers(params),
    }),
    findCustomer: (id: string) => ({
      queryKey: ['customers', 'findCustomer', id] as const,
      queryFn: () => findCustomer(id),
    }),
    checkCustomerPhone: (phone: string, branchId?: string) => ({
      queryKey: ['customers', 'checkPhone', phone, branchId] as const,
      queryFn: () => checkCustomerPhone(phone, branchId),
    }),
  },
}

export const CustomerFlowApi = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  linkCustomerBranch,
}

export const customerApi = {
  list: findCustomers,
  getById: findCustomer,
  create: createCustomer,
  update: (id: string, payload: UpdateCustomerPayload) => updateCustomer({ id, payload }),
  remove: deleteCustomer,
}
