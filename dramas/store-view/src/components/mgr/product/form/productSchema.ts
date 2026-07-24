import { z } from 'zod'

const UNITS = ['KG', 'PIECE'] as const

export const createProductSchema = (t: (key: string) => string) => {
  //
  const priceField = z
    .number({ error: t('validation.priceInvalidType') })
    .nonnegative(t('validation.priceNegative'))
    .multipleOf(0.01)

  return z
    .object({
      name: z.string().min(1, t('validation.nameRequired')).max(200, t('validation.nameMax')),
      description: z.string().max(1000).optional().or(z.literal('')),
      sku: z.string().max(100).regex(/^[A-Za-z0-9_-]*$/, t('validation.skuPattern')).optional().or(z.literal('')),
      unit: z.enum(UNITS, { error: t('validation.unitRequired') }),
      categoryId: z.string().uuid(t('validation.categoryRequired')).optional().or(z.literal('')),
      branchId: z.string().uuid(t('productForm.placeholderBranch')).optional().or(z.literal('')),
      priceCurrency: z.enum(['UZS', 'USD']),
      costPriceUzs: priceField.optional(),
      retailPriceUzs: priceField.optional(),
      wholesalePriceUzs: priceField.optional(),
      costPriceUsd: priceField.optional(),
      retailPriceUsd: priceField.optional(),
      wholesalePriceUsd: priceField.optional(),
      isActive: z.boolean().optional(),
    })
    .superRefine((data, context) => {
      //
      if (data.priceCurrency === 'UZS') {
        if (data.costPriceUzs === undefined) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['costPriceUzs'] })
        }
        if (data.retailPriceUzs === undefined) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['retailPriceUzs'] })
        }
        if (data.wholesalePriceUzs === undefined) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['wholesalePriceUzs'] })
        }
        if (data.retailPriceUzs !== undefined && data.wholesalePriceUzs !== undefined && data.wholesalePriceUzs > data.retailPriceUzs) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.wholesaleExceedsRetail'), path: ['wholesalePriceUzs'] })
        }
        if (data.costPriceUzs !== undefined && data.wholesalePriceUzs !== undefined && data.costPriceUzs > data.wholesalePriceUzs) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.costExceedsWholesale'), path: ['costPriceUzs'] })
        }
        return
      }

      if (data.costPriceUsd === undefined) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['costPriceUsd'] })
      }
      if (data.retailPriceUsd === undefined) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['retailPriceUsd'] })
      }
      if (data.wholesalePriceUsd === undefined) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['wholesalePriceUsd'] })
      }
      if (data.retailPriceUsd !== undefined && data.wholesalePriceUsd !== undefined && data.wholesalePriceUsd > data.retailPriceUsd) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.wholesaleExceedsRetail'), path: ['wholesalePriceUsd'] })
      }
      if (data.costPriceUsd !== undefined && data.wholesalePriceUsd !== undefined && data.costPriceUsd > data.wholesalePriceUsd) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.costExceedsWholesale'), path: ['costPriceUsd'] })
      }
    })
}

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>
