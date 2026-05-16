import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProduct, useUpdateProduct } from '@/entities/product';
import { createProductSchema, type ProductFormValues } from '../validation/productSchema';
import type { Product } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';

interface UseProductFormOptions {
  product?: Product | null;
  onSuccess?: () => void;
}

export function useProductForm({ product, onSuccess }: UseProductFormOptions = {}) {
  const t = useT();
  const isEdit = Boolean(product);

  const schema = useMemo(() => createProductSchema(t), [t]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      unit: 'PIECE',
      categoryId: '',
      priceCurrency: 'UZS',
      retailPriceUzs: 0,
      wholesalePriceUzs: 0,
      retailPriceUsd: undefined,
      wholesalePriceUsd: undefined,
      isActive: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      const hasUsdOnly = !product.retailPriceUzs && !!product.retailPriceUsd;
      form.reset({
        name: product.name,
        description: product.description ?? '',
        sku: product.sku ?? '',
        unit: product.unit,
        categoryId: product.category.id,
        priceCurrency: hasUsdOnly ? 'USD' : 'UZS',
        retailPriceUzs: hasUsdOnly ? undefined : product.retailPriceUzs,
        wholesalePriceUzs: hasUsdOnly ? undefined : product.wholesalePriceUzs,
        retailPriceUsd: hasUsdOnly ? (product.retailPriceUsd ?? undefined) : undefined,
        wholesalePriceUsd: hasUsdOnly ? (product.wholesalePriceUsd ?? undefined) : undefined,
        isActive: product.isActive,
      });
    } else {
      form.reset({
        name: '', description: '', sku: '', unit: 'PIECE',
        categoryId: '', priceCurrency: 'UZS',
        retailPriceUzs: 0, wholesalePriceUzs: 0,
        retailPriceUsd: undefined, wholesalePriceUsd: undefined, isActive: true,
      });
    }
  }, [product]);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const { priceCurrency, ...rest } = values;

    const payload = {
      ...rest,
      sku: values.sku || undefined,
      description: values.description || undefined,
      retailPriceUzs: priceCurrency === 'USD' ? 0 : values.retailPriceUzs!,
      wholesalePriceUzs: priceCurrency === 'USD' ? 0 : values.wholesalePriceUzs!,
      retailPriceUsd: priceCurrency === 'USD' ? values.retailPriceUsd : undefined,
      wholesalePriceUsd: priceCurrency === 'USD' ? values.wholesalePriceUsd : undefined,
    };

    if (isEdit && product) {
      updateMutation.mutate(
        { id: product.id, payload },
        { onSuccess: () => { onSuccess?.(); form.reset(); } },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { onSuccess?.(); form.reset(); },
      });
    }
  });

  return { form, onSubmit, isPending, isEdit };
}
