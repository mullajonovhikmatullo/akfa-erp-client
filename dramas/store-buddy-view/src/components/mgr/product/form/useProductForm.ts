import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '@erp/store-buddy-stub'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { createProductSchema, type ProductFormValues } from './productSchema'

interface UseProductFormOptions {
  t: (key: string) => string
  product?: Product | null
  onSuccess?: () => void
}

const emptyValues: ProductFormValues = {
  name: '',
  description: '',
  sku: '',
  unit: 'PIECE',
  categoryId: '',
  branchId: '',
  priceCurrency: 'UZS',
  costPriceUzs: 0,
  retailPriceUzs: 0,
  wholesalePriceUzs: 0,
  costPriceUsd: undefined,
  retailPriceUsd: undefined,
  wholesalePriceUsd: undefined,
  isActive: true,
}

export function useProductForm({ t, product, onSuccess }: UseProductFormOptions) {
  //
  const isEdit = Boolean(product)
  const schema = useMemo(() => createProductSchema(t), [t])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    //
    if (product) {
      const hasUsdOnly = !product.retailPriceUzs && !!product.retailPriceUsd
      form.reset({
        name: product.name,
        description: product.description ?? '',
        sku: product.sku ?? '',
        unit: product.unit,
        categoryId: product.category?.id ?? '',
        branchId: '',
        priceCurrency: hasUsdOnly ? 'USD' : 'UZS',
        costPriceUzs: hasUsdOnly ? undefined : product.costPriceUzs,
        retailPriceUzs: hasUsdOnly ? undefined : product.retailPriceUzs,
        wholesalePriceUzs: hasUsdOnly ? undefined : product.wholesalePriceUzs,
        costPriceUsd: hasUsdOnly ? (product.costPriceUsd ?? undefined) : undefined,
        retailPriceUsd: hasUsdOnly ? (product.retailPriceUsd ?? undefined) : undefined,
        wholesalePriceUsd: hasUsdOnly ? (product.wholesalePriceUsd ?? undefined) : undefined,
        isActive: product.isActive,
      })
      return
    }

    form.reset(emptyValues)
  }, [form, product])

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = form.handleSubmit((values) => {
    //
    const { priceCurrency, branchId, ...rest } = values
    const payload = {
      ...rest,
      ...(isEdit ? {} : { branchId: branchId || undefined }),
      sku: values.sku || undefined,
      description: values.description || undefined,
      categoryId: values.categoryId || undefined,
      costPriceUzs: priceCurrency === 'USD' ? 0 : values.costPriceUzs!,
      retailPriceUzs: priceCurrency === 'USD' ? 0 : values.retailPriceUzs!,
      wholesalePriceUzs: priceCurrency === 'USD' ? 0 : values.wholesalePriceUzs!,
      costPriceUsd: priceCurrency === 'USD' ? values.costPriceUsd : undefined,
      retailPriceUsd: priceCurrency === 'USD' ? values.retailPriceUsd : undefined,
      wholesalePriceUsd: priceCurrency === 'USD' ? values.wholesalePriceUsd : undefined,
    }

    if (isEdit && product) {
      updateMutation.mutate(
        { id: product.id, payload },
        {
          onSuccess: () => {
            //
            onSuccess?.()
            form.reset()
          },
        },
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        //
        onSuccess?.()
        form.reset()
      },
    })
  })

  return { form, onSubmit, isPending, isEdit }
}
