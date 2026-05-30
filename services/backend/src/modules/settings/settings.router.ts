import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { SettingsSchema, UpdateSettingsSchema } from "./settings.schema.js";
import * as settingsService from "./settings.service.js";

const settingsApp = new OpenAPIHono();

settingsApp.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Settings"],
    summary: "Get restaurant settings",
    responses: {
      200: {
        content: { "application/json": { schema: SettingsSchema } },
        description: "Current settings",
      },
    },
  }),
  async (c) => {
    const data = await settingsService.getSettings();
    return c.json(data, 200);
  },
);

settingsApp.openapi(
  createRoute({
    method: "put",
    path: "/",
    tags: ["Settings"],
    summary: "Update restaurant settings",
    request: {
      body: { content: { "application/json": { schema: UpdateSettingsSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: SettingsSchema } },
        description: "Settings updated",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const data = await settingsService.updateSettings(body);
    return c.json(data, 200);
  },
);

export default settingsApp;
