import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { formatInr } from '@/lib/units';

export default async function AdminPage() {
  const user = await requireUser('admin');
  const sql = getSql();
  const [stats] = await sql`
    SELECT
      (SELECT count(*) FROM products) AS products,
      (SELECT count(*) FROM orders) AS orders,
      (SELECT coalesce(sum(total_inr), 0) FROM orders) AS total,
      (SELECT count(*) FROM quotes WHERE status = 'pending_verification') AS pending_quotes,
      (SELECT count(*) FROM seller_profiles WHERE status = 'pending') AS pending_sellers
  `;

  return (
    <main className="shell">
      <Nav user={user} active="admin" />
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow-text">Admin dashboard</p>
            <h1>Admin overview</h1>
          </div>
          <p className="page-note">Keep inventory accurate, verify seller quotes, and approve trusted sellers.</p>
        </div>
        <div className="grid three">
          <div className="panel stat-panel"><p className="muted small">Catalog</p><div className="total">{stats.products}</div></div>
          <div className="panel stat-panel"><p className="muted small">Quotes to verify</p><div className="total">{stats.pending_quotes}</div></div>
          <div className="panel stat-panel"><p className="muted small">Sellers to approve</p><div className="total">{stats.pending_sellers}</div></div>
          <div className="panel stat-panel"><p className="muted small">Orders</p><div className="total">{stats.orders}</div></div>
          <div className="panel stat-panel"><p className="muted small">Order value</p><div className="total">{formatInr(stats.total)}</div></div>
        </div>
        <div className="actions" style={{ marginTop: 18 }}>
          <Link className="button" href="/admin/products">Inventory</Link>
          <Link className="button secondary" href="/admin/quotes">Review quotes</Link>
          <Link className="button secondary" href="/admin/sellers">Approve sellers</Link>
          <Link className="button secondary" href="/admin/orders">Orders</Link>
        </div>
      </section>
    </main>
  );
}
