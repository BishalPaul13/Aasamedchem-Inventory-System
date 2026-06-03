import { getSql } from './db';

export async function createSellerProfile(userId, companyName, businessRegistration) {
  const sql = getSql();
  const [profile] = await sql`
    INSERT INTO seller_profiles (user_id, company_name, business_registration, status)
    VALUES (${userId}, ${companyName}, ${businessRegistration}, 'pending')
    RETURNING *
  `;
  return profile;
}

export async function approveSellerProfile(sellerId, approvedBy) {
  const sql = getSql();
  const [profile] = await sql`
    UPDATE seller_profiles
    SET status = 'approved', approved_at = now(), updated_at = now()
    WHERE user_id = ${sellerId}
    RETURNING *
  `;
  return profile;
}

export async function rejectSellerProfile(sellerId, rejectionReason) {
  const sql = getSql();
  const [profile] = await sql`
    UPDATE seller_profiles
    SET status = 'rejected', approval_notes = ${rejectionReason}, updated_at = now()
    WHERE user_id = ${sellerId}
    RETURNING *
  `;
  return profile;
}

export async function getSellerProfile(userId) {
  const sql = getSql();
  const [profile] = await sql`
    SELECT * FROM seller_profiles WHERE user_id = ${userId}
  `;
  return profile;
}

export async function getAllSellerProfiles(status = null) {
  const sql = getSql();
  if (status) {
    return await sql`
      SELECT sp.*, u.name, u.email
      FROM seller_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.status = ${status}
      ORDER BY sp.created_at DESC
    `;
  }
  return await sql`
    SELECT sp.*, u.name, u.email
    FROM seller_profiles sp
    JOIN users u ON sp.user_id = u.id
    ORDER BY sp.created_at DESC
  `;
}

export async function createQuote(sellerId, buyerId, items, deliveryDate, deliveryTerms, validityDays = 7) {
  const sql = getSql();
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  
  // Create quote
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + validityDays);
  
  const [quote] = await sql`
    INSERT INTO quotes (seller_id, buyer_id, status, total_inr, delivery_date, delivery_terms, validity_days, expires_at)
    VALUES (${sellerId}, ${buyerId}, 'draft', ${total.toFixed(12)}, ${deliveryDate}, ${deliveryTerms}, ${validityDays}, ${expiresAt})
    RETURNING *
  `;
  
  // Add quote items
  await Promise.all(items.map((item) => sql`
    INSERT INTO quote_items (
      quote_id,
      product_id,
      product_snapshot,
      quantity,
      unit,
      price_per_unit_inr,
      line_total_inr
    )
    VALUES (
      ${quote.id},
      ${item.productId},
      ${JSON.stringify(item.productSnapshot)},
      ${item.quantity},
      ${item.unit},
      ${item.pricePerUnit},
      ${item.lineTotal.toFixed(12)}
    )
  `));
  
  return quote;
}

export async function submitQuote(quoteId) {
  const sql = getSql();
  const [quote] = await sql`
    UPDATE quotes
    SET status = 'pending_verification', updated_at = now()
    WHERE id = ${quoteId}
    RETURNING *
  `;
  return quote;
}

export async function verifyQuote(quoteId, verifiedBy) {
  const sql = getSql();
  const [quote] = await sql`
    UPDATE quotes
    SET status = 'verified', verified_at = now(), verified_by = ${verifiedBy}, updated_at = now()
    WHERE id = ${quoteId}
    RETURNING *
  `;
  return quote;
}

export async function rejectQuote(quoteId, rejectionReason) {
  const sql = getSql();
  const [quote] = await sql`
    UPDATE quotes
    SET status = 'rejected', rejection_reason = ${rejectionReason}, updated_at = now()
    WHERE id = ${quoteId}
    RETURNING *
  `;
  return quote;
}

