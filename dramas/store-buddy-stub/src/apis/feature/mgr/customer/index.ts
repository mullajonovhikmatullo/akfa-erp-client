import { http } from '@erp/erp-shared'
import type {
  CreateCustomerPayload,
  Customer,
  CustomerDetail,
  CustomerFilters,
  RecentSale,
  UpdateCustomerPayload,
} from '../../../../models/domain/customer'

const parseCustomer = (raw: Record<string, unknown>): Customer => ({
  ...(raw as unknown as Customer),
  balance: Number(raw.balance),
})

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
  },
}

export const CustomerFlowApi = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
}

export const customerApi = {
  list: findCustomers,
  getById: findCustomer,
  create: createCustomer,
  update: (id: string, payload: UpdateCustomerPayload) => updateCustomer({ id, payload }),
  remove: deleteCustomer,
}
