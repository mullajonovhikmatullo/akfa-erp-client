export { saleApi } from './api/sale.api';
export type { SaleFilters, CreateSalePayload, AddPaymentPayload } from './api/sale.api';
export {
  saleKeys,
  useSales,
  useSaleDetail,
  useCreateSale,
  useAddPayment,
  useSetDebtDeadline,
} from './model/sale.queries';
