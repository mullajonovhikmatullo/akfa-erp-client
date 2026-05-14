import { Controller } from 'react-hook-form';
import { Form, Input, InputNumber, Select, Switch, Modal, Button } from 'antd';
import { useCategories } from '@/entities/product';
import { AppModal } from '@/shared/ui';
import type { Product, ProductUnit } from '@/shared/types/domain';
import { useProductForm } from '../model/useProductForm';

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'KG', label: 'кг' },
  { value: 'PIECE', label: 'дона (pcs)' },
  { value: 'PACK', label: 'пакет (pack)' },
  { value: 'METER', label: 'метр (m)' },
  { value: 'SQUARE_METER', label: 'м²' },
  { value: 'LITER', label: 'литр (L)' },
  { value: 'SET', label: 'тўплам (set)' },
];

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
}

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const { form, onSubmit, isPending, isEdit } = useProductForm({
    product,
    onSuccess: onClose,
  });
  const { control, formState: { errors }, watch } = form;

  const { data: categories = [], isLoading: catsLoading } = useCategories(true);

  const retailUzs = watch('retailPriceUzs');

  return (
    <AppModal
      title={isEdit ? `Таҳрирлаш · ${product?.sku ?? product?.name}` : 'Янги маҳсулот'}
      open={open}
      onClose={onClose}
      width={700}
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

        {/* Row 1: Name + SKU */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Номи"
                required
                validateStatus={errors.name ? 'error' : undefined}
                help={errors.name?.message}
              >
                <Input {...field} placeholder="Масалан: Профил А60 — Оқ" />
              </Form.Item>
            )}
          />
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="SKU (ихтиёрий)"
                validateStatus={errors.sku ? 'error' : undefined}
                help={errors.sku?.message}
              >
                <Input {...field} placeholder="PRF-A60-WHT" style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            )}
          />
        </div>

        {/* Row 2: Category + Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Категория танланг"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Ўлчов бирлиги"
                required
                validateStatus={errors.unit ? 'error' : undefined}
                help={errors.unit?.message}
              >
                <Select {...field} options={UNIT_OPTIONS} />
              </Form.Item>
            )}
          />
        </div>

        {/* Row 3: UZS prices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="retailPriceUzs"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Чакана нарх (сўм)"
                required
                validateStatus={errors.retailPriceUzs ? 'error' : undefined}
                help={errors.retailPriceUzs?.message}
              >
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  min={0}
                  step={1000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="wholesalePriceUzs"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Улгуржи нарх (сўм)"
                required
                validateStatus={errors.wholesalePriceUzs ? 'error' : undefined}
                help={errors.wholesalePriceUzs?.message}
              >
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  min={0}
                  max={retailUzs || undefined}
                  step={1000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                />
              </Form.Item>
            )}
          />
        </div>

        {/* Row 4: USD prices (optional) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="retailPriceUsd"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Чакана нарх (USD, ихтиёрий)"
                validateStatus={errors.retailPriceUsd ? 'error' : undefined}
                help={errors.retailPriceUsd?.message}
              >
                <InputNumber
                  {...field}
                  value={field.value ?? undefined}
                  style={{ width: '100%' }}
                  min={0}
                  step={0.5}
                  precision={2}
                  prefix="$"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="wholesalePriceUsd"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Улгуржи нарх (USD, ихтиёрий)"
                validateStatus={errors.wholesalePriceUsd ? 'error' : undefined}
                help={errors.wholesalePriceUsd?.message}
              >
                <InputNumber
                  {...field}
                  value={field.value ?? undefined}
                  style={{ width: '100%' }}
                  min={0}
                  step={0.5}
                  precision={2}
                  prefix="$"
                />
              </Form.Item>
            )}
          />
        </div>

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Form.Item label="Тасниф (ихтиёрий)">
              <Input.TextArea {...field} rows={2} placeholder="Қисқача тасниф..." />
            </Form.Item>
          )}
        />

        {/* isActive — only in edit mode */}
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
