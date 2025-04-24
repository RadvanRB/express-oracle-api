import { z } from "zod";

// Validační schéma pro vytvoření produktu
export const createProductSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(2).max(50),
  subCategory: z.string().max(50).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  color: z.string().max(20).optional(),
  manufacturer: z.string().max(100).optional(),
  sku: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  manufactureDate: z.date().optional(),
  expiryDate: z.date().optional(),
  stockedDate: z.date().optional(),
  lastSoldDate: z.date().optional(),
});

// Validační schéma pro aktualizaci produktu
export const updateProductSchema = createProductSchema.partial();

// Validační schéma pro pokročilé filtrování
export const advancedFilterSchema = z.object({
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  categories: z.array(z.string()).optional(),
  manufacturers: z.array(z.string()).optional(),
  dateFilters: z.object({
    manufacturedAfter: z.string().optional(),
    manufacturedBefore: z.string().optional(),
    expiryDateAfter: z.string().optional(),
    expiryDateBefore: z.string().optional(),
    stockedDateAfter: z.string().optional(),
    stockedDateBefore: z.string().optional(),
  }).optional(),
  dimensions: z.object({
    maxWidth: z.number().optional(),
    maxHeight: z.number().optional(),
    maxDepth: z.number().optional(),
    maxWeight: z.number().optional(),
  }).optional(),
  searchText: z.string().optional(),
  inStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sort: z.array(
    z.object({
      field: z.string(),
      direction: z.string(), // Umožní jakýkoliv string, budeme upravovat v controlleru
    })
  ).optional(),
});

// Typy odvozené ze schémat
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdvancedFilterInput = z.infer<typeof advancedFilterSchema>;