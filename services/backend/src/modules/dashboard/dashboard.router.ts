import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  DashboardStatsSchema,
  PopularItemSchema,
} from "./dashboard.schema.js";
import { OrderSummarySchema } from "../orders/orders.schema.js";
import * as dashboardService from "./dashboard.service.js";

const dashboardApp = new OpenAPIHono();

dashboardApp.openapi(
  createRoute({
    method: "get",
    path: "/stats",
    tags: ["Dashboard"],
    summary: "Get dashboard statistics",
    responses: {
      200: {
        content: { "application/json": { schema: DashboardStatsSchema } },
        description: "Dashboard KPI stats",
      },
    },
  }),
  async (c) => {
    const data = await dashboardService.getDashboardStats();
    return c.json(data, 200);
  },
);

dashboardApp.openapi(
  createRoute({
    method: "get",
    path: "/popular-items",
    tags: ["Dashboard"],
    summary: "Get popular menu items",
    request: {
      query: z.object({
        limit: z.string().regex(/^\d+$/).optional(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.array(PopularItemSchema) },
        },
        description: "Popular items by order count",
      },
    },
  }),
  async (c) => {
    const { limit } = c.req.valid("query");
    const data = await dashboardService.getPopularItems(
      limit ? parseInt(limit, 10) : 10,
    );
    return c.json(data, 200);
  },
);

dashboardApp.openapi(
  createRoute({
    method: "get",
    path: "/recent-orders",
    tags: ["Dashboard"],
    summary: "Get recent orders",
    request: {
      query: z.object({
        limit: z.string().regex(/^\d+$/).optional(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.array(OrderSummarySchema) },
        },
        description: "Recent orders",
      },
    },
  }),
  async (c) => {
    const { limit } = c.req.valid("query");
    const data = await dashboardService.getRecentOrders(
      limit ? parseInt(limit, 10) : 10,
    );
    return c.json(data, 200);
  },
);

export default dashboardApp;
