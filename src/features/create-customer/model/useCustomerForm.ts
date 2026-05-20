import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useCreateCustomer, useUpdateCustomer } from '@/entities/customer';
import { useCurrentUser } from '@/entities/user';
import { useBranches } from '@/entities/branch';
import { createCustomerSchema, type CustomerFormValues } from '../validation/customerSchema';
import type { Customer } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';

interface UseCustomerFormOptions {
  customer?: Customer | null;
  onSuccess?: () => void;
}

export function useCustomerForm({ customer, onSuccess }: UseCustomerFormOptions) {
  const t = useT();
  const isEdit = Boolean(customer?.id);
  const { isSuper, branchId } = useCurrentUser();
  const { data: branches = [] } = useBranches();

  const schema = useMemo(() => createCustomerSchema(t), [t]);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      balance: 0,
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
        balance: 0,
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
        { fullName: values.fullName, phone, address, branchId: resolvedBranchId, balance: values.balance ?? 0 },
        { onSuccess },
      );
    }
  });

  return { form, onSubmit, isPending, isEdit, isSuper, branches };
}
