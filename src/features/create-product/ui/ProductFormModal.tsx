import { Controller } from 'react-hook-form';
import { Form, Input, InputNumber, Select, Switch, Modal, Button } from 'antd';
import { useCategories } from '@/entities/product';
import { AppModal } from '@/shared/ui';
import type { Product, ProductUnit } from '@/shared/types/domain';
import { useProductForm } from '../model/useProductForm';
import { useT } from '@/shared/lib/i18n';

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
}

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const t = useT();

  const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
    { value: 'KG', label: t('units.KG') },
    { value: 'PIECE', label: t('units.PIECE') },
    { value: 'PACK', label: t('units.PACK') },
    { value: 'METER', label: t('units.METER') },
    { value: 'SQUARE_METER', label: t('units.SQUARE_METER') },
    { value: 'LITER', label: t('units.LITER') },
    { value: 'SET', label: t('units.SET') },
  ];
  const { form, onSubmit, isPending, isEdit } = useProductForm({
    product,
    onSuccess: onClose,
  });
  const { control, formState: { errors }, watch } = form;

  const { data: categories = [], isLoading: catsLoading } = useCategories(true);

  const retailUzs = watch('retailPriceUzs');

  return (
    <AppModal
      title={isEdit ? `${t('common.edit')} · ${product?.sku ?? product?.name}` : t('productForm.titleCreate')}
      open={open}
      onClose={onClose}
      width={700}
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

        {/* Row 1: Name + SKU */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('common.name')}
                required
                validateStatus={errors.name ? 'error' : undefined}
                help={errors.name?.message}
              >
                <Input {...field} placeholder={t('productForm.namePlaceholder')} />
              </Form.Item>
            )}
          />
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('productForm.labelSku')}
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
                label={t('productForm.labelCategory')}
                required
                validateStatus={errors.categoryId ? 'error' : undefined}
                help={errors.categoryId?.message}
              >
                <Select
                  {...field}
                  loading={catsLoading}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder={t('productForm.placeholderCategory')}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Form.Item
                label={t('productForm.labelUnit')}
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
                label={t('productForm.labelRetailUzs')}
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
                label={t('productForm.labelWholesaleUzs')}
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
                label={t('productForm.labelRetailUsd')}
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
                label={t('productForm.labelWholesaleUsd')}
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
            <Form.Item label={t('productForm.labelDescription')}>
              <Input.TextArea {...field} rows={2} placeholder={t('productForm.placeholderDescription')} />
            </Form.Item>
          )}
        />

        {/* isActive — only in edit mode */}
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
