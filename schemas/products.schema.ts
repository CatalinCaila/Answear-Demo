import { z } from 'zod';

const availabilityEnum = z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'LAST']);

const variationSchema = z.object({
  id: z.number(),
  ean: z.string(),
  availability: availabilityEnum,
});

const sizeSchema = z.object({
  id: z.number(),
  name: z.string(),
  variation: variationSchema,
});

const productBrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
});

const badgeSchema = z.object({
  id: z.number(),
  type: z.string(),
  text: z.string(),
  priority: z.number(),
  textColor: z.string(),
  backgroundColor: z.string(),
  transparency: z.number()
});

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  url: z.string(),
  price: z.number(),
  priceRegular: z.number(),
  priceMinimal: z.number(),
  priceIsDiscounted: z.boolean(),
  subtitle: z.string().optional(),
  productBrand: productBrandSchema,
  allSizes: z.array(sizeSchema),
 
  categories: z.array(z.object({
    id: z.number(),
    name: z.string()
  })).optional(),
  frontendUuid: z.string().optional(),
  pbbCode: z.string().optional(),
  color: z.object({
    name: z.string(),
    colorPbbCode: z.string()
  }).optional(),
  source: z.string().optional(),
  badges: z.array(badgeSchema).optional(),
  badgesFront: z.array(badgeSchema).optional(),
  percentageDiscountValue: z.number().optional(),
  percentageDiscountValueFromMinimal: z.number().optional(),
  onOfferFor30Days: z.boolean().optional(),
  hasSizeGroupProducts: z.boolean().optional(),
  isAvailableSoon: z.boolean().optional(),
  isPresale: z.boolean().optional()
});

export const productsResponseSchema = z.object({
  items: z.array(productSchema),
  sortingOrder: z.array(z.string()),
  filters: z.array(z.any()).optional(),
  category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    url: z.string()
  }).optional(),
  urlFilters: z.string().optional(),
  sorting: z.record(z.string()).optional(),
  count: z.number().optional(),
  seoMetaTags: z.object({
    title: z.string(),
    description: z.string(),
    header: z.string().nullable().optional(),
    noindex: z.boolean()
  }).optional()
});
