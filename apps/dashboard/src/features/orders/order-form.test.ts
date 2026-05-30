import assert from "node:assert/strict";
import test from "node:test";
import { canSubmitOrderDraft, getOrderDraftTotal } from "./order-form";

test("calculates order draft totals from quantity and current unit price", () => {
  const total = getOrderDraftTotal([
    { menuItemId: "item-1", quantity: 2, unitPrice: 12.5 },
    { menuItemId: "item-2", quantity: 1, unitPrice: 5 },
  ]);

  assert.equal(total, 30);
});

test("requires a customer and at least one item before submit", () => {
  assert.equal(
    canSubmitOrderDraft({
      customerName: "",
      type: "takeout",
      tableNumber: 0,
      items: [{ menuItemId: "item-1", quantity: 1, unitPrice: 10 }],
    }),
    false,
  );

  assert.equal(
    canSubmitOrderDraft({
      customerName: "Walk-in",
      type: "takeout",
      tableNumber: 0,
      items: [],
    }),
    false,
  );
});

test("requires a table number for dine-in orders", () => {
  assert.equal(
    canSubmitOrderDraft({
      customerName: "Walk-in",
      type: "dine-in",
      tableNumber: 0,
      items: [{ menuItemId: "item-1", quantity: 1, unitPrice: 10 }],
    }),
    false,
  );

  assert.equal(
    canSubmitOrderDraft({
      customerName: "Walk-in",
      type: "dine-in",
      tableNumber: 8,
      items: [{ menuItemId: "item-1", quantity: 1, unitPrice: 10 }],
    }),
    true,
  );
});
