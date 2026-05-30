import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { restaurantSettings } from "../../db/schema.js";

export async function getSettings() {
  let settings = await db.query.restaurantSettings.findFirst();
  if (!settings) {
    // Create default settings if none exist
    const [row] = await db
      .insert(restaurantSettings)
      .values({})
      .returning();
    settings = row;
  }
  return settings;
}

export async function updateSettings(data: Record<string, any>) {
  const values: Record<string, any> = { updatedAt: new Date() };
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      // Convert numeric fields that are stored as numeric
      if (key === "taxRate") {
        values[key] = val;
      } else {
        values[key] = val;
      }
    }
  }

  const [row] = await db
    .update(restaurantSettings)
    .set(values)
    .where(eq(restaurantSettings.id, 1))
    .returning();
  return row;
}
