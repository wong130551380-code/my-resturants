import { eq, and, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { menuCategories, menuItems } from "../../db/schema.js";

// ─── Categories ──────────────────────────────────────────────────────────────

export async function listCategories() {
  return db.query.menuCategories.findMany({
    orderBy: [asc(menuCategories.sortOrder)],
    with: { items: true },
  });
}

export async function getCategory(id: string) {
  return db.query.menuCategories.findFirst({
    where: eq(menuCategories.id, id),
    with: { items: true },
  });
}

export async function createCategory(data: { name: string; sortOrder: number }) {
  const [row] = await db
    .insert(menuCategories)
    .values({ name: data.name, sortOrder: data.sortOrder })
    .returning();
  return row;
}

export async function updateCategory(
  id: string,
  data: { name?: string; sortOrder?: number },
) {
  const [row] = await db
    .update(menuCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(menuCategories.id, id))
    .returning();
  return row;
}

export async function deleteCategory(id: string) {
  const [row] = await db
    .delete(menuCategories)
    .where(eq(menuCategories.id, id))
    .returning();
  return row;
}

// ─── Menu Items ──────────────────────────────────────────────────────────────

export async function listMenuItems(filters?: {
  categoryId?: string;
  available?: string;
}) {
  const conditions = [];
  if (filters?.categoryId) {
    conditions.push(eq(menuItems.categoryId, filters.categoryId));
  }
  if (filters?.available !== undefined) {
    conditions.push(
      eq(menuItems.available, filters.available === "true"),
    );
  }

  return db.query.menuItems.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [asc(menuItems.sortOrder)],
    with: { category: true },
  });
}

export async function getMenuItem(id: string) {
  return db.query.menuItems.findFirst({
    where: eq(menuItems.id, id),
    with: { category: true },
  });
}

export async function createMenuItem(data: {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  popular: boolean;
  image?: string;
  sortOrder: number;
}) {
  const [row] = await db
    .insert(menuItems)
    .values({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: String(data.price),
      available: data.available,
      popular: data.popular,
      image: data.image ?? null,
      sortOrder: data.sortOrder,
    })
    .returning();
  return row;
}

export async function updateMenuItem(
  id: string,
  data: {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    available?: boolean;
    popular?: boolean;
    image?: string | null;
    sortOrder?: number;
  },
) {
  const values: Record<string, any> = { updatedAt: new Date() };
  if (data.categoryId !== undefined) values.categoryId = data.categoryId;
  if (data.name !== undefined) values.name = data.name;
  if (data.description !== undefined) values.description = data.description;
  if (data.price !== undefined) values.price = String(data.price);
  if (data.available !== undefined) values.available = data.available;
  if (data.popular !== undefined) values.popular = data.popular;
  if (data.image !== undefined) values.image = data.image;
  if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;

  const [row] = await db
    .update(menuItems)
    .set(values)
    .where(eq(menuItems.id, id))
    .returning();
  return row;
}

export async function deleteMenuItem(id: string) {
  const [row] = await db
    .delete(menuItems)
    .where(eq(menuItems.id, id))
    .returning();
  return row;
}
