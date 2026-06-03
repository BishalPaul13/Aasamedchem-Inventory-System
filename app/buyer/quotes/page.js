import { requireUser } from '@/lib/auth';
import { getQuotesByBuyer } from '@/lib/marketplace';
import Link from 'next/link';

export default async function BuyerQuotesPage() {
  const buyer = await requireUser('buyer');
  const quotes = await getQuotesByBuyer(buyer.id);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow-text">Buyer Portal</div>
          <h1>Quotes From Sellers</h1>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No quotes available yet.</p>
        </div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Total Price</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => {
                const isExpired = new Date(q.expires_at) < new Date();
                const canAccept = q.status === 'verified' && !isExpired;
                
                return (
                  <tr key={q.id}>
                    <td>{q.seller_name}</td>
                    <td><strong>₹{Number(q.total_inr).toFixed(2)}</strong></td>
                    <td>{new Date(q.delivery_date).toLocaleDateString()}</td>
                    <td><span className="pill">{q.status}</span></td>
                    <td className="small muted">
                      {isExpired ? <span className="error">Expired</span> : new Date(q.expires_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/buyer/quotes/${q.id}`} className="button secondary">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
