import { z } from 'zod';

const UNITS = ['KG', 'PIECE', 'PACK', 'METER', 'SQUARE_METER', 'LITER', 'SET'] as const;

const priceField = z
  .number({ invalid_type_error: 'Narxni kiriting' })
  .nonnegative("Narx manfiy bo'lmasligi kerak")
  .multipleOf(0.01);

export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nom majburiy')
      .max(200, "Nom 200 ta belgidan oshmasligi kerak"),
    description: z.string().max(1000).optional().or(z.literal('')),
    sku: z
      .string()
      .max(100)
      .regex(/^[A-Za-z0-9_-]*$/, "SKU faqat harf, raqam, tire va pastki chiziqdan iborat bo'lishi mumkin")
      .optional()
      .or(z.literal('')),
    unit: z.enum(UNITS, { required_error: "O'lchov birligini tanlang" }),
    categoryId: z.string().uuid("Kategoriyani tanlang"),
    retailPriceUzs: priceField,
    wholesalePriceUzs: priceField,
    retailPriceUsd: priceField.optional(),
    wholesalePriceUsd: priceField.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.wholesalePriceUzs <= d.retailPriceUzs, {
    message: "Ulgurji narx chakana narxdan oshmasligi kerak",
    path: ['wholesalePriceUzs'],
  });

export type ProductFormValues = z.infer<typeof productSchema>;
