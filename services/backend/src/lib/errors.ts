import type { Context } from "hono";
import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({ error: z.string() });

export function sendError(c: Context, status: number, message: string) {
  return c.json({ error: message }, status as any) as any;
}

export function sendSuccess<T>(c: Context, data: T, status = 200) {
  return c.json(data, status as any);
}
