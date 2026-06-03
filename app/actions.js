'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearSession, login, requireUser, setSession } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { baseUnitByDimension, getAllowedUnits, toBaseQuantity } from '@/lib/units';
import {
  createSellerProfile,
  approveSellerProfile,
  rejectSellerProfile,
  createQuote,
  submitQuote,
  verifyQuote,
  rejectQuote,
  createDispute,
  resolveDispute,
  createPayment,
  markPaymentAsPaid
} from '@/lib/marketplace';

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
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  redirect('/login');
}

// Seller Profile Actions
export async function createSellerProfileAction(_, formData) {
  const user = await requireUser('seller');
  const companyName = String(formData.get('company_name') || '').trim();
  const businessRegistration = String(formData.get('business_registration') || '').trim();
  
  if (!companyName) {
    return { error: 'Company name is required.' };
  }
  
  await createSellerProfile(user.id, companyName, businessRegistration);
  revalidatePath('/seller/profile');
  redirect('/seller/profile');
}

// Admin Seller Approval Actions
export async function approveSellerAction(_, formData) {
  const admin = await requireUser('admin');
  const sellerId = String(formData.get('seller_id') || '').trim();
  
  if (!sellerId) return { error: 'Seller ID is required.' };
  
  await approveSellerProfile(sellerId, admin.id);
  revalidatePath('/admin');
  redirect('/admin');
}

export async function rejectSellerAction(_, formData) {
  const admin = await requireUser('admin');
  const sellerId = String(formData.get('seller_id') || '').trim();
  const rejectionReason = String(formData.get('reason') || '').trim();
  
  if (!sellerId) return { error: 'Seller ID is required.' };
  
  await rejectSellerProfile(sellerId, rejectionReason);
  revalidatePath('/admin');
  redirect('/admin');
}

// Quote Creation (Seller)
export async function createQuoteAction(_, formData) {
  const seller = await requireUser('seller');
  const buyerId = String(formData.get('buyer_id') || '').trim();
  const deliveryDate = String(formData.get('delivery_date') || '').trim();
  const deliveryTerms = String(formData.get('delivery_terms') || '').trim();
  const validityDays = Number(formData.get('validity_days') || 7);
  
  if (!buyerId || !deliveryDate || !deliveryTerms) {
    return { error: 'All fields are required.' };
  }
  
  const productIds = formData.getAll('product_id').map(String);
  const items = [];
  
  const sql = getSql();
  const products = await sql`SELECT * FROM products WHERE id = ANY(${productIds}::uuid[]) AND is_active = true`;
  const productsById = new Map(products.map((p) => [p.id, p]));
  
  for (const productId of productIds) {
    const product = productsById.get(productId);
    if (!product) continue;
    
    const quantity = Number(formData.get(`quantity_${productId}`) || 0);
    const unit = String(formData.get(`unit_${productId}`) || '').trim();
    const pricePerUnit = Number(formData.get(`price_${productId}`) || 0);
    
    if (quantity <= 0 || !unit) continue;
    
    const lineTotal = quantity * pricePerUnit;
    items.push({
      productId,
      productSnapshot: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        dimension: product.dimension,
        baseUnit: product.base_unit
      },
      quantity,
      unit,
      pricePerUnit,
      lineTotal
    });
  }
  
  if (items.length === 0) {
    return { error: 'At least one product is required.' };
  }
  
  const quote = await createQuote(seller.id, buyerId, items, deliveryDate, deliveryTerms, validityDays);
  revalidatePath('/seller/quotes');
  redirect(`/seller/quotes/${quote.id}`);
}

// Quote Submission (Seller)
export async function submitQuoteAction(_, formData) {
  const seller = await requireUser('seller');
  const quoteId = String(formData.get('quote_id') || '').trim();
  
  if (!quoteId) return { error: 'Quote ID is required.' };
  
  await submitQuote(quoteId);
  revalidatePath('/seller/quotes');
  redirect(`/seller/quotes/${quoteId}`);
}

// Quote Verification (Admin)
export async function verifyQuoteAction(_, formData) {
  const admin = await requireUser('admin');
  const quoteId = String(formData.get('quote_id') || '').trim();
  
  if (!quoteId) return { error: 'Quote ID is required.' };
  
  await verifyQuote(quoteId, admin.id);
  revalidatePath('/admin/quotes');
  redirect('/admin/quotes');
}

export async function rejectQuoteAction(_, formData) {
  const admin = await requireUser('admin');
  const quoteId = String(formData.get('quote_id') || '').trim();
  const rejectionReason = String(formData.get('reason') || '').trim();
  
  if (!quoteId) return { error: 'Quote ID is required.' };
  
  await rejectQuote(quoteId, rejectionReason);
  revalidatePath('/admin/quotes');
  redirect('/admin/quotes');
}

