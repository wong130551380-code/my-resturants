import { z } from "@hono/zod-openapi";

// ─── Dashboard Schemas ───────────────────────────────────────────────────────

export const DashboardStatsSchema = z
  .object({
    totalRevenue: z.string(),
    totalOrders: z.number(),
    avgOrderValue: z.string(),
    totalCustomers: z.number(),
    pendingOrders: z.number(),
    preparingOrders: z.number(),
    todayRevenue: z.string(),
    todayOrders: z.number(),
  })
  .openapi("DashboardStats");

export const PopularItemSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    categoryName: z.string(),
    totalOrdered: z.number(),
    revenue: z.string(),
  })
  .openapi("PopularItem");
