import { getSql } from './db';

export async function listProducts({ q = '', category = '', activeOnly = true } = {}) {
  const sql = getSql();
  return sql`
    SELECT *
    FROM products
    WHERE (${activeOnly} = false OR is_active = true)
      AND (${q} = '' OR name ILIKE ${`%${q}%`} OR sku ILIKE ${`%${q}%`} OR category ILIKE ${`%${q}%`})
      AND (${category} = '' OR category = ${category})
    ORDER BY name ASC
  `;
}

export async function listCategories() {
  const sql = getSql();
  return sql`SELECT DISTINCT category FROM products ORDER BY category ASC`;
}

export async function getProduct(id) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}
