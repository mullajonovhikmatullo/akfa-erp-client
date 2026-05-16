import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, InputNumber, Select, Input, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { useCreateExpense, useExpenseCategories } from '@/entities/expense';
import { AppModal } from '@/shared/ui';
import { createExpenseSchema, type ExpenseFormValues } from '../validation/expenseSchema';
import { useT } from '@/shared/lib/i18n';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExpenseFormModal({ open, onClose }: ExpenseFormModalProps) {
  const t = useT();
  const schema = useMemo(() => createExpenseSchema(t), [t]);
  const { data: categories = [], isLoading: catsLoading } = useExpenseCategories();
  const createExpense = useCreateExpense();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: '', amount: undefined as unknown as number, description: '', expenseDate: '' },
  });

  const onSubmit = handleSubmit((values) => {
    createExpense.mutate(
      {
        categoryId: values.categoryId,
        amount: values.amount,
        description: values.description || undefined,
        expenseDate: values.expenseDate || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  });

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
            <Form.Item
              label={t('expenseForm.labelCategory')}
              required
              validateStatus={errors.categoryId ? 'error' : undefined}
              help={errors.categoryId?.message}
            >
              <Select
                {...field}
                loading={catsLoading}
                placeholder={t('expenseForm.placeholderCategory')}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
                label={t('expenseForm.labelAmount')}
                required
                validateStatus={errors.amount ? 'error' : undefined}
                help={errors.amount?.message}
              >
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  min={0.01}
                  step={10000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                />
              </Form.Item>
            )}
          />

          <Controller
            name="expenseDate"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('expenseForm.labelDate')}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) => field.onChange(d ? d.toISOString() : '')}
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
              <Input.TextArea {...field} rows={2} placeholder={t('expenseForm.placeholderNote')} />
            </Form.Item>
          )}
        />

      </Form>
    </AppModal>
  );
}
