# Restaurant Operations Dashboard

Fullstack restaurant operations dashboard built for the Odyssey assignment.

## Stack

- pnpm workspace + Turborepo
- `apps/dashboard`: Expo Router + React Native Web
- `services/backend`: Hono API prepared for Cloudflare Workers via Wrangler
- PostgreSQL + Drizzle ORM
- drizzle-zod for API schema derivation
- Hono OpenAPI generation
- Orval-generated frontend API client
- React Query

## Architecture

The intended contract flow is:

```text
Drizzle schema -> drizzle-zod -> Hono/OpenAPI -> Orval -> React Query usage
```

Database truth starts in `services/backend/src/db/schema.ts`. Backend route schemas derive from Drizzle tables with `drizzle-zod`, then Hono exposes `services/backend/openapi.json`. The dashboard regenerates its API client from that OpenAPI file into `apps/dashboard/src/api/generated`.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a PostgreSQL database and set `DATABASE_URL`. For the Worker runtime, a Neon/Postgres HTTP-compatible connection string is recommended.

For local scripts that use `.env`, create:

```bash
services/backend/.env
```

with:

```bash
DATABASE_URL=postgres://user:password@host:5432/database
```

For Wrangler local dev, update:

```bash
services/backend/wrangler.toml
```

## Database

Push schema:

```bash
pnpm db:push
```

Seed review data:

```bash
pnpm db:seed
```

## Development

Run backend:

```bash
pnpm dev:backend
```

Run dashboard on web:

```bash
pnpm dev:dashboard
```

Regenerate OpenAPI and frontend client:

```bash
pnpm gen:contract
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Notes and Tradeoffs

- The backend is configured for Wrangler and a Worker-compatible Postgres strategy (Neon HTTP driver via `@neondatabase/serverless` Pool). A real deployment should use Neon Hyperdrive or a similar managed connection.
- The dashboard includes a backend-backed order creation modal, menu management, customer management with order history, settings, and dashboard summary data.
- Order creation is wrapped in a database transaction and updates customer spend/visit aggregates server-side. Order numbers use a random suffix for collision resistance.
- The CRM page shows per-customer order history fetched from `GET /api/customers/{id}/orders`, including order count, total spend, and last order date.
- Business logic is extracted into feature hooks (`src/features/*/use-*.ts`) that wrap Orval-generated API functions with React Query, keeping page components mostly presentational.
- Tests cover the backend order state machine (3 unit tests), backend order service integration (6 tests: server-calculated totals, unavailable item rejection, missing item rejection, invalid status transitions, full status path, customer spend updates), and frontend order draft logic (3 tests). Total: 12 tests.
- `packages/shared`, `packages/types`, and `packages/api-client` exist as workspace placeholders. Currently, shared types come from Orval-generated schemas in `apps/dashboard/src/api/generated/`. As the project grows, cross-app utilities and types can be promoted into these packages.
- The Orval-generated API types wrap responses in `{ data, status }` but the `customInstance` returns raw JSON. Feature hooks handle this type narrowing with explicit casts.
