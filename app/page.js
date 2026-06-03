import { getCurrentUser } from '@/lib/auth';
import Nav from '@/components/Nav';
import Link from 'next/link';

export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <main className="shell">
      <Nav user={user} />
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Inventory and quotation control</span>
          <h1>aasamedchem</h1>
          <p>A quote workflow for medical chemical supply: buyers request items, approved sellers prepare INR quotes, and admins verify inventory, sellers, and pricing before orders move forward.</p>
          <div className="hero-actions">
            <Link className="button" href={user ? '/dashboard' : '/login'}>{user ? 'Open dashboard' : 'Log in'}</Link>
            <Link className="button secondary ghost" href="/login">View demo access</Link>
          </div>
        </div>
        <div className="hero-metrics" aria-label="System highlights">
          <div>
            <strong>g / kg</strong>
            <span>Weight conversions</span>
          </div>
          <div>
            <strong>mL / L</strong>
            <span>Volume conversions</span>
          </div>
          <div>
            <strong>INR</strong>
            <span>Base-unit pricing</span>
          </div>
        </div>
      </section>
      <section className="landing-band">
        <div className="landing-grid">
          <div className="panel feature-panel">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f766e' }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Inventory units
            </h2>
            <p className="muted">Weight is stored in grams, volume in milliliters, and count in units.</p>
          </div>
          <div className="panel feature-panel">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f766e' }}>
                <path d="M6 3h12M6 8h12M6 13h8.5a4.5 4.5 0 0 0 0-9H6M9 13l9 9" />
              </svg>
              Seller quotes
            </h2>
            <p className="muted">Sellers quote buyers with delivery terms, validity dates, and itemized INR totals.</p>
          </div>
          <div className="panel feature-panel">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f766e' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin verification
            </h2>
            <p className="muted">Admins review seller approvals, quote status, inventory, orders, and disputes.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
