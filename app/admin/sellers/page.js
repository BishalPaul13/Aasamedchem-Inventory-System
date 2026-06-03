import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getAllSellerProfiles } from '@/lib/marketplace';

export default async function AdminSellersPage() {
  const admin = await requireUser('admin');
  const sellers = await getAllSellerProfiles();

  const pendingSellers = sellers.filter((seller) => seller.status === 'pending');
  const approvedSellers = sellers.filter((seller) => seller.status === 'approved');
  const rejectedSellers = sellers.filter((seller) => seller.status === 'rejected');

  return (
    <main className="shell">
      <Nav user={admin} active="admin-sellers" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Admin workspace</p>
            <h1>Seller approval</h1>
          </div>
          <p className="page-note">Review seller profiles before they can send quotes.</p>
        </div>

        <div className="grid three">
          <div className="panel stat-panel"><p className="muted small">Pending</p><div className="total">{pendingSellers.length}</div></div>
          <div className="panel stat-panel"><p className="muted small">Approved</p><div className="total">{approvedSellers.length}</div></div>
          <div className="panel stat-panel"><p className="muted small">Rejected</p><div className="total">{rejectedSellers.length}</div></div>
        </div>

        {pendingSellers.length > 0 ? (
          <section className="stack section-gap">
            <h2>Needs review</h2>
            <div className="panel">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Registration</th>
                    <th>Applied</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map((seller) => (
                    <tr key={seller.id}>
                      <td><strong>{seller.company_name}</strong></td>
                      <td>{seller.name}</td>
                      <td>{seller.email}</td>
                      <td className="small muted">{seller.business_registration || '-'}</td>
                      <td className="small muted">{new Date(seller.created_at).toLocaleDateString()}</td>
                      <td><Link href={`/admin/sellers/${seller.user_id}`} className="button secondary">Review</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="panel empty-state section-gap">
            <h2>No seller profiles waiting</h2>
            <p className="muted">New seller applications will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
