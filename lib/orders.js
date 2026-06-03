import { getSql } from './db';

export async function listOrders({ userId } = {}) {
  const sql = getSql();
  if (userId) {
    return sql`
      SELECT o.*, u.email AS user_email, u.name AS user_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `;
  }

  return sql`
    SELECT o.*, u.email AS user_email, u.name AS user_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
  `;
}

export async function getOrder(id) {
  const sql = getSql();
  const orders = await sql`
    SELECT o.*, u.email AS user_email, u.name AS user_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ${id}
    LIMIT 1
  `;
  if (!orders[0]) return null;
  const items = await sql`
    SELECT *
    FROM order_items
    WHERE order_id = ${id}
    ORDER BY id ASC
  `;
  return { ...orders[0], items };
}
