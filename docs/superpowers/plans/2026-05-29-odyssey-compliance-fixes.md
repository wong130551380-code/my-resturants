# Odyssey Compliance Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the restaurant dashboard project into closer compliance with the Odyssey assignment requirements.

**Architecture:** Keep the existing monorepo shape, but make the backend match Cloudflare Workers, restore the required contract-generation chain, and move page business logic into focused hooks. The frontend should consume generated Orval React Query hooks and expose the missing order creation and CRM history flows.

**Tech Stack:** pnpm workspace, Turborepo, Expo Router + React Native Web, Hono on Cloudflare Workers, PostgreSQL + Drizzle ORM, drizzle-zod, OpenAPI, Orval, React Query, Vitest.

---

## File Map

- Modify: `package.json` for required root scripts.
- Modify: `turbo.json` for task names and outputs.
- Modify: `services/backend/package.json` for Workers runtime, tests, and scripts.
- Create: `services/backend/wrangler.toml` for Cloudflare Worker local dev.
- Modify: `services/backend/src/index.ts` to export the Worker-compatible Hono app only.
- Remove or stop using: `services/backend/src/server.ts` as the main backend entry.
- Modify: `services/backend/src/db/index.ts` to use a Worker-compatible PostgreSQL driver strategy.
- Modify: `services/backend/src/modules/*/*.schema.ts` to derive base schemas from Drizzle with `drizzle-zod`.
- Modify: `services/backend/src/modules/orders/orders.service.ts` for transactions, customer aggregate updates, and safer order number generation.
- Create: `services/backend/src/modules/orders/orders.service.test.ts` for order validation and status transition tests.
- Create: `services/backend/src/lib/order-state-machine.test.ts` for pure state-machine tests.
- Modify: `apps/dashboard/orval.config.ts` so GET endpoints generate `useQuery` hooks correctly.
- Modify: `apps/dashboard/src/api/custom-instance.ts` to return the generated response shape consistently.
- Create: `apps/dashboard/src/features/orders/use-orders.ts` for orders queries/mutations.
- Create: `apps/dashboard/src/features/orders/order-create-modal.tsx` for order creation.
- Modify: `apps/dashboard/src/app/(tabs)/orders.tsx` to use the feature hook and modal.
- Create: `apps/dashboard/src/features/customers/use-customers.ts` and customer detail/history UI.
- Modify: `apps/dashboard/src/app/(tabs)/crm.tsx` to show order history/spend from backend data.
- Modify: `apps/dashboard/src/components/ui/modal.tsx`, `toast.tsx`, `skeleton.tsx`, and `components/animated-icon.tsx` to satisfy lint.
- Create frontend tests for order creation state and important empty/error UI.
- Create: `README.md` with setup, seed, architecture, and tradeoffs.

---

## Task 1: Root Scripts and DX

**Files:**
- Modify: `package.json`
- Modify: `turbo.json`

- [ ] Add root scripts:

```json
{
  "scripts": {
    "dev:dashboard": "pnpm --filter dashboard web",
    "dev:backend": "pnpm --filter backend dev",
    "gen:contract": "pnpm --filter backend generate:openapi && pnpm --filter dashboard generate:api",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "db:push": "pnpm --filter backend db:push",
    "db:seed": "pnpm --filter backend db:seed"
  }
}
```

- [ ] Add `lint`, `typecheck`, and `test` tasks to `turbo.json`.
- [ ] Run:

```bash
pnpm gen:contract
pnpm typecheck
pnpm test
```

Expected after later tasks: all pass.

---

## Task 2: Convert Backend Runtime to Cloudflare Workers

**Files:**
- Modify: `services/backend/package.json`
- Create: `services/backend/wrangler.toml`
- Modify: `services/backend/src/index.ts`
- Modify: `services/backend/src/db/index.ts`

- [ ] Replace Node dev server scripts with Wrangler-oriented scripts:

