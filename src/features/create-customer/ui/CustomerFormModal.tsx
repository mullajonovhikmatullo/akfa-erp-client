import { Controller } from 'react-hook-form';
import { Form, Input, Switch, Select } from 'antd';
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
  const { form, onSubmit, isPending, isEdit, isSuper, branches } = useCustomerForm({
    customer,
    onSuccess: onClose,
  });
  const { control, formState: { errors } } = form;

  return (
    <AppModal
      title={isEdit ? `Таҳрирлаш · ${customer?.fullName}` : 'Янги мижоз'}
      open={open}
      onClose={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isPending}>
          Бекор қилиш
        </Button>,
        <Button key="submit" type="primary" loading={isPending} onClick={() => onSubmit()}>
          {isEdit ? 'Сақлаш' : 'Қўшиш'}
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
                label="Филиал"
                required
                validateStatus={errors.branchId ? 'error' : undefined}
                help={errors.branchId?.message}
              >
                <Select
                  {...field}
                  placeholder="Филиал танланг"
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
              label="Тўлиқ исми"
              required
              validateStatus={errors.fullName ? 'error' : undefined}
              help={errors.fullName?.message}
            >
              <Input {...field} placeholder="Масалан: Бобур Тошматов" />
            </Form.Item>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Телефон (ихтиёрий)"
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
                label="Манзил (ихтиёрий)"
                validateStatus={errors.address ? 'error' : undefined}
                help={errors.address?.message}
              >
                <Input {...field} placeholder="Тошкент, Чиланзор 5" />
              </Form.Item>
            )}
          />
        </div>

        {isEdit && (
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Form.Item label="Ҳолат">
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  checkedChildren="Фаол"
                  unCheckedChildren="Нофаол"
                />
              </Form.Item>
            )}
          />
        )}

      </Form>
    </AppModal>
  );
}
