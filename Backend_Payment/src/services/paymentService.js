const { pool } = require("../db");
const { config } = require("../config");

const CLIENT_TO_DB_METHOD = {
  card: "BANK_TRANSFER",
  transfer: "MOMO",
  cod: "COD",
};

const DB_TO_CLIENT_METHOD = {
  BANK_TRANSFER: "card",
  MOMO: "transfer",
  COD: "cod",
};

const PAYMENT_STATUS = ["SUCCESS", "FAILED"];

async function fetchOrderAmount(orderId) {
  const response = await fetch(`${config.orderServiceUrl}/orders/${orderId}`);
  if (!response.ok) {
    throw new Error("Unable to load order for payment.");
  }

  const order = await response.json();
  return Number(order.total);
}

function mapPaymentRow(row) {
  return {
    orderId: row.order_id,
    amount: Number(row.amount),
    method: DB_TO_CLIENT_METHOD[row.method] ?? "card",
    status: row.status,
    txnId: row.txn_id ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

exports.processPayment = async (data) => {
  const method = CLIENT_TO_DB_METHOD[data.method] ?? "BANK_TRANSFER";
  const status = PAYMENT_STATUS.includes(data.outcome) ? data.outcome : "FAILED";
  const amount = await fetchOrderAmount(data.orderId);
  const txnId = status === "SUCCESS" ? `TXN-${Date.now()}` : null;

  const result = await pool.query(
    `INSERT INTO payments (order_id, amount, method, status, txn_id)
     VALUES ($1::uuid, $2, $3, $4, $5)
     ON CONFLICT (order_id)
     DO UPDATE SET
       amount = EXCLUDED.amount,
       method = EXCLUDED.method,
       status = EXCLUDED.status,
       txn_id = EXCLUDED.txn_id,
       updated_at = NOW()
     RETURNING order_id, amount, method, status, txn_id, created_at, updated_at`,
    [data.orderId, amount, method, status, txnId],
  );

  return mapPaymentRow(result.rows[0]);
};

exports.getPayment = async (orderId) => {
  const result = await pool.query(
    `SELECT order_id, amount, method, status, txn_id, created_at, updated_at
     FROM payments
     WHERE order_id = $1::uuid`,
    [orderId],
  );
  if (result.rowCount === 0) return null;

  return mapPaymentRow(result.rows[0]);
};
