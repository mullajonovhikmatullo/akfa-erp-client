import { http } from '@store/store-shared'
import type {
  AddPaymentPayload,
  CreateSalePayload,
  DebtPaymentPage,
  DebtPaymentFilters,
  SaleDetail,
  SaleFilters,
  SaleListItem,
  SalePage,
  SalePageQuery,
  SaleReport,
  SaleReportQuery,
  SaleSettings,
} from '../../../../models/domain/sale'

type Raw = Record<string, unknown>

const parseSale = (raw: Raw): SaleListItem => ({
  ...(raw as unknown as SaleListItem),
  totalAmountUzs: Number(raw.totalAmountUzs),
  discountPercent: Number(raw.discountPercent ?? 0),
  discountAmountUzs: Number(raw.discountAmountUzs ?? 0),
  paidAmountUzs: Number(raw.paidAmountUzs),
  debtAmountUzs: Number(raw.debtAmountUzs),
})

const parseSaleDetail = (raw: Raw): SaleDetail => ({
  ...parseSale(raw),
  items: ((raw.items as Raw[]) ?? []).map((item) => ({
    ...(item as unknown as SaleDetail['items'][0]),
    quantity: Number(item.quantity),
    listUnitPrice: item.listUnitPrice != null ? Number(item.listUnitPrice) : null,
    discountPercent: Number(item.discountPercent ?? 0),
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

const findSalesReport = (params: SaleReportQuery): Promise<SaleReport> =>
  http.get('/sales/report', { params }).then((response) => {
    //
    const body = response.data.data as Omit<SaleReport, 'sales'> & { sales: Raw[] | null }
    return { ...body, sales: body.sales ? body.sales.map(parseSale) : null }
  })

const findSale = (id: string) => http.get(`/sales/${id}`).then((response) => parseSaleDetail(response.data.data))

const findDebtPayments = (params: DebtPaymentFilters): Promise<DebtPaymentPage> =>
  http.get('/sales/payments', { params }).then((response) => {
    const body = response.data.data as DebtPaymentPage
    return {
      ...body,
      items: body.items.map((payment) => ({
        ...payment,
        amountUzs: Number(payment.amountUzs),
        amountUsd: Number(payment.amountUsd),
        usdToUzsRate: payment.usdToUzsRate != null ? Number(payment.usdToUzsRate) : null,
        sale: { ...payment.sale, debtAmountUzs: Number(payment.sale.debtAmountUzs) },
      })),
    }
  })

const parseSaleSettings = (raw: Raw): SaleSettings => ({
  discountEnabled: Boolean(raw.discountEnabled),
  defaultDiscountPercent: Number(raw.defaultDiscountPercent ?? 0),
})

const findSaleSettings = () => http.get('/sales/settings').then((response) => parseSaleSettings(response.data.data))

const updateSaleSettings = (payload: SaleSettings) =>
  http.put('/sales/settings', payload).then((response) => parseSaleSettings(response.data.data))

const createSale = (payload: CreateSalePayload) => http.post('/sales', payload).then((response) => parseSaleDetail(response.data.data))

const addPayment = ({ saleId, payload }: { saleId: string; payload: AddPaymentPayload }) =>
  http.post(`/sales/${saleId}/payments`, payload).then((response) => parseSaleDetail(response.data.data))

const setDebtDeadline = ({ saleId, debtDueDate }: { saleId: string; debtDueDate: string | null }) =>
  http.patch(`/sales/${saleId}/debt-deadline`, { debtDueDate }).then((response) => parseSale(response.data.data))

export const SaleSeekApi = {
  findSales,
  findSalesPage,
  findSale,
  findSalesReport,
  findDebtPayments,
  findSaleSettings,
  fetch: {
    findSales: (params?: SaleFilters) => ({
      queryKey: ['sales', 'findSales', params] as const,
      queryFn: () => findSales(params),
    }),
    findSalesPage: (params: SalePageQuery) => ({
      queryKey: ['sales', 'findSales', 'paginated', params.page, params.pageSize, params] as const,
      queryFn: () => findSalesPage(params),
    }),
    findSalesReport: (params: SaleReportQuery) => ({
      queryKey: ['sales', 'report', params] as const,
      queryFn: () => findSalesReport(params),
    }),
    findSale: (id: string) => ({
      queryKey: ['sales', 'findSale', id] as const,
      queryFn: () => findSale(id),
    }),
    findDebtPayments: (params: DebtPaymentFilters) => ({
      queryKey: ['sales', 'debtPayments', params] as const,
      queryFn: () => findDebtPayments(params),
    }),
    findSaleSettings: () => ({
      queryKey: ['sale-settings'] as const,
      queryFn: findSaleSettings,
    }),
  },
}

export const SaleFlowApi = {
  createSale,
  addPayment,
  setDebtDeadline,
  updateSaleSettings,
}

export const saleApi = {
  list: findSales,
  listPaginated: findSalesPage,
  getById: findSale,
  create: createSale,
  addPayment: (saleId: string, payload: AddPaymentPayload) => addPayment({ saleId, payload }),
  setDebtDeadline: (saleId: string, debtDueDate: string | null) => setDebtDeadline({ saleId, debtDueDate }),
}
