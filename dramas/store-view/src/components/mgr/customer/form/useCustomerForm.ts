import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Branch } from '@store/store-shared/core'
import type { Customer } from '@store/store-stub'
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers'
import { createCustomerSchema, type CustomerFormValues } from './customerSchema'

interface UseCustomerFormOptions {
  t: (key: string) => string
  customer?: Customer | null
  onSuccess?: (customer: Customer) => void
  isSuper: boolean
  branchId?: string | null
  branches: Branch[]
  branchesLoading?: boolean
}

export function useCustomerForm({
  t,
  customer,
  onSuccess,
  isSuper,
  branchId,
  branches,
  branchesLoading = false,
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
      branchId: undefined,
    },
  })

  useEffect(() => {
    //
    if (customer) {
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
        branchId: undefined,
      })
    }
  }, [customer, form])

  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
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
      const resolvedBranchId = isSuper ? values.branchId : branchId ?? undefined
      const balanceAmount = values.balance ?? 0
      const signedBalance = balanceAmount === 0 ? 0 : values.balanceType === 'debt' ? balanceAmount : -balanceAmount
      createMutation.mutate(
        { fullName: values.fullName, phone, address, branchId: resolvedBranchId, balance: signedBalance },
        { onSuccess },
      )
    }
  })

  return { form, onSubmit, isPending, isEdit, isSuper, branches, branchesLoading }
}