// Quote Acceptance (Buyer) - Creates Order
export async function acceptQuoteAction(_, formData) {
  const buyer = await requireUser('buyer');
  const quoteId = String(formData.get('quote_id') || '').trim();
  
  if (!quoteId) return { error: 'Quote ID is required.' };
  
  const sql = getSql();
  const [quote] = await sql`SELECT * FROM quotes WHERE id = ${quoteId} AND buyer_id = ${buyer.id} AND status = 'verified'`;
  
  if (!quote) {
    return { error: 'Quote not found or not available.' };
  }
  
  // Create order from quote
  const [order] = await sql`
    INSERT INTO orders (user_id, customer_name, status, total_inr)
    VALUES (${buyer.id}, ${buyer.name}, 'accepted', ${quote.total_inr})
    RETURNING id
  `;
  
  // Update quote status
  await sql`UPDATE quotes SET status = 'accepted', updated_at = now() WHERE id = ${quoteId}`;
  
  // Create payment record
  await createPayment(order.id, buyer.id, quote.seller_id, quote.total_inr, 'pending');
  
  revalidatePath('/dashboard');
  redirect(`/orders/${order.id}`);
}

// Dispute Management
export async function createDisputeAction(_, formData) {
  const user = await requireUser();
  const otherUserId = String(formData.get('other_user_id') || '').trim();
  const quoteId = String(formData.get('quote_id') || '').trim();
  const orderId = String(formData.get('order_id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  
  if (!title || !description) {
    return { error: 'Title and description are required.' };
  }
  
  const sql = getSql();
  const [otherUser] = await sql`SELECT id FROM users WHERE id = ${otherUserId}`;
  
  if (!otherUser) {
    return { error: 'User not found.' };
  }
  
  await createDispute(user.id, otherUserId, quoteId || null, orderId || null, title, description);
  revalidatePath('/disputes');
  redirect('/disputes');
}

// Admin Dispute Resolution
export async function resolveDisputeAction(_, formData) {
  const admin = await requireUser('admin');
  const disputeId = String(formData.get('dispute_id') || '').trim();
  const resolutionNotes = String(formData.get('resolution_notes') || '').trim();
  
  if (!disputeId || !resolutionNotes) {
    return { error: 'Dispute ID and resolution notes are required.' };
  }
  
  await resolveDispute(disputeId, admin.id, resolutionNotes);
  revalidatePath('/admin/disputes');
  redirect('/admin/disputes');
}

// Payment Actions
export async function markPaymentAction(_, formData) {
  const admin = await requireUser('admin');
  const paymentId = String(formData.get('payment_id') || '').trim();
  const paymentReference = String(formData.get('payment_reference') || '').trim();
  
  if (!paymentId) return { error: 'Payment ID is required.' };
  
  await markPaymentAsPaid(paymentId, paymentReference);
  revalidatePath('/admin/payments');
  redirect('/admin/payments');
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
  const requestedLines = productIds
    .map((productId) => ({
      productId,
      quantity: value(formData, `quantity_${productId}`),
      unit: value(formData, `unit_${productId}`)
    }))
    .filter((line) => line.quantity);
  const items = [];

  if (requestedLines.length === 0) {
    redirect('/dashboard?error=Select at least one product quantity.');
  }

  const products = await sql`
    SELECT *
    FROM products
    WHERE id = ANY(${requestedLines.map((line) => line.productId)}::uuid[])
      AND is_active = true
  `;
  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const requestedLine of requestedLines) {
    const product = productsById.get(requestedLine.productId);
    if (!product) continue;
    const { quantity, unit } = requestedLine;
    if (!getAllowedUnits(product.dimension).includes(unit)) {
      throw new Error(`Unsupported unit ${unit} for ${product.name}`);
    }

    const baseQuantity = toBaseQuantity(quantity, unit);
    const lineTotal = baseQuantity * Number(product.price_per_base_unit_inr);
    items.push({ product, quantity, unit, baseQuantity, lineTotal });
  }

  if (items.length === 0) {
    redirect('/dashboard?error=No active products were selected.');
  }

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const [order] = await sql`
    INSERT INTO orders (user_id, customer_name, total_inr)
    VALUES (${user.id}, ${customerName}, ${total.toFixed(12)})
    RETURNING id
  `;

  await Promise.all(items.map((item) => sql`
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
    `
  ));

  revalidatePath('/dashboard');
  revalidatePath('/admin/orders');
  redirect(`/orders/${order.id}`);
}
