import type { StoreTranslator } from '@store/store-i18n'
import { Controller } from 'react-hook-form'
import { Button, Input } from 'antd'

import { blockAutofill } from '@store/store-shared/lib/autofill'
import type { CategoryManagerFormControl, CategoryManagerFormErrors } from './types'

interface ExpenseCategoryCreateFormProps {
  t: StoreTranslator
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
    <div className="u-items-start u-flex u-gap-8 u-mb-20">
      <Controller
        name="newName"
        control={control}
        rules={{
          validate: (value) => value.trim().length > 0 || t('categoryDrawer.nameRequired'),
          maxLength: { value: 100, message: t('categoryDrawer.nameMax') },
        }}
        render={({ field }) => (
          <div className="u-flex-1 u-min-w-0">
            <Input
              {...field}
              {...blockAutofill('store-expense-category-new-name')}
              placeholder={t('categoryDrawer.placeholderNewName')}
              onPressEnter={onSubmit}
              status={errors.newName ? 'error' : undefined}
            />
            {errors.newName?.message ? <div className="u-text-danger u-fs-11 u-mt-4">{errors.newName.message}</div> : null}
          </div>
        )}
      />
      <Button
        type="primary"
        icon={<i className="icons-plus icon-size-13" />}
        loading={pending}
        disabled={!name.trim()}
        onClick={onSubmit}
      >
        {t('common.add')}
      </Button>
    </div>
  )
}
