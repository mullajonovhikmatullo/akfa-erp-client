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
      retailPriceUzs: priceField,
      wholesalePriceUzs: priceField,
      retailPriceUsd: priceField.optional(),
      wholesalePriceUsd: priceField.optional(),
      isActive: z.boolean().optional(),
    })
    .refine((d) => d.wholesalePriceUzs <= d.retailPriceUzs, {
      message: t('validation.wholesaleExceedsRetail'),
      path: ['wholesalePriceUzs'],
    });
};

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;
