import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import dayjs from 'dayjs'
import { blockAutofill } from '@erp/erp-shared/lib/autofill'
import { AppModal } from '@erp/erp-shared/ui/app-modal'
import { SelectLoadingContent } from '@erp/erp-shared/ui/select-loading-content'
import { useCreateExpense, useExpenseCategories } from '../hooks/useExpenses'
import { createExpenseSchema, type ExpenseFormValues } from './expenseSchema'

interface ExpenseFormModalProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  exchangeRate: number
}

const getDefaultValues = (): ExpenseFormValues => ({
  categoryId: '',
  currency: 'UZS',
  amount: 0,
  usdToUzsRate: 12650,
  description: '',
  expenseDate: dayjs().toISOString(),
})

export function ExpenseFormModal({ t, open, onClose, exchangeRate }: ExpenseFormModalProps) {
  //
  const schema = useMemo(() => createExpenseSchema(t), [t])
  const { data: categories = [], isLoading: categoriesLoading } = useExpenseCategories()
  const createExpense = useCreateExpense()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...getDefaultValues(), usdToUzsRate: exchangeRate },
  })
  const currency = watch('currency')

  useEffect(() => {
    //
    if (open) reset({ ...getDefaultValues(), usdToUzsRate: exchangeRate })
  }, [exchangeRate, open, reset])

  const onSubmit = handleSubmit((values) => {
    //
    const usdToUzsRate = exchangeRate
    const amount = values.currency === 'USD' ? Number((values.amount * usdToUzsRate).toFixed(2)) : values.amount
    createExpense.mutate(
      {
        categoryId: values.categoryId,
        amount,
        currency: values.currency,
        amountUsd: values.currency === 'USD' ? values.amount : 0,
        usdToUzsRate: values.currency === 'USD' ? usdToUzsRate : undefined,
        description: values.description || undefined,
        expenseDate: values.expenseDate || undefined,
      },
      {
        onSuccess: () => {
          //
          reset(getDefaultValues())
          onClose()
        },
      },
    )
  })

  return (
    <AppModal
      title={t('expenseForm.title')}
      open={open}
      onClose={onClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={createExpense.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={createExpense.isPending} onClick={onSubmit}>
          {t('common.save')}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('expenseForm.labelCategory')} required validateStatus={errors.categoryId ? 'error' : undefined} help={errors.categoryId?.message}>
              <Select
                {...field}
                loading={categoriesLoading}
                notFoundContent={categoriesLoading ? <SelectLoadingContent /> : undefined}
                placeholder={t('expenseForm.placeholderCategory')}
                options={categories.map((category) => ({ value: category.id, label: category.name }))}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('expenseForm.labelCurrency')} required>
              <Select
                {...field}
                options={[
                  { value: 'UZS', label: t('expenseForm.currencyUzs') },
                  { value: 'USD', label: t('expenseForm.currencyUsd') },
                ]}
              />
            </Form.Item>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={currency === 'USD' ? t('expenseForm.labelAmountUsd') : t('expenseForm.labelAmount')}
                required
                validateStatus={errors.amount ? 'error' : undefined}
                help={errors.amount?.message}
              >
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  min={0}
                  step={currency === 'USD' ? 1 : 10000}
                  precision={currency === 'USD' ? 2 : 0}
                  addonAfter={currency}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => {
                    //
                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
                    const isShortcut = event.metaKey || event.ctrlKey
                    if (isShortcut || allowedKeys.includes(event.key)) return
                    if (currency === 'USD' && (event.key === '.' || event.key === ',')) return
                    if (!/^\d$/.test(event.key)) event.preventDefault()
                  }}
                  onPaste={(event) => {
                    //
                    const text = event.clipboardData.getData('text')
                    const normalized = text.replace(/\s/g, '').replace(',', '.')
                    if (currency === 'USD') {
                      if (!/^\d+(\.\d{0,2})?$/.test(normalized)) event.preventDefault()
                      return
                    }
                    if (!/^\d+$/.test(normalized)) event.preventDefault()
                  }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(value) => {
                    //
                    const normalized = value?.replace(/\s/g, '').replace(',', '.') ?? ''
                    const parsed = Number(normalized) || 0
                    return (currency === 'USD' ? parsed : Math.trunc(parsed)) as unknown as 0
                  }}
                />
              </Form.Item>
            )}
          />

          {currency === 'USD' ? (
            <Controller
              name="usdToUzsRate"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={t('expenseForm.labelUsdRate')}
                  required
                  validateStatus={errors.usdToUzsRate ? 'error' : undefined}
                  help={errors.usdToUzsRate?.message}
                >
                  <InputNumber
                    {...field}
                    value={exchangeRate}
                    disabled
                    style={{ width: '100%' }}
                    min={1}
                    step={50}
                    precision={0}
                    addonAfter="UZS"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    parser={(value) => Math.trunc(Number(value?.replace(/\s/g, '')) || 0) as unknown as 0}
                  />
                </Form.Item>
              )}
            />
          ) : null}

          <Controller
            name="expenseDate"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('expenseForm.labelDate')}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(value) => field.onChange(value ? value.toISOString() : '')}
                  showTime={{ format: 'HH:mm' }}
                  format="DD.MM.YYYY HH:mm"
                />
              </Form.Item>
            )}
          />
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Form.Item label={t('expenseForm.labelNote')}>
              <Input.TextArea {...field} {...blockAutofill('akfa-expense-description')} rows={2} placeholder={t('expenseForm.placeholderNote')} />
            </Form.Item>
          )}
        />
      </Form>
    </AppModal>
  )
}
