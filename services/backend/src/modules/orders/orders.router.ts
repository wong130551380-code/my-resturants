import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  OrderSchema,
  OrderSummarySchema,
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  OrderListQuerySchema,
} from "./orders.schema.js";
import * as orderService from "./orders.service.js";
import { sendError } from "../../lib/errors.js";

const ordersApp = new OpenAPIHono();

ordersApp.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Orders"],
    summary: "List all orders",
    request: { query: OrderListQuerySchema },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.array(OrderSummarySchema) },
        },
        description: "List of orders",
      },
    },
  }),
  async (c) => {
    const query = c.req.valid("query");
    const data = await orderService.listOrders(query);
    return c.json(data, 200);
  },
);

ordersApp.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Orders"],
    summary: "Create a new order",
    request: {
      body: { content: { "application/json": { schema: CreateOrderSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: OrderSchema } },
        description: "Order created",
      },
      400: {
        content: {
          "application/json": { schema: z.object({ error: z.string() }) },
        },
        description: "Validation error",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const data = await orderService.createOrder(body);
      return c.json(data, 201);
    } catch (err: any) {
      return sendError(c, 400, err.message);
    }
  },
);

ordersApp.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Orders"],
    summary: "Get an order",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: { "application/json": { schema: OrderSchema } },
        description: "Order details",
      },
      404: {
        content: {
          "application/json": { schema: z.object({ error: z.string() }) },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await orderService.getOrder(id);
    if (!data) return sendError(c, 404, "Order not found");
    return c.json(data, 200);
  },
);

ordersApp.openapi(
  createRoute({
    method: "patch",
    path: "/{id}/status",
    tags: ["Orders"],
    summary: "Update order status",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { "application/json": { schema: UpdateOrderStatusSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: OrderSchema } },
        description: "Order status updated",
      },
      400: {
        content: {
          "application/json": { schema: z.object({ error: z.string() }) },
        },
        description: "Invalid transition",
      },
      404: {
        content: {
          "application/json": { schema: z.object({ error: z.string() }) },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { status } = c.req.valid("json");
    try {
      const data = await orderService.updateOrderStatus(id, status);
      if (!data) return sendError(c, 404, "Order not found");
      return c.json(data, 200);
    } catch (err: any) {
      return sendError(c, 400, err.message);
    }
  },
);

export default ordersApp;
