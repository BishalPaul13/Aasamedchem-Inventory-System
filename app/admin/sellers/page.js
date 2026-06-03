import { requireUser } from '@/lib/auth';
import { getAllSellerProfiles } from '@/lib/marketplace';
import Link from 'next/link';

export default async function AdminSellersPage() {
  const admin = await requireUser('admin');
  const sellers = await getAllSellerProfiles();

  const pendingSellers = sellers.filter(s => s.status === 'pending');
  const approvedSellers = sellers.filter(s => s.status === 'approved');
  const rejectedSellers = sellers.filter(s => s.status === 'rejected');

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow-text">Admin Panel</div>
          <h1>Seller Management</h1>
        </div>
      </div>

      {/* Pending Sellers */}
      {pendingSellers.length > 0 && (
        <div className="stack">
          <h2>Pending Approval ({pendingSellers.length})</h2>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact Name</th>
                  <th>Email</th>
                  <th>Registration</th>
                  <th>Applied</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingSellers.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.company_name}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td className="small muted">{s.business_registration || '—'}</td>
                    <td className="small muted">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/sellers/${s.user_id}`} className="button secondary">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Sellers */}
      {approvedSellers.length > 0 && (
        <div className="stack">
          <h2>Approved Sellers ({approvedSellers.length})</h2>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {approvedSellers.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.company_name}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td className="small muted">{new Date(s.approved_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejected Sellers */}
      {rejectedSellers.length > 0 && (
        <div className="stack">
          <h2>Rejected Sellers ({rejectedSellers.length})</h2>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact</th>
                  <th>Rejection Reason</th>
                </tr>
              </thead>
              <tbody>
                {rejectedSellers.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.company_name}</strong></td>
                    <td>{s.name}</td>
                    <td className="small">{s.approval_notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
