'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearSession, login, requireUser, setSession } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { baseUnitByDimension, getAllowedUnits, toBaseQuantity } from '@/lib/units';

function value(formData, key) {
  return String(formData.get(key) || '').trim();
}

export async function loginAction(_, formData) {
  const user = await login(value(formData, 'email'), value(formData, 'password'));
  if (!user) {
    return { error: 'Invalid email or password.' };
  }
  await setSession(user);
  redirect(user.role === 'admin' ? '/admin' : '/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

export async function saveProductAction(formData) {
  await requireUser('admin');
  const sql = getSql();
  const id = value(formData, 'id');
  const dimension = value(formData, 'dimension');
  const baseUnit = baseUnitByDimension[dimension];
  const product = {
    sku: value(formData, 'sku'),
    name: value(formData, 'name'),
    category: value(formData, 'category'),
    description: value(formData, 'description'),
    dimension,
    baseUnit,
    inventory: value(formData, 'inventory_base_quantity') || '0',
    price: value(formData, 'price_per_base_unit_inr') || '0',
    active: formData.get('is_active') === 'on'
  };

  if (id) {
    await sql`
      UPDATE products
      SET sku = ${product.sku},
          name = ${product.name},
          category = ${product.category},
          description = ${product.description},
          dimension = ${product.dimension},
          base_unit = ${product.baseUnit},
          inventory_base_quantity = ${product.inventory},
          price_per_base_unit_inr = ${product.price},
          is_active = ${product.active},
          updated_at = now()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO products (sku, name, category, description, dimension, base_unit, inventory_base_quantity, price_per_base_unit_inr, is_active)
      VALUES (${product.sku}, ${product.name}, ${product.category}, ${product.description}, ${product.dimension}, ${product.baseUnit}, ${product.inventory}, ${product.price}, ${product.active})
    `;
  }

  revalidatePath('/admin/products');
  revalidatePath('/dashboard');
  redirect('/admin/products');
}

export async function deleteProductAction(formData) {
  await requireUser('admin');
  const sql = getSql();
  await sql`UPDATE products SET is_active = false, updated_at = now() WHERE id = ${value(formData, 'id')}`;
  revalidatePath('/admin/products');
}

export async function updateOrderStatusAction(formData) {
  await requireUser('admin');
  const sql = getSql();
  await sql`UPDATE orders SET status = ${value(formData, 'status')} WHERE id = ${value(formData, 'id')}`;
  revalidatePath('/admin/orders');
}

export async function placeOrderAction(formData) {
  const user = await requireUser();
  const sql = getSql();
  const productIds = formData.getAll('product_id').map(String);
  const customerName = value(formData, 'customer_name') || user.name;
  const items = [];

  for (const productId of productIds) {
    const quantity = value(formData, `quantity_${productId}`);
    const unit = value(formData, `unit_${productId}`);
    if (!quantity) continue;

    const [product] = await sql`SELECT * FROM products WHERE id = ${productId} AND is_active = true`;
    if (!product) continue;
    if (!getAllowedUnits(product.dimension).includes(unit)) {
      throw new Error(`Unsupported unit ${unit} for ${product.name}`);
    }

    const baseQuantity = toBaseQuantity(quantity, unit);
    const lineTotal = baseQuantity * Number(product.price_per_base_unit_inr);
    items.push({ product, quantity, unit, baseQuantity, lineTotal });
  }

  if (items.length === 0) {
    redirect('/dashboard?error=Select at least one product quantity.');
  }

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const [order] = await sql`
    INSERT INTO orders (user_id, customer_name, total_inr)
    VALUES (${user.id}, ${customerName}, ${total.toFixed(12)})
    RETURNING id
  `;

  for (const item of items) {
    await sql`
      INSERT INTO order_items (
        order_id,
        product_id,
        product_snapshot,
        ordered_quantity,
        ordered_unit,
        base_quantity,
        price_per_base_unit_inr,
        line_total_inr
      )
      VALUES (
        ${order.id},
        ${item.product.id},
        ${JSON.stringify({
          sku: item.product.sku,
          name: item.product.name,
          category: item.product.category,
          dimension: item.product.dimension,
          baseUnit: item.product.base_unit
        })},
        ${item.quantity},
        ${item.unit},
        ${item.baseQuantity.toFixed(12)},
        ${item.product.price_per_base_unit_inr},
        ${item.lineTotal.toFixed(12)}
      )
    `;
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/orders');
  redirect(`/orders/${order.id}`);
}
