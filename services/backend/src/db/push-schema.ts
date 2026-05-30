import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
-- Enums
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending','preparing','ready','served','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('dine-in','takeout','delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  popular BOOLEAN NOT NULL DEFAULT false,
  image VARCHAR(500),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS menu_items_category_id_idx ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(available);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_visit TIMESTAMP,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customers_name_idx ON customers(name);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(200) NOT NULL,
  table_number INTEGER NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  type order_type NOT NULL DEFAULT 'dine-in',
  total NUMERIC(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  modifiers TEXT[]
);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- Restaurant Settings (Singleton)
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name VARCHAR(200) NOT NULL DEFAULT 'My Restaurant',
  address TEXT NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  email VARCHAR(320) NOT NULL DEFAULT '',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
  tax_rate NUMERIC(5,3) NOT NULL DEFAULT 0,
  open_time VARCHAR(5) NOT NULL DEFAULT '11:00',
  close_time VARCHAR(5) NOT NULL DEFAULT '23:00',
  tables INTEGER NOT NULL DEFAULT 20,
  auto_accept_orders BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  prep_time_minutes INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_settings_singleton_chk CHECK (id = 1)
);
`;

async function main() {
  console.log("Pushing schema to database...");
  await pool.query(sql);
  console.log("Schema pushed successfully!");

  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables:", tables.rows.map((r: any) => r.table_name).join(", "));
  await pool.end();
}

main().catch((err) => {
  console.error("Error:", err.message);
  pool.end();
  process.exit(1);
});
