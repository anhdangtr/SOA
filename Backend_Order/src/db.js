const { Pool } = require("pg");
const { config } = require("./config");

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
});

const PRODUCT_SEED = [
  { name: "Whole Salt-Baked Ri Chicken (Grade 1)", price: 290, imageUrl: "/menu/ga-1.jpg" },
  { name: "Chopped Salt-Baked Ri Chicken", price: 290, imageUrl: "/menu/ga-2.jpg" },
  { name: "Half Salt-Baked Ri Chicken", price: 160, imageUrl: "/menu/ga-3.jpg" },
  { name: "Pickled Beef Tendon (Small)", price: 125, imageUrl: "/menu/ngam-1s.jpg" },
  { name: "Pickled Beef Tendon (Large)", price: 185, imageUrl: "/menu/ngam-1l.jpg" },
  { name: "Thai-Style Boneless Chicken Feet", price: 155, imageUrl: "/menu/ngam-2.jpg" },
  { name: "Pig Ear & Beef Shank Roll", price: 195, imageUrl: "/menu/ngam-3.jpg" },
  { name: "Pickled Vegetables", price: 110, imageUrl: "/menu/ngam-5.jpg" },
  { name: "Mixed Tre Salad", price: 110, imageUrl: "/menu/ngam-6.jpg" },
  { name: "Mixed Tre Ingredient Combo", price: 300, imageUrl: "/menu/ngam-7.jpg" },
  { name: "Rice Paper with Dipping Sauce", price: 25, imageUrl: "/menu/kho-a.jpg" },
  { name: "Soft-Dried Mango", price: 75, imageUrl: "/menu/kho-1a.jpg" },
  { name: "Chili Salt Dried Mango", price: 85, imageUrl: "/menu/kho-2.jpg" },
  { name: "Crispy Fried Jackfruit (500g)", price: 165, imageUrl: "/menu/kho-3.jpg" },
  { name: "Rice Crackers with Pork Floss (250g)", price: 85, imageUrl: "/menu/kho-4.jpg" },
  { name: "Garlic Fish Sauce Pork Rind (200g)", price: 115, imageUrl: "/menu/kho-5.jpg" },
  { name: "Premium Soft Beef Jerky (250g)", price: 185, imageUrl: "/menu/kho-6.jpg" },
  { name: "Shredded Chicken with Lime Leaves", price: 95, imageUrl: "/menu/kho-7.jpg" },
  { name: "Premium Fish Sauce Pork Floss", price: 125, imageUrl: "/menu/kho-8.jpg" },
  { name: "Thick-Cut Soft-Dried Coconut", price: 155, imageUrl: "/menu/kho-9.jpg" },
  { name: "Dew-Wetted Rice Paper Combo", price: 135, imageUrl: "/menu/kho-10.jpg" },
  { name: "Steamed Fish Paste", price: 75, imageUrl: "/menu/gia-vi-2.jpg" },
  { name: "Divine Dipping Salt (250g)", price: 85, imageUrl: "/menu/gia-vi-3.jpg" },
  { name: "Pig Ear Tre Stick (Binh Dinh)", price: 30, imageUrl: "/menu/top-1.jpg" },
  { name: "Fermented Pork (Nem Chua)", price: 10, imageUrl: "/menu/top-2.jpg" },
  { name: "Pork Sausage Stick (Cha The)", price: 9, imageUrl: "/menu/top-3.jpg" },
  { name: "Spicy Beef Sausage with Tendon", price: 15, imageUrl: "/menu/top-4.jpg" },
  { name: "Extra Quail Eggs (5 pcs)", price: 10, imageUrl: "/menu/top-5.jpg" },
  { name: "Extra Shrimp Chips", price: 5, imageUrl: "/menu/top-6.jpg" },
  { name: "Extra Fruits (Mango / Ambarella)", price: 7, imageUrl: "https://aicdn.picsart.com/fd3b6585-b9b7-40f1-a752-7850642d1a22.jpg" },
  { name: "Six-Flavor Herbal Coolant", price: 15, imageUrl: "/menu/nuoc-1.jpg" },
  { name: "Soft Drink (Pepsi / 7Up / Sting)", price: 15, imageUrl: "/menu/nuoc-2.jpg" },
  { name: "Bottled Water", price: 10, imageUrl: "/menu/nuoc-3.jpg" },
  { name: "Wet Wipe", price: 2, imageUrl: "/menu/nuoc-4.jpg" },
];

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isOrderCode(value) {
  return typeof value === "string" && /^DH\d{7}$/i.test(value);
}

