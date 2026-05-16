export { saleApi } from './api/sale.api';
export type { SaleFilters, SalePage, CreateSalePayload, AddPaymentPayload } from './api/sale.api';
export {
  saleKeys,
  useSales,
  useSalesPage,
  useSaleDetail,
  useCreateSale,
  useAddPayment,
  useSetDebtDeadline,
} from './model/sale.queries';
