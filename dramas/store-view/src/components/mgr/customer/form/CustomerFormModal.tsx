import { useWatch } from 'react-hook-form'
import { Button, Form } from 'antd'
import { isValidUzbekMobilePhone } from '@store/store-shared'
import { AppModal } from '@store/store-shared/ui/app-modal'
import type { Branch, Customer } from '@store/store-stub'
import { useCustomerMutation } from '../hooks/useCustomerMutation'
import { useCustomerPhoneCheck } from '../hooks/useCustomerPhoneCheck'
import { useCustomerForm } from './useCustomerForm'
import { CustomerFormFields } from './view/CustomerFormFields'
import { FormSection } from './view/FormSection'

interface CustomerFormModalProps {
  t: (key: string) => string
  open: boolean
  customer?: Customer | null
  onClose: () => void
  onCreated?: (customer: Customer) => void
  isStoreOwner: boolean
  branchId?: string | null
  branches: Branch[]
  branchesLoading?: boolean
}

export function CustomerFormModal({
  t,
  open,
  customer,
  onClose,
  onCreated,
  isStoreOwner,
  branchId,
  branches,
  branchesLoading,
}: CustomerFormModalProps) {
  //
  const { form, onSubmit, isPending, isEdit } = useCustomerForm({
    t,
    open,
    customer,
    isStoreOwner,
    branchId,
    onSuccess: (savedCustomer) => {
      //
      onCreated?.(savedCustomer)
      onClose()
    },
  })
  const {
    control,
    formState: { errors },
  } = form
  const phone = useWatch({ control, name: 'phone' }) ?? ''
  const formBranchId = useWatch({ control, name: 'branchId' })
  const targetBranchId = isStoreOwner ? formBranchId : branchId ?? undefined
  const phoneCheck = useCustomerPhoneCheck(phone, targetBranchId, !isEdit && open && isValidUzbekMobilePhone(phone))
  const { linkCustomerBranch } = useCustomerMutation(t)
  const existingCustomer = phoneCheck.data?.customer ?? null

  function useExistingCustomer() {
    //
    if (!existingCustomer) return
    if (phoneCheck.data?.linkedToBranch) {
      onCreated?.(existingCustomer)
      onClose()
      return
    }
    linkCustomerBranch.mutate(
      { customerId: existingCustomer.id, branchId: targetBranchId },
      {
        onSuccess: (linkedCustomer) => {
          //
          onCreated?.(linkedCustomer)
          onClose()
        },
      },
    )
  }

  return (
    <AppModal
      title={isEdit ? `${t('common.edit')} · ${customer?.fullName}` : t('customerForm.titleCreate')}
      open={open}
      onClose={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isPending || phoneCheck.isFetching}
          disabled={!isEdit && Boolean(existingCustomer)}
          onClick={() => onSubmit()}
        >
          {isEdit ? t('common.save') : t('common.add')}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>
        <FormSection>
          <CustomerFormFields
            t={t}
            control={control}
            errors={errors}
            isEdit={isEdit}
            isStoreOwner={isStoreOwner}
            branches={branches}
            branchesLoading={branchesLoading}
            existingCustomer={existingCustomer}
            linkedToBranch={Boolean(phoneCheck.data?.linkedToBranch)}
            linkingCustomer={linkCustomerBranch.isPending}
            onUseExistingCustomer={useExistingCustomer}
          />
        </FormSection>
      </Form>
    </AppModal>
  )
}
