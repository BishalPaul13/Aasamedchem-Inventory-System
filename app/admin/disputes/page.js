import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getDisputes } from '@/lib/marketplace';

export default async function AdminDisputesPage() {
  const admin = await requireUser('admin');
  const disputes = await getDisputes();

  return (
    <main className="shell">
      <Nav user={admin} active="admin-disputes" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Admin workspace</p>
            <h1>Disputes</h1>
          </div>
          <p className="page-note">Resolve buyer and seller issues tied to quotes or orders.</p>
        </div>

        {disputes.length === 0 ? (
          <div className="panel empty-state">
            <h2>No open disputes</h2>
            <p className="muted">Buyer and seller disputes will appear here when raised.</p>
          </div>
        ) : (
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Opened</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id}>
                    <td><strong>{dispute.title}</strong></td>
                    <td>{dispute.buyer_name}</td>
                    <td>{dispute.seller_name}</td>
                    <td><span className="pill">{dispute.status}</span></td>
                    <td className="small muted">{new Date(dispute.created_at).toLocaleDateString()}</td>
                    <td><Link href={`/admin/disputes/${dispute.id}`} className="button secondary">Open</Link></td>
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