```json
{
  "scripts": {
    "dev": "wrangler dev src/index.ts --port 3000",
    "deploy": "wrangler deploy",
    "build": "tsc --noEmit",
    "db:generate": "drizzle-kit generate --config src/db/drizzle.config.ts",
    "db:push": "drizzle-kit push --config src/db/drizzle.config.ts",
    "db:seed": "tsx src/db/seed.ts",
    "generate:openapi": "tsx scripts/generate-openapi.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint ."
  }
}
```

- [ ] Add `wrangler`, `@cloudflare/workers-types`, and a Worker-compatible Postgres strategy. Prefer Neon HTTP/WebSocket or Hyperdrive; do not keep `@hono/node-server` as the primary runtime.
- [ ] Create `wrangler.toml` with `main = "src/index.ts"` and local vars for `DATABASE_URL`.
- [ ] Keep `src/index.ts` exporting `default app`; remove Node `serve` from the normal path.
- [ ] Run:

```bash
pnpm --filter backend dev
curl http://localhost:3000/health
```

Expected: JSON health response from Wrangler.

---

## Task 3: Restore Drizzle-Zod Contract Source

**Files:**
- Modify: `services/backend/src/modules/menu/menu.schema.ts`
- Modify: `services/backend/src/modules/orders/orders.schema.ts`
- Modify: `services/backend/src/modules/customers/customers.schema.ts`
- Modify: `services/backend/src/modules/settings/settings.schema.ts`

- [ ] Import `createSelectSchema` and `createInsertSchema` from `drizzle-zod`.
- [ ] Derive base schemas from `services/backend/src/db/schema.ts`, then extend/omit only where API shape differs.
- [ ] Keep OpenAPI names with `.openapi("Name")`.
- [ ] Remove duplicated enum literals where they can be inferred from Drizzle enum values.
- [ ] Regenerate contract:

```bash
pnpm gen:contract
```

Expected: `services/backend/openapi.json` and `apps/dashboard/src/api/generated/**` update cleanly.

---

## Task 4: Harden Order Business Rules

**Files:**
- Modify: `services/backend/src/modules/orders/orders.service.ts`
- Modify: `services/backend/src/modules/customers/customers.service.ts`
- Test: `services/backend/src/modules/orders/orders.service.test.ts`
- Test: `services/backend/src/lib/order-state-machine.test.ts`

- [ ] Wrap order creation in `db.transaction`.
- [ ] Generate order numbers in a collision-resistant way, such as a short random suffix or a dedicated sequence table.
- [ ] Reject unavailable menu items and missing menu items inside the transaction.
- [ ] Update customer `totalVisits`, `totalSpent`, and `lastVisit` when an order is created for a customer.
- [ ] Add tests for:

```text
creates order with server-calculated total
rejects unavailable item
rejects missing item
rejects invalid pending -> completed transition
allows pending -> preparing -> ready -> served -> completed
updates customer spend and visits on order creation
```

- [ ] Run:

```bash
pnpm --filter backend test
```

Expected: all backend tests pass.

---

## Task 5: Fix Orval Hook Generation and Frontend API Use

**Files:**
- Modify: `apps/dashboard/orval.config.ts`
- Modify: `apps/dashboard/src/api/custom-instance.ts`
- Create: `apps/dashboard/src/features/orders/use-orders.ts`
- Create: `apps/dashboard/src/features/menu/use-menu.ts`
- Create: `apps/dashboard/src/features/customers/use-customers.ts`
- Create: `apps/dashboard/src/features/settings/use-settings.ts`

- [ ] Adjust Orval config so GET operations generate `useQuery` hooks, not mutation hooks.
- [ ] Ensure generated return types match what `customInstance` returns.
- [ ] Replace page-level `useQuery` / `useMutation` wrappers with feature hooks that compose generated hooks.
- [ ] Keep page components mostly presentational: filters, selected IDs, modal visibility, and rendering only.
- [ ] Run:

```bash
pnpm --filter dashboard generate:api
pnpm --filter dashboard exec tsc --noEmit
```

Expected: no type errors.

---

## Task 6: Implement Order Creation Flow

