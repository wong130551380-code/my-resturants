import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log("Seeding database...");

  // Clean our tables in reverse dependency order
  await pool.query(`
    TRUNCATE order_items, orders, customers, menu_items, menu_categories, restaurant_settings CASCADE;
  `);

  // ─── Menu Categories ─────────────────────────────────────────────────────
  const categories = [
    { name: "Appetizers", sort_order: 0 },
    { name: "Main Courses", sort_order: 1 },
    { name: "Pasta", sort_order: 2 },
    { name: "Pizza", sort_order: 3 },
    { name: "Seafood", sort_order: 4 },
    { name: "Desserts", sort_order: 5 },
    { name: "Beverages", sort_order: 6 },
    { name: "Sides", sort_order: 7 },
  ];

  const categoryIds: Record<string, string> = {};
  for (const cat of categories) {
    const res = await pool.query(
      "INSERT INTO menu_categories (name, sort_order) VALUES ($1, $2) RETURNING id",
      [cat.name, cat.sort_order]
    );
    categoryIds[cat.name] = res.rows[0].id;
  }
  console.log(`  ${categories.length} categories inserted`);

  // ─── Menu Items ──────────────────────────────────────────────────────────
  const items = [
    { name: "Bruschetta", description: "Toasted bread with tomatoes, garlic, and fresh basil", price: 9.5, category: "Appetizers", available: true, popular: true },
    { name: "Calamari Fritti", description: "Crispy fried squid with marinara dipping sauce", price: 12.0, category: "Appetizers", available: true, popular: false },
    { name: "Caesar Salad", description: "Romaine lettuce, croutons, parmesan, classic caesar dressing", price: 11.0, category: "Appetizers", available: true, popular: false },
    { name: "Soup of the Day", description: "Ask your server for today's selection", price: 8.0, category: "Appetizers", available: false, popular: false },
    { name: "Grilled Ribeye", description: "12oz prime ribeye with roasted vegetables and herb butter", price: 38.0, category: "Main Courses", available: true, popular: true },
    { name: "Chicken Parmesan", description: "Breaded chicken breast with marinara and melted mozzarella", price: 22.0, category: "Main Courses", available: true, popular: false },
    { name: "Lamb Shank", description: "Slow-braised lamb shank with rosemary and red wine reduction", price: 32.0, category: "Main Courses", available: true, popular: false },
    { name: "Vegetable Stir Fry", description: "Seasonal vegetables with ginger soy glaze and jasmine rice", price: 18.0, category: "Main Courses", available: true, popular: false },
    { name: "Spaghetti Carbonara", description: "Classic carbonara with guanciale, egg, pecorino", price: 19.0, category: "Pasta", available: true, popular: true },
    { name: "Penne Arrabbiata", description: "Spicy tomato sauce with garlic and chili flakes", price: 16.0, category: "Pasta", available: true, popular: false },
    { name: "Fettuccine Alfredo", description: "Creamy parmesan sauce with fresh fettuccine", price: 18.0, category: "Pasta", available: true, popular: false },
    { name: "Lasagna Bolognese", description: "Layered pasta with meat ragu and bechamel", price: 20.0, category: "Pasta", available: false, popular: false },
    { name: "Margherita", description: "San Marzano tomatoes, fresh mozzarella, basil", price: 16.0, category: "Pizza", available: true, popular: true },
    { name: "Quattro Formaggi", description: "Mozzarella, gorgonzola, fontina, parmesan", price: 19.0, category: "Pizza", available: true, popular: false },
    { name: "Diavola", description: "Spicy salami, tomato, mozzarella, chili oil", price: 18.0, category: "Pizza", available: true, popular: false },
    { name: "Grilled Salmon", description: "Atlantic salmon with lemon caper butter and asparagus", price: 28.0, category: "Seafood", available: true, popular: true },
    { name: "Seafood Risotto", description: "Arborio rice with shrimp, mussels, and saffron", price: 26.0, category: "Seafood", available: true, popular: false },
    { name: "Fish & Chips", description: "Beer-battered cod with fries and tartar sauce", price: 20.0, category: "Seafood", available: true, popular: false },
    { name: "Tiramisu", description: "Classic Italian coffee-flavored dessert", price: 10.0, category: "Desserts", available: true, popular: true },
    { name: "Panna Cotta", description: "Vanilla cream with berry compote", price: 9.0, category: "Desserts", available: true, popular: false },
    { name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 12.0, category: "Desserts", available: true, popular: false },
    { name: "Espresso", description: "Double shot Italian espresso", price: 4.0, category: "Beverages", available: true, popular: false },
    { name: "Fresh Lemonade", description: "House-made with fresh lemons and mint", price: 5.5, category: "Beverages", available: true, popular: false },
    { name: "House Red Wine", description: "Glass of Chianti Classico", price: 12.0, category: "Beverages", available: true, popular: false },
    { name: "Garlic Bread", description: "Toasted with garlic butter and herbs", price: 6.0, category: "Sides", available: true, popular: false },
    { name: "Truffle Fries", description: "Crispy fries with truffle oil and parmesan", price: 8.0, category: "Sides", available: true, popular: true },
    { name: "Grilled Vegetables", description: "Seasonal grilled vegetables with balsamic", price: 7.0, category: "Sides", available: true, popular: false },
  ];

  const itemIds: Record<string, string> = {};
  for (const item of items) {
    const res = await pool.query(
      `INSERT INTO menu_items (category_id, name, description, price, available, popular)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [categoryIds[item.category], item.name, item.description, item.price, item.available, item.popular]
    );
    itemIds[item.name] = res.rows[0].id;
  }
  console.log(`  ${items.length} menu items inserted`);

  // ─── Customers ───────────────────────────────────────────────────────────
  const customerData = [
    { name: "James Wilson", email: "james.w@email.com", phone: "(555) 123-4567", total_visits: 24, total_spent: 1850.5, last_visit: "2026-05-29", tags: ["VIP", "Regular"], notes: "Prefers window seating" },
    { name: "Sarah Chen", email: "sarah.chen@email.com", phone: "(555) 234-5678", total_visits: 18, total_spent: 1320.0, last_visit: "2026-05-29", tags: ["Regular"], notes: "Allergic to shellfish" },
    { name: "Mike Thompson", email: "mike.t@email.com", phone: "(555) 345-6789", total_visits: 8, total_spent: 480.0, last_visit: "2026-05-29", tags: ["Takeout"], notes: null },
    { name: "Emily Davis", email: "emily.d@email.com", phone: "(555) 456-7890", total_visits: 32, total_spent: 2680.0, last_visit: "2026-05-29", tags: ["VIP", "Regular", "Wine Lover"], notes: "Birthday: March 15" },
    { name: "Alex Rodriguez", email: "alex.r@email.com", phone: "(555) 567-8901", total_visits: 12, total_spent: 890.0, last_visit: "2026-05-29", tags: ["Delivery"], notes: null },
    { name: "Lisa Park", email: "lisa.p@email.com", phone: "(555) 678-9012", total_visits: 6, total_spent: 340.0, last_visit: "2026-05-29", tags: ["New"], notes: null },
    { name: "Robert Kim", email: "robert.k@email.com", phone: "(555) 789-0123", total_visits: 15, total_spent: 1100.0, last_visit: "2026-05-29", tags: ["Regular"], notes: null },
    { name: "Nancy White", email: "nancy.w@email.com", phone: "(555) 890-1234", total_visits: 3, total_spent: 150.0, last_visit: "2026-05-28", tags: ["New"], notes: null },
    { name: "David Brown", email: "david.b@email.com", phone: "(555) 901-2345", total_visits: 45, total_spent: 4200.0, last_visit: "2026-05-27", tags: ["VIP", "Regular", "Corporate"], notes: "Corporate account - invoices monthly" },
    { name: "Maria Garcia", email: "maria.g@email.com", phone: "(555) 012-3456", total_visits: 20, total_spent: 1650.0, last_visit: "2026-05-26", tags: ["Regular", "Wine Lover"], notes: null },
  ];

  const customerIds: Record<string, string> = {};
  for (const c of customerData) {
    const res = await pool.query(
      `INSERT INTO customers (name, email, phone, total_visits, total_spent, last_visit, tags, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [c.name, c.email, c.phone, c.total_visits, c.total_spent, c.last_visit, c.tags, c.notes]
    );
    customerIds[c.name] = res.rows[0].id;
  }
  console.log(`  ${customerData.length} customers inserted`);

  // ─── Orders ──────────────────────────────────────────────────────────────
  const orderData = [
    {
      order_number: "ORD-001", customer: "James Wilson", table_number: 5, status: "preparing", type: "dine-in",
      items: [{ name: "Bruschetta", qty: 1 }, { name: "Grilled Ribeye", qty: 2 }, { name: "House Red Wine", qty: 2 }],
      created_at: "2026-05-29T18:30:00Z",
    },
    {
      order_number: "ORD-002", customer: "Sarah Chen", table_number: 12, status: "served", type: "dine-in",
      items: [{ name: "Caesar Salad", qty: 1 }, { name: "Spaghetti Carbonara", qty: 1 }, { name: "Tiramisu", qty: 1 }],
      created_at: "2026-05-29T18:15:00Z",
    },
    {
      order_number: "ORD-003", customer: "Mike Thompson", table_number: 0, status: "pending", type: "takeout",
      items: [{ name: "Margherita", qty: 2 }, { name: "Truffle Fries", qty: 1 }],
      notes: "Extra crispy fries", created_at: "2026-05-29T18:45:00Z",
    },
    {
      order_number: "ORD-004", customer: "Emily Davis", table_number: 3, status: "ready", type: "dine-in",
      items: [{ name: "Calamari Fritti", qty: 1 }, { name: "Grilled Salmon", qty: 1 }, { name: "Panna Cotta", qty: 1 }, { name: "Fresh Lemonade", qty: 2 }],
      created_at: "2026-05-29T17:50:00Z",
    },
    {
      order_number: "ORD-005", customer: "Alex Rodriguez", table_number: 0, status: "preparing", type: "delivery",
      items: [{ name: "Chicken Parmesan", qty: 3 }, { name: "Garlic Bread", qty: 2 }],
      notes: "Deliver to 123 Main St, Apt 4B", created_at: "2026-05-29T18:20:00Z",
    },
    {
      order_number: "ORD-006", customer: "Lisa Park", table_number: 8, status: "completed", type: "dine-in",
      items: [{ name: "Quattro Formaggi", qty: 1 }, { name: "Espresso", qty: 2 }],
      created_at: "2026-05-29T17:00:00Z",
    },
    {
      order_number: "ORD-007", customer: "Robert Kim", table_number: 1, status: "completed", type: "dine-in",
      items: [{ name: "Soup of the Day", qty: 2 }, { name: "Fish & Chips", qty: 2 }, { name: "Chocolate Lava Cake", qty: 1 }],
      created_at: "2026-05-29T16:30:00Z",
    },
    {
      order_number: "ORD-008", customer: "Nancy White", table_number: 0, status: "cancelled", type: "takeout",
      items: [{ name: "Penne Arrabbiata", qty: 1 }, { name: "Caesar Salad", qty: 1 }],
      notes: "Customer cancelled - wrong order placed", created_at: "2026-05-29T18:00:00Z",
    },
  ];

  // Build price lookup from inserted items
  const priceRes = await pool.query("SELECT id, name, price FROM menu_items");
  const priceMap: Record<string, { id: string; price: string }> = {};
  for (const row of priceRes.rows) {
    priceMap[row.name] = { id: row.id, price: row.price };
  }

  for (const order of orderData) {
    let total = 0;
    for (const item of order.items) {
      const p = priceMap[item.name];
      if (p) total += parseFloat(p.price) * item.qty;
    }

    const orderRes = await pool.query(
      `INSERT INTO orders (order_number, customer_id, customer_name, table_number, status, type, total, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [order.order_number, customerIds[order.customer], order.customer, order.table_number, order.status, order.type, total, (order as any).notes ?? null, order.created_at]
    );
    const orderId = orderRes.rows[0].id;

    for (const item of order.items) {
      const p = priceMap[item.name];
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, p?.id ?? null, item.name, item.qty, p?.price ?? "0"]
      );
    }
  }
  console.log(`  ${orderData.length} orders with items inserted`);

  // ─── Restaurant Settings ─────────────────────────────────────────────────
  await pool.query(
    `INSERT INTO restaurant_settings (id, name, address, phone, email, currency, timezone, tax_rate, open_time, close_time, tables, auto_accept_orders, email_notifications, sms_notifications)
     VALUES (1, 'Bella Cucina', '123 Restaurant Row, New York, NY 10012', '(555) 100-2000', 'info@bellacucina.com', 'USD', 'America/New_York', 8.875, '11:00', '23:00', 20, false, true, false)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, phone = EXCLUDED.phone, email = EXCLUDED.email`
  );
  console.log("  Restaurant settings inserted");

  console.log("\nSeed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed error:", err.message);
  pool.end();
  process.exit(1);
});
