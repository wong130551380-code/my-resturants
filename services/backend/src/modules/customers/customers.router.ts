import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  CustomerSchema,
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerListQuerySchema,
  CustomerOrderHistorySchema,
} from "./customers.schema.js";
import * as customerService from "./customers.service.js";
import { sendError } from "../../lib/errors.js";

const customersApp = new OpenAPIHono();

customersApp.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Customers"],
    summary: "List all customers",
    request: { query: CustomerListQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: z.array(CustomerSchema) } },
        description: "List of customers",
      },
    },
  }),
  async (c) => {
    const query = c.req.valid("query");
    const data = await customerService.listCustomers(query);
    return c.json(data, 200);
  },
);

customersApp.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Customers"],
    summary: "Create a customer",
    request: {
      body: { content: { "application/json": { schema: CreateCustomerSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: CustomerSchema } },
        description: "Customer created",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const data = await customerService.createCustomer(body);
    return c.json(data, 201);
  },
);

customersApp.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Customers"],
    summary: "Get a customer",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: { "application/json": { schema: CustomerSchema } },
        description: "Customer details",
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
    const data = await customerService.getCustomer(id);
    if (!data) return sendError(c, 404, "Customer not found");
    return c.json(data, 200);
  },
);

customersApp.openapi(
  createRoute({
    method: "put",
    path: "/{id}",
    tags: ["Customers"],
    summary: "Update a customer",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { "application/json": { schema: UpdateCustomerSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: CustomerSchema } },
        description: "Customer updated",
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
    const body = c.req.valid("json");
    const data = await customerService.updateCustomer(id, body);
    if (!data) return sendError(c, 404, "Customer not found");
    return c.json(data, 200);
  },
);

customersApp.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Customers"],
    summary: "Delete a customer",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": { schema: z.object({ message: z.string() }) },
        },
        description: "Customer deleted",
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
    const data = await customerService.deleteCustomer(id);
    if (!data) return sendError(c, 404, "Customer not found");
    return c.json({ message: "Customer deleted" }, 200);
  },
);

customersApp.openapi(
  createRoute({
    method: "get",
    path: "/{id}/orders",
    tags: ["Customers"],
    summary: "Get customer order history",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": { schema: CustomerOrderHistorySchema },
        },
        description: "Customer order history with aggregates",
      },
      404: {
        content: {
          "application/json": { schema: z.object({ error: z.string() }) },
        },
        description: "Customer not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const customer = await customerService.getCustomer(id);
    if (!customer) return sendError(c, 404, "Customer not found");
    const data = await customerService.getCustomerOrders(id);
    return c.json(data, 200);
  },
);

export default customersApp;
