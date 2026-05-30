import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { orders, orderItems, menuItems, customers } from "../../db/schema.js";
import { canTransition, type OrderStatus } from "../../lib/order-state-machine.js";

export async function listOrders(filters?: {
  status?: string;
  type?: string;
}) {
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.type) {
    conditions.push(eq(orders.type, filters.type as any));
  }

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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));

  return rows;
}

export async function getOrder(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });
}

export async function createOrder(data: {
  customerId?: string;
  customerName: string;
  tableNumber: number;
  type: "dine-in" | "takeout" | "delivery";
  notes?: string;
  items: { menuItemId: string; quantity: number; modifiers?: string[] }[];
}) {
  // Validate all menu items exist and are available
  const menuItemIds = data.items.map((i) => i.menuItemId);
  const foundItems = await db.query.menuItems.findMany({
    where: sql`${menuItems.id} IN (${sql.join(menuItemIds.map((id) => sql`${id}`), sql`, `)})`,
  });

  if (foundItems.length !== menuItemIds.length) {
    const foundIds = new Set(foundItems.map((i) => i.id));
    const missing = menuItemIds.filter((id) => !foundIds.has(id));
    throw new Error(`Menu items not found: ${missing.join(", ")}`);
  }

  const unavailable = foundItems.filter((i) => !i.available);
  if (unavailable.length > 0) {
    throw new Error(
      `Items unavailable: ${unavailable.map((i) => i.name).join(", ")}`,
    );
  }

  // Build price map
  const priceMap = new Map(
    foundItems.map((i) => [i.id, { price: parseFloat(i.price), name: i.name }]),
  );

  // Calculate total server-side
  let total = 0;
  const itemsWithPrices = data.items.map((item) => {
    const info = priceMap.get(item.menuItemId)!;
    const lineTotal = info.price * item.quantity;
    total += lineTotal;
    return {
      menuItemId: item.menuItemId,
      name: info.name,
      quantity: item.quantity,
      unitPrice: String(info.price),
      modifiers: item.modifiers ?? null,
    };
  });

  // Generate order number with random suffix for collision resistance
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const orderNumber = `ORD-${dateStr}-${suffix}`;

  // Wrap order creation + customer update in a transaction
  const result = await db.transaction(async (tx) => {
    const [orderRow] = await tx
      .insert(orders)
      .values({
        orderNumber,
        customerId: data.customerId ?? null,
        customerName: data.customerName,
        tableNumber: data.tableNumber,
        status: "pending",
        type: data.type,
        total: String(total),
        notes: data.notes ?? null,
      })
      .returning();

    if (itemsWithPrices.length > 0) {
      await tx.insert(orderItems).values(
        itemsWithPrices.map((item) => ({
          orderId: orderRow.id,
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          modifiers: item.modifiers,
        })),
      );
    }

    // Update customer aggregates if customerId is provided
    if (data.customerId) {
      await tx
        .update(customers)
        .set({
          totalVisits: sql`${customers.totalVisits} + 1`,
          totalSpent: sql`${customers.totalSpent} + ${total}`,
          lastVisit: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, data.customerId));
    }

    return orderRow;
  });

  return getOrder(result.id);
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
) {
  const current = await db.query.orders.findFirst({
    where: eq(orders.id, id),
  });

  if (!current) return null;

  if (!canTransition(current.status as OrderStatus, newStatus)) {
    throw new Error(
      `Cannot transition from "${current.status}" to "${newStatus}"`,
    );
  }

  const [row] = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  return getOrder(row.id);
}
