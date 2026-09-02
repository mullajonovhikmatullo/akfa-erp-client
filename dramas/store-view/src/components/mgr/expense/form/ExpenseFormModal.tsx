import { Button, Form } from 'antd'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { useExpenseForm } from './useExpenseForm'
import { ExpenseFormFields } from './view/ExpenseFormFields'
import { FormSection } from './view/FormSection'

interface ExpenseFormModalProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  exchangeRate: number
  branchId?: string
}

export function ExpenseFormModal({ t, open, onClose, exchangeRate, branchId }: ExpenseFormModalProps) {
  //
  const expenseForm = useExpenseForm({ t, open, onClose, exchangeRate, branchId })
  const {
    control,
    formState: { errors },
  } = expenseForm.form

  return (
    <AppModal
      title={t('expenseForm.title')}
      open={open}
      onClose={onClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={expenseForm.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={expenseForm.isPending} onClick={expenseForm.onSubmit}>
          {t('common.save')}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>
        <FormSection>
          <ExpenseFormFields
            t={t}
            control={control}
            errors={errors}
            currency={expenseForm.currency}
            exchangeRate={exchangeRate}
            categories={expenseForm.categories}
            categoriesLoading={expenseForm.categoriesLoading}
          />
        </FormSection>
      </Form>
    </AppModal>
  )
}
