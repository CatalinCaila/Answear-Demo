import { z } from 'zod';

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  url: z.string(),
  price: z.number(),
  productBrand: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
  allSizes: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      variation: z.object({
        id: z.number(),
        ean: z.string(),
        availability: z.string(), // Use z.enum([...]) if known
      }),
    })
  ),
});

export const productsResponseSchema = z.object({
  items: z.array(productSchema),
  sortingOrder: z.array(z.string()),
});
