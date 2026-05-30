export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
  served: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

export function getValidTransitions(from: OrderStatus): OrderStatus[] {
  return validTransitions[from] ?? [];
}
