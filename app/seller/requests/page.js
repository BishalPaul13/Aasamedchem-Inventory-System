import Link from 'next/link';
import { redirect } from 'next/navigation';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getSellerProfile } from '@/lib/marketplace';
import { getSql } from '@/lib/db';
import { formatInr } from '@/lib/units';

export default async function SellerRequestsPage() {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);

  if (!profile) {
    redirect('/seller/profile');
  }

  if (profile.status !== 'approved') {
    return (
      <main className="shell">
        <Nav user={seller} active="seller-requests" />
        <section className="page">
          <div className="panel empty-state">
            <h1>Seller approval required</h1>
            <p className="muted">Admin approval is required before you can view and respond to buyer requests.</p>
            <Link href="/seller/profile" className="button secondary">View profile</Link>
          </div>
        </section>
      </main>
    );
  }

  const sql = getSql();
  
  // Get all pending buyer requests (orders with status 'quoted')
  const requests = await sql`
    SELECT 
      o.id,
      o.customer_name,
      o.status,
      o.total_inr,
      o.created_at,
      u.email as buyer_email,
      u.id as buyer_id,
      COUNT(oi.id) as item_count
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status = 'quoted'
    GROUP BY o.id, o.customer_name, o.status, o.total_inr, o.created_at, u.email, u.id
    ORDER BY o.created_at DESC
  `;

  return (
    <main className="shell">
      <Nav user={seller} active="seller-requests" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Seller workspace</p>
            <h1>Buyer requests</h1>
          </div>
          <p className="page-note">View buyer item requests and create quotes to respond.</p>
        </div>

        {requests.length === 0 ? (
          <div className="panel empty-state">
            <h2>No buyer requests yet</h2>
            <p className="muted">When buyers submit item requests, they will appear here for you to quote.</p>
          </div>
        ) : (
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Request total</th>
                  <th>Requested</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td><strong>{request.customer_name}</strong></td>
                    <td className="small muted">{request.buyer_email}</td>
                    <td>{request.item_count} item{request.item_count !== 1 ? 's' : ''}</td>
                    <td>{formatInr(request.total_inr)}</td>
                    <td className="small muted">{new Date(request.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link 
                        href={`/seller/requests/${request.id}?buyer_id=${request.buyer_id}`} 
                        className="button secondary"
                      >
                        View & quote
                      </Link>
                    </td>
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
