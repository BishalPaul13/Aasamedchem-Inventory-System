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
          <p>Manage chemical inventory, convert units cleanly, and generate INR quotations with audit-ready pricing from the first request to admin review.</p>
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
              Base-unit stock
            </h2>
            <p className="muted">Weight is stored in grams, volume in milliliters, and count in units.</p>
          </div>
          <div className="panel feature-panel">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f766e' }}>
                <path d="M6 3h12M6 8h12M6 13h8.5a4.5 4.5 0 0 0 0-9H6M9 13l9 9" />
              </svg>
              INR pricing
            </h2>
            <p className="muted">Rates are stored as INR per base unit with high-precision numeric columns.</p>
          </div>
          <div className="panel feature-panel">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f766e' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Role access
            </h2>
          <p className="muted">Admins manage catalog and orders. Sellers and buyers browse, quote, and track their orders.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
