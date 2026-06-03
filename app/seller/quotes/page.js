import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getQuotesBySeller, getSellerProfile } from '@/lib/marketplace';
import { formatInr } from '@/lib/units';

export default async function SellerQuotesPage() {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);

  if (!profile || profile.status !== 'approved') {
    return (
      <main className="shell">
        <Nav user={seller} active="seller-quotes" />
        <section className="page">
          <div className="panel empty-state">
            <h1>Seller approval required</h1>
            <p className="muted">Admin approval is required before you can send quotes to buyers.</p>
          </div>
        </section>
      </main>
    );
  }

  const quotes = await getQuotesBySeller(seller.id);

  return (
    <main className="shell">
      <Nav user={seller} active="seller-quotes" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Seller workspace</p>
            <h1>Sent quotes</h1>
          </div>
          <p className="page-note">Draft, submit, and track buyer quotations.</p>
          <Link href="/seller/create-quote" className="button">New quote</Link>
        </div>

        {quotes.length === 0 ? (
          <div className="panel empty-state">
            <h2>No quotes sent</h2>
            <p className="muted">Create a quote for a buyer with product lines, delivery terms, and validity.</p>
            <Link href="/seller/create-quote" className="button">Create first quote</Link>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.buyer_name}</td>
                    <td>{formatInr(quote.total_inr)}</td>
                    <td><span className="pill">{quote.status}</span></td>
                    <td>{new Date(quote.delivery_date).toLocaleDateString()}</td>
                    <td className="small muted">{new Date(quote.created_at).toLocaleDateString()}</td>
                    <td><Link href={`/seller/quotes/${quote.id}`} className="button secondary">Open</Link></td>
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
