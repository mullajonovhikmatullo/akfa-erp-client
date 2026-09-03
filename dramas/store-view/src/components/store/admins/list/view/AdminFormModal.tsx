import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Form, Input, Modal, Select } from 'antd'

import { blockAutofill } from '@store/store-shared/lib/autofill'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, User } from '@store/store-stub'

export type AdminFormValues = {
  name: string
  username?: string
  password?: string
  branchId?: string | null
}

interface AdminFormModalProps {
  t: StoreTranslator
  open: boolean
  editTarget: User | null
  control: Control<AdminFormValues>
  errors: FieldErrors<AdminFormValues>
  branches: Branch[]
  branchesLoading: boolean
  pending: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function AdminFormModal({
  t,
  open,
  editTarget,
  control,
  errors,
  branches,
  branchesLoading,
  pending,
  onCancel,
  onSubmit,
}: AdminFormModalProps) {
  //
  return (
    <Modal
      title={
        <div className="u-items-center u-flex u-gap-8">
          <i className="icons-user-switch icon-size-18" />
          {editTarget ? `${t('common.edit')} — ${editTarget.name}` : t('admins.modalCreate')}
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={editTarget ? t('common.save') : t('common.create')}
      confirmLoading={pending}
      destroyOnHidden
      width={480}
    >
      <Form layout="vertical" autoComplete="off" className="u-mt-16">
        <Form.Item label={t('profile.fullName')} required validateStatus={errors.name ? 'error' : undefined} help={errors.name?.message}>
          <Controller
            name="name"
            control={control}
            rules={{ required: t('admins.nameRequired') }}
            render={({ field }) => (
              <Input {...field} {...blockAutofill('store-admin-full-name')} placeholder={t('profile.fullNamePlaceholder')} />
            )}
          />
        </Form.Item>

        {!editTarget ? (
          <Form.Item
            label={t('profile.username')}
            required
            validateStatus={errors.username ? 'error' : undefined}
            help={errors.username?.message}
          >
            <Controller
              name="username"
              control={control}
              rules={{
                required: t('admins.usernameRequired'),
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: t('admins.usernamePattern') },
              }}
              render={({ field }) => (
                <Input {...field} {...blockAutofill('store-admin-username')} placeholder={t('profile.usernamePlaceholder')} prefix="@" />
              )}
            />
          </Form.Item>
        ) : null}

        {!editTarget ? (
          <Form.Item
            label={t('admins.labelPassword')}
            required
            validateStatus={errors.password ? 'error' : undefined}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              rules={{
                required: t('admins.passwordRequired'),
                minLength: { value: 6, message: t('pwd.minLen') },
              }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  {...blockAutofill('store-admin-new-password')}
                  placeholder={t('pwd.minLen')}
                  prefix={<i className="icons-lock icon-size-18 u-text-muted" />}
                />
              )}
            />
          </Form.Item>
        ) : null}

        <Form.Item
          label={t('admins.labelBranch')}
          required={!editTarget}
          validateStatus={errors.branchId ? 'error' : undefined}
          help={errors.branchId?.message}
        >
          <Controller
            name="branchId"
            control={control}
            rules={editTarget ? undefined : { required: t('admins.branchRequired') }}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                allowClear={Boolean(editTarget)}
                placeholder={t('admins.branchPlaceholder')}
                loading={branchesLoading}
                notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
