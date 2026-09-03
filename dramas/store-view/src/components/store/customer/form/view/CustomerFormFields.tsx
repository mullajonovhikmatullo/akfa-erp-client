import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Alert, Button, Form, Input, InputNumber, Radio, Select, Switch } from 'antd'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { UzbekPhoneInput } from '@store/store-shared'
import type { Branch, Customer } from '@store/store-stub'
import type { CustomerFormValues } from '../customerSchema'

interface CustomerFormFieldsProps {
  t: (key: string) => string
  control: Control<CustomerFormValues>
  errors: FieldErrors<CustomerFormValues>
  isEdit: boolean
  isStoreOwner: boolean
  branches: Branch[]
  branchesLoading?: boolean
  existingCustomer: Customer | null
  linkedToBranch: boolean
  linkingCustomer: boolean
  onUseExistingCustomer: () => void
}

export function CustomerFormFields({
  t,
  control,
  errors,
  isEdit,
  isStoreOwner,
  branches,
  branchesLoading,
  existingCustomer,
  linkedToBranch,
  linkingCustomer,
  onUseExistingCustomer,
}: CustomerFormFieldsProps) {
  //
  return (
    <>
      {isStoreOwner && !isEdit ? (
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
      ) : null}

      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <Form.Item label={t('customerForm.labelFullName')} required validateStatus={errors.fullName ? 'error' : undefined} help={errors.fullName?.message}>
            <Input {...field} {...blockAutofill('store-customer-full-name')} placeholder={t('customerForm.placeholderFullName')} />
          </Form.Item>
        )}
      />

      <div className="u-grid u-gap-12 u-grid-cols-2">
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('customerForm.labelPhone')} required validateStatus={errors.phone ? 'error' : undefined} help={errors.phone?.message}>
              <UzbekPhoneInput {...field} status={errors.phone ? 'error' : undefined} />
            </Form.Item>
          )}
        />
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('customerForm.labelAddress')} validateStatus={errors.address ? 'error' : undefined} help={errors.address?.message}>
              <Input {...field} {...blockAutofill('store-customer-address')} placeholder={t('customerForm.placeholderAddress')} />
            </Form.Item>
          )}
        />
      </div>

      {!isEdit && existingCustomer ? (
        <Alert
          type={linkedToBranch ? 'warning' : 'info'}
          showIcon
          className="u-mb-12"
          message={t('customerForm.phoneExistsTitle')}
          description={
            <div className="u-grid u-gap-8">
              <span>
                <strong>{existingCustomer.fullName}</strong>
                {' · '}{existingCustomer.phone}
                {' · '}{existingCustomer.branch.name}
              </span>
              <span className="u-text-muted">
                {t(linkedToBranch ? 'customerForm.phoneExistsCurrentBranch' : 'customerForm.phoneExistsOtherBranch')}
              </span>
              <Button type="primary" size="small" loading={linkingCustomer} onClick={onUseExistingCustomer} className="u-w-fit">
                {t('customerForm.useExisting')}
              </Button>
            </div>
          }
        />
      ) : null}

      {!isEdit ? (
        <Form.Item label={t('customerForm.labelBalance')} validateStatus={errors.balance ? 'error' : undefined} help={errors.balance?.message}>
          <div className="u-grid u-gap-8 u-grid-cols-160-content">
            <Controller
              name="balanceType"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  optionType="button"
                  buttonStyle="solid"
                  className="u-grid u-grid-cols-2"
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
                <InputNumber<number>
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  min={0}
                  step={1000}
                  className="u-w-full"
                  formatter={(value) => (value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '')}
                  parser={(value) => Number(value?.replace(/\s/g, '') ?? 0)}
                  addonAfter="so'm"
                />
              )}
            />
          </div>
        </Form.Item>
      ) : null}

      {isEdit ? (
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('common.status')}>
              <Switch checked={field.value} onChange={field.onChange} checkedChildren={t('common.active')} unCheckedChildren={t('common.inactive')} />
            </Form.Item>
          )}
        />
      ) : null}
    </>
  )
}
