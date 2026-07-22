import { Controller } from 'react-hook-form'
import { Button, Form, Input, InputNumber, Radio, Select, Switch } from 'antd'
import type { Branch } from '@erp/erp-shared/core'
import { blockAutofill } from '@erp/erp-shared/lib/autofill'
import { AppModal } from '@erp/erp-shared/ui/app-modal'
import { SelectLoadingContent } from '@erp/erp-shared/ui/select-loading-content'
import type { Customer } from '@erp/store-buddy-stub'
import { useCustomerForm } from './useCustomerForm'

interface CustomerFormModalProps {
  t: (key: string) => string
  open: boolean
  customer?: Customer | null
  onClose: () => void
  onCreated?: (customer: Customer) => void
  isSuper: boolean
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
  isSuper,
  branchId,
  branches,
  branchesLoading,
}: CustomerFormModalProps) {
  //
  const { form, onSubmit, isPending, isEdit } = useCustomerForm({
    t,
    customer,
    isSuper,
    branchId,
    branches,
    branchesLoading,
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
        <Button key="submit" type="primary" loading={isPending} onClick={() => onSubmit()}>
          {isEdit ? t('common.save') : t('common.add')}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>
        {isSuper && !isEdit && (
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('customerForm.labelBranch')} required validateStatus={errors.branchId ? 'error' : undefined} help={errors.branchId?.message}>
                <Select
                  {...field}
                  loading={branchesLoading}
                  notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                  placeholder={t('customerForm.placeholderBranch')}
                  options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
                />
              </Form.Item>
            )}
          />
        )}

        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('customerForm.labelFullName')} required validateStatus={errors.fullName ? 'error' : undefined} help={errors.fullName?.message}>
              <Input {...field} {...blockAutofill('akfa-customer-full-name')} placeholder={t('customerForm.placeholderFullName')} />
            </Form.Item>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('customerForm.labelPhone')} required validateStatus={errors.phone ? 'error' : undefined} help={errors.phone?.message}>
                <Input {...field} {...blockAutofill('akfa-customer-phone')} inputMode="tel" placeholder="+998901234567" />
              </Form.Item>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('customerForm.labelAddress')} validateStatus={errors.address ? 'error' : undefined} help={errors.address?.message}>
                <Input {...field} {...blockAutofill('akfa-customer-address')} placeholder={t('customerForm.placeholderAddress')} />
              </Form.Item>
            )}
          />
        </div>

        {!isEdit && (
          <Form.Item label={t('customerForm.labelBalance')} validateStatus={errors.balance ? 'error' : undefined} help={errors.balance?.message}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8 }}>
              <Controller
                name="balanceType"
                control={control}
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    optionType="button"
                    buttonStyle="solid"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
                    options={[
                      { value: 'credit', label: t('customers.balanceCredit') },
                      { value: 'debt', label: t('customers.balanceDebt') },
                    ]}
                  />
                )}
              />
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    step={1000}
                    style={{ width: '100%' }}
                    formatter={(value) => (value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '')}
                    parser={(value) => Number(value?.replace(/\s/g, '') ?? 0)}
                    addonAfter="so'm"
                  />
                )}
              />
            </div>
          </Form.Item>
        )}

        {isEdit && (
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('common.status')}>
                <Switch checked={field.value} onChange={field.onChange} checkedChildren={t('common.active')} unCheckedChildren={t('common.inactive')} />
              </Form.Item>
            )}
          />
        )}
      </Form>
    </AppModal>
  )
}
