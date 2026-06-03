import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { formatInr } from '@/lib/units';

export default async function AdminQuotesPage() {
  const admin = await requireUser('admin');
  const sql = getSql();
  const quotes = await sql`
    SELECT q.*, s.name AS seller_name, s.email AS seller_email, b.name AS buyer_name
    FROM quotes q
    JOIN users s ON q.seller_id = s.id
    JOIN users b ON q.buyer_id = b.id
    ORDER BY q.created_at DESC
  `;

  return (
    <main className="shell">
      <Nav user={admin} active="admin-quotes" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Admin workspace</p>
            <h1>Quote review</h1>
          </div>
          <p className="page-note">Verify seller quotes before buyers can accept them.</p>
        </div>

        {quotes.length === 0 ? (
          <div className="panel empty-state">
            <h2>No quotes pending</h2>
            <p className="muted">Seller quotes will appear here for verification.</p>
          </div>
        ) : (
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Buyer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.seller_name}<br /><span className="muted small">{quote.seller_email}</span></td>
                    <td>{quote.buyer_name}</td>
                    <td>{formatInr(quote.total_inr)}</td>
                    <td><span className="pill">{quote.status}</span></td>
                    <td>{new Date(quote.delivery_date).toLocaleDateString()}</td>
                    <td><Link href={`/admin/quotes/${quote.id}`} className="button secondary">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
