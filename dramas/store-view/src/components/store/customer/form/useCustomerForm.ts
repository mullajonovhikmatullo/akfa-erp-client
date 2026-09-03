import type { StoreTranslator } from '@store/store-i18n'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Customer } from '@store/store-stub'
import { useCustomerMutation } from '../hooks/useCustomerMutation'
import { createCustomerSchema, type CustomerFormValues } from './customerSchema'

interface UseCustomerFormOptions {
  t: StoreTranslator
  open: boolean
  customer?: Customer | null
  onSuccess?: (customer: Customer) => void
  isStoreOwner: boolean
  branchId?: string | null
}

export function useCustomerForm({
  t,
  open,
  customer,
  onSuccess,
  isStoreOwner,
  branchId,
}: UseCustomerFormOptions) {
  //
  const isEdit = Boolean(customer?.id)
  const schema = useMemo(() => createCustomerSchema(t), [t])

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      balance: 0,
      balanceType: 'credit',
      isActive: true,
      branchId: branchId ?? undefined,
    },
  })

  useEffect(() => {
    //
    if (open && customer) {
      form.reset({
        fullName: customer.fullName,
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        isActive: customer.isActive,
      })
    } else {
      form.reset({
        fullName: '',
        phone: '',
        address: '',
        balance: 0,
        balanceType: 'credit',
        isActive: true,
        branchId: branchId ?? undefined,
      })
    }
  }, [branchId, customer, form, open])

  const { createCustomer: createMutation, updateCustomer: updateMutation } = useCustomerMutation(t)
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = form.handleSubmit((values) => {
    //
    const phone = values.phone || undefined
    const address = values.address || undefined

    if (isEdit && customer) {
      updateMutation.mutate(
        { id: customer.id, payload: { fullName: values.fullName, phone, address, isActive: values.isActive } },
        { onSuccess },
      )
    } else {
      const resolvedBranchId = isStoreOwner ? values.branchId : branchId ?? undefined
      const balanceAmount = values.balance ?? 0
      const signedBalance = balanceAmount === 0 ? 0 : values.balanceType === 'debt' ? balanceAmount : -balanceAmount
      createMutation.mutate(
        { fullName: values.fullName, phone, address, branchId: resolvedBranchId, balance: signedBalance },
        { onSuccess },
      )
    }
  })

  return { form, onSubmit, isPending, isEdit }
}
