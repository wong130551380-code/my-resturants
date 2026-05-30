import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import menuApp from "./modules/menu/menu.router.js";
import ordersApp from "./modules/orders/orders.router.js";
import customersApp from "./modules/customers/customers.router.js";
import settingsApp from "./modules/settings/settings.router.js";
import dashboardApp from "./modules/dashboard/dashboard.router.js";

const app = new OpenAPIHono();

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(
  "*",
  cors({
    origin: ["http://localhost:8081", "http://localhost:8099", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Mount Modules ──────────────────────────────────────────────────────────

app.route("/api/menu", menuApp);
app.route("/api/orders", ordersApp);
app.route("/api/customers", customersApp);
app.route("/api/settings", settingsApp);
app.route("/api/dashboard", dashboardApp);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── OpenAPI Spec ───────────────────────────────────────────────────────────

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Restaurant Dashboard API",
    version: "1.0.0",
    description: "Backend API for the restaurant management dashboard",
  },
  servers: [{ url: "http://localhost:3000" }],
});

export default app;
