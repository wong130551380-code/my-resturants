import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  orderItems,
  orders,
  orderStatusEnum,
  orderTypeEnum,
} from "../../db/schema.js";

const OrderStatusSchema = z.enum(orderStatusEnum.enumValues);
const OrderTypeSchema = z.enum(orderTypeEnum.enumValues);
const OrderItemBaseSchema = createSelectSchema(orderItems);
const OrderBaseSchema = createSelectSchema(orders);

// ─── Order Schemas ───────────────────────────────────────────────────────────

export const OrderItemSchema = z
  .object({
    ...OrderItemBaseSchema.shape,
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    menuItemId: z.string().uuid().nullable(),
    unitPrice: z.string(),
    modifiers: z.array(z.string()).nullable(),
  })
  .openapi("OrderItem");

export const OrderSchema = z
  .object({
    ...OrderBaseSchema.shape,
    id: z.string().uuid(),
    customerId: z.string().uuid().nullable(),
    status: OrderStatusSchema,
    type: OrderTypeSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    items: z.array(OrderItemSchema),
  })
  .openapi("Order");

export const OrderSummarySchema = z
  .object({
    id: z.string().uuid(),
    orderNumber: z.string(),
    customerName: z.string(),
    tableNumber: z.number(),
    status: OrderStatusSchema,
    type: OrderTypeSchema,
    total: z.string(),
    itemCount: z.number(),
    createdAt: z.string(),
  })
  .openapi("OrderSummary");

export const NewOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  modifiers: z.array(z.string()).optional(),
});

const CreateOrderBaseSchema = createInsertSchema(orders);

export const CreateOrderSchema = CreateOrderBaseSchema.pick({
  customerId: true,
  customerName: true,
  tableNumber: true,
  type: true,
  notes: true,
})
  .extend({
    customerId: z.string().uuid().optional(),
    customerName: z.string().min(1).max(200),
    tableNumber: z.number().int().min(0).default(0),
    type: OrderTypeSchema.default("dine-in"),
    notes: z.string().optional(),
    items: z.array(NewOrderItemSchema).min(1),
  });

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
});

export const OrderListQuerySchema = z.object({
  status: OrderStatusSchema.optional(),
  type: OrderTypeSchema.optional(),
});
