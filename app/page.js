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
          <h1>Aasa MedChem Inventory</h1>
          <p>Search inventory, quote flexible units, and let admins verify every conversion from order unit to base stock.</p>
          <Link className="button" href={user ? '/dashboard' : '/login'}>{user ? 'Open dashboard' : 'Log in'}</Link>
        </div>
      </section>
      <section className="page grid three">
        <div className="panel">
          <h2>Base-unit stock</h2>
          <p className="muted">Weight is stored in grams, volume in milliliters, and count in units.</p>
        </div>
        <div className="panel">
          <h2>INR pricing</h2>
          <p className="muted">Rates are stored as INR per base unit with high-precision numeric columns.</p>
        </div>
        <div className="panel">
          <h2>Role access</h2>
          <p className="muted">Admins manage catalog and orders. Sellers browse, quote, and track their orders.</p>
        </div>
      </section>
    </main>
  );
}
