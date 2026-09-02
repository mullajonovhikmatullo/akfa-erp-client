import { Controller } from 'react-hook-form'
import { Button, Input } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import type { CategoryManagerFormControl, CategoryManagerFormErrors } from './types'

interface ExpenseCategoryCreateFormProps {
  t: (key: string) => string
  control: CategoryManagerFormControl
  errors: CategoryManagerFormErrors
  name: string
  pending: boolean
  onSubmit: () => void
}

export function ExpenseCategoryCreateForm({
  t,
  control,
  errors,
  name,
  pending,
  onSubmit,
}: ExpenseCategoryCreateFormProps) {
  //
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
      <Controller
        name="newName"
        control={control}
        rules={{
          validate: (value) => value.trim().length > 0 || t('categoryDrawer.nameRequired'),
          maxLength: { value: 100, message: t('categoryDrawer.nameMax') },
        }}
        render={({ field }) => (
          <div style={{ flex: 1, minWidth: 0 }}>
            <Input
              {...field}
              {...blockAutofill('store-expense-category-new-name')}
              placeholder={t('categoryDrawer.placeholderNewName')}
              onPressEnter={onSubmit}
              status={errors.newName ? 'error' : undefined}
            />
            {errors.newName?.message ? <div style={{ marginTop: 4, color: 'var(--danger)', fontSize: 11 }}>{errors.newName.message}</div> : null}
          </div>
        )}
      />
      <Button
        type="primary"
        icon={<PlusIcon size={13} weight="bold" />}
        loading={pending}
        disabled={!name.trim()}
        onClick={onSubmit}
      >
        {t('common.add')}
      </Button>
    </div>
  )
}
