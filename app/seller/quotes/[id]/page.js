import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getQuote } from '@/lib/marketplace';
import { formatInr } from '@/lib/units';

export default async function SellerQuoteDetailPage({ params }) {
  const seller = await requireUser('seller');
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote || quote.seller_id !== seller.id) {
    notFound();
  }

  return (
    <main className="shell">
      <Nav user={seller} active="seller-quotes" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Quote details</p>
            <h1>Quote to {quote.buyer_name}</h1>
          </div>
          <p className="page-note">Status: <span className="pill">{quote.status}</span></p>
        </div>

        <div className="grid two">
          <div className="panel stack">
            <h2>Buyer information</h2>
            <p><strong>Name</strong><br /><span className="muted">{quote.buyer_name}</span></p>
            <p><strong>Email</strong><br /><span className="muted">{quote.buyer_email}</span></p>
            <p><strong>Quote ID</strong><br /><span className="muted" style={{ fontSize: '0.85em' }}>{quote.id}</span></p>
          </div>

          <div className="panel stack">
            <h2>Delivery details</h2>
            <p><strong>Delivery date</strong><br /><span className="muted">{new Date(quote.delivery_date).toLocaleDateString()}</span></p>
            <p><strong>Valid until</strong><br /><span className="muted">{new Date(quote.expires_at).toLocaleDateString()}</span></p>
            <p><strong>Delivery terms</strong><br /><span className="muted">{quote.delivery_terms}</span></p>
          </div>
        </div>

        <div className="panel stack">
          <h2>Line items</h2>
          {quote.items && quote.items.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Price per unit</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_snapshot.name}</td>
                    <td className="small muted">{item.product_snapshot.sku}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{formatInr(item.price_per_unit_inr)}</td>
                    <td><strong>{formatInr(item.line_total_inr)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No items in this quote.</p>
          )}
        </div>

        <div className="panel stack">
          <h2>Quote summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2em' }}>Total amount</span>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{formatInr(quote.total_inr)}</span>
          </div>
        </div>

        {quote.rejection_reason && (
          <div className="panel" style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#fef2f2' }}>
            <h3 style={{ color: '#dc2626' }}>Rejection reason</h3>
            <p className="muted">{quote.rejection_reason}</p>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/seller/quotes" className="button secondary">Back to quotes</Link>
        </div>
      </section>
    </main>
  );
}
