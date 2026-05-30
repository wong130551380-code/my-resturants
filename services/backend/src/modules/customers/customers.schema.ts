import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { customers } from "../../db/schema.js";

const CustomerBaseSchema = createSelectSchema(customers);

// ─── Customer Schemas ────────────────────────────────────────────────────────

export const CustomerSchema = z
  .object({
    ...CustomerBaseSchema.shape,
    id: z.string().uuid(),
    totalSpent: z.string(),
    lastVisit: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Customer");

export const CreateCustomerSchema = createInsertSchema(customers).extend({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(1).max(30),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().min(1).max(30).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export const CustomerListQuerySchema = z.object({
  tag: z.string().optional(),
  search: z.string().optional(),
});

const CustomerOrderSummarySchema = z
  .object({
    id: z.string().uuid(),
    orderNumber: z.string(),
    customerName: z.string(),
    tableNumber: z.number(),
    status: z.string(),
    type: z.string(),
    total: z.string(),
    itemCount: z.number(),
    createdAt: z.string(),
  })
  .openapi("CustomerOrderSummary");

export const CustomerOrderHistorySchema = z
  .object({
    orders: z.array(CustomerOrderSummarySchema),
    orderCount: z.number(),
    totalSpent: z.string(),
    lastOrderDate: z.string().nullable(),
  })
  .openapi("CustomerOrderHistory");
