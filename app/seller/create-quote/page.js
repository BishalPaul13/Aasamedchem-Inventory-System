import Link from 'next/link';
import Nav from '@/components/Nav';
import CreateQuoteForm from '@/components/CreateQuoteForm';
import { requireUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { getSellerProfile } from '@/lib/marketplace';
import { redirect } from 'next/navigation';

export default async function CreateQuotePage({ searchParams }) {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);

  if (!profile) {
    redirect('/seller/profile');
  }

  if (profile.status !== 'approved') {
    return (
      <main className="shell">
        <Nav user={seller} active="seller-create" />
        <section className="page">
          <div className="panel empty-state">
            <h1>Seller approval required</h1>
            <p className="muted">Only approved sellers can prepare quotes for buyers.</p>
            <Link href="/seller/profile" className="button secondary">View profile</Link>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const requestId = params?.request_id;
  const buyerId = params?.buyer_id;

  const sql = getSql();
  
  let prefilledBuyer = null;
  let prefilledProducts = [];

  // If coming from a buyer request, load those details
  if (requestId && buyerId) {
    const [buyer] = await sql`
      SELECT id, name, email FROM users WHERE id = ${buyerId} AND role = 'buyer'
    `;
    prefilledBuyer = buyer;

    prefilledProducts = await sql`
      SELECT p.id, oi.ordered_quantity as suggested_quantity, oi.ordered_unit as suggested_unit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${requestId}
    `;
  }

  const [buyers, products] = await Promise.all([
    sql`SELECT id, name, email FROM users WHERE role = 'buyer' ORDER BY name`,
    sql`SELECT * FROM products WHERE is_active = true ORDER BY name`
  ]);

  return (
    <main className="shell">
      <Nav user={seller} active="seller-create" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Seller workspace</p>
            <h1>Prepare quote</h1>
          </div>
          <p className="page-note">Choose buyer, products, delivery terms, and validity.</p>
        </div>
        <CreateQuoteForm 
          products={products} 
          buyers={buyers} 
          prefilledBuyer={prefilledBuyer}
          prefilledProducts={prefilledProducts}
        />
      </section>
    </main>
  );
}
