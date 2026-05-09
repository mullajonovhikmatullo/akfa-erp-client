import { Controller } from 'react-hook-form';
import { Form, Input, InputNumber, Select, Switch, Modal, Button } from 'antd';
import { useCategories } from '@/entities/product';
import { AppModal } from '@/shared/ui';
import type { Product, ProductUnit } from '@/shared/types/domain';
import { useProductForm } from '../model/useProductForm';

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'KG', label: 'kg' },
  { value: 'PIECE', label: 'dona (pcs)' },
  { value: 'PACK', label: 'paket (pack)' },
  { value: 'METER', label: 'metr (m)' },
  { value: 'SQUARE_METER', label: 'm²' },
  { value: 'LITER', label: 'litr (L)' },
  { value: 'SET', label: "to'plam (set)" },
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
      title={isEdit ? `Tahrirlash · ${product?.sku ?? product?.name}` : "Yangi mahsulot"}
      open={open}
      onClose={onClose}
      width={700}
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

        {/* Row 1: Name + SKU */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Nomi"
                required
                validateStatus={errors.name ? 'error' : undefined}
                help={errors.name?.message}
              >
                <Input {...field} placeholder="Masalan: Profil A60 — Oq" />
              </Form.Item>
            )}
          />
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="SKU (ixtiyoriy)"
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
                label="Kategoriya"
                required
                validateStatus={errors.categoryId ? 'error' : undefined}
                help={errors.categoryId?.message}
              >
                <Select
                  {...field}
                  loading={catsLoading}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Kategoriyani tanlang"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="O'lchov birligi"
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
                label="Chakana narx (so'm)"
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
                label="Ulgurji narx (so'm)"
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
                label="Chakana narx (USD, ixtiyoriy)"
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
                label="Ulgurji narx (USD, ixtiyoriy)"
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
            <Form.Item label="Tavsif (ixtiyoriy)">
              <Input.TextArea {...field} rows={2} placeholder="Qisqacha tavsif..." />
            </Form.Item>
          )}
        />

        {/* isActive — only in edit mode */}
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
