import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer } from '@/entities/customer';
import { customerSchema, type CustomerFormValues } from '../validation/customerSchema';
import type { Customer } from '@/shared/types/domain';

interface UseCustomerFormOptions {
  customer?: Customer | null;
  onSuccess?: () => void;
}

export function useCustomerForm({ customer, onSuccess }: UseCustomerFormOptions) {
  const isEdit = Boolean(customer?.id);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        fullName: customer.fullName,
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        isActive: customer.isActive,
      });
    } else {
      form.reset({ fullName: '', phone: '', address: '', isActive: true });
    }
  }, [customer, form]);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const phone = values.phone || undefined;
    const address = values.address || undefined;

    if (isEdit && customer) {
      updateMutation.mutate(
        { id: customer.id, payload: { fullName: values.fullName, phone, address, isActive: values.isActive } },
        { onSuccess },
      );
    } else {
      createMutation.mutate(
        { fullName: values.fullName, phone, address },
        { onSuccess },
      );
    }
  });

  return { form, onSubmit, isPending, isEdit };
}
