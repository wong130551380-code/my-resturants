import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
]);

export const orderTypeEnum = pgEnum("order_type", [
  "dine-in",
  "takeout",
  "delivery",
]);

// ─── Menu Categories ─────────────────────────────────────────────────────────

export const menuCategories = pgTable(
  "menu_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("menu_categories_name_idx").on(table.name),
  ]
);

// ─── Menu Items ──────────────────────────────────────────────────────────────

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    available: boolean("available").notNull().default(true),
    popular: boolean("popular").notNull().default(false),
    image: varchar("image", { length: 500 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("menu_items_category_id_idx").on(table.categoryId),
    index("menu_items_available_idx").on(table.available),
  ]
);

// ─── Customers ───────────────────────────────────────────────────────────────

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    totalVisits: integer("total_visits").notNull().default(0),
    totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
    lastVisit: timestamp("last_visit"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customers_email_idx").on(table.email),
    index("customers_name_idx").on(table.name),
  ]
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: varchar("order_number", { length: 20 }).notNull(),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    customerName: varchar("customer_name", { length: 200 }).notNull(),
    tableNumber: integer("table_number").notNull().default(0),
    status: orderStatusEnum("status").notNull().default("pending"),
    type: orderTypeEnum("type").notNull().default("dine-in"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_customer_id_idx").on(table.customerId),
  ]
);

// ─── Order Items ─────────────────────────────────────────────────────────────

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id").references(() => menuItems.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 200 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    modifiers: text("modifiers").array(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)]
);

// ─── Restaurant Settings (Singleton) ─────────────────────────────────────────

export const restaurantSettings = pgTable(
  "restaurant_settings",
  {
    id: integer("id").primaryKey().default(1),
    name: varchar("name", { length: 200 }).notNull().default("My Restaurant"),
    address: text("address").notNull().default(""),
    phone: varchar("phone", { length: 30 }).notNull().default(""),
    email: varchar("email", { length: 320 }).notNull().default(""),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("America/New_York"),
    taxRate: numeric("tax_rate", { precision: 5, scale: 3 }).notNull().default("0"),
    openTime: varchar("open_time", { length: 5 }).notNull().default("11:00"),
    closeTime: varchar("close_time", { length: 5 }).notNull().default("23:00"),
    tables: integer("tables").notNull().default(20),
    autoAcceptOrders: boolean("auto_accept_orders").notNull().default(false),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    smsNotifications: boolean("sms_notifications").notNull().default(false),
    prepTimeMinutes: integer("prep_time_minutes").notNull().default(15),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    check("restaurant_settings_singleton_chk", sql`${table.id} = 1`),
  ]
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  orderItems: many(orderItems),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));
