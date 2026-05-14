import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, InputNumber, Select, Input, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { useCreateExpense, useExpenseCategories } from '@/entities/expense';
import { AppModal } from '@/shared/ui';
import { expenseSchema, type ExpenseFormValues } from '../validation/expenseSchema';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExpenseFormModal({ open, onClose }: ExpenseFormModalProps) {
  const { data: categories = [], isLoading: catsLoading } = useExpenseCategories();
  const createExpense = useCreateExpense();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
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
      title="Харажат қайд қилиш"
      open={open}
      onClose={onClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={createExpense.isPending}>
          Бекор қилиш
        </Button>,
        <Button key="submit" type="primary" loading={createExpense.isPending} onClick={onSubmit}>
          Сақлаш
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Категория"
              required
              validateStatus={errors.categoryId ? 'error' : undefined}
              help={errors.categoryId?.message}
            >
              <Select
                {...field}
                loading={catsLoading}
                placeholder="Категория танланг"
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
                label="Миқдор (сўм)"
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
              <Form.Item label="Сана (ихтиёрий)">
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
            <Form.Item label="Изоҳ (ихтиёрий)">
              <Input.TextArea {...field} rows={2} placeholder="Қисқача тасниф..." />
            </Form.Item>
          )}
        />

      </Form>
    </AppModal>
  );
}
