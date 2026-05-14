import { z } from 'zod';

const UNITS = ['KG', 'PIECE', 'PACK', 'METER', 'SQUARE_METER', 'LITER', 'SET'] as const;

const priceField = z
  .number({ invalid_type_error: 'Нархни киритинг' })
  .nonnegative('Нарх манфий бўлмаслиги керак')
  .multipleOf(0.01);

export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Номи мажбурий')
      .max(200, 'Ном 200 та белгидан ошмаслиги керак'),
    description: z.string().max(1000).optional().or(z.literal('')),
    sku: z
      .string()
      .max(100)
      .regex(/^[A-Za-z0-9_-]*$/, 'SKU фақат ҳарф, рақам, тире ва пастки чизиқдан иборат бўлиши мумкин')
      .optional()
      .or(z.literal('')),
    unit: z.enum(UNITS, { required_error: 'Ўлчов бирлигини танланг' }),
    categoryId: z.string().uuid('Категорияни танланг'),
    retailPriceUzs: priceField,
    wholesalePriceUzs: priceField,
    retailPriceUsd: priceField.optional(),
    wholesalePriceUsd: priceField.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.wholesalePriceUzs <= d.retailPriceUzs, {
    message: 'Улгуржи нарх чакана нархдан ошмаслиги керак',
    path: ['wholesalePriceUzs'],
  });

export type ProductFormValues = z.infer<typeof productSchema>;
