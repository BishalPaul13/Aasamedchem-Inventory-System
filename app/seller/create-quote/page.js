import { requireUser } from '@/lib/auth';
import { getSellerProfile } from '@/lib/marketplace';
import { getSql } from '@/lib/db';
import CreateQuoteForm from '@/components/CreateQuoteForm';

export default async function CreateQuotePage() {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);

  if (!profile || profile.status !== 'approved') {
    return (
      <div className="page">
        <h1>Profile Not Approved</h1>
        <p>Only approved sellers can create quotes.</p>
      </div>
    );
  }

  const sql = getSql();
  const buyers = await sql`
    SELECT id, name, email FROM users WHERE role = 'buyer' ORDER BY name
  `;
  const products = await sql`
    SELECT * FROM products WHERE is_active = true ORDER BY name
  `;

  return (
    <div className="page">
      <div className="eyebrow-text">Seller Panel</div>
      <h1>Create Quote</h1>
      <CreateQuoteForm products={products} buyers={buyers} />
    </div>
  );
}
