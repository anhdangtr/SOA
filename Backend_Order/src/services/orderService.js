const { pool } = require("../db");
const { config } = require("../config");

const VALID_STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"];
const PAYMENT_METHODS = ["card", "transfer", "cod"];
const ORDER_PAYMENT_METHODS = [...PAYMENT_METHODS, "pending"];
const DEFAULT_SHIPPING_FEE = 25;

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sumTotal(lines) {
  return lines.reduce((total, line) => total + Number(line.item.price || 0) * Number(line.qty || 0), 0);
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

async function patchJson(url) {
  try {
    const response = await fetch(url, { method: "PATCH" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw createError(502, `Downstream service error: ${url}`);
  }

  return response.json();
}

function validateOrderInput(input) {
  if (!input || typeof input !== "object") {
    throw createError(400, "Invalid request body");
  }

  const { customer, lines, paymentMethod } = input;

  if (!customer?.name || !customer?.province || !customer?.ward || !customer?.houseNumber) {
    throw createError(400, "Customer name, province, ward and house number are required");
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    throw createError(400, "At least one order line is required");
  }

  for (const line of lines) {
    if (!line?.item?.id || !line?.item?.name || typeof line?.item?.price !== "number" || !line?.qty) {
      throw createError(400, "Each line must include item and qty");
    }
  }

  if (!ORDER_PAYMENT_METHODS.includes(paymentMethod)) {
    throw createError(400, "Invalid payment method");
  }
}

function sanitizeMoney(value, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : fallback;
}

function normalizePromoCode(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toUpperCase();
  return trimmed ? trimmed : null;
}

function buildCustomerAddress(customer) {
  return [customer.houseNumber, customer.ward, customer.province].filter(Boolean).join(", ");
}

function mapBaseStatus(status, delivery) {
  if (status === "CANCELLED") {
    return "CANCELLED";
  }

  if (status === "PENDING") {
    return "PENDING_PAYMENT";
  }

  if (delivery?.status === "DELIVERED") {
    return "DELIVERED";
  }

  if (delivery?.status === "DELIVERING") {
    return "DELIVERING";
  }

  return "CONFIRMED";
}

function buildHistory(orderRow, payment, delivery) {
  const createdAt = new Date(orderRow.created_at).getTime();
  const history = [
    {
      status: "PENDING_PAYMENT",
      at: createdAt,
      service: "Order Service",
      note: "Order created, awaiting payment.",
    },
  ];

  if (orderRow.status === "CANCELLED" || payment?.status === "FAILED") {
    history.push({
      status: "CANCELLED",
      at: payment?.updatedAt ?? payment?.createdAt ?? new Date(orderRow.updated_at).getTime(),
      service: "Payment Service",
      note: "Order cancelled after payment failure.",
    });
    return history;
  }

  if (orderRow.status === "CONFIRMED" || payment?.status === "SUCCESS") {
    history.push({
      status: "CONFIRMED",
      at: payment?.updatedAt ?? payment?.createdAt ?? new Date(orderRow.updated_at).getTime(),
      service: "Payment Service",
      note: "Payment confirmed. Kitchen is preparing the order.",
    });
  }

  if (delivery?.status === "DELIVERING" || delivery?.status === "DELIVERED") {
    history.push({
      status: "DELIVERING",
      at: delivery.createdAt ?? new Date(orderRow.updated_at).getTime(),
      service: "Delivery Service",
      note: "Delivery has been dispatched.",
    });
  }

  if (delivery?.status === "DELIVERED") {
    history.push({
      status: "DELIVERED",
      at: delivery.updatedAt ?? delivery.createdAt ?? new Date(orderRow.updated_at).getTime(),
      service: "Delivery Service",
      note: "Order delivered successfully.",
    });
  }

  return history;
}

function mapOrder(orderRow, payment, delivery) {
  const lines = Array.isArray(orderRow.lines) ? orderRow.lines : [];

  return {
    id: orderRow.id,
    createdAt: new Date(orderRow.created_at).getTime(),
    customer: {
      name: orderRow.customer_name,
      phone: orderRow.customer_phone,
      province: orderRow.customer_province,
      ward: orderRow.customer_ward,
      houseNumber: orderRow.customer_house_number,
      address: orderRow.customer_address,
      note: orderRow.customer_note ?? undefined,
    },
    lines,
    subtotal: Number(orderRow.subtotal_price ?? orderRow.total_price),
    shippingFee: Number(orderRow.shipping_fee ?? 0),
    discountAmount: Number(orderRow.discount_amount ?? 0),
    promoCode: orderRow.promo_code ?? undefined,
    total: Number(orderRow.total_price),
    paymentMethod: orderRow.payment_method,
    status: mapBaseStatus(orderRow.status, delivery),
    payment:
      payment ??
      ({
        orderId: orderRow.id,
        method: orderRow.payment_method,
        status: "PENDING",
      }),
    delivery: delivery
      ? {
          id: delivery.id,
          etaMinutes: delivery.etaMinutes,
          courier: delivery.courier,
        }
      : undefined,
    history: buildHistory(orderRow, payment, delivery),
  };
}

async function loadOrderRow(client, orderId) {
  const result = await client.query("SELECT * FROM orders WHERE id = $1::uuid", [orderId]);
  return result.rows[0] ?? null;
}

async function enrichOrder(orderRow) {
  const [payment, delivery] = await Promise.all([
    fetchJson(`${config.paymentServiceUrl}/payments/${orderRow.id}`),
    fetchJson(`${config.deliveryServiceUrl}/deliveries/${orderRow.id}`),
  ]);

  if (payment?.status === "FAILED" && orderRow.status !== "CANCELLED") {
    const result = await pool.query(
      "UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1::uuid RETURNING *",
      [orderRow.id],
    );
    orderRow = result.rows[0] ?? orderRow;
  }

  if (payment?.status === "SUCCESS" && orderRow.status === "PENDING") {
    const result = await pool.query(
      "UPDATE orders SET status = 'CONFIRMED', updated_at = NOW() WHERE id = $1::uuid RETURNING *",
      [orderRow.id],
    );
    orderRow = result.rows[0] ?? orderRow;
  }

  return mapOrder(orderRow, payment, delivery);
}

exports.createOrder = async (input) => {
  validateOrderInput(input);

  const subtotal = sumTotal(input.lines);
  const shippingFee = sanitizeMoney(input.shippingFee, DEFAULT_SHIPPING_FEE);
  const discountAmount = Math.min(sanitizeMoney(input.discountAmount, 0), subtotal + shippingFee);
  const total = Math.max(0, subtotal + shippingFee - discountAmount);
  const promoCode = normalizePromoCode(input.promoCode);
  const customerAddress = buildCustomerAddress(input.customer);
  const result = await pool.query(
    `INSERT INTO orders (
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
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, 'PENDING')
    RETURNING *`,
    [
      input.customer.name,
      input.customer.phone || "N/A",
      input.customer.province,
      input.customer.ward,
      input.customer.houseNumber,
      customerAddress,
      input.customer.note?.trim() || null,
      subtotal,
      shippingFee,
      discountAmount,
      promoCode,
      total,
      input.paymentMethod,
      JSON.stringify(input.lines),
    ],
  );

  return mapOrder(result.rows[0], null, null);
};

exports.listOrders = async () => {
  const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  return Promise.all(result.rows.map((row) => enrichOrder(row)));
};

exports.getOrderById = async (orderId) => {
  const client = await pool.connect();
  try {
    const orderRow = await loadOrderRow(client, orderId);
    return orderRow ? enrichOrder(orderRow) : null;
  } finally {
    client.release();
  }
};

exports.updateOrderStatus = async (orderId, status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw createError(400, "Invalid status");
  }

  const current = await exports.getOrderById(orderId);
  if (!current) {
    return null;
  }

  if (current.status === "CANCELLED" || current.status === "DELIVERED") {
    throw createError(409, "Order can no longer change status");
  }

  if (status === "CANCELLED") {
    await pool.query("UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1::uuid", [orderId]);
  } else if (status === "CONFIRMED") {
    await pool.query("UPDATE orders SET status = 'CONFIRMED', updated_at = NOW() WHERE id = $1::uuid", [orderId]);
  } else if (status === "DELIVERING") {
    await pool.query("UPDATE orders SET status = 'CONFIRMED', updated_at = NOW() WHERE id = $1::uuid", [orderId]);
    await postJson(`${config.deliveryServiceUrl}/deliveries`, {
      orderId,
      address: current.customer.address,
    }).catch(() => null);
  } else if (status === "DELIVERED") {
    await pool.query("UPDATE orders SET status = 'CONFIRMED', updated_at = NOW() WHERE id = $1::uuid", [orderId]);
    const delivery = await fetchJson(`${config.deliveryServiceUrl}/deliveries/${orderId}`);
    if (!delivery) {
      await postJson(`${config.deliveryServiceUrl}/deliveries`, {
        orderId,
        address: current.customer.address,
      });
    }
    await patchJson(`${config.deliveryServiceUrl}/deliveries/${orderId}/delivered`);
  } else {
    await pool.query("UPDATE orders SET status = 'PENDING', updated_at = NOW() WHERE id = $1::uuid", [orderId]);
  }

  return exports.getOrderById(orderId);
};

exports.updatePaymentMethod = async (orderId, paymentMethod) => {
  if (!ORDER_PAYMENT_METHODS.includes(paymentMethod)) {
    throw createError(400, "Invalid payment method");
  }

  const current = await exports.getOrderById(orderId);
  if (!current) {
    return null;
  }

  if (current.status === "CANCELLED" || current.status === "DELIVERED") {
    throw createError(409, "Order can no longer change payment method");
  }

  await pool.query(
    "UPDATE orders SET payment_method = $2, updated_at = NOW() WHERE id = $1::uuid",
    [orderId, paymentMethod],
  );

  return exports.getOrderById(orderId);
};

exports.listProducts = async () => {
  const result = await pool.query(
    `SELECT id, name, price, image_url
     FROM products
     ORDER BY name ASC`,
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    imageUrl: row.image_url,
  }));
};
