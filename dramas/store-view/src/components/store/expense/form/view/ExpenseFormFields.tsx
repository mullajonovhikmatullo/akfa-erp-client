import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { DatePicker, Form, Input, InputNumber, Segmented, Select } from 'antd'
import dayjs from 'dayjs'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { ExpenseCategory } from '@store/store-stub'
import type { ExpenseFormValues } from '../expenseSchema'

interface ExpenseFormFieldsProps {
  t: (key: string) => string
  control: Control<ExpenseFormValues>
  errors: FieldErrors<ExpenseFormValues>
  currency: ExpenseFormValues['currency']
  exchangeRate: number
  categories: ExpenseCategory[]
  categoriesLoading: boolean
}

const formatAmount = (value: string | number | undefined) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

function preventInvalidAmountKey(event: KeyboardEvent<HTMLInputElement>, currency: ExpenseFormValues['currency']) {
  //
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (event.metaKey || event.ctrlKey || allowedKeys.includes(event.key)) return
  if (currency === 'USD' && (event.key === '.' || event.key === ',')) return
  if (!/^\d$/.test(event.key)) event.preventDefault()
}

function preventInvalidAmountPaste(event: ClipboardEvent<HTMLInputElement>, currency: ExpenseFormValues['currency']) {
  //
  const normalized = event.clipboardData.getData('text').replace(/\s/g, '').replace(',', '.')
  if (currency === 'USD') {
    if (!/^\d+(\.\d{0,2})?$/.test(normalized)) event.preventDefault()
    return
  }
  if (!/^\d+$/.test(normalized)) event.preventDefault()
}

export function ExpenseFormFields({
  t,
  control,
  errors,
  currency,
  exchangeRate,
  categories,
  categoriesLoading,
}: ExpenseFormFieldsProps) {
  //
  return (
    <>
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
            <Segmented
              value={field.value}
              onChange={(value) => field.onChange(value as ExpenseFormValues['currency'])}
              options={[
                { value: 'UZS', label: t('expenseForm.currencyUzs') },
                { value: 'USD', label: t('expenseForm.currencyUsd') },
              ]}
              block
            />
          </Form.Item>
        )}
      />

      <div className="u-grid u-gap-12 u-grid-cols-2">
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
              <InputNumber<number>
                value={field.value}
                onChange={(value) => field.onChange(value ?? 0)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="u-w-full"
                min={0}
                step={currency === 'USD' ? 1 : 10000}
                precision={currency === 'USD' ? 2 : 0}
                addonAfter={currency}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => preventInvalidAmountKey(event, currency)}
                onPaste={(event) => preventInvalidAmountPaste(event, currency)}
                formatter={formatAmount}
                parser={(value) => {
                  //
                  const parsed = Number(value?.replace(/\s/g, '').replace(',', '.')) || 0
                  return currency === 'USD' ? parsed : Math.trunc(parsed)
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
              <Form.Item label={t('expenseForm.labelUsdRate')} required validateStatus={errors.usdToUzsRate ? 'error' : undefined} help={errors.usdToUzsRate?.message}>
                <InputNumber<number>
                  value={exchangeRate}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled
                  className="u-w-full"
                  min={1}
                  step={50}
                  precision={0}
                  addonAfter="UZS"
                  formatter={formatAmount}
                  parser={(value) => Math.trunc(Number(value?.replace(/\s/g, '')) || 0)}
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
                className="u-w-full"
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
            <Input.TextArea
              {...field}
              {...blockAutofill('store-expense-description')}
              rows={2}
              maxLength={500}
              showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
              placeholder={t('expenseForm.placeholderNote')}
            />
          </Form.Item>
        )}
      />
    </>
  )
}
