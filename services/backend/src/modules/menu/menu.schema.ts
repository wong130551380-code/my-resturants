import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { menuCategories, menuItems } from "../../db/schema.js";

const CategoryBaseSchema = createSelectSchema(menuCategories);
const MenuItemBaseSchema = createSelectSchema(menuItems);

// ─── Category Schemas ────────────────────────────────────────────────────────

export const CategorySchema = z
  .object({
    ...CategoryBaseSchema.shape,
    id: z.string().uuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Category");

export const CreateCategorySchema = createInsertSchema(menuCategories).extend({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Menu Item Schemas ───────────────────────────────────────────────────────

export const MenuItemSchema = z
  .object({
    ...MenuItemBaseSchema.shape,
    id: z.string().uuid(),
    categoryId: z.string().uuid(),
    price: z.string(),
    image: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("MenuItem");

export const CreateMenuItemSchema = createInsertSchema(menuItems).extend({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  price: z.number().positive(),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  image: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial().extend({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
  popular: z.boolean().optional(),
  image: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Query Schemas ───────────────────────────────────────────────────────────

export const MenuListQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  available: z
    .enum(["true", "false"])
    .optional(),
});
