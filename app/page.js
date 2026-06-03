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
          <h2>Base-unit stock</h2>
          <p className="muted">Weight is stored in grams, volume in milliliters, and count in units.</p>
        </div>
          <div className="panel feature-panel">
          <h2>INR pricing</h2>
          <p className="muted">Rates are stored as INR per base unit with high-precision numeric columns.</p>
        </div>
          <div className="panel feature-panel">
          <h2>Role access</h2>
          <p className="muted">Admins manage catalog and orders. Sellers browse, quote, and track their orders.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
