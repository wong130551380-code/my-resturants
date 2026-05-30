import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  CategorySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  MenuItemSchema,
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
  MenuListQuerySchema,
} from "./menu.schema.js";
import * as menuService from "./menu.service.js";
import { sendError } from "../../lib/errors.js";

const menuApp = new OpenAPIHono();

// ─── Categories ──────────────────────────────────────────────────────────────

menuApp.openapi(
  createRoute({
    method: "get",
    path: "/categories",
    tags: ["Menu"],
    summary: "List all menu categories",
    responses: {
      200: {
        content: { "application/json": { schema: z.array(CategorySchema) } },
        description: "List of categories",
      },
    },
  }),
  async (c) => {
    const data = await menuService.listCategories();
    return c.json(data, 200);
  },
);

menuApp.openapi(
  createRoute({
    method: "post",
    path: "/categories",
    tags: ["Menu"],
    summary: "Create a menu category",
    request: { body: { content: { "application/json": { schema: CreateCategorySchema } } } },
    responses: {
      201: {
        content: { "application/json": { schema: CategorySchema } },
        description: "Category created",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const data = await menuService.createCategory(body);
    return c.json(data, 201);
  },
);

menuApp.openapi(
  createRoute({
    method: "get",
    path: "/categories/{id}",
    tags: ["Menu"],
    summary: "Get a menu category",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: { "application/json": { schema: CategorySchema } },
        description: "Category details",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await menuService.getCategory(id);
    if (!data) return sendError(c, 404, "Category not found");
    return c.json(data, 200);
  },
);

menuApp.openapi(
  createRoute({
    method: "put",
    path: "/categories/{id}",
    tags: ["Menu"],
    summary: "Update a menu category",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { "application/json": { schema: UpdateCategorySchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: CategorySchema } },
        description: "Category updated",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const data = await menuService.updateCategory(id, body);
    if (!data) return sendError(c, 404, "Category not found");
    return c.json(data, 200);
  },
);

menuApp.openapi(
  createRoute({
    method: "delete",
    path: "/categories/{id}",
    tags: ["Menu"],
    summary: "Delete a menu category",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ message: z.string() }),
          },
        },
        description: "Category deleted",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await menuService.deleteCategory(id);
    if (!data) return sendError(c, 404, "Category not found");
    return c.json({ message: "Category deleted" }, 200);
  },
);

// ─── Menu Items ──────────────────────────────────────────────────────────────

menuApp.openapi(
  createRoute({
    method: "get",
    path: "/items",
    tags: ["Menu"],
    summary: "List all menu items",
    request: { query: MenuListQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: z.array(MenuItemSchema) } },
        description: "List of menu items",
      },
    },
  }),
  async (c) => {
    const query = c.req.valid("query");
    const data = await menuService.listMenuItems(query);
    return c.json(data, 200);
  },
);

menuApp.openapi(
  createRoute({
    method: "post",
    path: "/items",
    tags: ["Menu"],
    summary: "Create a menu item",
    request: { body: { content: { "application/json": { schema: CreateMenuItemSchema } } } },
    responses: {
      201: {
        content: { "application/json": { schema: MenuItemSchema } },
        description: "Item created",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const data = await menuService.createMenuItem(body);
    return c.json(data, 201);
  },
);

menuApp.openapi(
  createRoute({
    method: "get",
    path: "/items/{id}",
    tags: ["Menu"],
    summary: "Get a menu item",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: { "application/json": { schema: MenuItemSchema } },
        description: "Item details",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await menuService.getMenuItem(id);
    if (!data) return sendError(c, 404, "Menu item not found");
    return c.json(data, 200);
  },
);

menuApp.openapi(
  createRoute({
    method: "put",
    path: "/items/{id}",
    tags: ["Menu"],
    summary: "Update a menu item",
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { "application/json": { schema: UpdateMenuItemSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: MenuItemSchema } },
        description: "Item updated",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const data = await menuService.updateMenuItem(id, body);
    if (!data) return sendError(c, 404, "Menu item not found");
    return c.json(data, 200);
  },
);

menuApp.openapi(
  createRoute({
    method: "delete",
    path: "/items/{id}",
    tags: ["Menu"],
    summary: "Delete a menu item",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({ message: z.string() }),
          },
        },
        description: "Item deleted",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await menuService.deleteMenuItem(id);
    if (!data) return sendError(c, 404, "Menu item not found");
    return c.json({ message: "Menu item deleted" }, 200);
  },
);

export default menuApp;
