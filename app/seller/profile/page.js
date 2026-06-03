import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getSellerProfile } from '@/lib/marketplace';
import { createSellerProfileAction } from '@/app/actions';

export default async function SellerProfilePage() {
  const seller = await requireUser('seller');
  const profile = await getSellerProfile(seller.id);

  return (
    <main className="shell">
      <Nav user={seller} active="seller-profile" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Seller workspace</p>
            <h1>{profile ? 'Seller profile' : 'Create seller profile'}</h1>
          </div>
          <p className="page-note">
            {profile 
              ? `Status: ${profile.status}. ${profile.status === 'pending' ? 'Awaiting admin approval.' : profile.status === 'approved' ? 'You are approved to send quotes.' : 'Your application was rejected.'}` 
              : 'Set up your seller profile to send quotes to buyers.'}
          </p>
        </div>

        {profile ? (
          <div className="grid two">
            <div className="panel stack">
              <h2>Profile information</h2>
              <p><strong>Company name</strong><br /><span className="muted">{profile.company_name}</span></p>
              <p><strong>Business registration</strong><br /><span className="muted">{profile.business_registration || '-'}</span></p>
              <p><strong>Status</strong><br /><span className={`muted badge badge-${profile.status}`}>{profile.status}</span></p>
              {profile.approval_notes && (
                <p><strong>Admin notes</strong><br /><span className="muted">{profile.approval_notes}</span></p>
              )}
              {profile.status === 'approved' && (
                <Link href="/seller/quotes" className="button">Go to quotes</Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid two">
            <div className="panel">
              <form action={createSellerProfileAction} className="stack">
                <label>
                  Company name
                  <input 
                    type="text" 
                    name="company_name" 
                    placeholder="Your company name" 
                    required 
                  />
                </label>
                <label>
                  Business registration
                  <input 
                    type="text" 
                    name="business_registration" 
                    placeholder="GSTIN, PAN, or other registration number" 
                  />
                </label>
                <button type="submit">Create profile</button>
              </form>
            </div>
            <div className="panel">
              <h3>What happens next?</h3>
              <p className="muted">Once you create your profile, our admin team will review your details and approve your seller account. You'll then be able to send quotes to buyers.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
