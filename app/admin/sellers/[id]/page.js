import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { approveSellerAction, rejectSellerAction } from '@/app/actions';
import { requireUser } from '@/lib/auth';
import { getSellerProfile } from '@/lib/marketplace';

export default async function SellerReviewPage({ params }) {
  const admin = await requireUser('admin');
  const { id } = await params;
  const profile = await getSellerProfile(id);
  if (!profile) notFound();

  return (
    <main className="shell">
      <Nav user={admin} active="admin-sellers" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Seller approval</p>
            <h1>{profile.company_name}</h1>
          </div>
          <p className="page-note">Status: {profile.status}</p>
        </div>

        <div className="grid two">
          <div className="panel stack">
            <h2>Profile</h2>
            <p><strong>Company</strong><br /><span className="muted">{profile.company_name}</span></p>
            <p><strong>Registration</strong><br /><span className="muted">{profile.business_registration || '-'}</span></p>
            <p><strong>Notes</strong><br /><span className="muted">{profile.description || profile.approval_notes || '-'}</span></p>
          </div>

          <div className="panel stack">
            <h2>Decision</h2>
            <form action={approveSellerAction}>
              <input name="seller_id" type="hidden" value={profile.user_id} />
              <button type="submit">Approve seller</button>
            </form>
            <form action={rejectSellerAction} className="stack">
              <input name="seller_id" type="hidden" value={profile.user_id} />
              <label>
                Rejection reason
                <textarea name="reason" placeholder="Missing documents, invalid registration, etc." rows={3} />
              </label>
              <button className="danger" type="submit">Reject seller</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
