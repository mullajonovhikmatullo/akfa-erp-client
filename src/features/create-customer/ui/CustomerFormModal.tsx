import { Controller } from 'react-hook-form';
import { Form, Input, Switch } from 'antd';
import { AppModal } from '@/shared/ui';
import { Button } from 'antd';
import type { Customer } from '@/shared/types/domain';
import { useCustomerForm } from '../model/useCustomerForm';

interface CustomerFormModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
}

export function CustomerFormModal({ open, customer, onClose }: CustomerFormModalProps) {
  const { form, onSubmit, isPending, isEdit } = useCustomerForm({
    customer,
    onSuccess: onClose,
  });
  const { control, formState: { errors } } = form;

  return (
    <AppModal
      title={isEdit ? `Tahrirlash · ${customer?.fullName}` : "Yangi mijoz"}
      open={open}
      onClose={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isPending}>
          Bekor qilish
        </Button>,
        <Button key="submit" type="primary" loading={isPending} onClick={() => onSubmit()}>
          {isEdit ? 'Saqlash' : "Qo'shish"}
        </Button>,
      ]}
    >
      <Form layout="vertical" component="div" style={{ marginTop: 4 }}>

        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="To'liq ismi"
              required
              validateStatus={errors.fullName ? 'error' : undefined}
              help={errors.fullName?.message}
            >
              <Input {...field} placeholder="Masalan: Bobur Toshmatov" />
            </Form.Item>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Telefon (ixtiyoriy)"
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
                label="Manzil (ixtiyoriy)"
                validateStatus={errors.address ? 'error' : undefined}
                help={errors.address?.message}
              >
                <Input {...field} placeholder="Toshkent, Chilonzor 5" />
              </Form.Item>
            )}
          />
        </div>

        {isEdit && (
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Form.Item label="Holat">
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  checkedChildren="Faol"
                  unCheckedChildren="Nofaol"
                />
              </Form.Item>
            )}
          />
        )}

      </Form>
    </AppModal>
  );
}