**Files:**
- Create: `apps/dashboard/src/features/orders/order-create-modal.tsx`
- Modify: `apps/dashboard/src/app/(tabs)/orders.tsx`

- [ ] Add a modal opened by the `New Order` button.
- [ ] Load available menu items from generated menu hooks.
- [ ] Let reviewer choose customer name or existing customer, order type, table number, notes, items, and quantities.
- [ ] Show client-side estimated total, but submit only `menuItemId`, `quantity`, `customerId/customerName`, `type`, `tableNumber`, and `notes`.
- [ ] Use backend response total as source of truth after save.
- [ ] Invalidate orders, dashboard stats, recent orders, popular items, and customers.
- [ ] Add a frontend test covering disabled submit when no items are selected.

---

## Task 7: Implement CRM Order History

**Files:**
- Modify: `services/backend/src/modules/customers/customers.router.ts`
- Modify: `services/backend/src/modules/customers/customers.service.ts`
- Modify: `services/backend/src/modules/customers/customers.schema.ts`
- Modify: `apps/dashboard/src/app/(tabs)/crm.tsx`

- [ ] Add endpoint `GET /api/customers/{id}/orders`.
- [ ] Return recent orders, order count, total spend, and last order date from orders table.
- [ ] In CRM, open a customer detail modal instead of only edit modal.
- [ ] Show order history and spend from backend-derived data.
- [ ] Keep edit customer as a section/action inside the detail modal or a separate modal.
- [ ] Add backend test for customer order history totals.

---

## Task 8: Fix Lint and Add Tests

**Files:**
- Modify: `apps/dashboard/src/components/ui/modal.tsx`
- Modify: `apps/dashboard/src/components/ui/toast.tsx`
- Modify: `apps/dashboard/src/components/ui/skeleton.tsx`
- Modify: `apps/dashboard/src/components/animated-icon.tsx`
- Modify: `apps/dashboard/src/app/(tabs)/settings.tsx`
- Create frontend test files near the tested code.

- [ ] Replace `useRef(new Animated.Value(...)).current` patterns with `useMemo(() => new Animated.Value(...), [])` or a lint-compliant `useRef` initialization block.
- [ ] Replace synchronous server-state copying in Settings with a derived form initializer plus explicit reset logic.
- [ ] Remove unused imports and unstable dependency warnings.
- [ ] Run:

```bash
pnpm --filter dashboard lint
pnpm --filter dashboard exec tsc --noEmit
pnpm --filter dashboard test
```

Expected: all pass.

---

## Task 9: Shared Packages and Documentation

**Files:**
- Create or populate: `packages/shared`
- Create or populate: `packages/types`
- Create or populate: `packages/api-client`
- Create: `README.md`

- [ ] Move reusable frontend-independent utilities to `packages/shared`.
- [ ] Export contract-derived or shared-only types from `packages/types`; do not duplicate backend DTOs manually.
- [ ] Either move generated Orval output into `packages/api-client` or explain why it stays app-local.
- [ ] Add README sections:

```text
Overview
Stack
Architecture: Drizzle -> drizzle-zod -> Hono/OpenAPI -> Orval -> React Query
Local setup
Environment variables
Database push and seed
Development commands
Testing commands
Tradeoffs and incomplete areas
```

- [ ] Run final verification:

```bash
pnpm gen:contract
pnpm lint
pnpm typecheck
pnpm test
pnpm dev:backend
pnpm dev:dashboard
```

Expected: commands are documented and working.

---

## Completion Checklist

- [ ] Backend runs with Wrangler, not Node server as the primary runtime.
- [ ] Drizzle schema is the source for Zod/OpenAPI contracts.
- [ ] Orval generated hooks are consumed by frontend feature hooks.
- [ ] Orders can be created from the dashboard.
- [ ] Order status transitions are backend-controlled.
- [ ] CRM shows backend-derived order history and spend.
- [ ] Menu and settings CRUD still work.
- [ ] Seed data works from a clean database.
- [ ] Lint, typecheck, tests, contract generation pass.
- [ ] README is enough for a reviewer to run the app locally.
