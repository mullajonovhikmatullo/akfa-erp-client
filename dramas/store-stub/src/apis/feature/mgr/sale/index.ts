import { http } from '@store/store-shared'
import type {
  AddPaymentPayload,
  CreateSalePayload,
  SaleDetail,
  SaleFilters,
  SaleListItem,
  SalePage,
  SalePageQuery,
} from '../../../../models/domain/sale'

type Raw = Record<string, unknown>

const parseSale = (raw: Raw): SaleListItem => ({
  ...(raw as unknown as SaleListItem),
  totalAmountUzs: Number(raw.totalAmountUzs),
  paidAmountUzs: Number(raw.paidAmountUzs),
  debtAmountUzs: Number(raw.debtAmountUzs),
})

const parseSaleDetail = (raw: Raw): SaleDetail => ({
  ...parseSale(raw),
  items: ((raw.items as Raw[]) ?? []).map((item) => ({
    ...(item as unknown as SaleDetail['items'][0]),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
  })),
  payments: ((raw.payments as Raw[]) ?? []).map((payment) => ({
    ...(payment as unknown as SaleDetail['payments'][0]),
    amountUzs: Number(payment.amountUzs),
    amountUsd: Number(payment.amountUsd),
    usdToUzsRate: payment.usdToUzsRate != null ? Number(payment.usdToUzsRate) : null,
  })),
})

const findSales = (params?: SaleFilters) => http.get('/sales', { params }).then((response) => (response.data.data as Raw[]).map(parseSale))

const findSalesPage = (params: SalePageQuery): Promise<SalePage> =>
  http.get('/sales', { params }).then((response) => {
    //
    const body = response.data.data as { items: Raw[]; total: number; totalWithDebt: number }
    return {
      items: body.items.map(parseSale),
      total: body.total,
      totalWithDebt: body.totalWithDebt,
    }
  })

const findSale = (id: string) => http.get(`/sales/${id}`).then((response) => parseSaleDetail(response.data.data))

const createSale = (payload: CreateSalePayload) => http.post('/sales', payload).then((response) => parseSaleDetail(response.data.data))

const addPayment = ({ saleId, payload }: { saleId: string; payload: AddPaymentPayload }) =>
  http.post(`/sales/${saleId}/payments`, payload).then((response) => parseSaleDetail(response.data.data))

const setDebtDeadline = ({ saleId, debtDueDate }: { saleId: string; debtDueDate: string | null }) =>
  http.patch(`/sales/${saleId}/debt-deadline`, { debtDueDate }).then((response) => parseSale(response.data.data))

export const SaleSeekApi = {
  findSales,
  findSalesPage,
  findSale,
  fetch: {
    findSales: (params?: SaleFilters) => ({
      queryKey: ['sales', 'findSales', params] as const,
      queryFn: () => findSales(params),
    }),
    findSalesPage: (params: SalePageQuery) => ({
      queryKey: ['sales', 'findSales', 'paginated', params.page, params.pageSize, params] as const,
      queryFn: () => findSalesPage(params),
    }),
    findSale: (id: string) => ({
      queryKey: ['sales', 'findSale', id] as const,
      queryFn: () => findSale(id),
    }),
  },
}

export const SaleFlowApi = {
  createSale,
  addPayment,
  setDebtDeadline,
}

export const saleApi = {
  list: findSales,
  listPaginated: findSalesPage,
  getById: findSale,
  create: createSale,
  addPayment: (saleId: string, payload: AddPaymentPayload) => addPayment({ saleId, payload }),
  setDebtDeadline: (saleId: string, debtDueDate: string | null) => setDebtDeadline({ saleId, debtDueDate }),
}
