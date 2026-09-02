import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Form, Input, Modal, Switch } from 'antd'
import { TagIcon } from '@phosphor-icons/react'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import type { Category } from '@store/store-stub'

export type CategoryFormValues = {
  name: string
  description?: string
  isActive?: boolean
}

interface CategoryFormModalProps {
  t: (key: string) => string
  open: boolean
  editTarget: Category | null
  control: Control<CategoryFormValues>
  errors: FieldErrors<CategoryFormValues>
  pending: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function CategoryFormModal({
  t,
  open,
  editTarget,
  control,
  errors,
  pending,
  onCancel,
  onSubmit,
}: CategoryFormModalProps) {
  //
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TagIcon size={18} weight="duotone" />
          {editTarget ? `${t('common.edit')} — ${editTarget.name}` : t('categories.modalCreate')}
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={editTarget ? t('common.save') : t('common.create')}
      confirmLoading={pending}
      destroyOnHidden
      width={440}
    >
      <Form layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
        <Form.Item
          label={t('common.name')}
          required
          validateStatus={errors.name ? 'error' : undefined}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{
              required: t('categories.nameRequired'),
              maxLength: { value: 100, message: t('categories.nameMaxLength') },
            }}
            render={({ field }) => (
              <Input {...field} {...blockAutofill('store-category-name')} placeholder={t('categories.namePlaceholder')} />
            )}
          />
        </Form.Item>

        <Form.Item
          label={t('common.description')}
          validateStatus={errors.description ? 'error' : undefined}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: { value: 500, message: t('categories.descriptionMaxLength') },
            }}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                {...blockAutofill('store-category-description')}
                placeholder={t('categories.descPlaceholder')}
                rows={3}
                maxLength={500}
                showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
              />
            )}
          />
        </Form.Item>

        {editTarget ? (
          <Form.Item label={t('common.status')}>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value ?? true}
                  onChange={field.onChange}
                  checkedChildren={t('common.active')}
                  unCheckedChildren={t('common.inactive')}
                />
              )}
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  )
}
