import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer } from '@/entities/customer';
import { useCurrentUser } from '@/entities/user';
import { useBranches } from '@/entities/branch';
import { customerSchema, type CustomerFormValues } from '../validation/customerSchema';
import type { Customer } from '@/shared/types/domain';

interface UseCustomerFormOptions {
  customer?: Customer | null;
  onSuccess?: () => void;
}

export function useCustomerForm({ customer, onSuccess }: UseCustomerFormOptions) {
  const isEdit = Boolean(customer?.id);
  const { isSuper, branchId } = useCurrentUser();
  const { data: branches = [] } = useBranches();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      isActive: true,
      branchId: undefined,
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
      form.reset({
        fullName: '',
        phone: '',
        address: '',
        isActive: true,
        branchId: undefined,
      });
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
      // For branch_admin branchId is ignored by backend (uses their own).
      // For super_admin branchId is required — taken from the form selector.
      const resolvedBranchId = isSuper ? values.branchId : (branchId ?? undefined);
      createMutation.mutate(
        { fullName: values.fullName, phone, address, branchId: resolvedBranchId },
        { onSuccess },
      );
    }
  });

  return { form, onSubmit, isPending, isEdit, isSuper, branches };
}
