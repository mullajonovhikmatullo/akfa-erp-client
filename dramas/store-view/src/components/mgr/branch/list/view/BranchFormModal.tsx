import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Form, Input, Modal } from 'antd'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { isValidUzbekMobilePhone, UzbekPhoneInput } from '@store/store-shared'
import type { Branch, BranchPayload } from '@store/store-stub'

interface BranchFormModalProps {
  t: (key: string) => string
  open: boolean
  editTarget: Branch | null
  control: Control<BranchPayload>
  errors: FieldErrors<BranchPayload>
  pending: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function BranchFormModal({
  t,
  open,
  editTarget,
  control,
  errors,
  pending,
  onCancel,
  onSubmit,
}: BranchFormModalProps) {
  //
  return (
    <Modal
      title={editTarget ? t('branches.modalEdit') : t('branches.modalCreate')}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={editTarget ? t('common.save') : t('common.create')}
      confirmLoading={pending}
      destroyOnHidden
    >
      <Form layout="vertical" autoComplete="off" className="u-mt-16">
        <Form.Item
          label={t('branches.labelName')}
          required
          validateStatus={errors.name ? 'error' : undefined}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: t('branches.nameRequired') }}
            render={({ field }) => (
              <Input {...field} {...blockAutofill('store-branch-name')} placeholder={t('branches.namePlaceholder')} />
            )}
          />
        </Form.Item>

        <Form.Item label={t('branches.labelAddress')}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ''}
                onChange={field.onChange}
                {...blockAutofill('store-branch-address')}
                placeholder={t('branches.addressPlaceholder')}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={t('common.phone')}
          validateStatus={errors.phone ? 'error' : undefined}
          help={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => !value || isValidUzbekMobilePhone(value) || t('validation.phoneInvalid'),
            }}
            render={({ field }) => (
              <UzbekPhoneInput
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ''}
                onChange={field.onChange}
                status={errors.phone ? 'error' : undefined}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