function normalizeTimestamp(value) {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return value > 10_000_000_000 ? new Date(value) : new Date(value * 1000);
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    const numeric = Number(value);
    return numeric > 10_000_000_000 ? new Date(numeric) : new Date(numeric * 1000);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizeStatus(value) {
  switch (value) {
    case "CANCELLED":
    case "FAILED":
      return "CANCELLED";
    case "CONFIRMED":
    case "DELIVERING":
    case "DELIVERED":
    case "SUCCESS":
      return "CONFIRMED";
    case "PENDING":
    case "PENDING_PAYMENT":
    default:
      return "PENDING";
  }
}

function normalizeCustomer(row) {
  const customer = row.customer && typeof row.customer === "object" ? row.customer : {};
  const province = row.customer_province ?? customer.province ?? "Ho Chi Minh City";
  const ward = row.customer_ward ?? customer.ward ?? "Central Ward";
  const houseNumber =
    row.customer_house_number ??
    customer.houseNumber ??
    row.customer_address ??
    customer.address ??
    "Address pending confirmation";

  return {
    name: row.customer_name ?? customer.name ?? "Unknown Customer",
    phone: row.customer_phone ?? customer.phone ?? "N/A",
    province,
    ward,
    houseNumber,
    note: row.customer_note ?? customer.note ?? null,
    address:
      row.customer_address ??
      customer.address ??
      `${houseNumber}, ${ward}, ${province}`,
  };
}

function normalizeLines(row) {
  if (Array.isArray(row.lines)) {
    return row.lines;
  }

  if (typeof row.lines === "string") {
    try {
      const parsed = JSON.parse(row.lines);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
}

function normalizePaymentMethod(value) {
  return ["card", "transfer", "cod", "pending"].includes(value) ? value : "pending";
}

function normalizeTotal(row) {
  const value = row.total_price ?? row.total ?? 0;
  return Number(value) || 0;
}

function normalizeSubtotal(row) {
  const value = row.subtotal_price ?? row.total_price ?? row.total ?? 0;
  return Number(value) || 0;
}

function normalizeShippingFee(row) {
  const value = row.shipping_fee ?? 0;
  return Number(value) || 0;
}

function normalizeDiscountAmount(row) {
  const value = row.discount_amount ?? 0;
  return Number(value) || 0;
}

async function createProductsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      image_url TEXT NOT NULL
    );
  `);

  const existingProducts = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  if (existingProducts.rows[0].count === 0) {
    for (const product of PRODUCT_SEED) {
      await pool.query(
        `INSERT INTO products (name, price, image_url)
         VALUES ($1, $2, $3)`,
        [product.name, product.price, product.imageUrl],
      );
    }
  }
}

async function migrateOrdersTable() {
  const ordersExists = await pool.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'orders'
    ) AS exists
  `);

  await pool.query(`
    CREATE SEQUENCE IF NOT EXISTS order_code_seq START WITH 1 INCREMENT BY 1;
  `);

  let legacyRows = [];
  if (ordersExists.rows[0].exists) {
    const result = await pool.query("SELECT * FROM orders");
    legacyRows = result.rows;
    await pool.query("DROP TABLE orders");
  }

  await pool.query(`
    CREATE TABLE orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_code VARCHAR(9) NOT NULL UNIQUE DEFAULT ('DH' || LPAD(nextval('order_code_seq')::text, 7, '0')),
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_province VARCHAR(120) NOT NULL,
      customer_ward VARCHAR(120) NOT NULL,
      customer_house_number TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_note TEXT,
      subtotal_price NUMERIC(12, 2) NOT NULL CHECK (subtotal_price >= 0),
      shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
      discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
      promo_code VARCHAR(50),
      total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
      payment_method VARCHAR(30) NOT NULL,
      lines JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (const row of legacyRows) {
    const customer = normalizeCustomer(row);
    await pool.query(
      `INSERT INTO orders (
        id,
        order_code,
        customer_name,
        customer_phone,
        customer_province,
        customer_ward,
        customer_house_number,
        customer_address,
        customer_note,
        subtotal_price,
        shipping_fee,
        discount_amount,
        promo_code,
        total_price,
        payment_method,
        lines,
        status,
        created_at,
        updated_at
      )
      VALUES (
        COALESCE($1::uuid, gen_random_uuid()),
        COALESCE($2, ('DH' || LPAD(nextval('order_code_seq')::text, 7, '0'))),
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16::jsonb,
        $17,
        $18,
        $19
      )`,
      [
        isUuid(row.id) ? row.id : undefined,
        isOrderCode(row.order_code) ? row.order_code.toUpperCase() : undefined,
        customer.name,
        customer.phone,
        customer.province,
        customer.ward,
        customer.houseNumber,
        customer.address,
        customer.note,
        normalizeSubtotal(row),
        normalizeShippingFee(row),
        normalizeDiscountAmount(row),
        row.promo_code ?? null,
        normalizeTotal(row),
        normalizePaymentMethod(row.payment_method),
        JSON.stringify(normalizeLines(row)),
        normalizeStatus(row.status),
        normalizeTimestamp(row.created_at),
        normalizeTimestamp(row.updated_at ?? row.created_at),
      ],
    );
  }
}

async function initDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await pool.query(`DROP TABLE IF EXISTS order_items;`);
  await pool.query(`DROP TABLE IF EXISTS order_histories;`);

  await createProductsTable();
  await migrateOrdersTable();

  console.log("Order database initialized successfully with products and orders.");
}

module.exports = {
  pool,
  initDb,
};
