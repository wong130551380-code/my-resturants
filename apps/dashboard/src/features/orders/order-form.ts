export type OrderDraftItem = {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
};

export type OrderDraft = {
  customerName: string;
  type: "dine-in" | "takeout" | "delivery";
  tableNumber: number;
  items: OrderDraftItem[];
};

export function getOrderDraftTotal(items: OrderDraftItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function canSubmitOrderDraft(draft: OrderDraft) {
  if (!draft.customerName.trim()) return false;
  if (draft.type === "dine-in" && draft.tableNumber < 1) return false;
  return draft.items.some((item) => item.menuItemId && item.quantity > 0);
}
