import { Controller } from 'react-hook-form';
import { Form, Input, Switch, Select, InputNumber } from 'antd';
import { AppModal } from '@/shared/ui';
import { Button } from 'antd';
import type { Customer } from '@/shared/types/domain';
import { useCustomerForm } from '../model/useCustomerForm';
import { useT } from '@/shared/lib/i18n';

interface CustomerFormModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onCreated?: (customer: Customer) => void;
}

export function CustomerFormModal({ open, customer, onClose, onCreated }: CustomerFormModalProps) {
  const t = useT();
  const { form, onSubmit, isPending, isEdit, isSuper, branches } = useCustomerForm({
    customer,
    onSuccess: (savedCustomer) => {
      onCreated?.(savedCustomer);
      onClose();
    },
  });
  const { control, formState: { errors } } = form;

  return (
    <AppModal
      title={isEdit ? `${t('common.edit')} · ${customer?.fullName}` : t('customerForm.titleCreate')}
      open={open}
      onClose={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={isPending} onClick={() => onSubmit()}>
          {isEdit ? t('common.save') : t('common.add')}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>

        {isSuper && !isEdit && (
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('customerForm.labelBranch')}
                required
                validateStatus={errors.branchId ? 'error' : undefined}
                help={errors.branchId?.message}
              >
                <Select
                  {...field}
                  placeholder={t('customerForm.placeholderBranch')}
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                />
              </Form.Item>
            )}
          />
        )}

        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Form.Item
              label={t('customerForm.labelFullName')}
              required
              validateStatus={errors.fullName ? 'error' : undefined}
              help={errors.fullName?.message}
            >
              <Input {...field} placeholder={t('customerForm.placeholderFullName')} />
            </Form.Item>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('customerForm.labelPhone')}
                validateStatus={errors.phone ? 'error' : undefined}
                help={errors.phone?.message}
              >
                <Input {...field} placeholder="+998901234567" />
              </Form.Item>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('customerForm.labelAddress')}
                validateStatus={errors.address ? 'error' : undefined}
                help={errors.address?.message}
              >
                <Input {...field} placeholder={t('customerForm.placeholderAddress')} />
              </Form.Item>
            )}
          />
        </div>

        {!isEdit && (
          <Controller
            name="balance"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('customerForm.labelBalance')}
                validateStatus={errors.balance ? 'error' : undefined}
                help={errors.balance?.message}
              >
                <InputNumber
                  {...field}
                  min={0}
                  step={1000}
                  style={{ width: '100%' }}
                  formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
                  parser={(v) => Number(v?.replace(/\s/g, '') ?? 0)}
                  addonAfter="so'm"
                />
              </Form.Item>
            )}
          />
        )}

        {isEdit && (
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Form.Item label={t('common.status')}>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  checkedChildren={t('common.active')}
                  unCheckedChildren={t('common.inactive')}
                />
              </Form.Item>
            )}
          />
        )}

      </Form>
    </AppModal>
  );
}
