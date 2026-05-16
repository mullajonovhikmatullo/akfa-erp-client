import { z } from 'zod';

const UNITS = ['KG', 'PIECE', 'PACK', 'METER', 'SQUARE_METER', 'LITER', 'SET'] as const;

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
      categoryId: z.string().uuid(t('validation.categoryRequired')),
      priceCurrency: z.enum(['UZS', 'USD']),
      retailPriceUzs: priceField.optional(),
      wholesalePriceUzs: priceField.optional(),
      retailPriceUsd: priceField.optional(),
      wholesalePriceUsd: priceField.optional(),
      isActive: z.boolean().optional(),
    })
    .superRefine((d, ctx) => {
      if (d.priceCurrency === 'UZS') {
        if (d.retailPriceUzs === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['retailPriceUzs'] });
        }
        if (d.wholesalePriceUzs === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['wholesalePriceUzs'] });
        }
        if (d.retailPriceUzs !== undefined && d.wholesalePriceUzs !== undefined && d.wholesalePriceUzs > d.retailPriceUzs) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.wholesaleExceedsRetail'), path: ['wholesalePriceUzs'] });
        }
      } else {
        if (d.retailPriceUsd === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['retailPriceUsd'] });
        }
        if (d.wholesalePriceUsd === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.priceInvalidType'), path: ['wholesalePriceUsd'] });
        }
        if (d.retailPriceUsd !== undefined && d.wholesalePriceUsd !== undefined && d.wholesalePriceUsd > d.retailPriceUsd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.wholesaleExceedsRetail'), path: ['wholesalePriceUsd'] });
        }
      }
    });
};

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;
