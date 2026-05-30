import { sql, eq, and, gte, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  orders,
  orderItems,
  customers,
  menuItems,
  menuCategories,
} from "../../db/schema.js";

export async function getDashboardStats() {
  // Overall aggregates
  const [overall] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)::text`,
      totalOrders: sql<number>`count(*)::int`,
      avgOrderValue: sql<string>`COALESCE(AVG(${orders.total}::numeric), 0)::text`,
    })
    .from(orders)
    .where(sql`${orders.status} NOT IN ('cancelled')`);

  // Today's aggregates
  const [today] = await db
    .select({
      todayRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)::text`,
      todayOrders: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        sql`DATE(${orders.createdAt}) = CURRENT_DATE`,
        sql`${orders.status} != 'cancelled'`,
      ),
    );

  const [customerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers);

  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "pending"));

  const [preparingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "preparing"));

  return {
    totalRevenue: overall?.totalRevenue ?? "0",
    totalOrders: overall?.totalOrders ?? 0,
    avgOrderValue: overall?.avgOrderValue ?? "0",
    totalCustomers: customerCount?.count ?? 0,
    pendingOrders: pendingCount?.count ?? 0,
    preparingOrders: preparingCount?.count ?? 0,
    todayRevenue: today?.todayRevenue ?? "0",
    todayOrders: today?.todayOrders ?? 0,
  };
}

export async function getPopularItems(limit = 10) {
  const rows = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      categoryName: menuCategories.name,
      totalOrdered: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
      revenue: sql<string>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.unitPrice}::numeric), 0)::text`,
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(sql`${orders.status} != 'cancelled'`)
    .groupBy(menuItems.id, menuCategories.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(limit);

  return rows;
}

export async function getRecentOrders(limit = 10) {
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      tableNumber: orders.tableNumber,
      status: orders.status,
      type: orders.type,
      total: orders.total,
      createdAt: orders.createdAt,
      itemCount: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return rows;
}
