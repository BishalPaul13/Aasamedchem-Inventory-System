import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getQuotesByBuyer } from '@/lib/marketplace';
import { formatInr } from '@/lib/units';

export default async function BuyerQuotesPage() {
  const buyer = await requireUser('buyer');
  const quotes = await getQuotesByBuyer(buyer.id);

  return (
    <main className="shell">
      <Nav user={buyer} active="buyer-quotes" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Buyer workspace</p>
            <h1>Seller quotes</h1>
          </div>
          <p className="page-note">Compare verified offers before placing an order.</p>
        </div>

        {quotes.length === 0 ? (
          <div className="panel empty-state">
            <h2>No seller quotes yet</h2>
            <p className="muted">When a seller sends a quote and admin verifies it, it will appear here for review.</p>
            <Link className="button" href="/dashboard">Request items</Link>
          </div>
        ) : (
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Total</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Valid until</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => {
                  const isExpired = new Date(quote.expires_at) < new Date();
                  return (
                    <tr key={quote.id}>
                      <td>{quote.seller_name}</td>
                      <td><strong>{formatInr(quote.total_inr)}</strong></td>
                      <td>{new Date(quote.delivery_date).toLocaleDateString()}</td>
                      <td><span className="pill">{quote.status}</span></td>
                      <td className="small muted">
                        {isExpired ? <span className="error">Expired</span> : new Date(quote.expires_at).toLocaleDateString()}
                      </td>
                      <td><Link href={`/buyer/quotes/${quote.id}`} className="button secondary">Open</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
