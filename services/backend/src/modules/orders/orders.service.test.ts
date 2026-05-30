import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  menuCategories,
  menuItems,
  customers,
  orders,
} from "../../db/schema.js";
import { createOrder, updateOrderStatus } from "./orders.service.js";

describe("orders service", () => {
  let categoryId: string;
  let availableItemId: string;
  let availableItemId2: string;
  let unavailableItemId: string;
  let customerId: string;

  before(async () => {
    // Create test category
    const [cat] = await db
      .insert(menuCategories)
      .values({ name: "__test_category__", sortOrder: 9999 })
      .returning();
    categoryId = cat.id;

    // Create test menu items
    const [avail] = await db
      .insert(menuItems)
      .values({
        categoryId,
        name: "__test_available_1__",
        description: "test",
        price: "12.50",
        available: true,
        sortOrder: 0,
      })
      .returning();
    availableItemId = avail.id;

    const [avail2] = await db
      .insert(menuItems)
      .values({
        categoryId,
        name: "__test_available_2__",
        description: "test",
        price: "7.00",
        available: true,
        sortOrder: 1,
      })
      .returning();
    availableItemId2 = avail2.id;

    const [unavail] = await db
      .insert(menuItems)
      .values({
        categoryId,
        name: "__test_unavailable__",
        description: "test",
        price: "8.00",
        available: false,
        sortOrder: 2,
      })
      .returning();
    unavailableItemId = unavail.id;

    // Create test customer
    const [cust] = await db
      .insert(customers)
      .values({
        name: "__test_customer__",
        email: `test_${Date.now()}@test.com`,
        phone: "000-000-0000",
        tags: [],
        totalVisits: 0,
        totalSpent: "0",
      })
      .returning();
    customerId = cust.id;
  });

  after(async () => {
    await db.execute(
      `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = '${customerId}')`,
    );
    await db.delete(orders).where(eq(orders.customerId, customerId));
    await db.delete(customers).where(eq(customers.id, customerId));
    await db.delete(menuItems).where(eq(menuItems.categoryId, categoryId));
    await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
  });

  it("creates order with server-calculated total", async () => {
    const result = await createOrder({
      customerId,
      customerName: "Test Customer",
      tableNumber: 1,
      type: "dine-in",
      items: [
        { menuItemId: availableItemId, quantity: 2 },  // 12.50 * 2 = 25.00
        { menuItemId: availableItemId2, quantity: 1 }, // 7.00 * 1 = 7.00
      ],
    });

    assert.ok(result);
    assert.equal(result!.total, "32.00"); // 25.00 + 7.00
    assert.equal(result!.status, "pending");
    assert.equal(result!.items.length, 2);
  });

  it("rejects unavailable items", async () => {
    await assert.rejects(
      () =>
        createOrder({
          customerName: "Test",
          tableNumber: 1,
          type: "dine-in",
          items: [{ menuItemId: unavailableItemId, quantity: 1 }],
        }),
      (err: Error) => {
        assert.ok(err.message.includes("Items unavailable"));
        return true;
      },
    );
  });

  it("rejects missing menu items", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    await assert.rejects(
      () =>
        createOrder({
          customerName: "Test",
          tableNumber: 1,
          type: "dine-in",
          items: [{ menuItemId: fakeId, quantity: 1 }],
        }),
      (err: Error) => {
        assert.ok(err.message.includes("Menu items not found"));
        return true;
      },
    );
  });

  it("rejects invalid status transition (pending -> completed)", async () => {
    const order = await createOrder({
      customerName: "Test",
      tableNumber: 1,
      type: "dine-in",
      items: [{ menuItemId: availableItemId, quantity: 1 }],
    });

    await assert.rejects(
      () => updateOrderStatus(order!.id, "completed"),
      (err: Error) => {
        assert.ok(err.message.includes("Cannot transition"));
        return true;
      },
    );
  });

  it("allows full status path: pending -> preparing -> ready -> served -> completed", async () => {
    const order = await createOrder({
      customerName: "Test",
      tableNumber: 1,
      type: "dine-in",
      items: [{ menuItemId: availableItemId, quantity: 1 }],
    });

    const preparing = await updateOrderStatus(order!.id, "preparing");
    assert.equal(preparing!.status, "preparing");

    const ready = await updateOrderStatus(order!.id, "ready");
    assert.equal(ready!.status, "ready");

    const served = await updateOrderStatus(order!.id, "served");
    assert.equal(served!.status, "served");

    const completed = await updateOrderStatus(order!.id, "completed");
    assert.equal(completed!.status, "completed");
  });

  it("updates customer spend and visits on order creation", async () => {
    // Create an order with a known total
    await createOrder({
      customerId,
      customerName: "Test Customer",
      tableNumber: 1,
      type: "dine-in",
      items: [{ menuItemId: availableItemId, quantity: 4 }], // 12.50 * 4 = 50.00
    });

    // Check customer aggregates
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId));

    assert.ok(customer.totalVisits >= 1);
    assert.ok(parseFloat(customer.totalSpent) >= 50.0);
    assert.ok(customer.lastVisit !== null);
  });
});