export async function getQuote(quoteId) {
  const sql = getSql();
  const [quote] = await sql`
    SELECT q.*, 
           s.name as seller_name, s.email as seller_email,
           b.name as buyer_name, b.email as buyer_email
    FROM quotes q
    JOIN users s ON q.seller_id = s.id
    JOIN users b ON q.buyer_id = b.id
    WHERE q.id = ${quoteId}
  `;
  
  if (!quote) return null;
  
  const items = await sql`
    SELECT * FROM quote_items WHERE quote_id = ${quoteId}
  `;
  
  return { ...quote, items };
}

export async function getQuotesByBuyer(buyerId, status = null) {
  const sql = getSql();
  if (status) {
    return await sql`
      SELECT q.*, s.name as seller_name, s.email as seller_email
      FROM quotes q
      JOIN users s ON q.seller_id = s.id
      WHERE q.buyer_id = ${buyerId} AND q.status = ${status}
      ORDER BY q.created_at DESC
    `;
  }
  return await sql`
    SELECT q.*, s.name as seller_name, s.email as seller_email
    FROM quotes q
    JOIN users s ON q.seller_id = s.id
    WHERE q.buyer_id = ${buyerId}
    ORDER BY q.created_at DESC
  `;
}

export async function getQuotesBySeller(sellerId, status = null) {
  const sql = getSql();
  if (status) {
    return await sql`
      SELECT q.*, b.name as buyer_name, b.email as buyer_email
      FROM quotes q
      JOIN users b ON q.buyer_id = b.id
      WHERE q.seller_id = ${sellerId} AND q.status = ${status}
      ORDER BY q.created_at DESC
    `;
  }
  return await sql`
    SELECT q.*, b.name as buyer_name, b.email as buyer_email
    FROM quotes q
    JOIN users b ON q.buyer_id = b.id
    WHERE q.seller_id = ${sellerId}
    ORDER BY q.created_at DESC
  `;
}

export async function createDispute(buyerId, sellerId, quoteId, orderId, title, description) {
  const sql = getSql();
  const [dispute] = await sql`
    INSERT INTO disputes (buyer_id, seller_id, quote_id, order_id, title, description)
    VALUES (${buyerId}, ${sellerId}, ${quoteId}, ${orderId}, ${title}, ${description})
    RETURNING *
  `;
  return dispute;
}

export async function resolveDispute(disputeId, resolvedBy, resolutionNotes) {
  const sql = getSql();
  const [dispute] = await sql`
    UPDATE disputes
    SET status = 'resolved', resolved_by = ${resolvedBy}, resolution_notes = ${resolutionNotes}, updated_at = now()
    WHERE id = ${disputeId}
    RETURNING *
  `;
  return dispute;
}

export async function getDisputes(status = null) {
  const sql = getSql();
  if (status) {
    return await sql`
      SELECT d.*, b.name as buyer_name, s.name as seller_name
      FROM disputes d
      JOIN users b ON d.buyer_id = b.id
      JOIN users s ON d.seller_id = s.id
      WHERE d.status = ${status}
      ORDER BY d.created_at DESC
    `;
  }
  return await sql`
    SELECT d.*, b.name as buyer_name, s.name as seller_name
    FROM disputes d
    JOIN users b ON d.buyer_id = b.id
    JOIN users s ON d.seller_id = s.id
    ORDER BY d.created_at DESC
  `;
}

export async function createPayment(orderId, buyerId, sellerId, amount, paymentMethod) {
  const sql = getSql();
  const [payment] = await sql`
    INSERT INTO payments (order_id, buyer_id, seller_id, amount_inr, payment_method)
    VALUES (${orderId}, ${buyerId}, ${sellerId}, ${amount.toFixed(12)}, ${paymentMethod})
    RETURNING *
  `;
  return payment;
}

export async function markPaymentAsPaid(paymentId, paymentReference) {
  const sql = getSql();
  const [payment] = await sql`
    UPDATE payments
    SET status = 'paid', payment_reference = ${paymentReference}, paid_at = now(), updated_at = now()
    WHERE id = ${paymentId}
    RETURNING *
  `;
  return payment;
}

export async function getPayments(orderId) {
  const sql = getSql();
  return await sql`
    SELECT * FROM payments WHERE order_id = ${orderId}
  `;
}
