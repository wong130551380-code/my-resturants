import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { customers, orders, orderItems } from "../../db/schema.js";

export async function listCustomers(filters?: {
  tag?: string;
  search?: string;
}) {
  const conditions = [];

  if (filters?.tag) {
    conditions.push(sql`${customers.tags} @> ARRAY[${filters.tag}]::text[]`);
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(customers.name, term),
        ilike(customers.email, term),
        ilike(customers.phone, term),
      )!,
    );
  }

  return db.query.customers.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(customers.lastVisit)],
  });
}

export async function getCustomer(id: string) {
  return db.query.customers.findFirst({
    where: eq(customers.id, id),
  });
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
  tags: string[];
  notes?: string;
}) {
  const [row] = await db
    .insert(customers)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      tags: data.tags,
      notes: data.notes ?? null,
    })
    .returning();
  return row;
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    tags?: string[];
    notes?: string | null;
  },
) {
  const values: Record<string, any> = { updatedAt: new Date() };
  if (data.name !== undefined) values.name = data.name;
  if (data.email !== undefined) values.email = data.email;
  if (data.phone !== undefined) values.phone = data.phone;
  if (data.tags !== undefined) values.tags = data.tags;
  if (data.notes !== undefined) values.notes = data.notes;

  const [row] = await db
    .update(customers)
    .set(values)
    .where(eq(customers.id, id))
    .returning();
  return row;
}

export async function deleteCustomer(id: string) {
  const [row] = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning();
  return row;
}

export async function getCustomerOrders(customerId: string) {
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
      itemCount: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orders.customerId, customerId))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));

  const orderCount = rows.length;
  const totalSpent = rows.reduce((sum, r) => sum + parseFloat(r.total), 0);
  const lastOrderDate = rows.length > 0 ? rows[0].createdAt : null;

  return {
    orders: rows,
    orderCount,
    totalSpent: totalSpent.toFixed(2),
    lastOrderDate,
  };
}
