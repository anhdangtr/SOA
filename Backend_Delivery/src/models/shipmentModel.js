import { pool } from "../db.js";

function mapShipmentRow(row) {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    address: String(row.address),
    status: row.status,
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
}

async function healthcheck() {
  await pool.query("SELECT 1");
}

async function findShipmentByOrderId(orderId) {
  const result = await pool.query(
    `
      SELECT id, order_id, address, status, created_at, updated_at
      FROM shipments
      WHERE order_id::text = $1
      LIMIT 1
    `,
    [orderId],
  );

  return result.rows[0] ? mapShipmentRow(result.rows[0]) : null;
}

async function createShipment(input) {
  const result = await pool.query(
    `
      INSERT INTO shipments (order_id, address, status)
      VALUES ($1::uuid, $2, 'DELIVERING')
      ON CONFLICT (order_id)
      DO UPDATE SET
        address = EXCLUDED.address,
        status = 'DELIVERING',
        updated_at = NOW()
      RETURNING id, order_id, address, status, created_at, updated_at
    `,
    [input.orderId, input.address],
  );

  return mapShipmentRow(result.rows[0]);
}

async function updateShipmentStatus(orderId, status) {
  const result = await pool.query(
    `
      UPDATE shipments
      SET status = $2, updated_at = NOW()
      WHERE order_id::text = $1
      RETURNING id, order_id, address, status, created_at, updated_at
    `,
    [orderId, status],
  );

  return result.rows[0] ? mapShipmentRow(result.rows[0]) : null;
}

export const shipmentModel = {
  healthcheck,
  findShipmentByOrderId,
  createShipment,
  updateShipmentStatus,
};
