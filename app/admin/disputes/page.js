import { requireUser } from '@/lib/auth';
import { getDisputes } from '@/lib/marketplace';
import Link from 'next/link';

export default async function AdminDisputesPage() {
  const admin = await requireUser('admin');
  const disputes = await getDisputes();

  const openDisputes = disputes.filter(d => d.status === 'open');
  const inProgressDisputes = disputes.filter(d => d.status === 'in_progress');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow-text">Admin Panel</div>
          <h1>Dispute Resolution</h1>
        </div>
      </div>

      {/* Open Disputes */}
      {openDisputes.length > 0 && (
        <div className="stack">
          <h2>Open Disputes ({openDisputes.length})</h2>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Opened</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {openDisputes.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.title}</strong></td>
                    <td>{d.buyer_name}</td>
                    <td>{d.seller_name}</td>
                    <td><span className="pill">{d.status}</span></td>
                    <td className="small muted">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/disputes/${d.id}`} className="button secondary">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgressDisputes.length > 0 && (
        <div className="stack">
          <h2>In Progress ({inProgressDisputes.length})</h2>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {inProgressDisputes.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.title}</strong></td>
                    <td>{d.buyer_name}</td>
                    <td>{d.seller_name}</td>
                    <td className="small muted">{new Date(d.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolvedDisputes.length > 0 && (
        <div className="stack">
          <h2>Resolved ({resolvedDisputes.length})</h2>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {resolvedDisputes.map(d => (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td>{d.buyer_name}</td>
                    <td>{d.seller_name}</td>
                    <td className="small muted">{new Date(d.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {disputes.length === 0 && (
        <div className="empty-state">
          <p className="muted">No disputes yet.</p>
        </div>
      )}
    </div>
  );
}
