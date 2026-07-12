import { z } from 'zod';

const UNITS = ['KG', 'PIECE'] as const;

export const createProductSchema = (t: (k: string) => string) => {
  const priceField = z
    .number({ error: t('validation.priceInvalidType') })
    .nonnegative(t('validation.priceNegative'))
    .multipleOf(0.01);

  return z
    .object({
      name: z
        .string()
        .min(1, t('validation.nameRequired'))
        .max(200, t('validation.nameMax')),
      description: z.string().max(1000).optional().or(z.literal('')),
      sku: z
        .string()
        .max(100)
        .regex(/^[A-Za-z0-9_-]*$/, t('validation.skuPattern'))
        .optional()
        .or(z.literal('')),
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
    .superRefine((d, ctx) => {
      if (d.priceCurrency === 'UZS') {
        if (d.costPriceUzs === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['costPriceUzs'] });
        }
        if (d.retailPriceUzs === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['retailPriceUzs'] });
        }
        if (d.wholesalePriceUzs === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['wholesalePriceUzs'] });
        }
        if (d.retailPriceUzs !== undefined && d.wholesalePriceUzs !== undefined && d.wholesalePriceUzs > d.retailPriceUzs) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.wholesaleExceedsRetail'), path: ['wholesalePriceUzs'] });
        }
        if (d.costPriceUzs !== undefined && d.wholesalePriceUzs !== undefined && d.costPriceUzs > d.wholesalePriceUzs) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.costExceedsWholesale'), path: ['costPriceUzs'] });
        }
      } else {
        if (d.costPriceUsd === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['costPriceUsd'] });
        }
        if (d.retailPriceUsd === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['retailPriceUsd'] });
        }
        if (d.wholesalePriceUsd === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['wholesalePriceUsd'] });
        }
        if (d.retailPriceUsd !== undefined && d.wholesalePriceUsd !== undefined && d.wholesalePriceUsd > d.retailPriceUsd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.wholesaleExceedsRetail'), path: ['wholesalePriceUsd'] });
        }
        if (d.costPriceUsd !== undefined && d.wholesalePriceUsd !== undefined && d.costPriceUsd > d.wholesalePriceUsd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.costExceedsWholesale'), path: ['costPriceUsd'] });
        }
      }
    });
};

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;
