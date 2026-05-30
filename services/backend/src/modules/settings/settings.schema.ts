import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { restaurantSettings } from "../../db/schema.js";

const SettingsBaseSchema = createSelectSchema(restaurantSettings);

// ─── Settings Schemas ────────────────────────────────────────────────────────

export const SettingsSchema = z
  .object({
    ...SettingsBaseSchema.shape,
    taxRate: z.string(),
    updatedAt: z.string(),
  })
  .openapi("RestaurantSettings");

export const UpdateSettingsSchema = createInsertSchema(restaurantSettings).partial().extend({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(320).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().max(50).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  tables: z.number().int().min(1).max(500).optional(),
  autoAcceptOrders: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  prepTimeMinutes: z.number().int().min(1).max(120).optional(),
});
