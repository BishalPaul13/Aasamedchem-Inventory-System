import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getSellerProfile, createQuote, submitQuote } from '@/lib/marketplace';
import { getSql } from '@/lib/db';
import { formatInr } from '@/lib/units';

export default async function SellerRequestDetailPage({ params, searchParams }) {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);
  
  if (!profile || profile.status !== 'approved') {
    notFound();
  }

  const { id } = await params;
  const search = await searchParams;
  const buyerId = search?.buyer_id;

  const sql = getSql();
  
  // Get order details
  const [order] = await sql`
    SELECT o.*, u.name as buyer_name, u.email as buyer_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ${id} AND o.status = 'quoted'
  `;

  if (!order) {
    notFound();
  }

  // Get order items
  const items = await sql`
    SELECT oi.*, p.name, p.sku, p.dimension, p.base_unit
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${id}
  `;

  if (items.length === 0) {
    notFound();
  }

  return (
    <main className="shell">
      <Nav user={seller} active="seller-requests" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Buyer request</p>
            <h1>Quote for {order.buyer_name}</h1>
          </div>
          <p className="page-note">Review the items requested and create your quote.</p>
        </div>

        <div className="grid two">
          <div className="panel stack">
            <h2>Buyer information</h2>
            <p><strong>Name</strong><br /><span className="muted">{order.buyer_name}</span></p>
            <p><strong>Email</strong><br /><span className="muted">{order.buyer_email}</span></p>
            <p><strong>Request total</strong><br /><strong>{formatInr(order.total_inr)}</strong></p>
          </div>

          <div className="panel stack">
            <h2>Requested on</h2>
            <p><strong>Date</strong><br /><span className="muted">{new Date(order.created_at).toLocaleDateString()}</span></p>
            <p><strong>Items</strong><br /><span className="muted">{items.length} product{items.length !== 1 ? 's' : ''}</span></p>
          </div>
        </div>

        <div className="panel stack">
          <h2>Requested items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity requested</th>
                <th>Estimated total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td className="small muted">{item.sku}</td>
                  <td>{item.ordered_quantity} {item.ordered_unit}</td>
                  <td className="muted">{formatInr(item.line_total_inr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel stack">
          <h2>Next steps</h2>
          <p className="muted">Click the button below to create a quote for this buyer. You'll be able to set your own delivery terms, validity date, and pricing.</p>
          <Link 
            href={`/seller/create-quote?request_id=${id}&buyer_id=${buyerId}`}
            className="button"
          >
            Create quote for this request
          </Link>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/seller/requests" className="button secondary">Back to requests</Link>
        </div>
      </section>
    </main>
  );
}
