import { requireUser } from '@/lib/auth';
import { getQuotesBySeller, getSellerProfile } from '@/lib/marketplace';
import { getSql } from '@/lib/db';
import Link from 'next/link';

export default async function SellerQuotesPage() {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);

  if (!profile || profile.status !== 'approved') {
    return (
      <div className="page">
        <h1>Not Approved</h1>
        <p>Your seller profile must be approved first.</p>
      </div>
    );
  }

  const quotes = await getQuotesBySeller(seller.id);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow-text">Seller Panel</div>
          <h1>My Quotes</h1>
        </div>
        <Link href="/seller/create-quote" className="button">+ Create Quote</Link>
      </div>

      {quotes.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No quotes created yet.</p>
          <Link href="/seller/create-quote" className="button">Create Your First Quote</Link>
        </div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td>{q.buyer_name}</td>
                  <td>₹{Number(q.total_inr).toFixed(2)}</td>
                  <td><span className="pill">{q.status}</span></td>
                  <td>{new Date(q.delivery_date).toLocaleDateString()}</td>
                  <td className="small muted">{new Date(q.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/seller/quotes/${q.id}`} className="button secondary">View</Link>
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
