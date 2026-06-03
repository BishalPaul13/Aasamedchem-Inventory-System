import { requireUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import Link from 'next/link';

export default async function AdminQuotesPage() {
  const admin = await requireUser('admin');
  const sql = getSql();

  // Get all quotes
  const quotes = await sql`
    SELECT q.*, s.name as seller_name, s.email as seller_email, b.name as buyer_name
    FROM quotes q
    JOIN users s ON q.seller_id = s.id
    JOIN users b ON q.buyer_id = b.id
    ORDER BY q.created_at DESC
  `;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow-text">Admin Panel</div>
          <h1>Quote Management</h1>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No quotes yet.</p>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td>{q.seller_name}</td>
                  <td>{q.buyer_name}</td>
                  <td>₹{Number(q.total_inr).toFixed(2)}</td>
                  <td>
                    <span className="pill">{q.status}</span>
                  </td>
                  <td>{new Date(q.delivery_date).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/quotes/${q.id}`} className="button secondary">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
