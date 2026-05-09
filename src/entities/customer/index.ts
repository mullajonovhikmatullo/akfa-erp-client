export { customerApi } from './api/customer.api';
export type { CustomerFilters, CreateCustomerPayload, UpdateCustomerPayload, CustomerDetail } from './api/customer.api';
export {
  customerKeys,
  useCustomers,
  useCustomerDetail,
  useCreateCustomer,
  useUpdateCustomer,
  useDeactivateCustomer,
} from './model/customer.queries';
